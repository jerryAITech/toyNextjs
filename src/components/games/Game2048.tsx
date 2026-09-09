"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { RotateCcw, Trophy, ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { playMatchSound, playGameOverSound, playWinSound } from "@/lib/games/soundEffects";

type Board = number[][];

const TILE_TOYS: Record<number, { emoji: string; bg: string; text: string }> = {
  2: { emoji: "🧸", bg: "bg-amber-100", text: "text-amber-900" },
  4: { emoji: "🚗", bg: "bg-orange-100", text: "text-orange-900" },
  8: { emoji: "🚀", bg: "bg-rose-200", text: "text-rose-900" },
  16: { emoji: "🤖", bg: "bg-purple-200", text: "text-purple-900" },
  32: { emoji: "🚂", bg: "bg-indigo-200", text: "text-indigo-900" },
  64: { emoji: "🦖", bg: "bg-emerald-200", text: "text-emerald-900" },
  128: { emoji: "🦆", bg: "bg-yellow-300", text: "text-yellow-950" },
  256: { emoji: "🪀", bg: "bg-teal-300", text: "text-teal-950" },
  512: { emoji: "🥁", bg: "bg-pink-400", text: "text-white" },
  1024: { emoji: "🦄", bg: "bg-indigo-500", text: "text-white" },
  2048: { emoji: "👑", bg: "bg-amber-500", text: "text-white" },
};

function addRandomTile(b: Board): Board {
  const empty: { r: number; c: number }[] = [];
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      if (b[r][c] === 0) empty.push({ r, c });
    }
  }
  if (empty.length === 0) return b;
  const chosen = empty[Math.floor(Math.random() * empty.length)];
  const val = Math.random() < 0.9 ? 2 : 4;
  const newB = b.map((row) => [...row]);
  newB[chosen.r][chosen.c] = val;
  return newB;
}

function createInitialBoard(): Board {
  let b: Board = [
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ];
  b = addRandomTile(b);
  b = addRandomTile(b);
  return b;
}

