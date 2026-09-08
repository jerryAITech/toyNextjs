import { requireAdmin } from "@/lib/auth/session";
import { listAllReviewsForAdmin } from "@/lib/services/reviewService";
import { ok, handleApiError } from "@/lib/utils/response";

export async function GET() {
  try {
    await requireAdmin();
    const reviews = await listAllReviewsForAdmin();
    return ok({ reviews });
  } catch (err) {
    return handleApiError(err);
  }
}
