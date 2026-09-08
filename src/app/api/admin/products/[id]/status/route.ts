import { NextRequest } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/session";
import { setProductStatus } from "@/lib/services/productService";
import { ok, handleApiError } from "@/lib/utils/response";

const schema = z.object({ status: z.enum(["ACTIVE", "INACTIVE"]) });

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await params;
    const { status } = schema.parse(await req.json());
    const product = await setProductStatus(id, status);
    return ok(product);
  } catch (err) {
    return handleApiError(err);
  }
}
