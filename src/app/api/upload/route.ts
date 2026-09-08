import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth/session";
import { saveUpload, type UploadFolder } from "@/lib/utils/upload";
import { ok, handleApiError, ApiError } from "@/lib/utils/response";

const FOLDERS: UploadFolder[] = ["products", "banners", "categories"];

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();

    const formData = await req.formData();
    const file = formData.get("file");
    const folder = formData.get("folder");
    const kind = formData.get("kind");

    if (!(file instanceof File)) throw new ApiError("No file provided.", 422);
    if (typeof folder !== "string" || !FOLDERS.includes(folder as UploadFolder)) {
      throw new ApiError("Invalid upload folder.", 422);
    }
    if (kind !== "image" && kind !== "video") throw new ApiError("Invalid file kind.", 422);

    const url = await saveUpload(file, folder as UploadFolder, kind);
    return ok({ url });
  } catch (err) {
    return handleApiError(err);
  }
}
