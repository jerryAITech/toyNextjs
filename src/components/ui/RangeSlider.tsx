"use client";

import { cn } from "@/lib/utils/cn";

// Two overlapping native <input type="range"> elements — the input itself is pointer-events-none
// so clicks pass through to whichever thumb sits on top; only the thumb (via the pseudo-element
// selector below) re-enables pointer-events, which is the standard way to build a dual-thumb
// slider out of two single-thumb native inputs without a drag library.
const thumbClasses =
  "[&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:size-4 " +
  "[&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-primary-500 " +
  "[&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-soft [&::-webkit-slider-thumb]:cursor-pointer " +
  "[&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:size-4 [&::-moz-range-thumb]:rounded-full " +
  "[&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-primary-500 [&::-moz-range-thumb]:bg-white " +
  "[&::-moz-range-thumb]:shadow-soft [&::-moz-range-thumb]:cursor-pointer";

export function RangeSlider({
  min,
  max,
  valueMin,
  valueMax,
  step = 50,
  onChange,
}: {
  min: number;
  max: number;
  valueMin: number;
  valueMax: number;
  step?: number;
  onChange: (min: number, max: number) => void;
}) {
  const pctMin = ((valueMin - min) / (max - min)) * 100;
  const pctMax = ((valueMax - min) / (max - min)) * 100;

  return (
    <div className="relative h-5 w-full">
      <div className="absolute inset-x-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-ink-200" />
      <div
        className="absolute top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-primary-500"
        style={{ left: `${pctMin}%`, right: `${100 - pctMax}%` }}
      />
      <input
        type="range"
        aria-label="Minimum price"
        min={min}
        max={max}
        step={step}
        value={valueMin}
        onChange={(e) => onChange(Math.min(Number(e.target.value), valueMax - step), valueMax)}
        className={cn("pointer-events-none absolute inset-x-0 top-1/2 h-5 w-full -translate-y-1/2 cursor-pointer appearance-none bg-transparent", thumbClasses)}
      />
      <input
        type="range"
        aria-label="Maximum price"
        min={min}
        max={max}
        step={step}
        value={valueMax}
        onChange={(e) => onChange(valueMin, Math.max(Number(e.target.value), valueMin + step))}
        className={cn("pointer-events-none absolute inset-x-0 top-1/2 h-5 w-full -translate-y-1/2 cursor-pointer appearance-none bg-transparent", thumbClasses)}
      />
    </div>
  );
}
