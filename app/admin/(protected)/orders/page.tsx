import type { Metadata } from "next";

import AdminOrdersClient from "@/app/components/admin/AdminOrdersClient";
import { requireAdminPage } from "@/lib/auth/requireAdmin";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Orders",
};

export const dynamic = "force-dynamic";

type AdminOrdersPageProps = {
  searchParams: Promise<{
    order?: string;
  }>;
};

export default async function AdminOrdersPage({
  searchParams,
}: AdminOrdersPageProps) {
  const admin = await requireAdminPage();
  const { order: selectedOrderId } = await searchParams;

  /*
   * cafeId always comes from the authenticated session.
   * It is never accepted from the URL or browser request.
   */
  const orders = await prisma.order.findMany({
    where: {
      cafeId: admin.cafeId,
    },

    orderBy: {
      createdAt: "desc",
    },

    take: 100,

    select: {
      id: true,
      customerName: true,
      customerPhone: true,
      totalAmount: true,
      orderStatus: true,
      paymentStatus: true,
      paymentMethod: true,
      createdAt: true,
      updatedAt: true,

      items: {
        orderBy: {
          itemName: "asc",
        },

        select: {
          id: true,
          itemName: true,
          unitPrice: true,
          quantity: true,
          totalPrice: true,
        },
      },
    },
  });

  const validSelectedOrderId =
    selectedOrderId &&
    orders.some((order) => order.id === selectedOrderId)
      ? selectedOrderId
      : null;

  return (
    <AdminOrdersClient
      initialSelectedOrderId={validSelectedOrderId}
      initialOrders={orders.map((order) => ({
        id: order.id,
        customerName: order.customerName,
        customerPhone: order.customerPhone,
        totalAmount: order.totalAmount,
        orderStatus: order.orderStatus,
        paymentStatus: order.paymentStatus,
        paymentMethod: order.paymentMethod,
        createdAt: order.createdAt.toISOString(),
        updatedAt: order.updatedAt.toISOString(),

        items: order.items.map((item) => ({
          id: item.id,
          itemName: item.itemName,
          unitPrice: item.unitPrice,
          quantity: item.quantity,
          totalPrice: item.totalPrice,
        })),
      }))}
    />
  );
}