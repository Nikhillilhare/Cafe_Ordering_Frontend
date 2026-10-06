import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";

import {
  canManageCafe,
  getAuthenticatedAdmin,
} from "@/lib/auth/requireAdmin";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const themeColorKeys = [
  "primaryColor",
  "backgroundColor",
  "surfaceColor",
  "textColor",
  "mutedColor",
  "accentColor",
  "successColor",
] as const;


function isRecord(
  value: unknown,
): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  );
}

function isHexColor(value: string): boolean {
  return /^#[0-9a-fA-F]{6}$/.test(value);
}

function normalizeWhatsappNumber(
  value: string,
): string | null {
  const digits = value.replace(/\D/g, "");

  if (digits.length < 10 || digits.length > 15) {
    return null;
  }

  /*
   * Indian local mobile number:
   * 9168561804 → +919168561804
   */
  if (digits.length === 10) {
    return `+91${digits}`;
  }

  /*
   * Indian number with leading zero:
   * 09168561804 → +919168561804
   */
  if (
    digits.length === 11 &&
    digits.startsWith("0")
  ) {
    return `+91${digits.slice(1)}`;
  }

  return `+${digits}`;
}

function serializeCafe(cafe: {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  whatsappNumber: string | null;
  active: boolean;
  themeConfig: Prisma.JsonValue;
  updatedAt: Date;
}) {
  return {
    id: cafe.id,
    name: cafe.name,
    slug: cafe.slug,
    description: cafe.description,
    whatsappNumber: cafe.whatsappNumber ?? "",
    active: cafe.active,
    themeConfig: cafe.themeConfig,
    updatedAt: cafe.updatedAt.toISOString(),
  };
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

  const cafe = await prisma.cafe.findUnique({
    where: {
      id: admin.cafeId,
    },

    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      whatsappNumber: true,
      active: true,
      themeConfig: true,
      updatedAt: true,
    },
  });

  if (!cafe) {
    return NextResponse.json(
      {
        error: "Cafe not found.",
      },
      {
        status: 404,
      },
    );
  }

  return NextResponse.json({
    cafe: serializeCafe(cafe),
  });
}

export async function PATCH(request: Request) {
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
        error:
          "You do not have permission to update cafe settings.",
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

  if (!isRecord(body)) {
    return NextResponse.json(
      {
        error: "Invalid cafe settings data.",
      },
      {
        status: 400,
      },
    );
  }

  const name =
    typeof body.name === "string"
      ? body.name.trim().replace(/\s+/g, " ")
      : "";

  const description =
    typeof body.description === "string"
      ? body.description.trim().replace(/\s+/g, " ")
      : "";

  const whatsappNumber =
    typeof body.whatsappNumber === "string"
      ? normalizeWhatsappNumber(body.whatsappNumber)
      : null;

  if (name.length < 2 || name.length > 100) {
    return NextResponse.json(
      {
        error:
          "Cafe name must be between 2 and 100 characters.",
      },
      {
        status: 400,
      },
    );
  }

  if (description.length > 500) {
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

  if (!whatsappNumber) {
    return NextResponse.json(
      {
        error:
          "Enter a valid WhatsApp number with country code.",
      },
      {
        status: 400,
      },
    );
  }

  if (!isRecord(body.themeConfig)) {
    return NextResponse.json(
      {
        error: "Invalid theme configuration.",
      },
      {
        status: 400,
      },
    );
  }

  const validatedTheme: Record<string, string> = {};

  for (const key of themeColorKeys) {
    const value = body.themeConfig[key];

    if (typeof value !== "string") {
      return NextResponse.json(
        {
          error: `${key} is required.`,
        },
        {
          status: 400,
        },
      );
    }

    const normalizedColor = value.trim().toUpperCase();

    if (!isHexColor(normalizedColor)) {
      return NextResponse.json(
        {
          error: `${key} must be a valid six-digit hex color.`,
        },
        {
          status: 400,
        },
      );
    }

    validatedTheme[key] = normalizedColor;
  }

  const existingCafe = await prisma.cafe.findUnique({
    where: {
      id: admin.cafeId,
    },

    select: {
      id: true,
      themeConfig: true,
    },
  });

  if (!existingCafe) {
    return NextResponse.json(
      {
        error: "Cafe not found.",
      },
      {
        status: 404,
      },
    );
  }

  const existingTheme = isRecord(
    existingCafe.themeConfig,
  )
    ? existingCafe.themeConfig
    : {};

  const mergedTheme = {
    ...existingTheme,
    ...validatedTheme,
  } as Prisma.InputJsonObject;

  const updatedCafe = await prisma.cafe.update({
    where: {
      id: existingCafe.id,
    },

    data: {
      name,
      description: description || null,
      whatsappNumber,
      themeConfig: mergedTheme,
    },

    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      whatsappNumber: true,
      active: true,
      themeConfig: true,
      updatedAt: true,
    },
  });

  return NextResponse.json({
    message: "Cafe settings updated successfully.",
    cafe: serializeCafe(updatedCafe),
  });
}