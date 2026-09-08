import { NextRequest } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/session";
import { moderateReview, adminDeleteReview } from "@/lib/services/reviewService";
import { ok, handleApiError } from "@/lib/utils/response";

const schema = z.object({ status: z.enum(["APPROVED", "REJECTED", "HIDDEN"]) });

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await params;
    const { status } = schema.parse(await req.json());
    const review = await moderateReview(id, status);
    return ok(review);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await params;
    await adminDeleteReview(id);
    return ok({ deleted: true });
  } catch (err) {
    return handleApiError(err);
  }
}
