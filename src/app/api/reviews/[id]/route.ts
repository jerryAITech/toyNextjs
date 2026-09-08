import { NextRequest } from "next/server";
import { requireUser } from "@/lib/auth/session";
import { updateReview, deleteReview } from "@/lib/services/reviewService";
import { reviewSchema } from "@/lib/validation/review";
import { ok, handleApiError } from "@/lib/utils/response";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireUser();
    const { id } = await params;
    const body = reviewSchema.omit({ productId: true }).parse(await req.json());
    const review = await updateReview(session.sub, id, body.rating, body.comment);
    return ok(review);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireUser();
    const { id } = await params;
    await deleteReview(session.sub, id);
    return ok({ deleted: true });
  } catch (err) {
    return handleApiError(err);
  }
}
