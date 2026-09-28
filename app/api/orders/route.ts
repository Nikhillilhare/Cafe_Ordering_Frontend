import { NextResponse } from "next/server";
import {
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
} from "@prisma/client";

import { prisma } from "@/lib/prisma";

type OrderItemRequest = {
  menuItemId?: unknown;
  quantity?: unknown;
};

type OrderRequestBody = {
  cafeSlug?: unknown;
  customerName?: unknown;
  customerPhone?: unknown;
  paymentMethod?: unknown;
  items?: unknown;
};

const MAX_ITEM_QUANTITY = 50;

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as OrderRequestBody;

    const cafeSlug = String(body.cafeSlug ?? "")
      .trim()
      .toLowerCase();

    const customerName = String(body.customerName ?? "").trim();

    const customerPhoneInput = String(body.customerPhone ?? "").trim();

    const paymentMethodInput = String(
      body.paymentMethod ?? "",
    ).toUpperCase();

    /*
     * Customer validation
     */
    if (customerName.length < 2 || customerName.length > 100) {
      return NextResponse.json(
        {
          error: "Please enter a valid customer name.",
        },
        {
          status: 400,
        },
      );
    }

    const phoneDigits = customerPhoneInput.replace(/\D/g, "");

    if (phoneDigits.length < 10 || phoneDigits.length > 15) {
      return NextResponse.json(
        {
          error: "Please enter a valid mobile number.",
        },
        {
          status: 400,
        },
      );
    }

    const customerPhone =
      phoneDigits.length === 10 ? `+91${phoneDigits}` : `+${phoneDigits}`;

    /*
     * Payment method validation
     */
    if (
      paymentMethodInput !== PaymentMethod.WHATSAPP &&
      paymentMethodInput !== PaymentMethod.UPI
    ) {
      return NextResponse.json(
        {
          error: "Invalid order method.",
        },
        {
          status: 400,
        },
      );
    }

    /*
     * Cart validation
     */
    if (!Array.isArray(body.items) || body.items.length === 0) {
      return NextResponse.json(
        {
          error: "Your cart is empty.",
        },
        {
          status: 400,
        },
      );
    }

    const requestedItems = body.items as OrderItemRequest[];

    /*
     * Validate and combine duplicate cart items.
     *
     * If the same menu item appears twice, its quantities
     * are combined before calculating the order total.
     */
    const quantityByMenuItemId = new Map<string, number>();

    for (const requestedItem of requestedItems) {
      const menuItemId = String(requestedItem.menuItemId ?? "").trim();
      const quantity = Number(requestedItem.quantity);

      if (!menuItemId) {
        return NextResponse.json(
          {
            error: "A cart item is missing its menu item ID.",
          },
          {
            status: 400,
          },
        );
      }

      if (
        !Number.isInteger(quantity) ||
        quantity < 1 ||
        quantity > MAX_ITEM_QUANTITY
      ) {
        return NextResponse.json(
          {
            error: `Each item quantity must be between 1 and ${MAX_ITEM_QUANTITY}.`,
          },
          {
            status: 400,
          },
        );
      }

      const currentQuantity = quantityByMenuItemId.get(menuItemId) ?? 0;
      const combinedQuantity = currentQuantity + quantity;

      if (combinedQuantity > MAX_ITEM_QUANTITY) {
        return NextResponse.json(
          {
            error: `You can order a maximum of ${MAX_ITEM_QUANTITY} units of one item.`,
          },
          {
            status: 400,
          },
        );
      }

      quantityByMenuItemId.set(menuItemId, combinedQuantity);
    }

    /*
     * Find cafe from the public slug.
     */
    if (!cafeSlug) {
      return NextResponse.json(
        {
          error: "Cafe slug is required.",
        },
        {
          status: 400,
        },
      );
    }

    const cafe = await prisma.cafe.findUnique({
      where: {
        slug: cafeSlug,
      },

      select: {
        id: true,
        slug: true,
        active: true,
        whatsappNumber: true,
      },
    });

    if (!cafe || !cafe.active) {
      return NextResponse.json(
        {
          error: "Cafe not found or is currently unavailable.",
        },
        {
          status: 404,
        },
      );
    }

    /*
     * Fetch items using both menu-item IDs and cafeId.
     *
     * This cafeId condition prevents items from another
     * cafe from being added to this cafe's order.
     */
    const menuItemIds = Array.from(quantityByMenuItemId.keys());

    const menuItems = await prisma.menuItem.findMany({
      where: {
        id: {
          in: menuItemIds,
        },

        cafeId: cafe.id,
        available: true,
      },

      select: {
        id: true,
        name: true,
        price: true,
      },
    });

    if (menuItems.length !== menuItemIds.length) {
      return NextResponse.json(
        {
          error:
            "One or more items are unavailable or do not belong to this cafe.",
        },
        {
          status: 400,
        },
      );
    }

    /*
     * Build order items using database prices.
     *
     * The frontend total is intentionally not trusted.
     */
    const orderItems = menuItems.map((menuItem) => {
      const quantity = quantityByMenuItemId.get(menuItem.id);

      if (!quantity) {
        throw new Error(`Quantity missing for menu item ${menuItem.id}.`);
      }

      return {
        menuItemId: menuItem.id,
        itemName: menuItem.name,
        unitPrice: menuItem.price,
        quantity,
        totalPrice: menuItem.price * quantity,
      };
    });

    const totalAmount = orderItems.reduce(
      (total, orderItem) => total + orderItem.totalPrice,
      0,
    );

    if (totalAmount <= 0) {
      return NextResponse.json(
        {
          error: "Order total must be greater than zero.",
        },
        {
          status: 400,
        },
      );
    }

    const paymentMethod =
      paymentMethodInput === PaymentMethod.UPI
        ? PaymentMethod.UPI
        : PaymentMethod.WHATSAPP;

    /*
     * Create Order and OrderItem records together.
     * Prisma nested create keeps the operation atomic.
     */
    const order = await prisma.order.create({
      data: {
        cafeId: cafe.id,
        customerName,
        customerPhone,
        totalAmount,
        paymentMethod,
        paymentStatus: PaymentStatus.PENDING,
        orderStatus: OrderStatus.NEW,

        items: {
          create: orderItems,
        },
      },

      select: {
        id: true,
        totalAmount: true,
        orderStatus: true,
        paymentStatus: true,
        paymentMethod: true,
      },
    });

    return NextResponse.json(
      {
        orderId: order.id,
        cafeSlug: cafe.slug,
        totalAmount: order.totalAmount,
        orderStatus: order.orderStatus,
        paymentStatus: order.paymentStatus,
        paymentMethod: order.paymentMethod,
        whatsappNumber: cafe.whatsappNumber,
      },
      {
        status: 201,
      },
    );
  } catch (error) {
    console.error("Order creation error:", error);

    return NextResponse.json(
      {
        error: "Unable to create the order. Please try again.",
      },
      {
        status: 500,
      },
    );
  }
}