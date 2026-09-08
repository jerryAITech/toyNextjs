import { requireUser } from "@/lib/auth/session";
import { setDefaultAddress } from "@/lib/services/addressService";
import { ok, handleApiError } from "@/lib/utils/response";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireUser();
    const { id } = await params;
    const address = await setDefaultAddress(session.sub, id);
    return ok(address);
  } catch (err) {
    return handleApiError(err);
  }
}
