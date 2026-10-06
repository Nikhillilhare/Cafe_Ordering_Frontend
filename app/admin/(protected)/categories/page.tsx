import type { Metadata } from "next";

import AdminCategoriesClient from "@/app/components/admin/AdminCategoriesClient";
import {
  canManageCafe,
  requireAdminPage,
} from "@/lib/auth/requireAdmin";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Categories",
};

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  const admin = await requireAdminPage();

  /*
   * Security:
   * The cafeId comes only from the authenticated admin session.
   * It is never accepted from URL, form or browser state.
   */
  const categories = await prisma.category.findMany({
    where: {
      cafeId: admin.cafeId,
    },

    orderBy: [
      {
        sortOrder: "asc",
      },
      {
        createdAt: "asc",
      },
    ],

    select: {
      id: true,
      name: true,
      active: true,
      sortOrder: true,
      createdAt: true,
      updatedAt: true,

      _count: {
        select: {
          items: true,
        },
      },
    },
  });

  return (
    <AdminCategoriesClient
      canManage={canManageCafe(admin.role)}
      initialCategories={categories.map((category) => ({
        id: category.id,
        name: category.name,
        active: category.active,
        sortOrder: category.sortOrder,
        itemCount: category._count.items,
        createdAt: category.createdAt.toISOString(),
        updatedAt: category.updatedAt.toISOString(),
      }))}
    />
  );
}