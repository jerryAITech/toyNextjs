import { requireAdmin } from "@/lib/auth/session";
import { getOrderById } from "@/lib/services/orderService";
import { UserModel } from "@/lib/models/User";
import { ok, handleApiError } from "@/lib/utils/response";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await params;
    const order = await getOrderById({ userId: null, guestId: null }, id, true);
    const customer = order.userId
      ? await UserModel.findById(order.userId).select("name email mobile").lean()
      : { name: `${order.addressSnapshot.fullName} (Guest)`, email: order.guestEmail || "", mobile: order.addressSnapshot.mobile };
    return ok({ order, customer });
  } catch (err) {
    return handleApiError(err);
  }
}
