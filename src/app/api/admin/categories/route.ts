import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth/session";
import { categorySchema } from "@/lib/validation/category";
import { listCategories, createCategory } from "@/lib/services/categoryService";
import { ok, handleApiError } from "@/lib/utils/response";

export async function GET() {
  try {
    await requireAdmin();
    const categories = await listCategories();
    return ok({ categories });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    const body = categorySchema.parse(await req.json());
    const category = await createCategory(body);
    return ok(category, 201);
  } catch (err) {
    return handleApiError(err);
  }
}
