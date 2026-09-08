import { getCategoryBySlug } from "@/lib/services/categoryService";
import { getActiveBanners } from "@/lib/services/bannerService";
import { ok, fail, handleApiError } from "@/lib/utils/response";

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const category = await getCategoryBySlug(slug);
    if (!category || category.status !== "ACTIVE") return fail("Category not found.", 404);

    const banners = await getActiveBanners("CATEGORY", category._id.toString());
    return ok({ category, banners });
  } catch (err) {
    return handleApiError(err);
  }
}
