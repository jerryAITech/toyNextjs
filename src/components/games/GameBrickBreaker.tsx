"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Play, RotateCcw, Trophy, Heart } from "lucide-react";
import { playPaddleSound, playCollectSound, playWinSound, playGameOverSound } from "@/lib/games/soundEffects";

type Brick = {
  x: number;
  y: number;
  w: number;
  h: number;
  color: string;
  points: number;
  intact: boolean;
};

const BRICK_COLORS = ["#ef4577", "#fa5a1f", "#ffd23f", "#16a67a", "#6d4fd1"];

export function GameBrickBreaker({ active }: { active: boolean }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);

  const [highScore, setHighScore] = useState(() => {
    try {
      return parseInt(localStorage.getItem("toystore_highscore_bricks") || "0", 10) || 0;
    } catch {
      return 0;
    }
  });

  const [gameOver, setGameOver] = useState(false);
  const [isWon, setIsWon] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animFrameRef = useRef<number | null>(null);

  // Physics state
  const paddleXRef = useRef(150);
  const ballRef = useRef({ x: 180, y: 350, vx: 200, vy: -220, r: 7 });
  const bricksRef = useRef<Brick[]>([]);

  const effectivelyPlaying = isPlaying && active;

  const initBricks = (width: number) => {
    const rows = 4;
    const cols = 6;
    const padding = 6;
    const brickW = Math.floor((width - padding * (cols + 1)) / cols);
    const brickH = 18;
    const bricks: Brick[] = [];

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        bricks.push({
          x: padding + c * (brickW + padding),
          y: 40 + r * (brickH + padding),
          w: brickW,
          h: brickH,
          color: BRICK_COLORS[r % BRICK_COLORS.length],
          points: (rows - r) * 10,
          intact: true,
        });
      }
    }
    bricksRef.current = bricks;
  };

  const startGame = useCallback(() => {
    const canvas = canvasRef.current;
    const w = canvas ? canvas.width : 340;
    const h = canvas ? canvas.height : 450;

    paddleXRef.current = w / 2 - 40;
    ballRef.current = { x: w / 2, y: h - 60, vx: 210 * (Math.random() > 0.5 ? 1 : -1), vy: -230, r: 7 };
    initBricks(w);
    setScore(0);
    setLives(3);
    setGameOver(false);
    setIsWon(false);
    setIsPlaying(true);
  }, []);

  // Handle pointer drag for paddle
  const handlePointerMove = (clientX: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const paddleW = 80;
    paddleXRef.current = Math.max(0, Math.min(canvas.width - paddleW, x - paddleW / 2));
  };

  // Keyboard controls
  useEffect(() => {
    if (!effectivelyPlaying) return;
    const handleKey = (e: KeyboardEvent) => {
      const step = 25;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const paddleW = 80;

      if (e.key === "ArrowLeft" || e.key === "a") {
        paddleXRef.current = Math.max(0, paddleXRef.current - step);
      } else if (e.key === "ArrowRight" || e.key === "d") {
        paddleXRef.current = Math.min(canvas.width - paddleW, paddleXRef.current + step);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [effectivelyPlaying]);

  // Main canvas animation & physics loop
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
          if (bricksRef.current.length === 0) {
            initBricks(w);
          }
        }
      }

      const width = canvas.width;
      const height = canvas.height;
      const ball = ballRef.current;
      const paddleW = 80;
      const paddleH = 14;
      const paddleY = height - 28;

      // Move ball
      ball.x += ball.vx * dt;
      ball.y += ball.vy * dt;

      // Wall bounce
      if (ball.x - ball.r < 0) {
        ball.x = ball.r;
        ball.vx *= -1;
        playPaddleSound();
      } else if (ball.x + ball.r > width) {
        ball.x = width - ball.r;
        ball.vx *= -1;
        playPaddleSound();
      }

      if (ball.y - ball.r < 0) {
        ball.y = ball.r;
        ball.vy *= -1;
        playPaddleSound();
      }

      // Paddle bounce
      const px = paddleXRef.current;
      if (
        ball.y + ball.r >= paddleY &&
        ball.y - ball.r <= paddleY + paddleH &&
        ball.x >= px &&
        ball.x <= px + paddleW
      ) {
        ball.vy = -Math.abs(ball.vy);
        const hitOffset = (ball.x - (px + paddleW / 2)) / (paddleW / 2);
        ball.vx = hitOffset * 280;
        playPaddleSound();
      }

      // Brick collision
      let allCleared = true;
      for (const b of bricksRef.current) {
        if (!b.intact) continue;
        allCleared = false;

        if (
          ball.x + ball.r > b.x &&
          ball.x - ball.r < b.x + b.w &&
          ball.y + ball.r > b.y &&
          ball.y - ball.r < b.y + b.h
        ) {
          b.intact = false;
          ball.vy *= -1;
          playCollectSound();

          setScore((s) => {
            const next = s + b.points;
            setHighScore((prev) => {
              if (next > prev) {
                try {
                  localStorage.setItem("toystore_highscore_bricks", String(next));
                } catch {}
                return next;
              }
              return prev;
            });
            return next;
          });
          break;
        }
      }

      // Win condition
      if (allCleared && bricksRef.current.length > 0) {
        setIsPlaying(false);
        setIsWon(true);
        playWinSound();
        return;
      }

      // Bottom fall
      if (ball.y + ball.r > height) {
        setLives((l) => {
          const nextLives = l - 1;
          if (nextLives <= 0) {
            setIsPlaying(false);
            setGameOver(true);
            playGameOverSound();
          } else {
            // Reset ball position
            ball.x = width / 2;
            ball.y = height - 70;
            ball.vx = 200 * (Math.random() > 0.5 ? 1 : -1);
            ball.vy = -220;
          }
          return nextLives;
        });
      }

      // RENDER
      ctx.clearRect(0, 0, width, height);

      // Bricks
      for (const b of bricksRef.current) {
        if (!b.intact) continue;
        ctx.fillStyle = b.color;
        ctx.beginPath();
        ctx.roundRect(b.x, b.y, b.w, b.h, 5);
        ctx.fill();

        // Brick 3D highlight
        ctx.fillStyle = "rgba(255, 255, 255, 0.35)";
        ctx.fillRect(b.x + 2, b.y + 2, b.w - 4, 3);
      }

      // Paddle
      ctx.fillStyle = "#6d4fd1";
      ctx.beginPath();
      ctx.roundRect(paddleXRef.current, paddleY, paddleW, paddleH, 7);
      ctx.fill();
      ctx.fillStyle = "#a896ea";
      ctx.fillRect(paddleXRef.current + 4, paddleY + 2, paddleW - 8, 3);

      // Ball
      ctx.beginPath();
      ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2);
      ctx.fillStyle = "#ffd23f";
      ctx.fill();
      ctx.strokeStyle = "#ea580c";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [effectivelyPlaying]);

  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden select-none bg-gradient-to-b from-indigo-900 via-indigo-950 to-slate-950">
      {/* Game Header Bar */}
      <div className="relative z-20 flex items-center justify-between px-4 pt-3 pb-2 bg-black/40 backdrop-blur">
        <div className="flex items-center gap-2">
          <span className="flex size-9 items-center justify-center rounded-2xl bg-white/20 shadow-xs text-xl">
            🧱
          </span>
          <div>
            <h3 className="font-display text-base font-extrabold text-white leading-tight">
              Toy Brick Breaker
            </h3>
            <p className="text-[11px] font-medium text-white/70">Slide paddle to smash blocks!</p>
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

      {/* Stats Row */}
      <div className="relative z-20 mx-4 mt-2 flex items-center justify-between rounded-2xl bg-white/10 px-4 py-1.5 backdrop-blur text-center text-white">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-wider text-white/60">Score</span>
          <p className="font-display text-xl font-black text-sun-300">{score}</p>
        </div>

        <div className="flex items-center gap-1">
          {Array.from({ length: 3 }).map((_, i) => (
            <Heart
              key={i}
              size={18}
              className={i < lives ? "fill-rose-500 text-rose-500" : "text-white/20"}
            />
          ))}
        </div>
      </div>

      {/* Interactive Canvas Area */}
      <div
        ref={containerRef}
        onPointerMove={(e) => handlePointerMove(e.clientX)}
        onTouchMove={(e) => {
          if (e.touches[0]) handlePointerMove(e.touches[0].clientX);
        }}
        className="relative flex-1 touch-pan-y overflow-hidden cursor-ew-resize"
      >
        <canvas ref={canvasRef} className="h-full w-full" />

        {/* On-screen Thumb Paddle Controls */}
        {isPlaying && !gameOver && !isWon && (
          <div className="pointer-events-none absolute inset-x-0 bottom-3 flex items-center justify-between px-6 z-20">
            <button
              type="button"
              onClick={() => {
                const canvas = canvasRef.current;
                if (canvas) {
                  paddleXRef.current = Math.max(0, paddleXRef.current - 40);
                }
              }}
              className="pointer-events-auto flex size-11 items-center justify-center rounded-2xl bg-white/85 text-ink-800 shadow-soft backdrop-blur active:scale-90"
              aria-label="Move Paddle Left"
            >
              ◀
            </button>
            <span className="text-[11px] font-bold text-white/70 bg-black/40 px-3 py-1 rounded-full backdrop-blur">
              Slide or tap arrows
            </span>
            <button
              type="button"
              onClick={() => {
                const canvas = canvasRef.current;
                if (canvas) {
                  paddleXRef.current = Math.min(canvas.width - 80, paddleXRef.current + 40);
                }
              }}
              className="pointer-events-auto flex size-11 items-center justify-center rounded-2xl bg-white/85 text-ink-800 shadow-soft backdrop-blur active:scale-90"
              aria-label="Move Paddle Right"
            >
              ▶
            </button>
          </div>
        )}

        {/* Start Overlay */}
        {!isPlaying && !gameOver && !isWon && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/60 text-center backdrop-blur-xs p-4">
            <span className="text-5xl mb-2">🧱</span>
            <h4 className="font-display text-2xl font-black text-white">
              Toy Brick Breaker
            </h4>
            <p className="mt-1 text-xs text-white/90 max-w-xs">
              Slide paddle left & right to bounce the ball and smash all the toy bricks!
            </p>
            <button
              type="button"
              onClick={startGame}
              className="mt-4 flex items-center gap-2 rounded-full bg-primary-500 px-7 py-3 text-sm font-bold text-white shadow-lifted hover:bg-primary-600 active:scale-95"
            >
              <Play size={16} fill="currentColor" /> Tap to Play
            </button>
          </div>
        )}

        {/* Game Over Screen */}
        {gameOver && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/70 text-center backdrop-blur-xs p-4 animate-sheet-up">
            <div className="rounded-3xl bg-white p-6 shadow-lifted w-full max-w-xs">
              <span className="text-4xl">💔</span>
              <h4 className="mt-2 font-display text-xl font-extrabold text-ink-900">
                Out of Balls!
              </h4>
              <p className="text-xs text-ink-500">Your Score</p>
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

        {/* Win Screen */}
        {isWon && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/70 text-center backdrop-blur-xs p-4 animate-sheet-up">
            <div className="rounded-3xl bg-white p-6 shadow-lifted w-full max-w-xs">
              <span className="text-5xl animate-bounce">🏆</span>
              <h4 className="mt-2 font-display text-2xl font-black text-ink-900">
                All Cleared!
              </h4>
              <p className="text-xs text-ink-500">Brilliant Smash!</p>
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
