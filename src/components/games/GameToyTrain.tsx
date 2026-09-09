"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Play, RotateCcw, Trophy, ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { playCollectSound, playGameOverSound, playWinSound } from "@/lib/games/soundEffects";

type Direction = "UP" | "DOWN" | "LEFT" | "RIGHT";
type Point = { x: number; y: number };

const GRID_SIZE = 14;
const INITIAL_SPEED = 190; // ms per tick

const INITIAL_TRAIN: Point[] = [
  { x: 5, y: 7 },
  { x: 4, y: 7 },
  { x: 3, y: 7 },
];
const INITIAL_GIFT: Point = { x: 10, y: 7 };

export function GameToyTrain({ active }: { active: boolean }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(0);

  const [highScore, setHighScore] = useState(() => {
    try {
      return parseInt(localStorage.getItem("toystore_highscore_train") || "0", 10) || 0;
    } catch {
      return 0;
    }
  });

  const [gameOver, setGameOver] = useState(false);

  const trainRef = useRef<Point[]>(INITIAL_TRAIN);
  const directionRef = useRef<Direction>("RIGHT");
  const nextDirectionRef = useRef<Direction>("RIGHT");
  const giftRef = useRef<Point>(INITIAL_GIFT);
  const [trainState, setTrainState] = useState<Point[]>(INITIAL_TRAIN);
  const [giftState, setGiftState] = useState<Point>(INITIAL_GIFT);

  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  const effectivelyPlaying = isPlaying && active;

  const spawnGift = useCallback((currentTrain: Point[]) => {
    const emptyCells: Point[] = [];
    for (let x = 0; x < GRID_SIZE; x++) {
      for (let y = 0; y < GRID_SIZE; y++) {
        if (!currentTrain.some((segment) => segment.x === x && segment.y === y)) {
          emptyCells.push({ x, y });
        }
      }
    }
    if (emptyCells.length > 0) {
      const chosen = emptyCells[Math.floor(Math.random() * emptyCells.length)];
      giftRef.current = chosen;
      setGiftState(chosen);
    }
  }, []);

  const startGame = useCallback(() => {
    const initialTrain: Point[] = [
      { x: 5, y: 7 },
      { x: 4, y: 7 },
      { x: 3, y: 7 },
    ];
    trainRef.current = initialTrain;
    directionRef.current = "RIGHT";
    nextDirectionRef.current = "RIGHT";
    setTrainState(initialTrain);
    setScore(0);
    setGameOver(false);
    setIsPlaying(true);
    spawnGift(initialTrain);
  }, [spawnGift]);

  const changeDirection = useCallback((newDir: Direction) => {
    const current = directionRef.current;
    if (
      (newDir === "UP" && current !== "DOWN") ||
      (newDir === "DOWN" && current !== "UP") ||
      (newDir === "LEFT" && current !== "RIGHT") ||
      (newDir === "RIGHT" && current !== "LEFT")
    ) {
      nextDirectionRef.current = newDir;
    }
  }, []);

  // Keyboard controls
  useEffect(() => {
    if (!isPlaying) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowUp":
        case "w":
        case "W":
          e.preventDefault();
          changeDirection("UP");
          break;
        case "ArrowDown":
        case "s":
        case "S":
          e.preventDefault();
          changeDirection("DOWN");
          break;
        case "ArrowLeft":
        case "a":
        case "A":
          e.preventDefault();
          changeDirection("LEFT");
          break;
        case "ArrowRight":
        case "d":
        case "D":
          e.preventDefault();
          changeDirection("RIGHT");
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isPlaying, changeDirection]);

  // Touch Swipe on game board
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current) return;
    const touch = e.changedTouches[0];
    const dx = touch.clientX - touchStartRef.current.x;
    const dy = touch.clientY - touchStartRef.current.y;
    touchStartRef.current = null;

    if (Math.abs(dx) < 15 && Math.abs(dy) < 15) return;

    if (Math.abs(dx) > Math.abs(dy)) {
      changeDirection(dx > 0 ? "RIGHT" : "LEFT");
    } else {
      changeDirection(dy > 0 ? "DOWN" : "UP");
    }
  };

  // Main game tick loop
  useEffect(() => {
    if (!effectivelyPlaying) return;

    const tickSpeed = Math.max(85, INITIAL_SPEED - Math.floor(score / 30) * 10);

    const interval = setInterval(() => {
      const dir = nextDirectionRef.current;
      directionRef.current = dir;

      const train = trainRef.current;
      const head = train[0];
      const newHead: Point = { ...head };

      if (dir === "UP") newHead.y -= 1;
      else if (dir === "DOWN") newHead.y += 1;
      else if (dir === "LEFT") newHead.x -= 1;
      else if (dir === "RIGHT") newHead.x += 1;

      // Wall collision
      if (
        newHead.x < 0 ||
        newHead.x >= GRID_SIZE ||
        newHead.y < 0 ||
        newHead.y >= GRID_SIZE
      ) {
        setIsPlaying(false);
        setGameOver(true);
        playGameOverSound();
        return;
      }

      // Self collision
      if (train.some((seg) => seg.x === newHead.x && seg.y === newHead.y)) {
        setIsPlaying(false);
        setGameOver(true);
        playGameOverSound();
        return;
      }

      // Check gift pickup
      const isEating = newHead.x === giftRef.current.x && newHead.y === giftRef.current.y;
      const newTrain = [newHead, ...train];
      if (!isEating) {
        newTrain.pop();
      } else {
        playCollectSound();
        setScore((prev) => {
          const next = prev + 10;
          setHighScore((prevHigh) => {
            if (next > prevHigh) {
              try {
                localStorage.setItem("toystore_highscore_train", String(next));
              } catch {}
              playWinSound();
              return next;
            }
            return prevHigh;
          });
          return next;
        });
        spawnGift(newTrain);
      }

      trainRef.current = newTrain;
      setTrainState(newTrain);
    }, tickSpeed);

    return () => clearInterval(interval);
  }, [effectivelyPlaying, score, spawnGift]);

  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden select-none bg-gradient-to-b from-amber-100 via-emerald-50 to-teal-50">
      {/* Game Header Bar */}
      <div className="relative z-20 flex items-center justify-between px-4 pt-3 pb-2">
        <div className="flex items-center gap-2">
          <span className="flex size-9 items-center justify-center rounded-2xl bg-white shadow-xs text-xl">
            🚂
          </span>
          <div>
            <h3 className="font-display text-base font-extrabold text-ink-900 leading-tight">
              Toy Train Express
            </h3>
            <p className="text-[11px] font-medium text-ink-500">Collect gift boxes!</p>
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
        <div>
          <span className="text-[10px] uppercase font-bold tracking-wider text-ink-400">Train Length</span>
          <p className="font-display text-lg font-black text-ink-800">{trainState.length} Cars</p>
        </div>
      </div>

      {/* Board & Controls Area */}
      <div className="relative flex-1 flex flex-col items-center justify-center px-4 py-2">
        {/* The Grid Board */}
        <div
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          className="relative aspect-square w-full max-w-[310px] sm:max-w-[340px] rounded-3xl border-4 border-amber-800/20 bg-emerald-100/90 shadow-soft overflow-hidden p-1.5 touch-pan-y"
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))`,
            gridTemplateRows: `repeat(${GRID_SIZE}, minmax(0, 1fr))`,
          }}
        >
          {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, idx) => {
            const x = idx % GRID_SIZE;
            const y = Math.floor(idx / GRID_SIZE);

            const isHead = trainState[0]?.x === x && trainState[0]?.y === y;
            const isBody = !isHead && trainState.some((s) => s.x === x && s.y === y);
            const isGift = giftState.x === x && giftState.y === y;

            return (
              <div
                key={idx}
                className="relative flex items-center justify-center rounded-xs"
              >
                {isHead && (
                  <span className="text-base select-none leading-none animate-pulse">
                    🚂
                  </span>
                )}
                {isBody && (
                  <span className="text-xs select-none leading-none opacity-90">
                    🚃
                  </span>
                )}
                {isGift && (
                  <span className="text-base select-none leading-none animate-bounce">
                    🎁
                  </span>
                )}
              </div>
            );
          })}

          {/* Start Screen Overlay */}
          {!isPlaying && !gameOver && (
            <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/40 text-center backdrop-blur-xs p-4">
              <span className="text-4xl mb-2">🚂</span>
              <h4 className="font-display text-xl font-black text-white">
                Toy Train Express
              </h4>
              <p className="mt-1 text-xs text-white/90">
                Swipe or use D-pad to steer. Collect presents without crashing!
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

          {/* Game Over Screen Overlay */}
          {gameOver && (
            <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/55 text-center backdrop-blur-xs p-4 animate-sheet-up">
              <span className="text-4xl mb-1">💥</span>
              <h4 className="font-display text-lg font-black text-white">
                Train Derailed!
              </h4>
              <p className="text-xs text-white/80">Score: {score}</p>
              <button
                type="button"
                onClick={startGame}
                className="mt-3 flex items-center gap-2 rounded-full bg-primary-500 px-5 py-2 text-xs font-bold text-white shadow-soft active:scale-95"
              >
                <RotateCcw size={14} /> Try Again
              </button>
            </div>
          )}
        </div>

        {/* On-Screen Touch D-Pad for Thumb Play */}
        <div className="mt-2 flex flex-col items-center gap-1">
          <button
            type="button"
            onClick={() => changeDirection("UP")}
            aria-label="Steer Up"
            className="flex size-11 items-center justify-center rounded-2xl bg-white shadow-soft border border-ink-100 text-ink-800 active:bg-primary-100 active:scale-90 transition-all"
          >
            <ChevronUp size={22} />
          </button>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => changeDirection("LEFT")}
              aria-label="Steer Left"
              className="flex size-11 items-center justify-center rounded-2xl bg-white shadow-soft border border-ink-100 text-ink-800 active:bg-primary-100 active:scale-90 transition-all"
            >
              <ChevronLeft size={22} />
            </button>
            <button
              type="button"
              onClick={() => changeDirection("DOWN")}
              aria-label="Steer Down"
              className="flex size-11 items-center justify-center rounded-2xl bg-white shadow-soft border border-ink-100 text-ink-800 active:bg-primary-100 active:scale-90 transition-all"
            >
              <ChevronDown size={22} />
            </button>
            <button
              type="button"
              onClick={() => changeDirection("RIGHT")}
              aria-label="Steer Right"
              className="flex size-11 items-center justify-center rounded-2xl bg-white shadow-soft border border-ink-100 text-ink-800 active:bg-primary-100 active:scale-90 transition-all"
            >
              <ChevronRight size={22} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
