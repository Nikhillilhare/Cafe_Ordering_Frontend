import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

type MockPaymentRouteContext = {
  params: Promise<{
    providerOrderId: string;
  }>;
};

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  context: MockPaymentRouteContext,
) {
  try {
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

    const { providerOrderId } = await context.params;
    const normalizedProviderOrderId = providerOrderId.trim();

    if (!normalizedProviderOrderId) {
      return NextResponse.json(
        {
          error: "Provider order ID is required.",
        },
        {
          status: 400,
        },
      );
    }

    const payment = await prisma.payment.findFirst({
      where: {
        gateway: "MOCK",
        gatewayOrderId: normalizedProviderOrderId,
      },

      select: {
        id: true,
        gateway: true,
        gatewayOrderId: true,
        amount: true,
        status: true,
        createdAt: true,

        cafe: {
          select: {
            name: true,
            slug: true,
          },
        },

        order: {
          select: {
            id: true,
            customerName: true,
            totalAmount: true,

            items: {
              select: {
                id: true,
                itemName: true,
                unitPrice: true,
                quantity: true,
                totalPrice: true,
              },

              orderBy: {
                itemName: "asc",
              },
            },
          },
        },
      },
    });

    if (!payment) {
      return NextResponse.json(
        {
          error: "Mock payment session not found.",
        },
        {
          status: 404,
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

    return NextResponse.json(
      {
        paymentId: payment.id,
        provider: payment.gateway,
        providerOrderId: payment.gatewayOrderId,
        amount: payment.amount,
        paymentStatus: payment.status,
        createdAt: payment.createdAt,

        cafe: {
          name: payment.cafe.name,
          slug: payment.cafe.slug,
        },

        order: {
          id: payment.order.id,
          customerName: payment.order.customerName,
          items: payment.order.items,
        },
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  } catch (error) {
    console.error("Mock payment retrieval error:", error);

    return NextResponse.json(
      {
        error: "Unable to load the mock payment.",
      },
      {
        status: 500,
      },
    );
  }
}