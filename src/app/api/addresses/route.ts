import { NextRequest } from "next/server";
import { requireUser } from "@/lib/auth/session";
import { addressSchema } from "@/lib/validation/address";
import { listAddresses, createAddress } from "@/lib/services/addressService";
import { ok, handleApiError } from "@/lib/utils/response";

export async function GET() {
  try {
    const session = await requireUser();
    const addresses = await listAddresses(session.sub);
    return ok({ addresses });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireUser();
    const body = addressSchema.parse(await req.json());
    const address = await createAddress(session.sub, body);
    return ok(address, 201);
  } catch (err) {
    return handleApiError(err);
  }
}
