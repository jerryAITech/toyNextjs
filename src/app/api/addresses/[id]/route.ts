import { NextRequest } from "next/server";
import { requireUser } from "@/lib/auth/session";
import { addressSchema } from "@/lib/validation/address";
import { updateAddress, deleteAddress } from "@/lib/services/addressService";
import { ok, handleApiError } from "@/lib/utils/response";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireUser();
    const { id } = await params;
    const body = addressSchema.partial().parse(await req.json());
    const address = await updateAddress(session.sub, id, body);
    return ok(address);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireUser();
    const { id } = await params;
    await deleteAddress(session.sub, id);
    return ok({ deleted: true });
  } catch (err) {
    return handleApiError(err);
  }
}
