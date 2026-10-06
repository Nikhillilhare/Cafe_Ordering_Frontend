import {
  Prisma,
} from "@prisma/client";
import { NextResponse } from "next/server";

import {
  canManageCafe,
  getAuthenticatedAdmin,
} from "@/lib/auth/requireAdmin";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type MenuItemRouteContext = {
  params: Promise<{
    itemId: string;
  }>;
};

function normalizeName(value: unknown): string {
  return typeof value === "string"
    ? value.trim().replace(/\s+/g, " ")
    : "";
}

function normalizeDescription(
  value: unknown,
): string | null {
  if (value === null) {
    return null;
  }

  if (typeof value !== "string") {
    return null;
  }

  const description = value.trim().replace(/\s+/g, " ");

  return description || null;
}

export async function PATCH(
  request: Request,
  context: MenuItemRouteContext,
) {
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

  if (!canManageCafe(admin.role)) {
    return NextResponse.json(
      {
        error: "You do not have permission to update menu items.",
      },
      {
        status: 403,
      },
    );
  }

  const { itemId } = await context.params;

  const existingItem = await prisma.menuItem.findFirst({
    where: {
      id: itemId,
      cafeId: admin.cafeId,
    },

    select: {
      id: true,
      categoryId: true,
      name: true,
    },
  });

  if (!existingItem) {
    return NextResponse.json(
      {
        error: "Menu item not found.",
      },
      {
        status: 404,
      },
    );
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      {
        error: "Invalid request body.",
      },
      {
        status: 400,
      },
    );
  }

  if (
    typeof body !== "object" ||
    body === null ||
    Array.isArray(body)
  ) {
    return NextResponse.json(
      {
        error: "Invalid menu item data.",
      },
      {
        status: 400,
      },
    );
  }

  const data = body as Record<string, unknown>;

  const updateData: {
    categoryId?: string;
    name?: string;
    description?: string | null;
    price?: number;
    available?: boolean;
    featured?: boolean;
    sortOrder?: number;
  } = {};

  let categoryName: string | null = null;

  if ("name" in data) {
    const name = normalizeName(data.name);

    if (name.length < 2 || name.length > 100) {
      return NextResponse.json(
        {
          error:
            "Menu item name must be between 2 and 100 characters.",
        },
        {
          status: 400,
        },
      );
    }

    const duplicateItem = await prisma.menuItem.findFirst({
      where: {
        cafeId: admin.cafeId,

        id: {
          not: existingItem.id,
        },

        name: {
          equals: name,
          mode: "insensitive",
        },
      },

      select: {
        id: true,
      },
    });

    if (duplicateItem) {
      return NextResponse.json(
        {
          error: "A menu item with this name already exists.",
        },
        {
          status: 409,
        },
      );
    }

    updateData.name = name;
  }

  if ("description" in data) {
    if (
      data.description !== null &&
      typeof data.description !== "string"
    ) {
      return NextResponse.json(
        {
          error: "Description must be text.",
        },
        {
          status: 400,
        },
      );
    }

    const description = normalizeDescription(
      data.description,
    );

    if (description && description.length > 500) {
      return NextResponse.json(
        {
          error:
            "Description cannot contain more than 500 characters.",
        },
        {
          status: 400,
        },
      );
    }

    updateData.description = description;
  }

  if ("price" in data) {
    if (
      typeof data.price !== "number" ||
      !Number.isInteger(data.price) ||
      data.price < 1 ||
      data.price > 1000000
    ) {
      return NextResponse.json(
        {
          error:
            "Price must be a whole number between ₹1 and ₹10,00,000.",
        },
        {
          status: 400,
        },
      );
    }

    updateData.price = data.price;
  }

  if ("available" in data) {
    if (typeof data.available !== "boolean") {
      return NextResponse.json(
        {
          error: "Available status must be true or false.",
        },
        {
          status: 400,
        },
      );
    }

    updateData.available = data.available;
  }

  if ("featured" in data) {
    if (typeof data.featured !== "boolean") {
      return NextResponse.json(
        {
          error: "Featured status must be true or false.",
        },
        {
          status: 400,
        },
      );
    }

    updateData.featured = data.featured;
  }

  if ("sortOrder" in data) {
    if (
      typeof data.sortOrder !== "number" ||
      !Number.isInteger(data.sortOrder) ||
      data.sortOrder < 0 ||
      data.sortOrder > 100000
    ) {
      return NextResponse.json(
        {
          error: "Sort order must be a non-negative integer.",
        },
        {
          status: 400,
        },
      );
    }

    updateData.sortOrder = data.sortOrder;
  }

  if ("categoryId" in data) {
    if (
      typeof data.categoryId !== "string" ||
      !data.categoryId.trim()
    ) {
      return NextResponse.json(
        {
          error: "Please select a valid category.",
        },
        {
          status: 400,
        },
      );
    }

    const category = await prisma.category.findFirst({
      where: {
        id: data.categoryId.trim(),
        cafeId: admin.cafeId,
      },

      select: {
        id: true,
        name: true,
      },
    });

    if (!category) {
      return NextResponse.json(
        {
          error: "The selected category does not exist.",
        },
        {
          status: 404,
        },
      );
    }

    updateData.categoryId = category.id;
    categoryName = category.name;

    /*
     * When an item moves to another category, place it at the
     * end of that category unless sortOrder was explicitly sent.
     */
    if (
      category.id !== existingItem.categoryId &&
      updateData.sortOrder === undefined
    ) {
      const lastItem = await prisma.menuItem.findFirst({
        where: {
          cafeId: admin.cafeId,
          categoryId: category.id,
        },

        orderBy: {
          sortOrder: "desc",
        },

        select: {
          sortOrder: true,
        },
      });

      updateData.sortOrder =
        (lastItem?.sortOrder ?? -1) + 1;
    }
  }

  if (Object.keys(updateData).length === 0) {
    return NextResponse.json(
      {
        error: "No valid menu item changes were provided.",
      },
      {
        status: 400,
      },
    );
  }

  const updatedItem = await prisma.menuItem.update({
    where: {
      id: existingItem.id,
    },

    data: updateData,

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
  });

  return NextResponse.json({
    message: "Menu item updated successfully.",

    item: {
      id: updatedItem.id,
      categoryId: updatedItem.categoryId,
      categoryName:
        categoryName ?? updatedItem.category.name,
      name: updatedItem.name,
      description: updatedItem.description,
      price: updatedItem.price,
      available: updatedItem.available,
      featured: updatedItem.featured,
      sortOrder: updatedItem.sortOrder,
      createdAt: updatedItem.createdAt.toISOString(),
      updatedAt: updatedItem.updatedAt.toISOString(),
    },
  });
}

