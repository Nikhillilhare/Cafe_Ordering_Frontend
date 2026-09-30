import { NextResponse } from "next/server";

import { deleteAdminSession } from "@/lib/auth/session";

function isSameOriginRequest(request: Request): boolean {
  const origin = request.headers.get("origin");
  const host = request.headers.get("host");

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

    await deleteAdminSession();

    return NextResponse.json(
      {
        success: true,
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  } catch (error) {
    console.error("Admin logout error:", error);

    return NextResponse.json(
      {
        error: "Unable to sign out.",
      },
      {
        status: 500,
      },
    );
  }
}