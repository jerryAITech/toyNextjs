"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Play, RotateCcw, Trophy } from "lucide-react";
import { playJumpSound, playCollectSound, playGameOverSound } from "@/lib/games/soundEffects";

type Obstacle = {
  x: number;
  w: number;
  h: number;
  emoji: string;
};

type Star = {
  x: number;
  y: number;
  collected: boolean;
};

const OBSTACLE_EMOJIS = ["🧱", "📦", "🚗", "🧸"];

export function GameDinoRunner({ active }: { active: boolean }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(0);

  const [highScore, setHighScore] = useState(() => {
    try {
      return parseInt(localStorage.getItem("toystore_highscore_dino") || "0", 10) || 0;
    } catch {
      return 0;
    }
  });

  const [gameOver, setGameOver] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animFrameRef = useRef<number | null>(null);

  // Physics state
  const dinoYRef = useRef(0);
  const dinoVyRef = useRef(0);
  const isGroundedRef = useRef(true);
  const jumpCountRef = useRef(0);

  const obstaclesRef = useRef<Obstacle[]>([]);
  const starsRef = useRef<Star[]>([]);
  const lastObstacleSpawnRef = useRef(0);
  const speedRef = useRef(240);

  const effectivelyPlaying = isPlaying && active;

  const jump = useCallback(() => {
    if (!effectivelyPlaying) return;
    if (jumpCountRef.current < 2) {
      dinoVyRef.current = -420;
      isGroundedRef.current = false;
      jumpCountRef.current += 1;
      playJumpSound();
    }
  }, [effectivelyPlaying]);

  const startGame = useCallback(() => {
    dinoYRef.current = 0;
    dinoVyRef.current = 0;
    isGroundedRef.current = true;
    jumpCountRef.current = 0;
    obstaclesRef.current = [];
    starsRef.current = [];
    lastObstacleSpawnRef.current = performance.now();
    speedRef.current = 240;

    setScore(0);
    setGameOver(false);
    setIsPlaying(true);
  }, []);

  // Keyboard controls
  useEffect(() => {
    if (!effectivelyPlaying) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.code === "Space" || e.key === "ArrowUp") {
        e.preventDefault();
        jump();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [effectivelyPlaying, jump]);

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
        }
      }

      const width = canvas.width;
      const height = canvas.height;
      const groundY = height - 55;

      // Accelerate speed slightly
      speedRef.current = Math.min(450, 240 + (now / 1000) * 4);
      const currentSpeed = speedRef.current;

      // Gravity on Dino
      dinoVyRef.current += 1100 * dt;
      dinoYRef.current += dinoVyRef.current * dt;

      if (dinoYRef.current >= 0) {
        dinoYRef.current = 0;
        dinoVyRef.current = 0;
        isGroundedRef.current = true;
        jumpCountRef.current = 0;
      }

      // Distance score
      setScore((s) => {
        const next = s + 1;
        setHighScore((prev) => {
          if (next > prev) {
            try {
              localStorage.setItem("toystore_highscore_dino", String(next));
            } catch {}
            return next;
          }
          return prev;
        });
        return next;
      });

      // Spawn obstacles
      if (now - lastObstacleSpawnRef.current > 1400 + Math.random() * 800) {
        lastObstacleSpawnRef.current = now;
        const emoji = OBSTACLE_EMOJIS[Math.floor(Math.random() * OBSTACLE_EMOJIS.length)];
        obstaclesRef.current.push({
          x: width + 20,
          w: 36,
          h: 36,
          emoji,
        });

        // 40% chance of star above obstacle
        if (Math.random() < 0.4) {
          starsRef.current.push({
            x: width + 38,
            y: groundY - 75,
            collected: false,
          });
        }
      }

      // Move obstacles
      for (const obs of obstaclesRef.current) {
        obs.x -= currentSpeed * dt;
      }
      obstaclesRef.current = obstaclesRef.current.filter((o) => o.x > -50);

      // Move stars
      for (const st of starsRef.current) {
        st.x -= currentSpeed * dt;
      }
      starsRef.current = starsRef.current.filter((s) => s.x > -40);

      // Collision checks
      const dinoX = 60;
      const dinoYPos = groundY + dinoYRef.current - 18;
      const dinoW = 32;

      for (const obs of obstaclesRef.current) {
        if (
          dinoX + dinoW - 8 > obs.x &&
          dinoX + 8 < obs.x + obs.w &&
          dinoYPos > groundY - obs.h
        ) {
          // CRASH
          setIsPlaying(false);
          setGameOver(true);
          playGameOverSound();
          return;
        }
      }

      // Star collection
      for (const st of starsRef.current) {
        if (!st.collected && Math.hypot(dinoX + dinoW / 2 - st.x, dinoYPos - st.y) < 28) {
          st.collected = true;
          playCollectSound();
          setScore((s) => s + 20);
        }
      }

      // RENDER
      ctx.clearRect(0, 0, width, height);

      // Sky gradient
      const skyGrad = ctx.createLinearGradient(0, 0, 0, height);
      skyGrad.addColorStop(0, "#bae6fd");
      skyGrad.addColorStop(0.7, "#f0fdf4");
      skyGrad.addColorStop(1, "#fef08a");
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, width, height);

      // Ground Track
      ctx.fillStyle = "#86efac";
      ctx.fillRect(0, groundY, width, height - groundY);
      ctx.fillStyle = "#4ade80";
      ctx.fillRect(0, groundY, width, 6);

      // Draw moving track dashes
      ctx.strokeStyle = "#16a34a";
      ctx.lineWidth = 2;
      ctx.setLineDash([8, 14]);
      ctx.lineDashOffset = -(now / 1000) * currentSpeed;
      ctx.beginPath();
      ctx.moveTo(0, groundY + 16);
      ctx.lineTo(width, groundY + 16);
      ctx.stroke();
      ctx.setLineDash([]);

      // Draw Stars
      for (const st of starsRef.current) {
        if (st.collected) continue;
        ctx.font = "22px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("⭐", st.x, st.y);
      }

      // Draw Obstacles
      for (const obs of obstaclesRef.current) {
        ctx.font = "30px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "bottom";
        ctx.fillText(obs.emoji, obs.x + obs.w / 2, groundY);
      }

      // Draw Dino
      ctx.font = "36px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "bottom";
      ctx.fillText("🦖", dinoX + dinoW / 2, groundY + dinoYRef.current);

      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [effectivelyPlaying]);

  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden select-none bg-sky-100">
      {/* Game Header Bar */}
      <div className="relative z-20 flex items-center justify-between px-4 pt-3 pb-2 bg-white/80 backdrop-blur">
        <div className="flex items-center gap-2">
          <span className="flex size-9 items-center justify-center rounded-2xl bg-white shadow-xs text-xl">
            🦕
          </span>
          <div>
            <h3 className="font-display text-base font-extrabold text-ink-900 leading-tight">
              Dino Jump Runner
            </h3>
            <p className="text-[11px] font-medium text-ink-500">Tap screen to jump (double-jump!)</p>
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

      {/* Live Distance Pill */}
      <div className="relative z-20 mx-4 mt-2 flex items-center justify-between rounded-2xl bg-white/80 px-4 py-1.5 backdrop-blur shadow-xs text-center">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-wider text-ink-400">Distance</span>
          <p className="font-display text-xl font-black text-primary-600">{score}m</p>
        </div>
        <span className="text-xs font-semibold text-ink-500">Tap or Space to Jump</span>
      </div>

      {/* Interactive Canvas Area */}
      <div
        ref={containerRef}
        onPointerDown={(e) => {
          e.preventDefault();
          jump();
        }}
        className="relative flex-1 touch-none overflow-hidden cursor-pointer"
      >
        <canvas ref={canvasRef} className="h-full w-full" />

        {/* Start Overlay */}
        {!isPlaying && !gameOver && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/40 text-center backdrop-blur-xs p-4">
            <span className="text-5xl mb-2 animate-bounce">🦕</span>
            <h4 className="font-display text-2xl font-black text-white">
              Dino Jump Runner
            </h4>
            <p className="mt-1 text-xs text-white/90 max-w-xs">
              Help baby Dino sprint through the toy land! Jump over toy blocks and collect stars.
            </p>
            <button
              type="button"
              onClick={startGame}
              className="mt-4 flex items-center gap-2 rounded-full bg-primary-500 px-7 py-3 text-sm font-bold text-white shadow-lifted hover:bg-primary-600 active:scale-95"
            >
              <Play size={16} fill="currentColor" /> Tap to Run
            </button>
          </div>
        )}

        {/* Game Over Screen */}
        {gameOver && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/55 text-center backdrop-blur-xs p-4 animate-sheet-up">
            <div className="rounded-3xl bg-white p-6 shadow-lifted w-full max-w-xs">
              <span className="text-4xl">💥</span>
              <h4 className="mt-2 font-display text-xl font-extrabold text-ink-900">
                Stumbled!
              </h4>
              <p className="text-xs text-ink-500">Distance Traveled</p>
              <p className="my-3 font-display text-4xl font-black text-primary-600">{score}m</p>
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
