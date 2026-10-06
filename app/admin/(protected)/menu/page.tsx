import type { Metadata } from "next";

import AdminMenuItemsClient from "@/app/components/admin/AdminMenuItemsClient";
import {
  canManageCafe,
  requireAdminPage,
} from "@/lib/auth/requireAdmin";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Menu Items",
};

export const dynamic = "force-dynamic";

export default async function AdminMenuItemsPage() {
  const admin = await requireAdminPage();

  /*
   * All data is restricted using the authenticated
   * admin's database cafeId.
   */
  const [items, categories] = await Promise.all([
    prisma.menuItem.findMany({
      where: {
        cafeId: admin.cafeId,
      },

      orderBy: [
        {
          category: {
            sortOrder: "asc",
          },
        },
        {
          sortOrder: "asc",
        },
        {
          createdAt: "asc",
        },
      ],

      select: {
        id: true,
        categoryId: true,
        name: true,
        description: true,
        price: true,
        available: true,
        featured: true,
        sortOrder: true,
        createdAt: true,
        updatedAt: true,

        category: {
          select: {
            name: true,
          },
        },
      },
    }),

    prisma.category.findMany({
      where: {
        cafeId: admin.cafeId,
      },

      orderBy: [
        {
          sortOrder: "asc",
        },
        {
          name: "asc",
        },
      ],

      select: {
        id: true,
        name: true,
        active: true,
      },
    }),
  ]);

  return (
    <AdminMenuItemsClient
      canManage={canManageCafe(admin.role)}
      categories={categories}
      initialItems={items.map((item) => ({
        id: item.id,
        categoryId: item.categoryId,
        categoryName: item.category.name,
        name: item.name,
        description: item.description,
        price: item.price,
        available: item.available,
        featured: item.featured,
        sortOrder: item.sortOrder,
        createdAt: item.createdAt.toISOString(),
        updatedAt: item.updatedAt.toISOString(),
      }))}
    />
  );
}