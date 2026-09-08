import { NextRequest } from "next/server";
import { loginSchema } from "@/lib/validation/auth";
import { login } from "@/lib/services/authService";
import { createSessionCookie } from "@/lib/auth/session";
import { ok, handleApiError, ApiError } from "@/lib/utils/response";
import { rateLimit, clientKeyFromRequest } from "@/lib/utils/rateLimit";

export async function POST(req: NextRequest) {
  try {
    const { allowed } = rateLimit(clientKeyFromRequest(req, "admin-login"), 10, 60_000);
    if (!allowed) throw new ApiError("Too many attempts. Please try again shortly.", 429);

    const body = loginSchema.parse(await req.json());
    const user = await login(body);

    if (user.role !== "ADMIN") throw new ApiError("This login is for administrators only.", 403);

    await createSessionCookie({ sub: user._id.toString(), role: "ADMIN", name: user.name, email: user.email });
    return ok({ id: user._id, name: user.name, email: user.email, role: user.role });
  } catch (err) {
    return handleApiError(err);
  }
}
