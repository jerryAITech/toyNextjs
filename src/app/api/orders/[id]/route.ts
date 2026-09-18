import { resolveOwner } from "@/lib/auth/owner";
import { getOrderById } from "@/lib/services/orderService";
import { ok, handleApiError } from "@/lib/utils/response";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const owner = await resolveOwner();
    const { id } = await params;
    const order = await getOrderById(owner, id);
    return ok({ order });
  } catch (err) {
    return handleApiError(err);
  }
}
