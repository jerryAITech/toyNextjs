import { requireAdmin } from "@/lib/auth/session";
import { getOrderById } from "@/lib/services/orderService";
import { UserModel } from "@/lib/models/User";
import { ok, handleApiError } from "@/lib/utils/response";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await params;
    const order = await getOrderById("", id, true);
    const customer = await UserModel.findById(order.userId).select("name email mobile").lean();
    return ok({ order, customer });
  } catch (err) {
    return handleApiError(err);
  }
}
