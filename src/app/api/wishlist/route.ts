import { NextRequest } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/auth/session";
import { getWishlist, addToWishlist, removeFromWishlist } from "@/lib/services/wishlistService";
import { ok, handleApiError } from "@/lib/utils/response";

const bodySchema = z.object({ productId: z.string().min(1) });

export async function GET() {
  try {
    const session = await requireUser();
    const products = await getWishlist(session.sub);
    return ok({ products });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireUser();
    const { productId } = bodySchema.parse(await req.json());
    await addToWishlist(session.sub, productId);
    return ok({ added: true }, 201);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await requireUser();
    const productId = req.nextUrl.searchParams.get("productId");
    if (!productId) return handleApiError(new Error("productId is required"));
    await removeFromWishlist(session.sub, productId);
    return ok({ removed: true });
  } catch (err) {
    return handleApiError(err);
  }
}
