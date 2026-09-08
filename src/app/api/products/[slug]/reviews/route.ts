import { NextRequest } from "next/server";
import { getProductBySlug } from "@/lib/services/productService";
import { getProductReviews, createReview, canUserReview } from "@/lib/services/reviewService";
import { reviewSchema } from "@/lib/validation/review";
import { getSession } from "@/lib/auth/session";
import { ok, fail, handleApiError } from "@/lib/utils/response";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const product = await getProductBySlug(slug);
    if (!product) return fail("Product not found.", 404);

    const data = await getProductReviews(product._id.toString());
    const session = await getSession();
    const eligibility = session ? await canUserReview(session.sub, product._id.toString()) : null;

    return ok({ ...data, eligibility });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const session = await getSession();
    if (!session) return fail("Please log in to write a review.", 401);

    const { slug } = await params;
    const product = await getProductBySlug(slug);
    if (!product) return fail("Product not found.", 404);

    const body = reviewSchema.parse({ ...(await req.json()), productId: product._id.toString() });
    const review = await createReview(session.sub, body.productId, body.rating, body.comment);

    return ok(review, 201);
  } catch (err) {
    return handleApiError(err);
  }
}
