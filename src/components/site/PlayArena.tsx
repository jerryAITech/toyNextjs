"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { BouncingCar } from "@/components/site/BouncingCar";

const TRACKS = [
  { id: "meadow", label: "Sunny Meadow", emoji: "🌻", arena: "bg-gradient-to-br from-mint-100 via-sun-100 to-primary-50", border: "border-white/70" },
  { id: "night", label: "Night City", emoji: "🌃", arena: "bg-gradient-to-br from-ink-900 via-primary-800 to-ink-700", border: "border-white/20" },
  { id: "candy", label: "Candy Land", emoji: "🍭", arena: "bg-gradient-to-br from-berry-100 via-sun-100 to-primary-100", border: "border-white/70" },
  { id: "toyroom", label: "Toy Room", emoji: "🧸", arena: "bg-gradient-to-br from-accent-100 via-sun-100 to-mint-100", border: "border-white/70" },
] as const;

// Standalone route (outside the (site) layout, same as /explore) so the site header/footer/
// bottom-nav don't crowd the arena — the car used to float over every page; now it only exists
// here, bounded to whichever themed track the user picks.
export function PlayArena() {
  const [trackId, setTrackId] = useState<(typeof TRACKS)[number]["id"]>(TRACKS[0].id);
  // Bumped by the Reset button and folded into the car's `key` below — remounting it wipes both
  // the trail canvas and the car's position/velocity back to a fresh start, so one button resets
  // everything rather than needing separate "clear trail" and "reset position" logic.
  const [resetNonce, setResetNonce] = useState(0);
  const track = TRACKS.find((t) => t.id === trackId) ?? TRACKS[0];

  return (
    <div className="flex min-h-dvh flex-col bg-ink-50">
      <div className="flex items-center gap-3 border-b border-ink-100 bg-white px-4 py-3">
        <Link href="/" aria-label="Back to home" className="flex size-9 shrink-0 items-center justify-center rounded-full text-ink-600 hover:bg-ink-100">
          <ArrowLeft size={18} />
        </Link>
        <div className="min-w-0 flex-1">
          <h1 className="font-display text-lg font-bold text-ink-900">Play</h1>
          <p className="text-xs text-ink-400">Pick a track, then drag or steer the car around.</p>
        </div>
        <button
          type="button"
          onClick={() => setResetNonce((n) => n + 1)}
          className="flex shrink-0 items-center gap-1.5 rounded-full border border-ink-200 px-3.5 py-2 text-sm font-semibold text-ink-600 transition-colors hover:bg-ink-50"
        >
          <RotateCcw size={14} /> Reset
        </button>
      </div>

      <div className="flex flex-wrap gap-2 px-4 py-3">
        {TRACKS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTrackId(t.id)}
            aria-pressed={trackId === t.id}
            className={cn(
              "flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-semibold transition-colors",
              trackId === t.id ? "border-primary-500 bg-primary-500 text-white shadow-soft" : "border-ink-200 bg-white text-ink-600 hover:bg-ink-50"
            )}
          >
            <span aria-hidden="true">{t.emoji}</span> {t.label}
          </button>
        ))}
      </div>

      <div className="relative mx-4 mb-4 flex-1 overflow-hidden rounded-3xl border border-ink-100 shadow-soft">
        <div className={cn("absolute inset-0", track.arena)} aria-hidden="true" />
        <div className={cn("pointer-events-none absolute inset-4 rounded-2xl border-4 border-dashed", track.border)} aria-hidden="true" />
        {/* Remounting on track/reset change resets the car (and its trail) to a fresh start. */}
        <BouncingCar key={`${trackId}-${resetNonce}`} mode="embedded" trail />
      </div>
    </div>
  );
}
