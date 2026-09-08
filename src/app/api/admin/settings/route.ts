import { NextRequest } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/session";
import { getSettings, updateSettings } from "@/lib/services/settingsService";
import { ok, handleApiError } from "@/lib/utils/response";

export async function GET() {
  try {
    await requireAdmin();
    const settings = await getSettings();
    return ok(settings);
  } catch (err) {
    return handleApiError(err);
  }
}

const settingsSchema = z.object({
  storeName: z.string().trim().min(1).optional(),
  logo: z.string().optional(),
  contactEmail: z.email().optional(),
  contactPhone: z.string().optional(),
  address: z.string().optional(),
  currency: z.string().optional(),
  codEnabled: z.boolean().optional(),
  codMaxOrderAmount: z.coerce.number().min(0).optional(),
  razorpayEnabled: z.boolean().optional(),
  shippingFee: z.coerce.number().min(0).optional(),
  freeShippingThreshold: z.coerce.number().min(0).optional(),
  cancellationWindowStatus: z.string().optional(),
  lowStockThreshold: z.coerce.number().min(0).optional(),
});

export async function PATCH(req: NextRequest) {
  try {
    await requireAdmin();
    const body = settingsSchema.parse(await req.json());
    const settings = await updateSettings(body);
    return ok(settings);
  } catch (err) {
    return handleApiError(err);
  }
}