export function Game2048({ active }: { active: boolean }) {
  const [board, setBoard] = useState<Board>(createInitialBoard);
  const [score, setScore] = useState(0);

  const [highScore, setHighScore] = useState(() => {
    try {
      return parseInt(localStorage.getItem("toystore_highscore_2048") || "0", 10) || 0;
    } catch {
      return 0;
    }
  });

  const [gameOver, setGameOver] = useState(false);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  const effectivelyPlaying = active && !gameOver;

  const restart = useCallback(() => {
    setBoard(createInitialBoard());
    setScore(0);
    setGameOver(false);
  }, []);

  const slideRow = (row: number[]): { row: number[]; addedScore: number } => {
    const nonZero = row.filter((v) => v !== 0);
    const result: number[] = [];
    let added = 0;

    for (let i = 0; i < nonZero.length; i++) {
      if (i < nonZero.length - 1 && nonZero[i] === nonZero[i + 1]) {
        const merged = nonZero[i] * 2;
        result.push(merged);
        added += merged;
        i++;
      } else {
        result.push(nonZero[i]);
      }
    }
    while (result.length < 4) result.push(0);
    return { row: result, addedScore: added };
  };

  const move = useCallback((direction: "UP" | "DOWN" | "LEFT" | "RIGHT") => {
    setBoard((currentBoard) => {
      const b = currentBoard.map((row) => [...row]);
      let totalAdded = 0;
      let moved = false;

      if (direction === "LEFT") {
        for (let r = 0; r < 4; r++) {
          const { row: newRow, addedScore } = slideRow(b[r]);
          totalAdded += addedScore;
          if (newRow.some((val, idx) => val !== b[r][idx])) moved = true;
          b[r] = newRow;
        }
      } else if (direction === "RIGHT") {
        for (let r = 0; r < 4; r++) {
          const reversed = [...b[r]].reverse();
          const { row: newRow, addedScore } = slideRow(reversed);
          newRow.reverse();
          totalAdded += addedScore;
          if (newRow.some((val, idx) => val !== b[r][idx])) moved = true;
          b[r] = newRow;
        }
      } else if (direction === "UP") {
        for (let c = 0; c < 4; c++) {
          const col = [b[0][c], b[1][c], b[2][c], b[3][c]];
          const { row: newCol, addedScore } = slideRow(col);
          totalAdded += addedScore;
          if (newCol.some((val, idx) => val !== col[idx])) moved = true;
          for (let r = 0; r < 4; r++) b[r][c] = newCol[r];
        }
      } else if (direction === "DOWN") {
        for (let c = 0; c < 4; c++) {
          const col = [b[3][c], b[2][c], b[1][c], b[0][c]];
          const { row: newCol, addedScore } = slideRow(col);
          newCol.reverse();
          totalAdded += addedScore;
          if (newCol.some((val, idx) => val !== b[idx][c])) moved = true;
          for (let r = 0; r < 4; r++) b[r][c] = newCol[r];
        }
      }

      if (!moved) return currentBoard;

      if (totalAdded > 0) {
        playMatchSound();
        setScore((s) => {
          const next = s + totalAdded;
          setHighScore((prev) => {
            if (next > prev) {
              try {
                localStorage.setItem("toystore_highscore_2048", String(next));
              } catch {}
              return next;
            }
            return prev;
          });
          return next;
        });
      }

      const boardWithNew = addRandomTile(b);

      // Check game over
      let canMove = false;
      for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 4; c++) {
          if (boardWithNew[r][c] === 0) canMove = true;
          if (r < 3 && boardWithNew[r][c] === boardWithNew[r + 1][c]) canMove = true;
          if (c < 3 && boardWithNew[r][c] === boardWithNew[r][c + 1]) canMove = true;
          if (boardWithNew[r][c] === 2048) {
            playWinSound();
          }
        }
      }

      if (!canMove) {
        setGameOver(true);
        playGameOverSound();
      }

      return boardWithNew;
    });
  }, []);

  // Keyboard
  useEffect(() => {
    if (!effectivelyPlaying) return;
    const handleKey = (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowLeft":
        case "a":
          e.preventDefault();
          move("LEFT");
          break;
        case "ArrowRight":
        case "d":
          e.preventDefault();
          move("RIGHT");
          break;
        case "ArrowUp":
        case "w":
          e.preventDefault();
          move("UP");
          break;
        case "ArrowDown":
        case "s":
          e.preventDefault();
          move("DOWN");
          break;
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [effectivelyPlaying, move]);

  // Touch Swipe
  const onTouchStart = (e: React.TouchEvent) => {
    touchStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current) return;
    const dx = e.changedTouches[0].clientX - touchStartRef.current.x;
    const dy = e.changedTouches[0].clientY - touchStartRef.current.y;
    touchStartRef.current = null;

    if (Math.abs(dx) < 20 && Math.abs(dy) < 20) return;

    if (Math.abs(dx) > Math.abs(dy)) {
      move(dx > 0 ? "RIGHT" : "LEFT");
    } else {
      move(dy > 0 ? "DOWN" : "UP");
    }
  };

  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden select-none bg-gradient-to-b from-amber-50 via-rose-50 to-orange-50">
      {/* Game Header Bar */}
      <div className="relative z-20 flex items-center justify-between px-4 pt-3 pb-2 bg-white/80 backdrop-blur">
        <div className="flex items-center gap-2">
          <span className="flex size-9 items-center justify-center rounded-2xl bg-white shadow-xs text-xl">
            🔢
          </span>
          <div>
            <h3 className="font-display text-base font-extrabold text-ink-900 leading-tight">
              Toy 2048 Blocks
            </h3>
            <p className="text-[11px] font-medium text-ink-500">Swipe & merge matching toys!</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 rounded-full bg-sun-100/90 px-2.5 py-1 text-xs font-bold text-ink-800 shadow-xs">
            <Trophy size={13} className="text-sun-500" />
            <span>{highScore}</span>
          </div>

          <button
            type="button"
            onClick={restart}
            aria-label="Restart"
            className="flex size-8 items-center justify-center rounded-full bg-white text-ink-700 shadow-xs active:scale-95"
          >
            <RotateCcw size={14} />
          </button>
        </div>
      </div>

      {/* Stats Pill */}
      <div className="relative z-20 mx-4 mt-2 flex items-center justify-between rounded-2xl bg-white/80 px-4 py-1.5 backdrop-blur shadow-xs text-center">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-wider text-ink-400">Score</span>
          <p className="font-display text-xl font-black text-primary-600">{score}</p>
        </div>
        <span className="text-xs font-semibold text-ink-500">Swipe or use arrows</span>
      </div>

      {/* 4x4 Grid Board */}
      <div
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        className="relative flex-1 flex flex-col items-center justify-center p-3"
      >
        <div className="grid grid-cols-4 gap-2.5 w-full max-w-[310px] sm:max-w-[340px] aspect-square rounded-3xl bg-amber-900/15 p-3 shadow-soft border-2 border-amber-800/20">
          {board.map((row, r) =>
            row.map((val, c) => {
              const meta = TILE_TOYS[val];

              return (
                <div
                  key={`${r}-${c}`}
                  className={`relative flex flex-col items-center justify-center rounded-2xl transition-all duration-150 transform-gpu ${
                    val === 0 ? "bg-amber-900/10" : `${meta?.bg || "bg-amber-100"} shadow-soft scale-100`
                  }`}
                >
                  {val > 0 && (
                    <>
                      <span className="text-2xl sm:text-3xl animate-bounce-short">
                        {meta?.emoji}
                      </span>
                      <span className={`text-[10px] font-black leading-none ${meta?.text || "text-ink-900"}`}>
                        {val}
                      </span>
                    </>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* On-Screen Thumb Controls */}
        <div className="mt-3 flex flex-col items-center gap-1">
          <button
            type="button"
            onClick={() => move("UP")}
            aria-label="Slide Up"
            className="flex size-10 items-center justify-center rounded-xl bg-white shadow-soft text-ink-800 active:bg-primary-100 active:scale-90"
          >
            <ChevronUp size={20} />
          </button>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => move("LEFT")}
              aria-label="Slide Left"
              className="flex size-10 items-center justify-center rounded-xl bg-white shadow-soft text-ink-800 active:bg-primary-100 active:scale-90"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              type="button"
              onClick={() => move("DOWN")}
              aria-label="Slide Down"
              className="flex size-10 items-center justify-center rounded-xl bg-white shadow-soft text-ink-800 active:bg-primary-100 active:scale-90"
            >
              <ChevronDown size={20} />
            </button>
            <button
              type="button"
              onClick={() => move("RIGHT")}
              aria-label="Slide Right"
              className="flex size-10 items-center justify-center rounded-xl bg-white shadow-soft text-ink-800 active:bg-primary-100 active:scale-90"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        {/* Game Over Screen */}
        {gameOver && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/60 text-center backdrop-blur-xs p-4 animate-sheet-up">
            <div className="rounded-3xl bg-white p-6 shadow-lifted w-full max-w-xs">
              <span className="text-4xl">👑</span>
              <h4 className="mt-2 font-display text-xl font-extrabold text-ink-900">
                No More Moves!
              </h4>
              <p className="text-xs text-ink-500">2048 Score</p>
              <p className="my-3 font-display text-4xl font-black text-primary-600">{score}</p>
              <button
                type="button"
                onClick={restart}
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
