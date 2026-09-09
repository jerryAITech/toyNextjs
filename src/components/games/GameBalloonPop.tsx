"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Play, RotateCcw, Trophy, Sparkles, Flame } from "lucide-react";
import { playPopSound, playGameOverSound } from "@/lib/games/soundEffects";
import { cn } from "@/lib/utils/cn";

type Balloon = {
  id: number;
  x: number;
  y: number;
  radius: number;
  speed: number;
  swaySpeed: number;
  swayAmp: number;
  color: string;
  type: "normal" | "gold" | "cactus";
  points: number;
  label?: string;
};

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  alpha: number;
};

const COLORS = [
  "#ef4577", // Berry
  "#6d4fd1", // Purple
  "#fa5a1f", // Accent Orange
  "#16a67a", // Mint
  "#3b82f6", // Sky Blue
  "#ffd23f", // Sun Yellow
];

const GAME_DURATION = 30; // seconds

export function GameBalloonPop({ active }: { active: boolean }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(0);

  const [highScore, setHighScore] = useState(() => {
    try {
      return parseInt(localStorage.getItem("toystore_highscore_balloon") || "0", 10) || 0;
    } catch {
      return 0;
    }
  });

  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [combo, setCombo] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const balloonsRef = useRef<Balloon[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const nextIdRef = useRef(1);
  const animFrameRef = useRef<number | null>(null);
  const lastSpawnRef = useRef(0);
  const comboTimerRef = useRef<NodeJS.Timeout | null>(null);

  const effectivelyPlaying = isPlaying && active;

  const startGame = useCallback(() => {
    balloonsRef.current = [];
    particlesRef.current = [];
    setScore(0);
    setCombo(0);
    setTimeLeft(GAME_DURATION);
    setGameOver(false);
    setIsPlaying(true);
    lastSpawnRef.current = performance.now();
  }, []);

  const pointerStartRef = useRef<{ x: number; y: number } | null>(null);

  // Handle pop logic
  const handleCanvasClick = (clientX: number, clientY: number) => {
    if (!effectivelyPlaying) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    // Search from newest to oldest (top-most first)
    const balloons = balloonsRef.current;
    for (let i = balloons.length - 1; i >= 0; i--) {
      const b = balloons[i];
      const dist = Math.hypot(x - b.x, y - b.y);
      if (dist <= b.radius * 1.2) {
        // HIT!
        playPopSound();

        const multiplier = 1 + Math.min(Math.floor(combo / 3), 4) * 0.5;
        const addedPoints = Math.round(b.points * (b.type === "cactus" ? 1 : multiplier));

        setScore((s) => {
          const next = Math.max(0, s + addedPoints);
          setHighScore((prevHigh) => {
            if (next > prevHigh) {
              try {
                localStorage.setItem("toystore_highscore_balloon", String(next));
              } catch {}
              return next;
            }
            return prevHigh;
          });
          return next;
        });

        if (b.type === "cactus") {
          setCombo(0);
        } else {
          setCombo((c) => {
            const nextCombo = c + 1;
            if (comboTimerRef.current) clearTimeout(comboTimerRef.current);
            comboTimerRef.current = setTimeout(() => setCombo(0), 1800);
            return nextCombo;
          });
        }

        // Spawn particles
        const count = b.type === "gold" ? 16 : 10;
        for (let p = 0; p < count; p++) {
          const angle = (Math.PI * 2 * p) / count + Math.random() * 0.4;
          const spd = 2 + Math.random() * 4;
          particlesRef.current.push({
            x: b.x,
            y: b.y,
            vx: Math.cos(angle) * spd,
            vy: Math.sin(angle) * spd,
            color: b.color,
            size: 3 + Math.random() * 4,
            alpha: 1,
          });
        }

        balloons.splice(i, 1);
        break;
      }
    }
  };

  // Main Canvas render and physics loop
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

      // Sync canvas resolution to layout size
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

      // Clear canvas
      ctx.clearRect(0, 0, width, height);

      // Spawn balloons
      if (now - lastSpawnRef.current > 420) {
        lastSpawnRef.current = now;
        const isGold = Math.random() < 0.12;
        const isCactus = !isGold && Math.random() < 0.09;
        const radius = isGold ? 24 : 28 + Math.random() * 8;

        balloonsRef.current.push({
          id: nextIdRef.current++,
          x: Math.max(radius + 10, Math.random() * (width - radius * 2 - 20) + radius),
          y: height + radius + 10,
          radius,
          speed: 130 + Math.random() * 90 + (isGold ? 50 : 0),
          swaySpeed: 2 + Math.random() * 2,
          swayAmp: 16 + Math.random() * 16,
          color: isGold ? "#ffd23f" : isCactus ? "#16a67a" : COLORS[Math.floor(Math.random() * COLORS.length)],
          type: isGold ? "gold" : isCactus ? "cactus" : "normal",
          points: isGold ? 50 : isCactus ? -30 : 10,
          label: isGold ? "⭐" : isCactus ? "🌵" : undefined,
        });
      }

      // Draw and update balloons
      for (let i = balloonsRef.current.length - 1; i >= 0; i--) {
        const b = balloonsRef.current[i];
        b.y -= b.speed * dt;
        b.x += Math.sin((now / 1000) * b.swaySpeed + b.id) * b.swayAmp * dt;

        if (b.y + b.radius < -50) {
          balloonsRef.current.splice(i, 1);
          continue;
        }

        // Draw balloon string
        ctx.beginPath();
        ctx.moveTo(b.x, b.y + b.radius * 1.25);
        ctx.quadraticCurveTo(b.x - 4, b.y + b.radius * 1.25 + 10, b.x + 2, b.y + b.radius * 1.25 + 20);
        ctx.strokeStyle = "rgba(100, 100, 140, 0.4)";
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Draw balloon body (ellipse)
        ctx.beginPath();
        ctx.ellipse(b.x, b.y, b.radius, b.radius * 1.25, 0, 0, Math.PI * 2);
        ctx.fillStyle = b.color;
        ctx.shadowColor = "rgba(0, 0, 0, 0.15)";
        ctx.shadowBlur = 8;
        ctx.shadowOffsetY = 4;
        ctx.fill();
        ctx.shadowColor = "transparent";

        // Draw gloss shine
        ctx.beginPath();
        ctx.ellipse(b.x - b.radius * 0.35, b.y - b.radius * 0.4, b.radius * 0.3, b.radius * 0.5, -0.3, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255, 255, 255, 0.45)";
        ctx.fill();

        // Draw knot
        ctx.beginPath();
        ctx.moveTo(b.x - 4, b.y + b.radius * 1.25);
        ctx.lineTo(b.x + 4, b.y + b.radius * 1.25);
        ctx.lineTo(b.x, b.y + b.radius * 1.25 + 5);
        ctx.closePath();
        ctx.fillStyle = b.color;
        ctx.fill();

        // Draw emoji label if special
        if (b.label) {
          ctx.font = `${Math.round(b.radius * 0.9)}px sans-serif`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(b.label, b.x, b.y);
        }
      }

      // Draw and update particles
      for (let i = particlesRef.current.length - 1; i >= 0; i--) {
        const p = particlesRef.current[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.18; // gravity
        p.alpha -= 0.035;

        if (p.alpha <= 0) {
          particlesRef.current.splice(i, 1);
          continue;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.fill();
        ctx.globalAlpha = 1;
      }

      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [effectivelyPlaying]);

  // Countdown timer
  useEffect(() => {
    if (!effectivelyPlaying) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setIsPlaying(false);
          setGameOver(true);
          playGameOverSound();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [effectivelyPlaying]);

  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden select-none bg-gradient-to-b from-sky-300 via-sky-100 to-amber-50">
      {/* Game Header Bar */}
      <div className="relative z-20 flex items-center justify-between px-4 pt-3 pb-2">
        <div className="flex items-center gap-2">
          <span className="flex size-9 items-center justify-center rounded-2xl bg-white/80 shadow-xs text-xl">
            🎈
          </span>
          <div>
            <h3 className="font-display text-base font-extrabold text-ink-900 leading-tight">
              Balloon Carnival
            </h3>
            <p className="text-[11px] font-medium text-ink-500">Tap fast to pop!</p>
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
            className="flex size-8 items-center justify-center rounded-full bg-white/90 text-ink-700 shadow-xs active:scale-95"
          >
            <RotateCcw size={14} />
          </button>
        </div>
      </div>

      {/* Live Stats Row */}
      <div className="relative z-20 mx-4 flex items-center justify-between rounded-2xl bg-white/75 px-4 py-1.5 backdrop-blur shadow-xs">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-wider text-ink-400">Score</span>
          <p className="font-display text-xl font-black text-primary-600">{score}</p>
        </div>

        {combo > 1 && (
          <div className="flex items-center gap-1 animate-pulse rounded-full bg-accent-500 px-2.5 py-0.5 text-xs font-bold text-white shadow-xs">
            <Flame size={13} /> {combo}x Combo!
          </div>
        )}

        <div className="text-right">
          <span className="text-[10px] uppercase font-bold tracking-wider text-ink-400">Time</span>
          <p className={cn("font-display text-xl font-black", timeLeft <= 5 ? "text-danger animate-ping" : "text-ink-800")}>
            {timeLeft}s
          </p>
        </div>
      </div>

      {/* Interactive HTML5 Balloon Canvas Area */}
      <div
        ref={containerRef}
        className="relative flex-1 touch-pan-y overflow-hidden"
      >
        <canvas
          ref={canvasRef}
          onPointerDown={(e) => {
            pointerStartRef.current = { x: e.clientX, y: e.clientY };
          }}
          onPointerUp={(e) => {
            if (!pointerStartRef.current) return;
            const dx = Math.abs(e.clientX - pointerStartRef.current.x);
            const dy = Math.abs(e.clientY - pointerStartRef.current.y);
            pointerStartRef.current = null;
            if (dx < 14 && dy < 14) {
              handleCanvasClick(e.clientX, e.clientY);
            }
          }}
          className="h-full w-full cursor-pointer"
        />

        {/* Start Game Overlay */}
        {!isPlaying && !gameOver && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/35 px-6 text-center backdrop-blur-xs">
            <div className="flex size-16 items-center justify-center rounded-3xl bg-white shadow-lifted text-3xl animate-bounce">
              🎈
            </div>
            <h4 className="mt-3 font-display text-2xl font-black text-white drop-shadow">
              Balloon Carnival
            </h4>
            <p className="mt-1 text-xs text-white/90 max-w-xs">
              Pop as many balloons as you can in 30 seconds! Tap ⭐ for 50 bonus points, avoid 🌵!
            </p>
            <button
              type="button"
              onClick={startGame}
              className="mt-5 flex items-center gap-2 rounded-full bg-primary-500 px-7 py-3 text-base font-bold text-white shadow-lifted hover:bg-primary-600 active:scale-95 transition-all"
            >
              <Play size={18} fill="currentColor" /> Tap to Play
            </button>
          </div>
        )}

        {/* Game Over Screen */}
        {gameOver && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/50 px-6 text-center backdrop-blur-sm animate-sheet-up">
            <div className="rounded-3xl bg-white p-6 shadow-lifted w-full max-w-xs">
              <span className="text-4xl">🎉</span>
              <h4 className="mt-2 font-display text-xl font-extrabold text-ink-900">
                Time&apos;s Up!
              </h4>
              <p className="text-xs text-ink-500">Carnival Round Completed</p>

              <div className="my-4 rounded-2xl bg-ink-50 p-3">
                <span className="text-xs font-semibold text-ink-500">Your Score</span>
                <p className="font-display text-3xl font-black text-primary-600">{score}</p>
                {score >= highScore && score > 0 && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-accent-600 mt-1">
                    <Sparkles size={12} /> New Personal Best!
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={startGame}
                className="w-full flex items-center justify-center gap-2 rounded-full bg-primary-500 py-3 text-sm font-bold text-white shadow-soft hover:bg-primary-600 active:scale-95"
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
