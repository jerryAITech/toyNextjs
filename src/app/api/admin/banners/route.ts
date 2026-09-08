import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth/session";
import { bannerSchema } from "@/lib/validation/banner";
import { listAllBanners, createBanner } from "@/lib/services/bannerService";
import { ok, handleApiError } from "@/lib/utils/response";

export async function GET(req: NextRequest) {
  try {
    await requireAdmin();
    const type = req.nextUrl.searchParams.get("type");
    const banners = await listAllBanners(type === "HOME" || type === "CATEGORY" ? type : undefined);
    return ok({ banners });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    const body = bannerSchema.parse(await req.json());
    const banner = await createBanner(body);
    return ok(banner, 201);
  } catch (err) {
    return handleApiError(err);
  }
}
