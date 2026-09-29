import { NextResponse } from "next/server";
import {
  PaymentMethod,
  PaymentStatus,
} from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { mockPaymentProvider } from "@/lib/payments/mockPaymentProvider";

type CreatePaymentRequest = {
  orderId?: unknown;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CreatePaymentRequest;
    const orderId = String(body.orderId ?? "").trim();

    if (!orderId) {
      return NextResponse.json(
        {
          error: "Order ID is required.",
        },
        {
          status: 400,
        },
      );
    }

    const order = await prisma.order.findUnique({
      where: {
        id: orderId,
      },

      select: {
        id: true,
        cafeId: true,
        customerName: true,
        customerPhone: true,
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

    if (order.paymentMethod !== PaymentMethod.UPI) {
      return NextResponse.json(
        {
          error: "This order was not created for online payment.",
        },
        {
          status: 400,
        },
      );
    }

    if (order.paymentStatus === PaymentStatus.PAID) {
      return NextResponse.json(
        {
          error: "This order has already been paid.",
        },
        {
          status: 409,
        },
      );
    }

    /*
     * Return an existing pending mock payment instead of
     * creating duplicate payment attempts.
     */
    const existingPayment = await prisma.payment.findFirst({
      where: {
        orderId: order.id,
        gateway: "MOCK",
        status: PaymentStatus.PENDING,
        gatewayOrderId: {
          not: null,
        },
      },

      orderBy: {
        createdAt: "desc",
      },

      select: {
        id: true,
        gatewayOrderId: true,
        amount: true,
        status: true,
      },
    });

    if (existingPayment?.gatewayOrderId) {
      return NextResponse.json({
        paymentId: existingPayment.id,
        provider: "MOCK",
        providerOrderId: existingPayment.gatewayOrderId,
        checkoutUrl: `/payment/mock/${encodeURIComponent(
          existingPayment.gatewayOrderId,
        )}`,
        amount: existingPayment.amount,
        paymentStatus: existingPayment.status,
      });
    }

    /*
     * Create a provider checkout session.
     * The amount always comes from our database.
     */
    const session = await mockPaymentProvider.createPaymentSession({
      orderId: order.id,
      cafeId: order.cafeId,
      amount: order.totalAmount,
      customerName: order.customerName,
      customerPhone: order.customerPhone,
    });

    const payment = await prisma.payment.create({
      data: {
        cafeId: order.cafeId,
        orderId: order.id,
        gateway: session.provider,
        gatewayOrderId: session.providerOrderId,
        amount: order.totalAmount,
        status: PaymentStatus.PENDING,

        rawResponse: {
          mode: "mock",
          providerOrderId: session.providerOrderId,
          checkoutUrl: session.checkoutUrl,
        },
      },

      select: {
        id: true,
        amount: true,
        status: true,
      },
    });

    return NextResponse.json(
      {
        paymentId: payment.id,
        provider: session.provider,
        providerOrderId: session.providerOrderId,
        checkoutUrl: session.checkoutUrl,
        amount: payment.amount,
        paymentStatus: payment.status,
      },
      {
        status: 201,
      },
    );
  } catch (error) {
    console.error("Payment creation error:", error);

    return NextResponse.json(
      {
        error: "Unable to create the payment session.",
      },
      {
        status: 500,
      },
    );
  }
}