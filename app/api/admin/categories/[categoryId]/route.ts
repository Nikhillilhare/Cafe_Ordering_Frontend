import { NextResponse } from "next/server";

import {
  canManageCafe,
  getAuthenticatedAdmin,
} from "@/lib/auth/requireAdmin";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type CategoryRouteContext = {
  params: Promise<{
    categoryId: string;
  }>;
};

export async function PATCH(
  request: Request,
  context: CategoryRouteContext,
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
        error: "You do not have permission to update categories.",
      },
      {
        status: 403,
      },
    );
  }

  const { categoryId } = await context.params;

  const existingCategory = await prisma.category.findFirst({
    where: {
      id: categoryId,
      cafeId: admin.cafeId,
    },

    select: {
      id: true,
      name: true,
      active: true,
      sortOrder: true,
    },
  });

  if (!existingCategory) {
    return NextResponse.json(
      {
        error: "Category not found.",
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
        error: "Invalid category data.",
      },
      {
        status: 400,
      },
    );
  }

  const data = body as Record<string, unknown>;

  const updateData: {
    name?: string;
    active?: boolean;
    sortOrder?: number;
  } = {};

  if ("name" in data) {
    if (typeof data.name !== "string") {
      return NextResponse.json(
        {
          error: "Category name must be text.",
        },
        {
          status: 400,
        },
      );
    }

    const normalizedName = data.name
      .trim()
      .replace(/\s+/g, " ");

    if (
      normalizedName.length < 2 ||
      normalizedName.length > 80
    ) {
      return NextResponse.json(
        {
          error:
            "Category name must be between 2 and 80 characters.",
        },
        {
          status: 400,
        },
      );
    }

    const duplicateCategory =
      await prisma.category.findFirst({
        where: {
          cafeId: admin.cafeId,

          id: {
            not: categoryId,
          },

          name: {
            equals: normalizedName,
            mode: "insensitive",
          },
        },

        select: {
          id: true,
        },
      });

    if (duplicateCategory) {
      return NextResponse.json(
        {
          error: "A category with this name already exists.",
        },
        {
          status: 409,
        },
      );
    }

    updateData.name = normalizedName;
  }

  if ("active" in data) {
    if (typeof data.active !== "boolean") {
      return NextResponse.json(
        {
          error: "Active status must be true or false.",
        },
        {
          status: 400,
        },
      );
    }

    updateData.active = data.active;
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
          error: "Sort order must be a valid non-negative integer.",
        },
        {
          status: 400,
        },
      );
    }

    updateData.sortOrder = data.sortOrder;
  }

  if (Object.keys(updateData).length === 0) {
    return NextResponse.json(
      {
        error: "No valid category changes were provided.",
      },
      {
        status: 400,
      },
    );
  }

  const updatedCategory = await prisma.category.update({
    where: {
      id: existingCategory.id,
    },

    data: updateData,

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

  return NextResponse.json({
    message: "Category updated successfully.",

    category: {
      id: updatedCategory.id,
      name: updatedCategory.name,
      active: updatedCategory.active,
      sortOrder: updatedCategory.sortOrder,
      itemCount: updatedCategory._count.items,
      createdAt: updatedCategory.createdAt.toISOString(),
      updatedAt: updatedCategory.updatedAt.toISOString(),
    },
  });
}

export async function DELETE(
  _request: Request,
  context: CategoryRouteContext,
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
        error: "You do not have permission to delete categories.",
      },
      {
        status: 403,
      },
    );
  }

  const { categoryId } = await context.params;

  const category = await prisma.category.findFirst({
    where: {
      id: categoryId,
      cafeId: admin.cafeId,
    },

    select: {
      id: true,
      name: true,

      _count: {
        select: {
          items: true,
        },
      },
    },
  });

  if (!category) {
    return NextResponse.json(
      {
        error: "Category not found.",
      },
      {
        status: 404,
      },
    );
  }

  if (category._count.items > 0) {
    return NextResponse.json(
      {
        error:
          "This category contains menu items. Move or delete those items first, or deactivate the category instead.",
      },
      {
        status: 409,
      },
    );
  }

  await prisma.category.delete({
    where: {
      id: category.id,
    },
  });

  return NextResponse.json({
    message: `"${category.name}" category deleted successfully.`,
  });
}