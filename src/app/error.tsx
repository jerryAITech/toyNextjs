"use client";

import { useEffect } from "react";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-4 text-center">
      <span className="text-7xl">😵</span>
      <h1 className="font-display text-2xl font-extrabold text-ink-900">Oops, something went wrong</h1>
      <p className="max-w-sm text-sm text-ink-500">We hit a snag loading this page. Please try again.</p>
      <button
        onClick={reset}
        className="mt-2 inline-flex h-11 items-center justify-center rounded-full bg-primary-500 px-6 text-sm font-semibold text-white shadow-soft hover:bg-primary-600"
      >
        Try Again
      </button>
    </div>
  );
}
