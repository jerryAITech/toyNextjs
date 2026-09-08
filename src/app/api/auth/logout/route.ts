import { clearSessionCookie } from "@/lib/auth/session";
import { ok, handleApiError } from "@/lib/utils/response";

export async function POST() {
  try {
    await clearSessionCookie();
    return ok({ loggedOut: true });
  } catch (err) {
    return handleApiError(err);
  }
}
