"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { UploadCloud, X, Loader2, PlayCircle } from "lucide-react";
import { useToast } from "@/context/ToastContext";
import type { UploadFolder } from "@/lib/utils/upload";

async function uploadFile(file: File, folder: UploadFolder, kind: "image" | "video") {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("folder", folder);
  formData.append("kind", kind);
  const res = await fetch("/api/upload", { method: "POST", body: formData });
  const json = await res.json();
  if (!json.success) throw new Error(json.message || "Upload failed");
  return json.data.url as string;
}

export function ImageListUploadField({
  label,
  folder,
  images,
  onChange,
  max = 5,
}: {
  label: string;
  folder: UploadFolder;
  images: string[];
  onChange: (next: string[]) => void;
  max?: number;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const { showToast } = useToast();

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    if (images.length + files.length > max) {
      showToast(`You can upload at most ${max} images.`, "error");
      return;
    }
    setUploading(true);
    try {
      const urls: string[] = [];
      for (const file of Array.from(files)) {
        urls.push(await uploadFile(file, folder, "image"));
      }
      onChange([...images, ...urls]);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Upload failed", "error");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-ink-700">
        {label} ({images.length}/{max})
      </label>
      <div className="flex flex-wrap gap-3">
        {images.map((url, i) => (
          <div key={url} className="relative size-24 overflow-hidden rounded-xl border border-ink-200 bg-ink-50">
            <Image src={url} alt={`Upload ${i + 1}`} fill sizes="96px" className="object-cover" />
            <button
              type="button"
              onClick={() => onChange(images.filter((_, idx) => idx !== i))}
              className="absolute right-1 top-1 flex size-5 items-center justify-center rounded-full bg-black/60 text-white"
            >
              <X size={12} />
            </button>
          </div>
        ))}
        {images.length < max && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="flex size-24 flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-ink-200 text-ink-400 hover:border-primary-400 hover:text-primary-500"
          >
            {uploading ? <Loader2 size={20} className="animate-spin" /> : <UploadCloud size={20} />}
            <span className="text-xs">Upload</span>
          </button>
        )}
      </div>
      <input ref={inputRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => handleFiles(e.target.files)} />
    </div>
  );
}

export function VideoUploadField({
  label,
  folder,
  video,
  onChange,
}: {
  label: string;
  folder: UploadFolder;
  video: string | null;
  onChange: (next: string | null) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const { showToast } = useToast();

  async function handleFile(files: FileList | null) {
    const file = files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadFile(file, folder, "video");
      onChange(url);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Upload failed", "error");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-ink-700">{label} (max 1)</label>
      {video ? (
        <div className="flex items-center gap-3 rounded-xl border border-ink-200 p-3">
          <PlayCircle size={22} className="text-primary-500" />
          <span className="flex-1 truncate text-sm text-ink-600">{video.split("/").pop()}</span>
          <button type="button" onClick={() => onChange(null)} className="text-danger">
            <X size={16} />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="flex h-16 w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-ink-200 text-ink-400 hover:border-primary-400 hover:text-primary-500"
        >
          {uploading ? <Loader2 size={18} className="animate-spin" /> : <UploadCloud size={18} />}
          <span className="text-sm">Upload Video</span>
        </button>
      )}
      <input ref={inputRef} type="file" accept="video/mp4,video/webm" className="hidden" onChange={(e) => handleFile(e.target.files)} />
    </div>
  );
}
