import { NextRequest } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/session";
import { setProductFlag } from "@/lib/services/productService";
import { ok, handleApiError } from "@/lib/utils/response";

const schema = z.object({
  flag: z.enum(["isFeatured", "isBestSeller", "isTrending", "isNewArrival"]),
  value: z.boolean(),
});

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await params;
    const { flag, value } = schema.parse(await req.json());
    const product = await setProductFlag(id, flag, value);
    return ok(product);
  } catch (err) {
    return handleApiError(err);
  }
}
