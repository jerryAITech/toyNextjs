"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Play, RotateCcw, Trophy, Flame } from "lucide-react";
import { playHitSound, playGameOverSound, playWinSound } from "@/lib/games/soundEffects";

type HoleItem = {
  emoji: string;
  points: number;
  isBomb: boolean;
};

const TOYS: HoleItem[] = [
  { emoji: "🧸", points: 15, isBomb: false },
  { emoji: "🐰", points: 20, isBomb: false },
  { emoji: "🤖", points: 25, isBomb: false },
  { emoji: "🦖", points: 20, isBomb: false },
  { emoji: "🦆", points: 15, isBomb: false },
  { emoji: "💣", points: -30, isBomb: true },
];

const GAME_DURATION = 30;

export function GameWhackAToy({ active }: { active: boolean }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(0);

  const [highScore, setHighScore] = useState(() => {
    try {
      return parseInt(localStorage.getItem("toystore_highscore_whack") || "0", 10) || 0;
    } catch {
      return 0;
    }
  });

  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [combo, setCombo] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [activeHoles, setActiveHoles] = useState<(HoleItem | null)[]>(Array(9).fill(null));
  const [whackedIndex, setWhackedIndex] = useState<number | null>(null);

  const timeoutIdsRef = useRef<NodeJS.Timeout[]>([]);
  const effectivelyPlaying = isPlaying && active;

  const clearAllTimers = () => {
    timeoutIdsRef.current.forEach(clearTimeout);
    timeoutIdsRef.current = [];
  };

  const startGame = useCallback(() => {
    clearAllTimers();
    setScore(0);
    setCombo(0);
    setTimeLeft(GAME_DURATION);
    setGameOver(false);
    setActiveHoles(Array(9).fill(null));
    setIsPlaying(true);
  }, []);

  // Pop up toys randomly
  useEffect(() => {
    if (!effectivelyPlaying) return;

    const spawnInterval = setInterval(() => {
      // Pick 1 to 2 random holes
      const holeIndex = Math.floor(Math.random() * 9);
      const isBomb = Math.random() < 0.16;
      const toy = isBomb ? TOYS[TOYS.length - 1] : TOYS[Math.floor(Math.random() * (TOYS.length - 1))];

      setActiveHoles((prev) => {
        if (prev[holeIndex] !== null) return prev;
        const next = [...prev];
        next[holeIndex] = toy;
        return next;
      });

      // Stay up for 750ms - 1100ms
      const hideTime = 750 + Math.random() * 350;
      const hideTimeout = setTimeout(() => {
        setActiveHoles((prev) => {
          if (prev[holeIndex] !== toy) return prev;
          const next = [...prev];
          next[holeIndex] = null;
          return next;
        });
      }, hideTime);

      timeoutIdsRef.current.push(hideTimeout);
    }, 550);

    return () => {
      clearInterval(spawnInterval);
      clearAllTimers();
    };
  }, [effectivelyPlaying]);

  // Countdown timer
  useEffect(() => {
    if (!effectivelyPlaying) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsPlaying(false);
          setGameOver(true);
          playGameOverSound();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [effectivelyPlaying]);

  // Whack hole handler
  const handleWhack = (index: number) => {
    if (!isPlaying) return;
    const item = activeHoles[index];
    if (!item) return;

    playHitSound();
    setWhackedIndex(index);
    setTimeout(() => setWhackedIndex(null), 250);

    // Hide immediately
    setActiveHoles((prev) => {
      const next = [...prev];
      next[index] = null;
      return next;
    });

    if (item.isBomb) {
      setScore((s) => Math.max(0, s + item.points));
      setCombo(0);
    } else {
      const mult = 1 + Math.min(Math.floor(combo / 3), 4) * 0.5;
      const pts = Math.round(item.points * mult);
      setScore((s) => {
        const next = s + pts;
        setHighScore((prevHigh) => {
          if (next > prevHigh) {
            try {
              localStorage.setItem("toystore_highscore_whack", String(next));
            } catch {}
            playWinSound();
            return next;
          }
          return prevHigh;
        });
        return next;
      });
      setCombo((c) => c + 1);
    }
  };

  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden select-none bg-gradient-to-b from-orange-100 via-rose-50 to-amber-50">
      {/* Game Header Bar */}
      <div className="relative z-20 flex items-center justify-between px-4 pt-3 pb-2">
        <div className="flex items-center gap-2">
          <span className="flex size-9 items-center justify-center rounded-2xl bg-white shadow-xs text-xl">
            🦔
          </span>
          <div>
            <h3 className="font-display text-base font-extrabold text-ink-900 leading-tight">
              Whack-a-Toy!
            </h3>
            <p className="text-[11px] font-medium text-ink-500">Tap toys before they hide!</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 rounded-full bg-sun-100/90 px-2.5 py-1 text-xs font-bold text-ink-800 shadow-xs">
            <Trophy size={13} className="text-sun-500" />
            <span>{highScore}</span>
          </div>

          <button
            type="button"
            onClick={startGame}
            aria-label="Restart"
            className="flex size-8 items-center justify-center rounded-full bg-white text-ink-700 shadow-xs active:scale-95"
          >
            <RotateCcw size={14} />
          </button>
        </div>
      </div>

      {/* Live Stats Row */}
      <div className="relative z-20 mx-4 flex items-center justify-between rounded-2xl bg-white/80 px-4 py-1.5 backdrop-blur shadow-xs text-center">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-wider text-ink-400">Score</span>
          <p className="font-display text-lg font-black text-primary-600">{score}</p>
        </div>

        {combo > 1 && (
          <div className="flex items-center gap-1 animate-pulse rounded-full bg-accent-500 px-2.5 py-0.5 text-xs font-bold text-white shadow-xs">
            <Flame size={13} /> {combo}x Streak
          </div>
        )}

        <div>
          <span className="text-[10px] uppercase font-bold tracking-wider text-ink-400">Time</span>
          <p className="font-display text-lg font-black text-ink-800">{timeLeft}s</p>
        </div>
      </div>

      {/* 3x3 Toy Boxes Grid */}
      <div className="relative flex-1 flex items-center justify-center p-4">
        <div className="grid grid-cols-3 gap-3 w-full max-w-xs">
          {activeHoles.map((item, index) => {
            const isWhacked = whackedIndex === index;

            return (
              <button
                key={index}
                type="button"
                onClick={() => handleWhack(index)}
                className="relative aspect-square rounded-3xl bg-amber-200/90 border-4 border-amber-400/80 shadow-soft overflow-hidden flex items-center justify-center active:scale-95 transition-transform"
                aria-label={`Toy box hole ${index + 1}`}
              >
                {/* Hole Depth Shadow */}
                <div className="absolute inset-x-2 bottom-1 h-3 rounded-full bg-amber-700/20" />

                {/* Popping Toy */}
                {item && (
                  <div
                    className={`text-4xl sm:text-5xl select-none transition-all duration-150 transform-gpu ${
                      isWhacked ? "scale-50 opacity-40 rotate-12" : "scale-100 animate-pop"
                    }`}
                  >
                    {item.emoji}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Start Overlay */}
        {!isPlaying && !gameOver && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/40 text-center backdrop-blur-xs p-4">
            <span className="text-4xl mb-2">🦔</span>
            <h4 className="font-display text-xl font-black text-white">
              Whack-a-Toy!
            </h4>
            <p className="mt-1 text-xs text-white/90 max-w-xs">
              Tap toys as soon as they pop up. Watch out for the 💣 bombs!
            </p>
            <button
              type="button"
              onClick={startGame}
              className="mt-4 flex items-center gap-2 rounded-full bg-primary-500 px-6 py-2.5 text-sm font-bold text-white shadow-lifted hover:bg-primary-600 active:scale-95"
            >
              <Play size={16} fill="currentColor" /> Tap to Start
            </button>
          </div>
        )}

        {/* Game Over Screen */}
        {gameOver && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/55 text-center backdrop-blur-xs p-4 animate-sheet-up">
            <div className="rounded-3xl bg-white p-6 shadow-lifted w-full max-w-xs">
              <span className="text-4xl">⏱️</span>
              <h4 className="mt-2 font-display text-xl font-extrabold text-ink-900">
                Time Out!
              </h4>
              <p className="text-xs text-ink-500">Your Whack-a-Toy Score</p>
              <p className="my-3 font-display text-4xl font-black text-primary-600">{score}</p>
              <button
                type="button"
                onClick={startGame}
                className="w-full flex items-center justify-center gap-2 rounded-full bg-primary-500 py-3 text-sm font-bold text-white shadow-soft active:scale-95"
              >
                <RotateCcw size={16} /> Play Again
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
