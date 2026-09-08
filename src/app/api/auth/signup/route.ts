import { NextRequest } from "next/server";
import { signupSchema } from "@/lib/validation/auth";
import { signup, mergeGuestCartIntoUser } from "@/lib/services/authService";
import { createSessionCookie, getOrCreateGuestId, clearGuestCookie } from "@/lib/auth/session";
import { ok, handleApiError } from "@/lib/utils/response";
import { rateLimit, clientKeyFromRequest } from "@/lib/utils/rateLimit";
import { ApiError } from "@/lib/utils/response";

export async function POST(req: NextRequest) {
  try {
    const { allowed } = rateLimit(clientKeyFromRequest(req, "signup"), 10, 60_000);
    if (!allowed) throw new ApiError("Too many attempts. Please try again shortly.", 429);

    const body = signupSchema.parse(await req.json());
    const guestId = await getOrCreateGuestId();
    const user = await signup(body);

    await createSessionCookie({ sub: user._id.toString(), role: user.role as "USER" | "ADMIN", name: user.name, email: user.email });
    await mergeGuestCartIntoUser(user._id.toString(), guestId);
    await clearGuestCookie();

    return ok({ id: user._id, name: user.name, email: user.email, role: user.role }, 201);
  } catch (err) {
    return handleApiError(err);
  }
}
