import { NextRequest } from "next/server";
import { loginSchema } from "@/lib/validation/auth";
import { login, mergeGuestCartIntoUser } from "@/lib/services/authService";
import { createSessionCookie, getOrCreateGuestId, clearGuestCookie } from "@/lib/auth/session";
import { ok, handleApiError, ApiError } from "@/lib/utils/response";
import { rateLimit, clientKeyFromRequest } from "@/lib/utils/rateLimit";

export async function POST(req: NextRequest) {
  try {
    const { allowed } = rateLimit(clientKeyFromRequest(req, "login"), 15, 60_000);
    if (!allowed) throw new ApiError("Too many attempts. Please try again shortly.", 429);

    const body = loginSchema.parse(await req.json());
    const guestId = await getOrCreateGuestId();
    const user = await login(body);

    await createSessionCookie({ sub: user._id.toString(), role: user.role as "USER" | "ADMIN", name: user.name, email: user.email });
    await mergeGuestCartIntoUser(user._id.toString(), guestId);
    await clearGuestCookie();

    return ok({ id: user._id, name: user.name, email: user.email, role: user.role });
  } catch (err) {
    return handleApiError(err);
  }
}
