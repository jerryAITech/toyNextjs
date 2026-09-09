"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Play, RotateCcw, Trophy, Flame } from "lucide-react";
import { playHitSound, playCollectSound, playGameOverSound } from "@/lib/games/soundEffects";

type Target = {
  id: number;
  x: number;
  y: number;
  speed: number;
  r: number;
  emoji: string;
  points: number;
};

const TARGET_TYPES = [
  { emoji: "🎯", points: 30, r: 24, speedMin: 80, speedMax: 140 },
  { emoji: "🦆", points: 20, r: 22, speedMin: 100, speedMax: 170 },
  { emoji: "⭐", points: 50, r: 20, speedMin: 140, speedMax: 210 },
  { emoji: "🎈", points: 15, r: 25, speedMin: 70, speedMax: 120 },
];

const GAME_DURATION = 30;

export function GameTargetToss({ active }: { active: boolean }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(0);

  const [highScore, setHighScore] = useState(() => {
    try {
      return parseInt(localStorage.getItem("toystore_highscore_targets") || "0", 10) || 0;
    } catch {
      return 0;
    }
  });

  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [combo, setCombo] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const targetsRef = useRef<Target[]>([]);
  const nextIdRef = useRef(1);
  const animFrameRef = useRef<number | null>(null);
  const lastSpawnRef = useRef(0);
  const comboTimerRef = useRef<NodeJS.Timeout | null>(null);
  const pointerStartRef = useRef<{ x: number; y: number } | null>(null);

  const effectivelyPlaying = isPlaying && active;

  const startGame = useCallback(() => {
    targetsRef.current = [];
    setScore(0);
    setCombo(0);
    setTimeLeft(GAME_DURATION);
    setGameOver(false);
    setIsPlaying(true);
    lastSpawnRef.current = performance.now();
  }, []);

  const handlePointerDown = (clientX: number, clientY: number) => {
    if (!effectivelyPlaying) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    const targets = targetsRef.current;
    for (let i = targets.length - 1; i >= 0; i--) {
      const t = targets[i];
      if (Math.hypot(x - t.x, y - t.y) < t.r * 1.3) {
        // HIT TARGET!
        if (t.points >= 50) playCollectSound();
        else playHitSound();

        const multiplier = 1 + Math.min(Math.floor(combo / 3), 4) * 0.5;
        const pts = Math.round(t.points * multiplier);

        setScore((s) => {
          const next = s + pts;
          setHighScore((prev) => {
            if (next > prev) {
              try {
                localStorage.setItem("toystore_highscore_targets", String(next));
              } catch {}
              return next;
            }
            return prev;
          });
          return next;
        });

        setCombo((c) => {
          const nextCombo = c + 1;
          if (comboTimerRef.current) clearTimeout(comboTimerRef.current);
          comboTimerRef.current = setTimeout(() => setCombo(0), 1600);
          return nextCombo;
        });

        targets.splice(i, 1);
        break;
      }
    }
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

      // Spawn target
      if (now - lastSpawnRef.current > 550) {
        lastSpawnRef.current = now;
        const type = TARGET_TYPES[Math.floor(Math.random() * TARGET_TYPES.length)];
        const fromLeft = Math.random() > 0.5;
        const speed = (type.speedMin + Math.random() * (type.speedMax - type.speedMin)) * (fromLeft ? 1 : -1);

        targetsRef.current.push({
          id: nextIdRef.current++,
          x: fromLeft ? -type.r : width + type.r,
          y: Math.max(type.r + 20, Math.random() * (height - type.r * 2 - 30)),
          speed,
          r: type.r,
          emoji: type.emoji,
          points: type.points,
        });
      }

      // Move targets
      for (let i = targetsRef.current.length - 1; i >= 0; i--) {
        const t = targetsRef.current[i];
        t.x += t.speed * dt;
        if (t.x < -60 || t.x > width + 60) {
          targetsRef.current.splice(i, 1);
        }
      }

      // RENDER
      ctx.clearRect(0, 0, width, height);

      // Carnival Tent Background
      const grad = ctx.createLinearGradient(0, 0, 0, height);
      grad.addColorStop(0, "#fef3c7");
      grad.addColorStop(0.5, "#ffedd5");
      grad.addColorStop(1, "#fee2e2");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // Shooting gallery horizontal wire rails
      ctx.strokeStyle = "rgba(180, 83, 9, 0.25)";
      ctx.lineWidth = 3;
      for (let y = 60; y < height; y += 70) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Draw targets
      for (const t of targetsRef.current) {
        // Target background disc
        ctx.beginPath();
        ctx.arc(t.x, t.y, t.r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
        ctx.shadowColor = "rgba(0, 0, 0, 0.15)";
        ctx.shadowBlur = 6;
        ctx.fill();
        ctx.shadowColor = "transparent";

        // Target emoji
        ctx.font = `${Math.round(t.r * 1.3)}px sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(t.emoji, t.x, t.y);
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
    <div className="relative flex h-full w-full flex-col overflow-hidden select-none bg-amber-50">
      {/* Game Header Bar */}
      <div className="relative z-20 flex items-center justify-between px-4 pt-3 pb-2 bg-white/80 backdrop-blur">
        <div className="flex items-center gap-2">
          <span className="flex size-9 items-center justify-center rounded-2xl bg-white shadow-xs text-xl">
            🎯
          </span>
          <div>
            <h3 className="font-display text-base font-extrabold text-ink-900 leading-tight">
              Toy Target Pop
            </h3>
            <p className="text-[11px] font-medium text-ink-500">Tap moving targets in 30s!</p>
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
      <div className="relative z-20 mx-4 mt-2 flex items-center justify-between rounded-2xl bg-white/80 px-4 py-1.5 backdrop-blur shadow-xs text-center">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-wider text-ink-400">Score</span>
          <p className="font-display text-xl font-black text-primary-600">{score}</p>
        </div>

        {combo > 1 && (
          <div className="flex items-center gap-1 animate-pulse rounded-full bg-accent-500 px-2.5 py-0.5 text-xs font-bold text-white shadow-xs">
            <Flame size={13} /> {combo}x Combo!
          </div>
        )}

        <div>
          <span className="text-[10px] uppercase font-bold tracking-wider text-ink-400">Time</span>
          <p className="font-display text-xl font-black text-ink-800">{timeLeft}s</p>
        </div>
      </div>

      {/* Interactive Gallery Canvas */}
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
            handlePointerDown(e.clientX, e.clientY);
          }
        }}
        className="relative flex-1 touch-pan-y overflow-hidden cursor-crosshair"
      >
        <canvas ref={canvasRef} className="h-full w-full" />

        {/* Start Overlay */}
        {!isPlaying && !gameOver && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/40 text-center backdrop-blur-xs p-4">
            <span className="text-5xl mb-2 animate-bounce">🎯</span>
            <h4 className="font-display text-2xl font-black text-white">
              Toy Target Pop
            </h4>
            <p className="mt-1 text-xs text-white/90 max-w-xs">
              Carnival gallery! Tap 🎯 targets, 🦆 ducks, and ⭐ stars as they slide across!
            </p>
            <button
              type="button"
              onClick={startGame}
              className="mt-4 flex items-center gap-2 rounded-full bg-primary-500 px-7 py-3 text-sm font-bold text-white shadow-lifted hover:bg-primary-600 active:scale-95"
            >
              <Play size={16} fill="currentColor" /> Tap to Aim & Shoot
            </button>
          </div>
        )}

        {/* Game Over Screen */}
        {gameOver && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/55 text-center backdrop-blur-xs p-4 animate-sheet-up">
            <div className="rounded-3xl bg-white p-6 shadow-lifted w-full max-w-xs">
              <span className="text-4xl">🏆</span>
              <h4 className="mt-2 font-display text-xl font-extrabold text-ink-900">
                Gallery Closed!
              </h4>
              <p className="text-xs text-ink-500">Carnival Score</p>
              <p className="my-3 font-display text-4xl font-black text-primary-600">{score}</p>
              <button
                type="button"
                onClick={startGame}
                className="w-full flex items-center justify-center gap-2 rounded-full bg-primary-500 py-3 text-sm font-bold text-white shadow-soft active:scale-95"
              >
                <RotateCcw size={16} /> Shoot Again
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
