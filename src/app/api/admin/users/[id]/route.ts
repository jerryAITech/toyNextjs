import { NextRequest } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/session";
import { getUserDetail, setUserStatus } from "@/lib/services/userAdminService";
import { ok, handleApiError } from "@/lib/utils/response";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await params;
    const detail = await getUserDetail(id);
    return ok(detail);
  } catch (err) {
    return handleApiError(err);
  }
}

const statusSchema = z.object({ status: z.enum(["ACTIVE", "INACTIVE"]) });

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await params;
    const { status } = statusSchema.parse(await req.json());
    const user = await setUserStatus(id, status);
    return ok(user);
  } catch (err) {
    return handleApiError(err);
  }
}
