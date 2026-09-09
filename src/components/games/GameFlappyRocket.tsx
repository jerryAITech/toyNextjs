"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Play, RotateCcw, Trophy } from "lucide-react";
import { playJumpSound, playCollectSound, playGameOverSound } from "@/lib/games/soundEffects";

type Pillar = {
  x: number;
  topHeight: number;
  bottomY: number;
  gap: number;
  passed: boolean;
};

type Star = {
  x: number;
  y: number;
  collected: boolean;
};

export function GameFlappyRocket({ active }: { active: boolean }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(0);

  const [highScore, setHighScore] = useState(() => {
    try {
      return parseInt(localStorage.getItem("toystore_highscore_flappy") || "0", 10) || 0;
    } catch {
      return 0;
    }
  });

  const [gameOver, setGameOver] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animFrameRef = useRef<number | null>(null);

  // Physics state
  const rocketYRef = useRef(200);
  const rocketVyRef = useRef(0);
  const pillarsRef = useRef<Pillar[]>([]);
  const starsRef = useRef<Star[]>([]);
  const lastPillarSpawnRef = useRef(0);
  const pointerStartRef = useRef<{ x: number; y: number } | null>(null);

  const effectivelyPlaying = isPlaying && active;

  const jump = useCallback(() => {
    if (!effectivelyPlaying) return;
    rocketVyRef.current = -320;
    playJumpSound();
  }, [effectivelyPlaying]);

  const startGame = useCallback(() => {
    rocketYRef.current = 200;
    rocketVyRef.current = -150;
    pillarsRef.current = [];
    starsRef.current = [];
    lastPillarSpawnRef.current = performance.now();
    setScore(0);
    setGameOver(false);
    setIsPlaying(true);
  }, []);

  // Keyboard controls
  useEffect(() => {
    if (!effectivelyPlaying) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.code === "Space" || e.key === "ArrowUp") {
        e.preventDefault();
        jump();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
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
      const dt = Math.min((now - lastTime) / 1000, 0.1);
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

      // Gravity
      rocketVyRef.current += 780 * dt;
      rocketYRef.current += rocketVyRef.current * dt;

      // Spawn pillars
      if (now - lastPillarSpawnRef.current > 1600) {
        lastPillarSpawnRef.current = now;
        const gap = 135;
        const minH = 40;
        const maxH = height - gap - minH;
        const topHeight = Math.floor(minH + Math.random() * (maxH - minH));
        pillarsRef.current.push({
          x: width + 20,
          topHeight,
          bottomY: topHeight + gap,
          gap,
          passed: false,
        });

        // 50% chance of star in gap
        if (Math.random() < 0.5) {
          starsRef.current.push({
            x: width + 40,
            y: topHeight + gap / 2,
            collected: false,
          });
        }
      }

      // Move pillars
      const pillarSpeed = 130;
      for (const p of pillarsRef.current) {
        p.x -= pillarSpeed * dt;
      }
      pillarsRef.current = pillarsRef.current.filter((p) => p.x > -60);

      // Move stars
      for (const s of starsRef.current) {
        s.x -= pillarSpeed * dt;
      }
      starsRef.current = starsRef.current.filter((s) => s.x > -40);

      // Collision checks
      const rocketX = width * 0.25;
      const rocketY = rocketYRef.current;
      const rocketR = 16;

      // Floor & ceiling
      if (rocketY - rocketR < 0 || rocketY + rocketR > height) {
        setIsPlaying(false);
        setGameOver(true);
        playGameOverSound();
        return;
      }

      // Pillar collisions
      for (const p of pillarsRef.current) {
        // Scoring
        if (!p.passed && p.x + 40 < rocketX) {
          p.passed = true;
          setScore((s) => {
            const next = s + 1;
            setHighScore((prev) => {
              if (next > prev) {
                try {
                  localStorage.setItem("toystore_highscore_flappy", String(next));
                } catch {}
                return next;
              }
              return prev;
            });
            return next;
          });
        }

        // Hit box
        if (rocketX + rocketR > p.x && rocketX - rocketR < p.x + 46) {
          if (rocketY - rocketR < p.topHeight || rocketY + rocketR > p.bottomY) {
            setIsPlaying(false);
            setGameOver(true);
            playGameOverSound();
            return;
          }
        }
      }

      // Star collection
      for (const s of starsRef.current) {
        if (!s.collected && Math.hypot(rocketX - s.x, rocketY - s.y) < rocketR + 14) {
          s.collected = true;
          playCollectSound();
          setScore((sc) => sc + 5);
        }
      }

      // RENDER
      ctx.clearRect(0, 0, width, height);

      // Background Sky Gradient
      const grad = ctx.createLinearGradient(0, 0, 0, height);
      grad.addColorStop(0, "#a5b4fc");
      grad.addColorStop(0.6, "#c7d2fe");
      grad.addColorStop(1, "#fbcfe8");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // Draw clouds
      ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
      ctx.beginPath();
      ctx.arc(60, 60, 30, 0, Math.PI * 2);
      ctx.arc(90, 50, 40, 0, Math.PI * 2);
      ctx.arc(120, 60, 30, 0, Math.PI * 2);
      ctx.fill();

      // Draw Pillars (Toy Wooden Block Style)
      for (const p of pillarsRef.current) {
        // Top pillar
        ctx.fillStyle = "#fb923c";
        ctx.fillRect(p.x, 0, 46, p.topHeight);
        ctx.fillStyle = "#ea580c";
        ctx.fillRect(p.x - 3, p.topHeight - 16, 52, 16);

        // Bottom pillar
        ctx.fillStyle = "#38bdf8";
        ctx.fillRect(p.x, p.bottomY, 46, height - p.bottomY);
        ctx.fillStyle = "#0284c7";
        ctx.fillRect(p.x - 3, p.bottomY, 52, 16);
      }

      // Draw Stars
      for (const s of starsRef.current) {
        if (s.collected) continue;
        ctx.font = "20px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("⭐", s.x, s.y);
      }

      // Draw Rocket
      ctx.save();
      ctx.translate(rocketX, rocketY);
      const angle = Math.max(-0.6, Math.min(0.8, rocketVyRef.current / 380));
      ctx.rotate(angle);
      ctx.font = "32px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("🚀", 0, 0);
      ctx.restore();

      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [effectivelyPlaying]);

  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden select-none bg-indigo-100">
      {/* Game Header Bar */}
      <div className="relative z-20 flex items-center justify-between px-4 pt-3 pb-2 bg-white/80 backdrop-blur">
        <div className="flex items-center gap-2">
          <span className="flex size-9 items-center justify-center rounded-2xl bg-white shadow-xs text-xl">
            🪂
          </span>
          <div>
            <h3 className="font-display text-base font-extrabold text-ink-900 leading-tight">
              Flappy Rocket
            </h3>
            <p className="text-[11px] font-medium text-ink-500">Tap screen to flap & fly!</p>
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

      {/* Live Score Pill */}
      <div className="relative z-20 mx-4 mt-2 flex items-center justify-between rounded-2xl bg-white/80 px-4 py-1.5 backdrop-blur shadow-xs text-center">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-wider text-ink-400">Score</span>
          <p className="font-display text-xl font-black text-primary-600">{score}</p>
        </div>
        <span className="text-xs font-semibold text-ink-500">Tap screen or Space to boost</span>
      </div>

      {/* Interactive Canvas Area */}
      <div
        ref={containerRef}
        onPointerDown={(e) => {
          pointerStartRef.current = { x: e.clientX, y: e.clientY };
        }}
        onPointerUp={(e) => {
          if (!pointerStartRef.current) return;
          const dx = Math.abs(e.clientX - pointerStartRef.current.x);
          const dy = Math.abs(e.clientY - pointerStartRef.current.y);
          pointerStartRef.current = null;
          if (dx < 14 && dy < 14) {
            jump();
          }
        }}
        className="relative flex-1 touch-pan-y overflow-hidden cursor-pointer"
      >
        <canvas ref={canvasRef} className="h-full w-full" />

        {/* On-screen Thumb Boost Button for easy mobile playing */}
        {isPlaying && !gameOver && (
          <div className="pointer-events-none absolute inset-x-0 bottom-4 flex justify-center z-20">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                jump();
              }}
              className="pointer-events-auto flex items-center gap-2 rounded-full bg-primary-500/90 px-6 py-2.5 text-sm font-black text-white shadow-lifted backdrop-blur active:scale-95 hover:bg-primary-600"
            >
              🚀 TAP TO FLY
            </button>
          </div>
        )}

        {/* Start Overlay */}
        {!isPlaying && !gameOver && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/40 text-center backdrop-blur-xs p-4">
            <span className="text-5xl mb-2 animate-bounce">🚀</span>
            <h4 className="font-display text-2xl font-black text-white">
              Flappy Rocket
            </h4>
            <p className="mt-1 text-xs text-white/90 max-w-xs">
              Tap anywhere to boost the rocket. Fly between pillars and collect stars!
            </p>
            <button
              type="button"
              onClick={startGame}
              className="mt-4 flex items-center gap-2 rounded-full bg-primary-500 px-7 py-3 text-sm font-bold text-white shadow-lifted hover:bg-primary-600 active:scale-95"
            >
              <Play size={16} fill="currentColor" /> Tap to Launch
            </button>
          </div>
        )}

        {/* Game Over Screen */}
        {gameOver && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/55 text-center backdrop-blur-xs p-4 animate-sheet-up">
            <div className="rounded-3xl bg-white p-6 shadow-lifted w-full max-w-xs">
              <span className="text-4xl">💥</span>
              <h4 className="mt-2 font-display text-xl font-extrabold text-ink-900">
                Crash Landing!
              </h4>
              <p className="text-xs text-ink-500">Pillars navigated</p>
              <p className="my-3 font-display text-4xl font-black text-primary-600">{score}</p>
              <button
                type="button"
                onClick={startGame}
                className="w-full flex items-center justify-center gap-2 rounded-full bg-primary-500 py-3 text-sm font-bold text-white shadow-soft active:scale-95"
              >
                <RotateCcw size={16} /> Fly Again
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
