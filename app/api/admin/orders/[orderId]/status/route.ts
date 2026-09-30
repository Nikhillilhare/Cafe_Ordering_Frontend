import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { OrderStatus } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { getAuthenticatedAdmin } from "@/lib/auth/requireAdmin";

type UpdateOrderStatusRequest = {
  status?: unknown;
};

type OrderStatusRouteContext = {
  params: Promise<{
    orderId: string;
  }>;
};

const allowedTransitions: Record<
  OrderStatus,
  readonly OrderStatus[]
> = {
  NEW: [
    OrderStatus.ACCEPTED,
    OrderStatus.CANCELLED,
  ],

  ACCEPTED: [
    OrderStatus.PREPARING,
    OrderStatus.CANCELLED,
  ],

  PREPARING: [
    OrderStatus.READY,
    OrderStatus.CANCELLED,
  ],

  READY: [
    OrderStatus.COMPLETED,
    OrderStatus.CANCELLED,
  ],

  COMPLETED: [],

  CANCELLED: [],
};

function isOrderStatus(value: unknown): value is OrderStatus {
  return (
    typeof value === "string" &&
    Object.values(OrderStatus).includes(value as OrderStatus)
  );
}

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
  context: OrderStatusRouteContext,
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
      (await request.json()) as UpdateOrderStatusRequest;

    const requestedStatus = String(body.status ?? "")
      .trim()
      .toUpperCase();

    if (!isOrderStatus(requestedStatus)) {
      return NextResponse.json(
        {
          error: "Invalid order status.",
        },
        {
          status: 400,
        },
      );
    }

    /*
     * The query uses both orderId and session cafeId.
     * An admin cannot update another cafe's order.
     */
    const order = await prisma.order.findFirst({
      where: {
        id: normalizedOrderId,
        cafeId: admin.cafeId,
      },

      select: {
        id: true,
        orderStatus: true,
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
     * Repeated identical update is treated as successful.
     */
    if (order.orderStatus === requestedStatus) {
      return NextResponse.json({
        order: {
          id: order.id,
          orderStatus: order.orderStatus,
          paymentStatus: order.paymentStatus,
        },
      });
    }

    const validNextStatuses =
      allowedTransitions[order.orderStatus];

    if (!validNextStatuses.includes(requestedStatus)) {
      return NextResponse.json(
        {
          error: `Order cannot move from ${order.orderStatus} to ${requestedStatus}.`,
          allowedStatuses: validNextStatuses,
        },
        {
          status: 409,
        },
      );
    }

    const updatedOrder = await prisma.order.update({
      where: {
        id: order.id,
      },

      data: {
        orderStatus: requestedStatus,
      },

      select: {
        id: true,
        orderStatus: true,
        paymentStatus: true,
        updatedAt: true,
      },
    });

    revalidatePath("/admin");
    revalidatePath("/admin/orders");

    return NextResponse.json(
      {
        order: {
          id: updatedOrder.id,
          orderStatus: updatedOrder.orderStatus,
          paymentStatus: updatedOrder.paymentStatus,
          updatedAt: updatedOrder.updatedAt,
        },
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  } catch (error) {
    console.error("Admin order status update error:", error);

    return NextResponse.json(
      {
        error: "Unable to update the order status.",
      },
      {
        status: 500,
      },
    );
  }
}