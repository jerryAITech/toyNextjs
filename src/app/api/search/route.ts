import { NextRequest } from "next/server";
import { searchAutocomplete } from "@/lib/services/productService";
import { ok, handleApiError } from "@/lib/utils/response";

export async function GET(req: NextRequest) {
  try {
    const q = req.nextUrl.searchParams.get("q") || "";
    const results = await searchAutocomplete(q);
    return ok({ results });
  } catch (err) {
    return handleApiError(err);
  }
}
