import { NextResponse } from "next/server";

import {
  canManageCafe,
  getAuthenticatedAdmin,
} from "@/lib/auth/requireAdmin";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function normalizeName(value: unknown): string {
  return typeof value === "string"
    ? value.trim().replace(/\s+/g, " ")
    : "";
}

function normalizeDescription(
  value: unknown,
): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const description = value.trim().replace(/\s+/g, " ");

  return description || null;
}

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

  const items = await prisma.menuItem.findMany({
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
  });

  return NextResponse.json({
    items: items.map((item) => ({
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
        error: "You do not have permission to create menu items.",
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
        error: "Invalid menu item data.",
      },
      {
        status: 400,
      },
    );
  }

  const data = body as Record<string, unknown>;

  const categoryId =
    typeof data.categoryId === "string"
      ? data.categoryId.trim()
      : "";

  const name = normalizeName(data.name);
  const description = normalizeDescription(data.description);

  const price =
    typeof data.price === "number" ? data.price : Number.NaN;

  const available =
    typeof data.available === "boolean"
      ? data.available
      : true;

  const featured =
    typeof data.featured === "boolean"
      ? data.featured
      : false;

  if (!categoryId) {
    return NextResponse.json(
      {
        error: "Please select a category.",
      },
      {
        status: 400,
      },
    );
  }

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

  if (
    !Number.isInteger(price) ||
    price < 1 ||
    price > 1000000
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

  /*
   * Verify that the category belongs to the same cafe as
   * the authenticated admin.
   */
  const category = await prisma.category.findFirst({
    where: {
      id: categoryId,
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

  const duplicateItem = await prisma.menuItem.findFirst({
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

  const item = await prisma.$transaction(
    async (transaction) => {
      const lastItem = await transaction.menuItem.findFirst({
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

      return transaction.menuItem.create({
        data: {
          cafeId: admin.cafeId,
          categoryId: category.id,
          name,
          description,
          price,
          available,
          featured,
          sortOrder: (lastItem?.sortOrder ?? -1) + 1,
        },

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
        },
      });
    },
  );

  return NextResponse.json(
    {
      message: "Menu item created successfully.",

      item: {
        ...item,
        categoryName: category.name,
        createdAt: item.createdAt.toISOString(),
        updatedAt: item.updatedAt.toISOString(),
      },
    },
    {
      status: 201,
    },
  );
}