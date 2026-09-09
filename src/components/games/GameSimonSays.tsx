"use client";

import { useState, useCallback, useRef } from "react";
import { Play, RotateCcw, Trophy } from "lucide-react";
import { playTone, playWinSound, playGameOverSound } from "@/lib/games/soundEffects";

type PadColor = 0 | 1 | 2 | 3;

const PADS = [
  { id: 0 as PadColor, name: "Red", emoji: "🧸", freq: 261.63, bg: "bg-rose-500", activeBg: "bg-rose-300 ring-8 ring-rose-300/80 scale-105" },
  { id: 1 as PadColor, name: "Blue", emoji: "🤖", freq: 329.63, bg: "bg-sky-500", activeBg: "bg-sky-300 ring-8 ring-sky-300/80 scale-105" },
  { id: 2 as PadColor, name: "Green", emoji: "🦆", freq: 392.0, bg: "bg-emerald-500", activeBg: "bg-emerald-300 ring-8 ring-emerald-300/80 scale-105" },
  { id: 3 as PadColor, name: "Yellow", emoji: "⭐", freq: 523.25, bg: "bg-amber-400", activeBg: "bg-amber-200 ring-8 ring-amber-200/80 scale-105" },
];

export function GameSimonSays({ active }: { active: boolean }) {
  void active;
  const [isPlaying, setIsPlaying] = useState(false);
  const [round, setRound] = useState(0);

  const [highScore, setHighScore] = useState(() => {
    try {
      return parseInt(localStorage.getItem("toystore_highscore_simon") || "0", 10) || 0;
    } catch {
      return 0;
    }
  });

  const [activePad, setActivePad] = useState<PadColor | null>(null);
  const [isShowingSequence, setIsShowingSequence] = useState(false);
  const [gameOver, setGameOver] = useState(false);

  const sequenceRef = useRef<PadColor[]>([]);
  const playerStepRef = useRef(0);

  const playPadTone = (padId: PadColor) => {
    const pad = PADS[padId];
    if (pad) {
      playTone(pad.freq, 0.25);
    }
  };

  const playSequence = useCallback((seq: PadColor[]) => {
    setIsShowingSequence(true);
    let step = 0;

    const interval = setInterval(() => {
      if (step >= seq.length) {
        clearInterval(interval);
        setActivePad(null);
        setIsShowingSequence(false);
        playerStepRef.current = 0;
        return;
      }

      const padId = seq[step];
      setActivePad(padId);
      playPadTone(padId);

      setTimeout(() => {
        setActivePad(null);
      }, 350);

      step++;
    }, 600);
  }, []);

  const nextRound = useCallback((currentSeq: PadColor[]) => {
    const nextPad = Math.floor(Math.random() * 4) as PadColor;
    const newSeq = [...currentSeq, nextPad];
    sequenceRef.current = newSeq;
    setRound(newSeq.length);

    setHighScore((prev) => {
      if (newSeq.length > prev) {
        try {
          localStorage.setItem("toystore_highscore_simon", String(newSeq.length));
        } catch {}
        return newSeq.length;
      }
      return prev;
    });

    setTimeout(() => {
      playSequence(newSeq);
    }, 600);
  }, [playSequence]);

  const startGame = useCallback(() => {
    sequenceRef.current = [];
    playerStepRef.current = 0;
    setRound(0);
    setGameOver(false);
    setIsPlaying(true);
    nextRound([]);
  }, [nextRound]);

  const handlePadPress = (padId: PadColor) => {
    if (!isPlaying || isShowingSequence || gameOver) return;

    setActivePad(padId);
    playPadTone(padId);
    setTimeout(() => setActivePad(null), 200);

    const expected = sequenceRef.current[playerStepRef.current];
    if (padId === expected) {
      // Correct step
      playerStepRef.current += 1;
      if (playerStepRef.current === sequenceRef.current.length) {
        // Round completed!
        playWinSound();
        setTimeout(() => {
          nextRound(sequenceRef.current);
        }, 500);
      }
    } else {
      // Wrong pad - Game Over
      playGameOverSound();
      setIsPlaying(false);
      setGameOver(true);
    }
  };

  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden select-none bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-950">
      {/* Game Header Bar */}
      <div className="relative z-20 flex items-center justify-between px-4 pt-3 pb-2 bg-black/40 backdrop-blur">
        <div className="flex items-center gap-2">
          <span className="flex size-9 items-center justify-center rounded-2xl bg-white/20 shadow-xs text-xl">
            🎨
          </span>
          <div>
            <h3 className="font-display text-base font-extrabold text-white leading-tight">
              Toy Simon Says
            </h3>
            <p className="text-[11px] font-medium text-white/70">Watch & repeat the melody!</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 rounded-full bg-sun-400/20 px-2.5 py-1 text-xs font-bold text-sun-300">
            <Trophy size={13} />
            <span>{highScore}</span>
          </div>

          <button
            type="button"
            onClick={startGame}
            aria-label="Restart"
            className="flex size-8 items-center justify-center rounded-full bg-white/20 text-white shadow-xs active:scale-95"
          >
            <RotateCcw size={14} />
          </button>
        </div>
      </div>

      {/* Live Round Pill */}
      <div className="relative z-20 mx-4 mt-2 flex items-center justify-between rounded-2xl bg-white/10 px-4 py-1.5 backdrop-blur text-center text-white">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-wider text-white/60">Round</span>
          <p className="font-display text-xl font-black text-sun-300">{round}</p>
        </div>
        <p className="text-xs font-semibold text-white/80">
          {isShowingSequence ? "👀 Watch closely..." : isPlaying ? "👉 Your turn!" : "Press Play to begin"}
        </p>
      </div>

      {/* 4 Simon Pads in a circular 2x2 grid */}
      <div className="relative flex-1 flex items-center justify-center p-4">
        <div className="relative grid grid-cols-2 gap-4 w-full max-w-[280px] sm:max-w-[320px] aspect-square rounded-full p-4 bg-slate-800/80 border-8 border-slate-700 shadow-lifted">
          {/* Center Hub */}
          <div className="absolute inset-0 m-auto flex size-20 items-center justify-center rounded-full bg-slate-900 border-4 border-slate-700 shadow-inner z-10 pointer-events-none">
            <span className="text-2xl">🎵</span>
          </div>

          {PADS.map((pad) => {
            const isLit = activePad === pad.id;

            return (
              <button
                key={pad.id}
                type="button"
                onPointerDown={(e) => {
                  e.preventDefault();
                  handlePadPress(pad.id);
                }}
                disabled={isShowingSequence}
                aria-label={`Simon Pad ${pad.name}`}
                className={`relative rounded-3xl flex flex-col items-center justify-center transition-all duration-150 transform-gpu cursor-pointer shadow-soft ${
                  pad.bg
                } ${isLit ? pad.activeBg : "opacity-85 hover:opacity-100 active:scale-95"}`}
              >
                <span className="text-3xl sm:text-4xl drop-shadow">{pad.emoji}</span>
              </button>
            );
          })}
        </div>

        {/* Start Overlay */}
        {!isPlaying && !gameOver && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/60 text-center backdrop-blur-xs p-4">
            <span className="text-5xl mb-2 animate-bounce">🎨</span>
            <h4 className="font-display text-2xl font-black text-white">
              Toy Simon Says
            </h4>
            <p className="mt-1 text-xs text-white/90 max-w-xs">
              Watch the musical toy pads light up and repeat the exact sequence!
            </p>
            <button
              type="button"
              onClick={startGame}
              className="mt-4 flex items-center gap-2 rounded-full bg-primary-500 px-7 py-3 text-sm font-bold text-white shadow-lifted hover:bg-primary-600 active:scale-95"
            >
              <Play size={16} fill="currentColor" /> Tap to Start
            </button>
          </div>
        )}

        {/* Game Over Screen */}
        {gameOver && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/70 text-center backdrop-blur-xs p-4 animate-sheet-up">
            <div className="rounded-3xl bg-white p-6 shadow-lifted w-full max-w-xs">
              <span className="text-4xl">❌</span>
              <h4 className="mt-2 font-display text-xl font-extrabold text-ink-900">
                Wrong Pad!
              </h4>
              <p className="text-xs text-ink-500">Pattern Length Achieved</p>
              <p className="my-3 font-display text-4xl font-black text-primary-600">{round}</p>
              <button
                type="button"
                onClick={startGame}
                className="w-full flex items-center justify-center gap-2 rounded-full bg-primary-500 py-3 text-sm font-bold text-white shadow-soft active:scale-95"
              >
                <RotateCcw size={16} /> Try Again
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
