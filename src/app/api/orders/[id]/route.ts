import { requireUser } from "@/lib/auth/session";
import { getOrderById } from "@/lib/services/orderService";
import { ok, handleApiError } from "@/lib/utils/response";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireUser();
    const { id } = await params;
    const order = await getOrderById(session.sub, id);
    return ok({ order });
  } catch (err) {
    return handleApiError(err);
  }
}
