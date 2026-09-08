import { Loader2 } from "lucide-react";

export function InlineLoader({ label = "Loading..." }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-2 py-10 text-sm text-ink-400">
      <Loader2 size={16} className="animate-spin" />
      {label}
    </div>
  );
}
