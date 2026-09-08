import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth/session";
import { bannerSchema } from "@/lib/validation/banner";
import { getBannerById, updateBanner, deleteBanner } from "@/lib/services/bannerService";
import { ok, fail, handleApiError } from "@/lib/utils/response";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await params;
    const banner = await getBannerById(id);
    if (!banner) return fail("Banner not found.", 404);
    return ok(banner);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await params;
    const body = bannerSchema.partial().parse(await req.json());
    const banner = await updateBanner(id, body);
    return ok(banner);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await params;
    await deleteBanner(id);
    return ok({ deleted: true });
  } catch (err) {
    return handleApiError(err);
  }
}
