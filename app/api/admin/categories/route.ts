import { NextResponse } from "next/server";

import {
  canManageCafe,
  getAuthenticatedAdmin,
} from "@/lib/auth/requireAdmin";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
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

  return NextResponse.json({
    categories: categories.map((category) => ({
      id: category.id,
      name: category.name,
      active: category.active,
      sortOrder: category.sortOrder,
      itemCount: category._count.items,
      createdAt: category.createdAt.toISOString(),
      updatedAt: category.updatedAt.toISOString(),
    })),
  });
}

export async function POST(request: Request) {
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
        error: "You do not have permission to create categories.",
      },
      {
        status: 403,
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

  const name =
    typeof data.name === "string"
      ? data.name.trim().replace(/\s+/g, " ")
      : "";

  if (name.length < 2 || name.length > 80) {
    return NextResponse.json(
      {
        error: "Category name must be between 2 and 80 characters.",
      },
      {
        status: 400,
      },
    );
  }

  const duplicateCategory = await prisma.category.findFirst({
    where: {
      cafeId: admin.cafeId,

      name: {
        equals: name,
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

  const finalCategory = await prisma.$transaction(
    async (transaction) => {
      const lastCategory = await transaction.category.findFirst({
        where: {
          cafeId: admin.cafeId,
        },

        orderBy: {
          sortOrder: "desc",
        },

        select: {
          sortOrder: true,
        },
      });

      const category = await transaction.category.create({
        data: {
          cafeId: admin.cafeId,
          name,
          active: true,
          sortOrder: (lastCategory?.sortOrder ?? -1) + 1,
        },

        select: {
          id: true,
          name: true,
          active: true,
          sortOrder: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      return category;
    },
  );

  return NextResponse.json(
    {
      message: "Category created successfully.",

      category: {
        ...finalCategory,
        itemCount: 0,
        createdAt: finalCategory.createdAt.toISOString(),
        updatedAt: finalCategory.updatedAt.toISOString(),
      },
    },
    {
      status: 201,
    },
  );
}