import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import { ApiError } from "@/lib/utils/response";

const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];
const VIDEO_TYPES = ["video/mp4", "video/webm"];
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const MAX_VIDEO_SIZE = 50 * 1024 * 1024;

export type UploadFolder = "products" | "banners" | "categories";

export async function saveUpload(file: File, folder: UploadFolder, kind: "image" | "video") {
  const allowedTypes = kind === "image" ? IMAGE_TYPES : VIDEO_TYPES;
  const maxSize = kind === "image" ? MAX_IMAGE_SIZE : MAX_VIDEO_SIZE;

  if (!allowedTypes.includes(file.type)) {
    throw new ApiError(`Unsupported file type for ${kind}: ${file.type}`, 422);
  }
  if (file.size > maxSize) {
    throw new ApiError(`File is too large. Maximum size is ${Math.round(maxSize / (1024 * 1024))}MB.`, 422);
  }

  const ext = file.type.split("/")[1];
  const filename = `${randomUUID()}.${ext}`;
  const dir = path.join(process.cwd(), "public", "uploads", folder);
  await mkdir(dir, { recursive: true });

  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(dir, filename), buffer);

  return `/uploads/${folder}/${filename}`;
}
