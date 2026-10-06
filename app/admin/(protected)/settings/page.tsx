import type { Metadata } from "next";

import AdminCafeSettingsForm from "@/app/components/admin/AdminCafeSettingsForm";
import {
  canManageCafe,
  requireAdminPage,
} from "@/lib/auth/requireAdmin";
import type { AdminThemeConfig } from "@/lib/client/adminSettings";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Cafe Settings",
};

export const dynamic = "force-dynamic";

const defaultTheme: AdminThemeConfig = {
  primaryColor: "#C66A3D",
  backgroundColor: "#F8F3EC",
  surfaceColor: "#FFFFFF",
  textColor: "#2B211B",
  mutedColor: "#776B61",
  accentColor: "#E4B85C",
  successColor: "#6D9275",
};

function isRecord(
  value: unknown,
): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  );
}

function getThemeColor(
  theme: Record<string, unknown>,
  key: keyof AdminThemeConfig,
): string {
  const value = theme[key];

  if (
    typeof value === "string" &&
    /^#[0-9a-fA-F]{6}$/.test(value)
  ) {
    return value.toUpperCase();
  }

  return defaultTheme[key];
}

function normalizeTheme(
  value: unknown,
): AdminThemeConfig {
  const theme = isRecord(value) ? value : {};

  return {
    primaryColor: getThemeColor(
      theme,
      "primaryColor",
    ),

    backgroundColor: getThemeColor(
      theme,
      "backgroundColor",
    ),

    surfaceColor: getThemeColor(
      theme,
      "surfaceColor",
    ),

    textColor: getThemeColor(
      theme,
      "textColor",
    ),

    mutedColor: getThemeColor(
      theme,
      "mutedColor",
    ),

    accentColor: getThemeColor(
      theme,
      "accentColor",
    ),

    successColor: getThemeColor(
      theme,
      "successColor",
    ),
  };
}

export default async function AdminCafeSettingsPage() {
  const admin = await requireAdminPage();

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
    throw new Error(
      "The cafe connected to this admin account was not found.",
    );
  }

  return (
    <AdminCafeSettingsForm
      canManage={canManageCafe(admin.role)}
      initialSettings={{
        id: cafe.id,
        name: cafe.name,
        slug: cafe.slug,
        description: cafe.description,
        whatsappNumber:
          cafe.whatsappNumber ?? "",
        active: cafe.active,
        themeConfig: normalizeTheme(
          cafe.themeConfig,
        ),
        updatedAt:
          cafe.updatedAt.toISOString(),
      }}
    />
  );
}