import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth/session";
import { productSchema } from "@/lib/validation/product";
import { createProduct } from "@/lib/services/productService";
import { connectDB } from "@/lib/db/connect";
import { ProductModel } from "@/lib/models/Product";
import { ok, handleApiError } from "@/lib/utils/response";

export async function GET(req: NextRequest) {
  try {
    await requireAdmin();
    await connectDB();
    const q = req.nextUrl.searchParams.get("q");
    const status = req.nextUrl.searchParams.get("status");
    const category = req.nextUrl.searchParams.get("category");

    const filter: Record<string, unknown> = {};
    if (q) filter.$or = [{ name: { $regex: q, $options: "i" } }, { sku: { $regex: q, $options: "i" } }];
    if (status && status !== "all") filter.status = status;
    if (category) filter.category = category;

    const products = await ProductModel.find(filter).sort({ createdAt: -1 }).populate("category", "name slug").lean();
    return ok({ products });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    const body = productSchema.parse(await req.json());
    const product = await createProduct(body);
    return ok(product, 201);
  } catch (err) {
    return handleApiError(err);
  }
}
