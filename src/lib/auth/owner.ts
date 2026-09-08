import { getSession, getOrCreateGuestId } from "@/lib/auth/session";

export async function resolveCartOwner() {
  const session = await getSession();
  if (session) return { userId: session.sub, guestId: null };
  const guestId = await getOrCreateGuestId();
  return { userId: null, guestId };
}
