import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const COOKIE_NAME = process.env.COOKIE_NAME || "toystore_session";

// Checkout and single-order pages are open to guests (guest checkout); ownership is
// enforced by the guest-id cookie on the server instead of an upfront login redirect.
const PROTECTED_CUSTOMER_PREFIXES = ["/account", "/wishlist"];
const PROTECTED_CUSTOMER_EXACT = ["/orders"];

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

  const isProtected =
    PROTECTED_CUSTOMER_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`)) ||
    PROTECTED_CUSTOMER_EXACT.includes(pathname);

  if (isProtected) {
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
  matcher: ["/admin/:path*", "/account/:path*", "/orders", "/wishlist/:path*"],
};
