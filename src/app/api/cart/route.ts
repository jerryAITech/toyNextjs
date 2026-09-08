import { NextRequest } from "next/server";
import { z } from "zod";
import { resolveCartOwner } from "@/lib/auth/owner";
import { getCart, addToCart, updateCartItem, removeFromCart } from "@/lib/services/cartService";
import { ok, handleApiError } from "@/lib/utils/response";

const addSchema = z.object({ productId: z.string().min(1), quantity: z.coerce.number().int().min(1).default(1) });
const updateSchema = z.object({ productId: z.string().min(1), quantity: z.coerce.number().int().min(0) });

export async function GET() {
  try {
    const owner = await resolveCartOwner();
    const cart = await getCart(owner);
    return ok(cart);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const owner = await resolveCartOwner();
    const { productId, quantity } = addSchema.parse(await req.json());
    const cart = await addToCart(owner, productId, quantity);
    return ok(cart, 201);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const owner = await resolveCartOwner();
    const { productId, quantity } = updateSchema.parse(await req.json());
    const cart = await updateCartItem(owner, productId, quantity);
    return ok(cart);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const owner = await resolveCartOwner();
    const productId = req.nextUrl.searchParams.get("productId");
    if (!productId) return ok(await getCart(owner));
    const cart = await removeFromCart(owner, productId);
    return ok(cart);
  } catch (err) {
    return handleApiError(err);
  }
}
