import { cookies } from "next/headers";
import { signSession, verifySession, type SessionPayload } from "./jwt";
import { ApiError } from "@/lib/utils/response";

const COOKIE_NAME = process.env.COOKIE_NAME || "toystore_session";
const GUEST_COOKIE_NAME = "toystore_guest";

export async function createSessionCookie(payload: SessionPayload) {
  const token = await signSession(payload);
  const store = await cookies();
  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function clearSessionCookie() {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

export async function getSession(): Promise<SessionPayload | null> {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySession(token);
}

export async function requireUser(): Promise<SessionPayload> {
  const session = await getSession();
  if (!session) throw new ApiError("Please log in to continue.", 401);
  return session;
}

export async function requireAdmin(): Promise<SessionPayload> {
  const session = await requireUser();
  if (session.role !== "ADMIN") throw new ApiError("Admin access required.", 403);
  return session;
}

export async function getOrCreateGuestId(): Promise<string> {
  const store = await cookies();
  let guestId = store.get(GUEST_COOKIE_NAME)?.value;
  if (!guestId) {
    guestId = crypto.randomUUID();
    store.set(GUEST_COOKIE_NAME, guestId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });
  }
  return guestId;
}

export async function clearGuestCookie() {
  const store = await cookies();
  store.delete(GUEST_COOKIE_NAME);
}
