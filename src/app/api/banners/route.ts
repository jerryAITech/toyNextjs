import { NextRequest } from "next/server";
import { getActiveBanners } from "@/lib/services/bannerService";
import { ok, handleApiError } from "@/lib/utils/response";

export async function GET(req: NextRequest) {
  try {
    const type = req.nextUrl.searchParams.get("type") === "CATEGORY" ? "CATEGORY" : "HOME";
    const categoryId = req.nextUrl.searchParams.get("categoryId") || undefined;
    const banners = await getActiveBanners(type, categoryId);
    return ok({ banners });
  } catch (err) {
    return handleApiError(err);
  }
}
