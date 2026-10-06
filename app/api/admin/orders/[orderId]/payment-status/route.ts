import { randomUUID } from "node:crypto";

import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import {
  PaymentMethod,
  PaymentStatus,
} from "@prisma/client";

import { getAuthenticatedAdmin } from "@/lib/auth/requireAdmin";
import { prisma } from "@/lib/prisma";

type PaymentStatusRequest = {
  status?: unknown;
};

type PaymentStatusRouteContext = {
  params: Promise<{
    orderId: string;
  }>;
};

function isSameOriginRequest(request: Request): boolean {
  const origin = request.headers.get("origin");
  const host = request.headers.get("host");

  if (!origin) {
    return true;
  }

  if (!host) {
    return false;
  }

  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

export async function PATCH(
  request: Request,
  context: PaymentStatusRouteContext,
) {
  try {
    if (!isSameOriginRequest(request)) {
      return NextResponse.json(
        {
          error: "Invalid request origin.",
        },
        {
          status: 403,
        },
      );
    }

    const admin = await getAuthenticatedAdmin();

    if (!admin) {
      return NextResponse.json(
        {
          error: "Authentication required.",
        },
        {
          status: 401,
        },
      );
    }

    const { orderId } = await context.params;
    const normalizedOrderId = orderId.trim();

    if (!normalizedOrderId) {
      return NextResponse.json(
        {
          error: "Order ID is required.",
        },
        {
          status: 400,
        },
      );
    }

    const body =
      (await request.json()) as PaymentStatusRequest;

    const requestedStatus = String(body.status ?? "")
      .trim()
      .toUpperCase();

    /*
     * Manual admin flow only supports marking a verified
     * payment as PAID.
     */
    if (requestedStatus !== PaymentStatus.PAID) {
      return NextResponse.json(
        {
          error: "Admin can only mark a verified manual payment as paid.",
        },
        {
          status: 400,
        },
      );
    }

    const order = await prisma.order.findFirst({
      where: {
        id: normalizedOrderId,
        cafeId: admin.cafeId,
      },

      select: {
        id: true,
        cafeId: true,
        totalAmount: true,
        paymentMethod: true,
        paymentStatus: true,
      },
    });

    if (!order) {
      return NextResponse.json(
        {
          error: "Order not found.",
        },
        {
          status: 404,
        },
      );
    }

    /*
     * Online UPI payment status must only come from
     * a verified payment gateway or webhook.
     */
    if (order.paymentMethod === PaymentMethod.UPI) {
      return NextResponse.json(
        {
          error:
            "UPI payment status is gateway-controlled and cannot be changed manually.",
        },
        {
          status: 409,
        },
      );
    }

    if (
      order.paymentMethod !== PaymentMethod.WHATSAPP &&
      order.paymentMethod !== PaymentMethod.CASH
    ) {
      return NextResponse.json(
        {
          error: "This payment method cannot be verified manually.",
        },
        {
          status: 409,
        },
      );
    }

    /*
     * Repeated requests are idempotent.
     */
    if (order.paymentStatus === PaymentStatus.PAID) {
      return NextResponse.json({
        order: {
          id: order.id,
          paymentStatus: order.paymentStatus,
        },
      });
    }

    const manualGatewayOrderId =
      `manual_${randomUUID().replaceAll("-", "")}`;

    /*
     * Payment audit record and Order update are saved
     * in a single transaction.
     */
    const result = await prisma.$transaction(async (transaction) => {
      const payment = await transaction.payment.create({
        data: {
          cafeId: order.cafeId,
          orderId: order.id,
          gateway: "MANUAL",
          gatewayOrderId: manualGatewayOrderId,
          gatewayPaymentId: manualGatewayOrderId,
          amount: order.totalAmount,
          status: PaymentStatus.PAID,

          rawResponse: {
            source: "ADMIN_MANUAL_VERIFICATION",
            verifiedByAdminId: admin.id,
            paymentMethod: order.paymentMethod,
            verifiedAt: new Date().toISOString(),
          },
        },

        select: {
          id: true,
          status: true,
        },
      });

      const updatedOrder = await transaction.order.update({
        where: {
          id: order.id,
        },

        data: {
          paymentStatus: PaymentStatus.PAID,
          paymentId: payment.id,
        },

        select: {
          id: true,
          paymentStatus: true,
          updatedAt: true,
        },
      });

      return {
        payment,
        order: updatedOrder,
      };
    });

    revalidatePath("/admin");
    revalidatePath("/admin/orders");

    return NextResponse.json(
      {
        order: {
          id: result.order.id,
          paymentStatus: result.order.paymentStatus,
          updatedAt: result.order.updatedAt,
        },

        payment: {
          id: result.payment.id,
          status: result.payment.status,
        },
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  } catch (error) {
    console.error("Manual payment verification error:", error);

    return NextResponse.json(
      {
        error: "Unable to verify the manual payment.",
      },
      {
        status: 500,
      },
    );
  }
}