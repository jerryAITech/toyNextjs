import { NextRequest } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/session";
import { cancelOrder } from "@/lib/services/orderService";
import { ok, handleApiError } from "@/lib/utils/response";

const schema = z.object({ reason: z.string().trim().min(1).max(300).default("Cancelled by admin") });

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await params;
    const { reason } = schema.parse(await req.json().catch(() => ({})));
    const order = await cancelOrder("", id, reason, true);
    return ok(order);
  } catch (err) {
    return handleApiError(err);
  }
}
