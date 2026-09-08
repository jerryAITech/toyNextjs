import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth/session";
import { categorySchema } from "@/lib/validation/category";
import { getCategoryById, updateCategory, deleteCategory } from "@/lib/services/categoryService";
import { ok, fail, handleApiError } from "@/lib/utils/response";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await params;
    const category = await getCategoryById(id);
    if (!category) return fail("Category not found.", 404);
    return ok(category);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await params;
    const body = categorySchema.partial().parse(await req.json());
    const category = await updateCategory(id, body);
    return ok(category);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await params;
    await deleteCategory(id);
    return ok({ deleted: true });
  } catch (err) {
    return handleApiError(err);
  }
}
