import { NextRequest } from "next/server";
import { productListQuerySchema } from "@/lib/validation/product";
import { listProducts } from "@/lib/services/productService";
import { ok, handleApiError } from "@/lib/utils/response";

export async function GET(req: NextRequest) {
  try {
    const query = productListQuerySchema.parse(Object.fromEntries(req.nextUrl.searchParams));
    const result = await listProducts(query);
    return ok(result);
  } catch (err) {
    return handleApiError(err);
  }
}
