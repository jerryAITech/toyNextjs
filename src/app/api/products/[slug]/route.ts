import { getProductBySlug, getRelatedProducts } from "@/lib/services/productService";
import { ok, fail, handleApiError } from "@/lib/utils/response";

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const product = await getProductBySlug(slug);
    if (!product || product.status !== "ACTIVE") return fail("Product not found.", 404);

    const categoryId =
      typeof product.category === "object" && product.category !== null && "_id" in product.category
        ? String((product.category as { _id: unknown })._id)
        : String(product.category);

    const related = await getRelatedProducts(product._id.toString(), categoryId);
    return ok({ product, related });
  } catch (err) {
    return handleApiError(err);
  }
}
