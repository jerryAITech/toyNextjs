import { listCategories } from "@/lib/services/categoryService";
import { ok, handleApiError } from "@/lib/utils/response";

export async function GET() {
  try {
    const categories = await listCategories({ activeOnly: true });
    return ok({ categories });
  } catch (err) {
    return handleApiError(err);
  }
}
