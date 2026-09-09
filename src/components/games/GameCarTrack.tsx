"use client";

import { useState } from "react";
import { RotateCcw } from "lucide-react";
import { BouncingCar } from "@/components/site/BouncingCar";
import { cn } from "@/lib/utils/cn";

const TRACKS = [
  { id: "meadow", label: "Meadow", emoji: "🌻", arena: "bg-gradient-to-br from-mint-100 via-sun-100 to-primary-50", border: "border-white/70" },
  { id: "night", label: "Night City", emoji: "🌃", arena: "bg-gradient-to-br from-ink-900 via-primary-800 to-ink-700", border: "border-white/20" },
  { id: "candy", label: "Candy Land", emoji: "🍭", arena: "bg-gradient-to-br from-berry-100 via-sun-100 to-primary-100", border: "border-white/70" },
  { id: "toyroom", label: "Toy Room", emoji: "🧸", arena: "bg-gradient-to-br from-accent-100 via-sun-100 to-mint-100", border: "border-white/70" },
] as const;

export function GameCarTrack({ active }: { active: boolean }) {
  const [trackId, setTrackId] = useState<(typeof TRACKS)[number]["id"]>(TRACKS[0].id);
  const [resetNonce, setResetNonce] = useState(0);

  const track = TRACKS.find((t) => t.id === trackId) ?? TRACKS[0];

  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden select-none bg-ink-50">
      {/* Game Header Bar */}
      <div className="relative z-20 flex items-center justify-between px-4 pt-3 pb-2 bg-white/80 backdrop-blur">
        <div className="flex items-center gap-2">
          <span className="flex size-9 items-center justify-center rounded-2xl bg-white shadow-xs text-xl">
            🏎️
          </span>
          <div>
            <h3 className="font-display text-base font-extrabold text-ink-900 leading-tight">
              Toy Car Drift
            </h3>
            <p className="text-[11px] font-medium text-ink-500">Drag or steer to drift rainbow trails!</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setResetNonce((n) => n + 1)}
            aria-label="Reset Car"
            className="flex items-center gap-1 rounded-full border border-ink-200 bg-white px-3 py-1.5 text-xs font-bold text-ink-700 shadow-xs active:scale-95"
          >
            <RotateCcw size={12} /> Reset
          </button>
        </div>
      </div>

      {/* Track Selector Tabs */}
      <div className="relative z-20 flex items-center justify-center gap-1.5 px-4 py-2 bg-white/60 backdrop-blur border-b border-ink-100">
        {TRACKS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTrackId(t.id)}
            className={cn(
              "flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold transition-colors",
              trackId === t.id
                ? "bg-primary-500 text-white shadow-xs"
                : "bg-white/80 text-ink-600 hover:bg-white"
            )}
          >
            <span>{t.emoji}</span> {t.label}
          </button>
        ))}
      </div>

      {/* Arena Driving Canvas */}
      <div className="relative mx-3 my-2 flex-1 overflow-hidden rounded-3xl border border-ink-100 shadow-soft">
        <div className={cn("absolute inset-0 transition-colors duration-300", track.arena)} aria-hidden="true" />
        <div className={cn("pointer-events-none absolute inset-3 rounded-2xl border-4 border-dashed", track.border)} aria-hidden="true" />

        {/* Embedded Car Physics with Rainbow Trail */}
        {active && (
          <BouncingCar key={`${trackId}-${resetNonce}`} mode="embedded" trail />
        )}
      </div>
    </div>
  );
}
