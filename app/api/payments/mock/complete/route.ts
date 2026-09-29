import { randomUUID } from "node:crypto";

import { NextResponse } from "next/server";
import { PaymentStatus } from "@prisma/client";

import { prisma } from "@/lib/prisma";

type CompleteMockPaymentRequest = {
  paymentId?: unknown;
  result?: unknown;
};

type MockPaymentResult = "SUCCESS" | "FAILURE" | "CANCEL";

function getPaymentStatus(
  result: MockPaymentResult,
): PaymentStatus {
  if (result === "SUCCESS") {
    return PaymentStatus.PAID;
  }

  if (result === "FAILURE") {
    return PaymentStatus.FAILED;
  }

  return PaymentStatus.CANCELLED;
}

export async function POST(request: Request) {
  try {
    /*
     * Mock completion is allowed in development.
     *
     * For a deployed mock demo, PAYMENT_PROVIDER must
     * explicitly be set to "mock".
     */
    const mockPaymentsEnabled =
      process.env.NODE_ENV !== "production" ||
      process.env.PAYMENT_PROVIDER === "mock";

    if (!mockPaymentsEnabled) {
      return NextResponse.json(
        {
          error: "Mock payments are disabled.",
        },
        {
          status: 404,
        },
      );
    }

    const body =
      (await request.json()) as CompleteMockPaymentRequest;

    const paymentId = String(body.paymentId ?? "").trim();

    const result = String(body.result ?? "")
      .trim()
      .toUpperCase() as MockPaymentResult;

    if (!paymentId) {
      return NextResponse.json(
        {
          error: "Payment ID is required.",
        },
        {
          status: 400,
        },
      );
    }

    if (
      result !== "SUCCESS" &&
      result !== "FAILURE" &&
      result !== "CANCEL"
    ) {
      return NextResponse.json(
        {
          error: "Invalid mock payment result.",
        },
        {
          status: 400,
        },
      );
    }

    const payment = await prisma.payment.findUnique({
      where: {
        id: paymentId,
      },

      select: {
        id: true,
        orderId: true,
        gateway: true,
        gatewayOrderId: true,
        amount: true,
        status: true,

        order: {
          select: {
            id: true,
            totalAmount: true,
            paymentStatus: true,
          },
        },
      },
    });

    if (!payment) {
      return NextResponse.json(
        {
          error: "Payment not found.",
        },
        {
          status: 404,
        },
      );
    }

    if (payment.gateway !== "MOCK") {
      return NextResponse.json(
        {
          error: "This endpoint can only complete mock payments.",
        },
        {
          status: 400,
        },
      );
    }

    if (payment.amount !== payment.order.totalAmount) {
      return NextResponse.json(
        {
          error: "Payment amount does not match the order total.",
        },
        {
          status: 409,
        },
      );
    }

    const nextPaymentStatus = getPaymentStatus(result);

    /*
     * Repeated identical requests return the existing result.
     * This makes the endpoint idempotent.
     */
    if (payment.status === nextPaymentStatus) {
      return NextResponse.json({
        paymentId: payment.id,
        orderId: payment.orderId,
        paymentStatus: payment.status,
      });
    }

    /*
     * A completed payment cannot be changed from one final
     * state to another.
     */
    if (payment.status !== PaymentStatus.PENDING) {
      return NextResponse.json(
        {
          error: `Payment has already finished with status ${payment.status}.`,
        },
        {
          status: 409,
        },
      );
    }

    /*
     * Never downgrade an order which is already paid.
     */
    if (payment.order.paymentStatus === PaymentStatus.PAID) {
      return NextResponse.json(
        {
          error: "The order has already been paid.",
        },
        {
          status: 409,
        },
      );
    }

    const mockGatewayPaymentId =
      nextPaymentStatus === PaymentStatus.PAID
        ? `mock_payment_${randomUUID().replaceAll("-", "")}`
        : null;

    /*
     * Payment and Order are updated in one database transaction.
     * Either both updates succeed or neither update is saved.
     */
    const [updatedPayment, updatedOrder] =
      await prisma.$transaction([
        prisma.payment.update({
          where: {
            id: payment.id,
          },

          data: {
            status: nextPaymentStatus,
            gatewayPaymentId: mockGatewayPaymentId,

            rawResponse: {
              mode: "mock",
              result,
              providerOrderId: payment.gatewayOrderId,
              providerPaymentId: mockGatewayPaymentId,
              completedAt: new Date().toISOString(),
            },
          },

          select: {
            id: true,
            status: true,
          },
        }),

        prisma.order.update({
          where: {
            id: payment.orderId,
          },

          data: {
            paymentStatus: nextPaymentStatus,

            ...(nextPaymentStatus === PaymentStatus.PAID
              ? {
                  paymentId: payment.id,
                }
              : {}),
          },

          select: {
            id: true,
            paymentStatus: true,
          },
        }),
      ]);

    return NextResponse.json({
      paymentId: updatedPayment.id,
      orderId: updatedOrder.id,
      paymentStatus: updatedOrder.paymentStatus,
    });
  } catch (error) {
    console.error("Mock payment completion error:", error);

    return NextResponse.json(
      {
        error: "Unable to complete the mock payment.",
      },
      {
        status: 500,
      },
    );
  }
}