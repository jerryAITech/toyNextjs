import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth/session";
import { productSchema } from "@/lib/validation/product";
import { getProductById, updateProduct, deleteProduct } from "@/lib/services/productService";
import { ok, fail, handleApiError } from "@/lib/utils/response";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await params;
    const product = await getProductById(id);
    if (!product) return fail("Product not found.", 404);
    return ok(product);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await params;
    const body = productSchema.partial().parse(await req.json());
    const product = await updateProduct(id, body);
    return ok(product);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await params;
    await deleteProduct(id);
    return ok({ deleted: true });
  } catch (err) {
    return handleApiError(err);
  }
}
