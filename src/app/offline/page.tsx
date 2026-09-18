import type { Metadata } from "next";
import Link from "next/link";
import { WifiOff } from "lucide-react";

export const metadata: Metadata = {
  title: "You're offline",
};

// Served by the service worker (public/sw.js) as the fallback for page
// navigations when there's no network and nothing cached for that URL yet.
export default function OfflinePage() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col items-center justify-center gap-3 px-4 text-center">
      <div className="flex size-16 items-center justify-center rounded-full bg-ink-50">
        <WifiOff className="size-8 text-ink-400" />
      </div>
      <h1 className="font-display text-lg font-semibold text-ink-800">You&apos;re offline</h1>
      <p className="max-w-xs text-sm text-ink-500">
        This page isn&apos;t available without an internet connection. Pages you&apos;ve already visited may still work.
      </p>
      <Link
        href="/"
        className="mt-1 inline-flex h-9 items-center justify-center rounded-full bg-primary-500 px-4 text-sm font-semibold text-white shadow-soft transition-colors hover:bg-primary-600"
      >
        Try Home
      </Link>
    </div>
  );
}
