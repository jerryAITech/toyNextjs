import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-4 text-center">
      <span className="text-7xl">🧸</span>
      <h1 className="font-display text-3xl font-extrabold text-ink-900">404 — Toy Not Found</h1>
      <p className="max-w-sm text-sm text-ink-500">The page you&apos;re looking for has wandered off to play somewhere else.</p>
      <Link
        href="/"
        className="mt-2 inline-flex h-11 items-center justify-center rounded-full bg-primary-500 px-6 text-sm font-semibold text-white shadow-soft hover:bg-primary-600"
      >
        Back to Home
      </Link>
    </div>
  );
}
