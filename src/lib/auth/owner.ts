import { getSession, getOrCreateGuestId } from "@/lib/auth/session";

export type Owner = { userId: string | null; guestId: string | null };

export async function resolveOwner(): Promise<Owner> {
  const session = await getSession();
  if (session) return { userId: session.sub, guestId: null };
  const guestId = await getOrCreateGuestId();
  return { userId: null, guestId };
}