export async function DELETE(
  _request: Request,
  context: MenuItemRouteContext,
) {
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

  if (!canManageCafe(admin.role)) {
    return NextResponse.json(
      {
        error: "You do not have permission to delete menu items.",
      },
      {
        status: 403,
      },
    );
  }

  const { itemId } = await context.params;

  const item = await prisma.menuItem.findFirst({
    where: {
      id: itemId,
      cafeId: admin.cafeId,
    },

    select: {
      id: true,
      name: true,
    },
  });

  if (!item) {
    return NextResponse.json(
      {
        error: "Menu item not found.",
      },
      {
        status: 404,
      },
    );
  }

  try {
    await prisma.menuItem.delete({
      where: {
        id: item.id,
      },
    });
  } catch (caughtError) {
    /*
     * If the database protects historical order relations,
     * the admin should hide the item instead of deleting it.
     */
    if (
      caughtError instanceof
        Prisma.PrismaClientKnownRequestError &&
      caughtError.code === "P2003"
    ) {
      return NextResponse.json(
        {
          error:
            "This item is connected to historical orders and cannot be deleted. Mark it unavailable instead.",
        },
        {
          status: 409,
        },
      );
    }

    throw caughtError;
  }

  return NextResponse.json({
    message: `"${item.name}" deleted successfully.`,
  });
}