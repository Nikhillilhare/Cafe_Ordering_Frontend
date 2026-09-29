import "server-only";

import { cookies } from "next/headers";
import { AdminRole } from "@prisma/client";
import { jwtVerify, SignJWT } from "jose"

const ADMIN_SESSION_COOKIE = "cafe_admin_session";
const SESSION_DURATION_SECONDS = 60 * 60 * 8;
const SESSION_ISSUER = "cafe-ordering-platform";
const SESSION_AUDIENCE = "cafe-admin";

export type AdminSession = {
  adminId: string;
  cafeId: string;
  name: string;
  email: string;
  role: AdminRole;
};

function getSessionSecret(): Uint8Array {
  const secret = process.env.AUTH_SECRET;

  if (!secret || secret.length < 32) {
    throw new Error(
      "AUTH_SECRET must be configured with at least 32 characters.",
    );
  }

  return new TextEncoder().encode(secret);
}

function isAdminRole(value: unknown): value is AdminRole {
  return (
    typeof value === "string" &&
    Object.values(AdminRole).includes(value as AdminRole)
  );
}

export async function createAdminSession(
  session: AdminSession,
): Promise<void> {
  const token = await new SignJWT({
    adminId: session.adminId,
    cafeId: session.cafeId,
    name: session.name,
    email: session.email,
    role: session.role,
  })
    .setProtectedHeader({
      alg: "HS256",
      typ: "JWT",
    })
    .setIssuedAt()
    .setIssuer(SESSION_ISSUER)
    .setAudience(SESSION_AUDIENCE)
    .setExpirationTime(`${SESSION_DURATION_SECONDS}s`)
    .sign(getSessionSecret());

  const cookieStore = await cookies();

  cookieStore.set(ADMIN_SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DURATION_SECONDS,
  });
}

export async function getAdminSession(): Promise<AdminSession | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;

  if (!token) {
    return null;
  }

  try {
    const { payload } = await jwtVerify(
      token,
      getSessionSecret(),
      {
        issuer: SESSION_ISSUER,
        audience: SESSION_AUDIENCE,
      },
    );

    if (
      typeof payload.adminId !== "string" ||
      typeof payload.cafeId !== "string" ||
      typeof payload.name !== "string" ||
      typeof payload.email !== "string" ||
      !isAdminRole(payload.role)
    ) {
      return null;
    }

    return {
      adminId: payload.adminId,
      cafeId: payload.cafeId,
      name: payload.name,
      email: payload.email,
      role: payload.role,
    };
  } catch {
    return null;
  }
}

export async function deleteAdminSession(): Promise<void> {
  const cookieStore = await cookies();

  cookieStore.set(ADMIN_SESSION_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: new Date(0),
  });
}