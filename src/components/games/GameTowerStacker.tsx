"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Play, RotateCcw, Trophy, Sparkles } from "lucide-react";
import { playPaddleSound, playMatchSound, playGameOverSound } from "@/lib/games/soundEffects";

type Block = {
  y: number;
  x: number;
  width: number;
  color: string;
};

const BLOCK_COLORS = [
  "#ef4577",
  "#f97316",
  "#eab308",
  "#10b981",
  "#06b6d4",
  "#6366f1",
  "#a855f7",
];

const BLOCK_HEIGHT = 22;

export function GameTowerStacker({ active }: { active: boolean }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [heightScore, setHeightScore] = useState(0);

  const [highScore, setHighScore] = useState(() => {
    try {
      return parseInt(localStorage.getItem("toystore_highscore_stacker") || "0", 10) || 0;
    } catch {
      return 0;
    }
  });

  const [perfectStreak, setPerfectStreak] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animFrameRef = useRef<number | null>(null);

  // Stacker physics
  const blocksRef = useRef<Block[]>([]);
  const currentBlockXRef = useRef(50);
  const currentBlockWRef = useRef(140);
  const currentBlockDirRef = useRef(1); // 1 = right, -1 = left
  const currentSpeedRef = useRef(180);

  const effectivelyPlaying = isPlaying && active;

  const initGame = (w: number, h: number) => {
    const baseW = 140;
    const baseX = (w - baseW) / 2;
    blocksRef.current = [
      {
        y: h - BLOCK_HEIGHT - 20,
        x: baseX,
        width: baseW,
        color: "#64748b",
      },
    ];
    currentBlockWRef.current = baseW;
    currentBlockXRef.current = 10;
    currentBlockDirRef.current = 1;
    currentSpeedRef.current = 180;
  };

  const startGame = useCallback(() => {
    const canvas = canvasRef.current;
    const w = canvas ? canvas.width : 340;
    const h = canvas ? canvas.height : 450;

    initGame(w, h);
    setHeightScore(0);
    setPerfectStreak(0);
    setGameOver(false);
    setIsPlaying(true);
  }, []);

  const placeBlock = () => {
    if (!effectivelyPlaying) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const stack = blocksRef.current;
    const prevBlock = stack[stack.length - 1];
    const curX = currentBlockXRef.current;
    const curW = currentBlockWRef.current;

    // Calculate overlap with previous block
    const leftOverlap = Math.max(curX, prevBlock.x);
    const rightOverlap = Math.min(curX + curW, prevBlock.x + prevBlock.width);
    const overlapW = rightOverlap - leftOverlap;

    if (overlapW <= 0) {
      // MISSED COMPLETELY - GAME OVER
      setIsPlaying(false);
      setGameOver(true);
      playGameOverSound();
      return;
    }

    // Perfect placement check (within 3px)
    const isPerfect = Math.abs(curX - prevBlock.x) <= 3;
    let finalX = leftOverlap;
    let finalW = overlapW;

    if (isPerfect) {
      finalX = prevBlock.x;
      finalW = prevBlock.width;
      playMatchSound();
      setPerfectStreak((p) => p + 1);
    } else {
      playPaddleSound();
      setPerfectStreak(0);
    }

    // Add new block to tower
    const newY = prevBlock.y - BLOCK_HEIGHT;
    const color = BLOCK_COLORS[stack.length % BLOCK_COLORS.length];

    stack.push({
      y: newY,
      x: finalX,
      width: finalW,
      color,
    });

    currentBlockWRef.current = finalW;
    currentBlockXRef.current = 0;
    currentBlockDirRef.current = 1;
    currentSpeedRef.current = Math.min(380, 180 + stack.length * 6);

    const newScore = stack.length - 1;
    setHeightScore(newScore);

    setHighScore((prev) => {
      if (newScore > prev) {
        try {
          localStorage.setItem("toystore_highscore_stacker", String(newScore));
        } catch {}
        return newScore;
      }
      return prev;
    });
  };

  // Main canvas animation loop
  useEffect(() => {
    if (!effectivelyPlaying) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let lastTime = performance.now();

    const loop = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;

      // Sync canvas dimensions
      if (containerRef.current) {
        const w = containerRef.current.clientWidth;
        const h = containerRef.current.clientHeight;
        if (canvas.width !== w || canvas.height !== h) {
          canvas.width = w;
          canvas.height = h;
          if (blocksRef.current.length === 0) {
            initGame(w, h);
          }
        }
      }

      const width = canvas.width;
      const height = canvas.height;

      // Move moving block
      const curW = currentBlockWRef.current;
      currentBlockXRef.current += currentBlockDirRef.current * currentSpeedRef.current * dt;

      if (currentBlockXRef.current <= 0) {
        currentBlockXRef.current = 0;
        currentBlockDirRef.current = 1;
      } else if (currentBlockXRef.current + curW >= width) {
        currentBlockXRef.current = width - curW;
        currentBlockDirRef.current = -1;
      }

      // Camera offset when tower gets high
      const topBlock = blocksRef.current[blocksRef.current.length - 1];
      const cameraY = topBlock && topBlock.y < height * 0.4 ? height * 0.4 - topBlock.y : 0;

      // RENDER
      ctx.clearRect(0, 0, width, height);

      // Background Gradient
      const grad = ctx.createLinearGradient(0, 0, 0, height);
      grad.addColorStop(0, "#fed7aa");
      grad.addColorStop(0.5, "#fbcfe8");
      grad.addColorStop(1, "#e0e7ff");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      ctx.save();
      ctx.translate(0, cameraY);

      // Draw Stacked Blocks
      for (const b of blocksRef.current) {
        ctx.fillStyle = b.color;
        ctx.beginPath();
        ctx.roundRect(b.x, b.y, b.width, BLOCK_HEIGHT - 2, 4);
        ctx.fill();

        // 3D highlight
        ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
        ctx.fillRect(b.x + 2, b.y + 2, b.width - 4, 3);
      }

      // Draw Current Moving Block
      if (topBlock) {
        const movingY = topBlock.y - BLOCK_HEIGHT;
        const curColor = BLOCK_COLORS[blocksRef.current.length % BLOCK_COLORS.length];

        ctx.fillStyle = curColor;
        ctx.beginPath();
        ctx.roundRect(currentBlockXRef.current, movingY, curW, BLOCK_HEIGHT - 2, 4);
        ctx.fill();

        ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
        ctx.fillRect(currentBlockXRef.current + 2, movingY + 2, curW - 4, 3);
      }

      ctx.restore();

      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [effectivelyPlaying]);

  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden select-none bg-amber-50">
      {/* Game Header Bar */}
      <div className="relative z-20 flex items-center justify-between px-4 pt-3 pb-2 bg-white/80 backdrop-blur">
        <div className="flex items-center gap-2">
          <span className="flex size-9 items-center justify-center rounded-2xl bg-white shadow-xs text-xl">
            🏗️
          </span>
          <div>
            <h3 className="font-display text-base font-extrabold text-ink-900 leading-tight">
              Toy Tower Stacker
            </h3>
            <p className="text-[11px] font-medium text-ink-500">Tap screen to drop blocks!</p>
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

      {/* Live Tower Height Pill */}
      <div className="relative z-20 mx-4 mt-2 flex items-center justify-between rounded-2xl bg-white/80 px-4 py-1.5 backdrop-blur shadow-xs text-center">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-wider text-ink-400">Height</span>
          <p className="font-display text-xl font-black text-primary-600">{heightScore} Blocks</p>
        </div>

        {perfectStreak > 0 && (
          <div className="flex items-center gap-1 animate-bounce rounded-full bg-sun-400 px-3 py-0.5 text-xs font-extrabold text-ink-900 shadow-xs">
            <Sparkles size={13} /> PERFECT ×{perfectStreak}
          </div>
        )}

        <span className="text-xs font-semibold text-ink-500">Tap to Drop</span>
      </div>

      {/* Interactive Canvas Area */}
      <div
        ref={containerRef}
        onPointerDown={(e) => {
          e.preventDefault();
          placeBlock();
        }}
        className="relative flex-1 touch-none overflow-hidden cursor-pointer"
      >
        <canvas ref={canvasRef} className="h-full w-full" />

        {/* Start Overlay */}
        {!isPlaying && !gameOver && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/40 text-center backdrop-blur-xs p-4">
            <span className="text-5xl mb-2 animate-bounce">🏗️</span>
            <h4 className="font-display text-2xl font-black text-white">
              Toy Tower Stacker
            </h4>
            <p className="mt-1 text-xs text-white/90 max-w-xs">
              Tap precisely when the block lines up with the tower. Build the tallest skyscraper!
            </p>
            <button
              type="button"
              onClick={startGame}
              className="mt-4 flex items-center gap-2 rounded-full bg-primary-500 px-7 py-3 text-sm font-bold text-white shadow-lifted hover:bg-primary-600 active:scale-95"
            >
              <Play size={16} fill="currentColor" /> Tap to Build
            </button>
          </div>
        )}

        {/* Game Over Screen */}
        {gameOver && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/55 text-center backdrop-blur-xs p-4 animate-sheet-up">
            <div className="rounded-3xl bg-white p-6 shadow-lifted w-full max-w-xs">
              <span className="text-4xl">🏢</span>
              <h4 className="mt-2 font-display text-xl font-extrabold text-ink-900">
                Tower Fell!
              </h4>
              <p className="text-xs text-ink-500">Total Floors Built</p>
              <p className="my-3 font-display text-4xl font-black text-primary-600">{heightScore}</p>
              <button
                type="button"
                onClick={startGame}
                className="w-full flex items-center justify-center gap-2 rounded-full bg-primary-500 py-3 text-sm font-bold text-white shadow-soft active:scale-95"
              >
                <RotateCcw size={16} /> Stack Again
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
