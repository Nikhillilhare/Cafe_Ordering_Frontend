import { NextResponse } from 'next/server';
import { PaymentMethod } from '@prisma/client';

import { prisma } from '@/lib/prisma';

type OrderItemRequest = {
  menuItemId: string;
  quantity: number;
};

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const cafeSlug = String(body.cafeSlug ?? '').trim();
    const customerName = String(body.customerName ?? '').trim();
    const customerPhone = String(body.customerPhone ?? '').trim();

    const paymentMethodText = String(
      body.paymentMethod ?? 'WHATSAPP',
    ).toUpperCase();

    const requestedItems = body.items as OrderItemRequest[];

    if (!cafeSlug || !customerName || !customerPhone) {
      return NextResponse.json(
        {
          error: 'Customer name and phone number are required.',
        },
        { status: 400 },
      );
    }

    if (
      paymentMethodText !== 'UPI' &&
      paymentMethodText !== 'WHATSAPP'
    ) {
      return NextResponse.json(
        {
          error: 'Invalid payment method.',
        },
        { status: 400 },
      );
    }

    if (
      !Array.isArray(requestedItems) ||
      requestedItems.length === 0
    ) {
      return NextResponse.json(
        {
          error: 'At least one item is required.',
        },
        { status: 400 },
      );
    }

    const cafe = await prisma.cafe.findUnique({
      where: {
        slug: cafeSlug,
      },
    });

    if (!cafe || !cafe.active) {
      return NextResponse.json(
        {
          error: 'Cafe not found.',
        },
        { status: 404 },
      );
    }

    const menuItemIds = requestedItems.map(
      (item) => item.menuItemId,
    );

    const menuItems = await prisma.menuItem.findMany({
      where: {
        id: {
          in: menuItemIds,
        },
        cafeId: cafe.id,
        available: true,
      },
    });

    if (menuItems.length !== requestedItems.length) {
      return NextResponse.json(
        {
          error: 'One or more items are unavailable.',
        },
        { status: 400 },
      );
    }

    const menuItemMap = new Map(
      menuItems.map((item) => [item.id, item]),
    );

    const orderItems = requestedItems.map((requestedItem) => {
      const menuItem = menuItemMap.get(
        requestedItem.menuItemId,
      );

      if (!menuItem) {
        throw new Error('Menu item not found.');
      }

      if (
        !Number.isInteger(requestedItem.quantity) ||
        requestedItem.quantity < 1
      ) {
        throw new Error('Invalid quantity.');
      }

      return {
        menuItemId: menuItem.id,
        itemName: menuItem.name,
        unitPrice: menuItem.price,
        quantity: requestedItem.quantity,
        totalPrice:
          menuItem.price * requestedItem.quantity,
      };
    });

    const totalAmount = orderItems.reduce(
      (total, item) => total + item.totalPrice,
      0,
    );

    const paymentMethod =
      paymentMethodText === 'UPI'
        ? PaymentMethod.UPI
        : PaymentMethod.WHATSAPP;

    const order = await prisma.order.create({
      data: {
        cafeId: cafe.id,
        customerName,
        customerPhone,
        totalAmount,
        paymentMethod,
        paymentStatus: 'PENDING',
        orderStatus: 'NEW',
        items: {
          create: orderItems,
        },
      },
      include: {
        items: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        orderId: order.id,
        totalAmount: order.totalAmount,
        paymentMethod: order.paymentMethod,
        paymentStatus: order.paymentStatus,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error('Order creation error:', error);

    return NextResponse.json(
      {
        error: 'Unable to create order.',
      },
      { status: 500 },
    );
  }
}