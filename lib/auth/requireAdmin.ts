import "server-only";

import { redirect } from "next/navigation";
import { AdminRole } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { getAdminSession } from "./session";

export type AuthenticatedAdmin = {
  id: string;
  cafeId: string;
  name: string;
  email: string;
  role: AdminRole;

  cafe: {
    id: string;
    name: string;
    slug: string;
  };
};

export async function getAuthenticatedAdmin(): Promise<AuthenticatedAdmin | null> {
  const session = await getAdminSession();

  if (!session) {
    return null;
  }

  const admin = await prisma.adminUser.findUnique({
    where: {
      id: session.adminId,
    },

    select: {
      id: true,
      cafeId: true,
      name: true,
      email: true,
      role: true,

      cafe: {
        select: {
          id: true,
          name: true,
          slug: true,
          active: true,
        },
      },
    },
  });

  if (!admin || !admin.cafe.active) {
    return null;
  }

  /*
   * The database cafeId must match the signed session cafeId.
   * This prevents a stale or inconsistent session from being used.
   */
  if (admin.cafeId !== session.cafeId) {
    return null;
  }

  return {
    id: admin.id,
    cafeId: admin.cafeId,
    name: admin.name,
    email: admin.email,
    role: admin.role,

    cafe: {
      id: admin.cafe.id,
      name: admin.cafe.name,
      slug: admin.cafe.slug,
    },
  };
}

export async function requireAdminPage(): Promise<AuthenticatedAdmin> {
  const admin = await getAuthenticatedAdmin();

  if (!admin) {
    redirect("/admin/login");
  }

  return admin;
}

export function canManageCafe(role: AdminRole): boolean {
  return role === AdminRole.OWNER || role === AdminRole.MANAGER;
}

export function canManageAdmins(role: AdminRole): boolean {
  return role === AdminRole.OWNER;
}