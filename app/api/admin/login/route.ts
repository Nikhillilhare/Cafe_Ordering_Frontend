import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/auth/password";
import { createAdminSession } from "@/lib/auth/session";

type AdminLoginRequest = {
  email?: unknown;
  password?: unknown;
};

export const runtime = "nodejs";

function invalidCredentialsResponse() {
  return NextResponse.json(
    {
      error: "Invalid email or password.",
    },
    {
      status: 401,
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}

function isSameOriginRequest(request: Request): boolean {
  const origin = request.headers.get("origin");
  const host = request.headers.get("host");

  /*
   * Non-browser tools may not send Origin.
   * Browser requests must match the current host.
   */
  if (!origin) {
    return true;
  }

  if (!host) {
    return false;
  }

  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  try {
    if (!isSameOriginRequest(request)) {
      return NextResponse.json(
        {
          error: "Invalid request origin.",
        },
        {
          status: 403,
        },
      );
    }

    const body = (await request.json()) as AdminLoginRequest;

    const email = String(body.email ?? "")
      .trim()
      .toLowerCase();

    const password = String(body.password ?? "");

    if (
      !email ||
      !email.includes("@") ||
      email.length > 254 ||
      !password ||
      password.length > 128
    ) {
      return invalidCredentialsResponse();
    }

    const admin = await prisma.adminUser.findFirst({
      where: {
        email: {
          equals: email,
          mode: "insensitive",
        },
      },

      select: {
        id: true,
        cafeId: true,
        name: true,
        email: true,
        passwordHash: true,
        role: true,

        cafe: {
          select: {
            active: true,
          },
        },
      },
    });

    /*
     * Keep the error generic so the response does not reveal
     * whether a particular email address exists.
     */
    if (!admin || !admin.passwordHash || !admin.cafe.active) {
      await new Promise((resolve) => setTimeout(resolve, 300));

      return invalidCredentialsResponse();
    }

    const passwordIsValid = await verifyPassword(
      password,
      admin.passwordHash,
    );

    if (!passwordIsValid) {
      return invalidCredentialsResponse();
    }

    await createAdminSession({
      adminId: admin.id,
      cafeId: admin.cafeId,
      name: admin.name,
      email: admin.email,
      role: admin.role,
    });

    return NextResponse.json(
      {
        admin: {
          id: admin.id,
          name: admin.name,
          email: admin.email,
          role: admin.role,
        },
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  } catch (error) {
    console.error("Admin login error:", error);

    return NextResponse.json(
      {
        error: "Unable to sign in. Please try again.",
      },
      {
        status: 500,
      },
    );
  }
}