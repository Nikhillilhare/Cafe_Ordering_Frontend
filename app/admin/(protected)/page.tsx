import type { Metadata } from "next";
import {
  OrderStatus,
  PaymentStatus,
} from "@prisma/client";

import AdminDashboard from "@/app/components/admin/AdminDashboard";
import { requireAdminPage } from "@/lib/auth/requireAdmin";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Dashboard",
};

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const admin = await requireAdminPage();

  /*
   * Every query is scoped by the authenticated admin's cafeId.
   * No cafeId is accepted from the browser.
   */
  const [
    totalOrders,
    newOrders,
    paidOrders,
    paidRevenue,
    recentOrders,
  ] = await Promise.all([
    prisma.order.count({
      where: {
        cafeId: admin.cafeId,
      },
    }),

    prisma.order.count({
      where: {
        cafeId: admin.cafeId,
        orderStatus: OrderStatus.NEW,
      },
    }),

    prisma.order.count({
      where: {
        cafeId: admin.cafeId,
        paymentStatus: PaymentStatus.PAID,
      },
    }),

    prisma.order.aggregate({
      where: {
        cafeId: admin.cafeId,
        paymentStatus: PaymentStatus.PAID,
      },

      _sum: {
        totalAmount: true,
      },
    }),

    prisma.order.findMany({
      where: {
        cafeId: admin.cafeId,
      },

      orderBy: {
        createdAt: "desc",
      },

      take: 8,

      select: {
        id: true,
        customerName: true,
        totalAmount: true,
        orderStatus: true,
        paymentStatus: true,
        paymentMethod: true,
        createdAt: true,
      },
    }),
  ]);

  return (
    <AdminDashboard
      adminName={admin.name}
      cafeName={admin.cafe.name}
      statistics={{
        totalOrders,
        newOrders,
        paidOrders,
        totalRevenue: paidRevenue._sum.totalAmount ?? 0,
      }}
      recentOrders={recentOrders.map((order) => ({
        id: order.id,
        customerName: order.customerName,
        totalAmount: order.totalAmount,
        orderStatus: order.orderStatus,
        paymentStatus: order.paymentStatus,
        paymentMethod: order.paymentMethod,
        createdAt: order.createdAt.toISOString(),
      }))}
    />
  );
}