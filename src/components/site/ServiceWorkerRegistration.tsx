"use client";

import { useEffect } from "react";

// Only registered in production — a caching service worker fights Next's dev-mode
// fast refresh (stale chunks, stale RSC payloads), so it's skipped in `next dev`.
export function ServiceWorkerRegistration() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (!("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js").catch(() => {});
  }, []);

  return null;
}
