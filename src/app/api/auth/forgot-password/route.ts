import { NextRequest } from "next/server";
import { forgotPasswordSchema } from "@/lib/validation/auth";
import { requestPasswordReset } from "@/lib/services/authService";
import { ok, handleApiError, ApiError } from "@/lib/utils/response";
import { rateLimit, clientKeyFromRequest } from "@/lib/utils/rateLimit";

export async function POST(req: NextRequest) {
  try {
    const { allowed } = rateLimit(clientKeyFromRequest(req, "forgot-password"), 5, 60_000);
    if (!allowed) throw new ApiError("Too many attempts. Please try again shortly.", 429);

    const { email } = forgotPasswordSchema.parse(await req.json());
    const resetUrl = await requestPasswordReset(email);

    return ok({
      message: "If an account exists for this email, a reset link has been sent.",
      // Dev convenience only — remove once a real email provider is wired up.
      ...(process.env.NODE_ENV !== "production" && resetUrl ? { devResetUrl: resetUrl } : {}),
    });
  } catch (err) {
    return handleApiError(err);
  }
}
