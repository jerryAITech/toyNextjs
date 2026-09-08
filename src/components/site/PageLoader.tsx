import { LogoMark } from "./Logo";

export function PageLoader() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
      <LogoMark size={40} className="animate-pulse" />
      <p className="text-sm font-medium text-ink-400">Loading...</p>
    </div>
  );
}
