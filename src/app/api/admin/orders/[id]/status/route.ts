import { NextRequest } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/session";
import { updateOrderStatus } from "@/lib/services/orderService";
import { ORDER_STATUSES } from "@/lib/models/Order";
import { ok, handleApiError } from "@/lib/utils/response";

const schema = z.object({ status: z.enum(ORDER_STATUSES), note: z.string().trim().max(300).optional() });

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await params;
    const { status, note } = schema.parse(await req.json());
    const order = await updateOrderStatus(id, status, note);
    return ok(order);
  } catch (err) {
    return handleApiError(err);
  }
}
