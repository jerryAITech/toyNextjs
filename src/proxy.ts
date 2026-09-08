import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const COOKIE_NAME = process.env.COOKIE_NAME || "toystore_session";

const PROTECTED_CUSTOMER_PREFIXES = ["/account", "/checkout", "/orders", "/wishlist"];

async function getRole(req: NextRequest): Promise<"USER" | "ADMIN" | null> {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  if (!token || !process.env.JWT_SECRET) return null;
  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET));
    return (payload.role as "USER" | "ADMIN") ?? null;
  } catch {
    return null;
  }
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    const role = await getRole(req);
    if (role !== "ADMIN") {
      const loginUrl = new URL("/admin/login", req.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  if (PROTECTED_CUSTOMER_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    const role = await getRole(req);
    if (!role) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/account/:path*", "/checkout/:path*", "/orders/:path*", "/wishlist/:path*"],
};
