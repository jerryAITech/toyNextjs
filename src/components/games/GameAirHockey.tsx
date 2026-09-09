"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Play, RotateCcw, Trophy } from "lucide-react";
import { playPaddleSound, playWinSound, playGameOverSound } from "@/lib/games/soundEffects";

const WINNING_SCORE = 5;

export function GameAirHockey({ active }: { active: boolean }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [playerScore, setPlayerScore] = useState(0);
  const [botScore, setBotScore] = useState(0);

  const [winsCount, setWinsCount] = useState(() => {
    try {
      return parseInt(localStorage.getItem("toystore_hockey_wins") || "0", 10) || 0;
    } catch {
      return 0;
    }
  });

  const [winner, setWinner] = useState<"player" | "bot" | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animFrameRef = useRef<number | null>(null);

  // Entities
  const playerRef = useRef({ x: 170, y: 380, r: 24 });
  const botRef = useRef({ x: 170, y: 70, r: 24, speed: 200 });
  const puckRef = useRef({ x: 170, y: 220, vx: 0, vy: 0, r: 15 });

  const effectivelyPlaying = isPlaying && active && !winner;

  const resetPuck = (w: number, h: number, toBot: boolean) => {
    puckRef.current = {
      x: w / 2,
      y: h / 2,
      vx: (Math.random() - 0.5) * 120,
      vy: toBot ? 180 : -180,
      r: 15,
    };
  };

  const startGame = useCallback(() => {
    const canvas = canvasRef.current;
    const w = canvas ? canvas.width : 340;
    const h = canvas ? canvas.height : 450;

    playerRef.current = { x: w / 2, y: h - 60, r: 24 };
    botRef.current = { x: w / 2, y: 60, r: 24, speed: 200 };
    resetPuck(w, h, Math.random() > 0.5);

    setPlayerScore(0);
    setBotScore(0);
    setWinner(null);
    setIsPlaying(true);
  }, []);

  // Handle player paddle drag
  const handlePointerMove = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas || !effectivelyPlaying) return;

    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    const pr = playerRef.current.r;
    // Player is restricted to bottom half
    playerRef.current.x = Math.max(pr, Math.min(canvas.width - pr, x));
    playerRef.current.y = Math.max(canvas.height / 2 + pr + 10, Math.min(canvas.height - pr - 10, y));
  };

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
          playerRef.current.y = h - 60;
        }
      }

      const width = canvas.width;
      const height = canvas.height;
      const goalWidth = width * 0.45;
      const goalLeft = (width - goalWidth) / 2;
      const goalRight = goalLeft + goalWidth;

      const puck = puckRef.current;
      const player = playerRef.current;
      const bot = botRef.current;

      // Move bot towards puck horizontally & slightly towards center
      const botTargetX = puck.x;
      const botDx = botTargetX - bot.x;
      bot.x += Math.sign(botDx) * Math.min(Math.abs(botDx), bot.speed * dt);
      bot.x = Math.max(bot.r, Math.min(width - bot.r, bot.x));

      // Move puck
      puck.x += puck.vx * dt;
      puck.y += puck.vy * dt;

      // Friction
      puck.vx *= 0.992;
      puck.vy *= 0.992;

      // Left/Right side bounce
      if (puck.x - puck.r < 0) {
        puck.x = puck.r;
        puck.vx = Math.abs(puck.vx);
        playPaddleSound();
      } else if (puck.x + puck.r > width) {
        puck.x = width - puck.r;
        puck.vx = -Math.abs(puck.vx);
        playPaddleSound();
      }

      // Check Goals
      if (puck.y - puck.r < 0) {
        if (puck.x >= goalLeft && puck.x <= goalRight) {
          // PLAYER SCORED!
          playWinSound();
          setPlayerScore((ps) => {
            const next = ps + 1;
            if (next >= WINNING_SCORE) {
              setWinner("player");
              setIsPlaying(false);
              setWinsCount((w) => {
                const nextW = w + 1;
                try {
                  localStorage.setItem("toystore_hockey_wins", String(nextW));
                } catch {}
                return nextW;
              });
            } else {
              resetPuck(width, height, true);
            }
            return next;
          });
          return;
        } else {
          puck.y = puck.r;
          puck.vy = Math.abs(puck.vy);
          playPaddleSound();
        }
      } else if (puck.y + puck.r > height) {
        if (puck.x >= goalLeft && puck.x <= goalRight) {
          // BOT SCORED!
          playGameOverSound();
          setBotScore((bs) => {
            const next = bs + 1;
            if (next >= WINNING_SCORE) {
              setWinner("bot");
              setIsPlaying(false);
            } else {
              resetPuck(width, height, false);
            }
            return next;
          });
          return;
        } else {
          puck.y = height - puck.r;
          puck.vy = -Math.abs(puck.vy);
          playPaddleSound();
        }
      }

      // Collision Player with Puck
      const pDist = Math.hypot(puck.x - player.x, puck.y - player.y);
      if (pDist < puck.r + player.r) {
        playPaddleSound();
        const angle = Math.atan2(puck.y - player.y, puck.x - player.x);
        const speed = Math.max(260, Math.hypot(puck.vx, puck.vy) + 40);
        puck.vx = Math.cos(angle) * speed;
        puck.vy = Math.sin(angle) * speed;
        puck.x = player.x + Math.cos(angle) * (puck.r + player.r + 2);
        puck.y = player.y + Math.sin(angle) * (puck.r + player.r + 2);
      }

      // Collision Bot with Puck
      const bDist = Math.hypot(puck.x - bot.x, puck.y - bot.y);
      if (bDist < puck.r + bot.r) {
        playPaddleSound();
        const angle = Math.atan2(puck.y - bot.y, puck.x - bot.x);
        const speed = Math.max(260, Math.hypot(puck.vx, puck.vy) + 40);
        puck.vx = Math.cos(angle) * speed;
        puck.vy = Math.sin(angle) * speed;
        puck.x = bot.x + Math.cos(angle) * (puck.r + bot.r + 2);
        puck.y = bot.y + Math.sin(angle) * (puck.r + bot.r + 2);
      }

      // RENDER
      ctx.clearRect(0, 0, width, height);

      // Table Rink
      ctx.fillStyle = "#f8fafc";
      ctx.fillRect(0, 0, width, height);

      // Rink center line
      ctx.strokeStyle = "#e2e8f0";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(0, height / 2);
      ctx.lineTo(width, height / 2);
      ctx.stroke();

      // Center circle
      ctx.beginPath();
      ctx.arc(width / 2, height / 2, 45, 0, Math.PI * 2);
      ctx.stroke();

      // Goal Creases
      ctx.fillStyle = "rgba(239, 68, 68, 0.15)";
      ctx.fillRect(goalLeft, 0, goalWidth, 16);
      ctx.fillStyle = "rgba(59, 130, 246, 0.15)";
      ctx.fillRect(goalLeft, height - 16, goalWidth, 16);

      // Bot Goal Posts
      ctx.fillStyle = "#ef4444";
      ctx.fillRect(goalLeft - 4, 0, 8, 12);
      ctx.fillRect(goalRight - 4, 0, 8, 12);

      // Player Goal Posts
      ctx.fillStyle = "#3b82f6";
      ctx.fillRect(goalLeft - 4, height - 12, 8, 12);
      ctx.fillRect(goalRight - 4, height - 12, 8, 12);

      // Draw Bot Mallet
      ctx.beginPath();
      ctx.arc(bot.x, bot.y, bot.r, 0, Math.PI * 2);
      ctx.fillStyle = "#ef4444";
      ctx.fill();
      ctx.beginPath();
      ctx.arc(bot.x, bot.y, bot.r * 0.45, 0, Math.PI * 2);
      ctx.fillStyle = "#b91c1c";
      ctx.fill();

      // Draw Player Mallet
      ctx.beginPath();
      ctx.arc(player.x, player.y, player.r, 0, Math.PI * 2);
      ctx.fillStyle = "#3b82f6";
      ctx.fill();
      ctx.beginPath();
      ctx.arc(player.x, player.y, player.r * 0.45, 0, Math.PI * 2);
      ctx.fillStyle = "#1d4ed8";
      ctx.fill();

      // Draw Puck
      ctx.beginPath();
      ctx.arc(puck.x, puck.y, puck.r, 0, Math.PI * 2);
      ctx.fillStyle = "#0f172a";
      ctx.fill();
      ctx.strokeStyle = "#475569";
      ctx.lineWidth = 3;
      ctx.stroke();

      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [effectivelyPlaying]);

  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden select-none bg-slate-100">
      {/* Game Header Bar */}
      <div className="relative z-20 flex items-center justify-between px-4 pt-3 pb-2 bg-white/80 backdrop-blur">
        <div className="flex items-center gap-2">
          <span className="flex size-9 items-center justify-center rounded-2xl bg-white shadow-xs text-xl">
            🏓
          </span>
          <div>
            <h3 className="font-display text-base font-extrabold text-ink-900 leading-tight">
              Toy Air Hockey
            </h3>
            <p className="text-[11px] font-medium text-ink-500">Drag blue mallet to score 5 goals!</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 rounded-full bg-sun-100/90 px-2.5 py-1 text-xs font-bold text-ink-800 shadow-xs">
            <Trophy size={13} className="text-sun-500" />
            <span>{winsCount} Wins</span>
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

      {/* Scoreboard Pill */}
      <div className="relative z-20 mx-4 mt-2 flex items-center justify-between rounded-2xl bg-white/80 px-4 py-1.5 backdrop-blur shadow-xs text-center">
        <span className="text-xs font-black text-rose-600">🤖 Bot: {botScore}</span>
        <span className="text-xs font-bold text-ink-400">First to 5</span>
        <span className="text-xs font-black text-blue-600">You: {playerScore}</span>
      </div>

      {/* Interactive Table Area */}
      <div
        ref={containerRef}
        onPointerMove={(e) => handlePointerMove(e.clientX, e.clientY)}
        onTouchMove={(e) => {
          if (e.touches[0]) handlePointerMove(e.touches[0].clientX, e.touches[0].clientY);
        }}
        className="relative flex-1 touch-none overflow-hidden cursor-crosshair m-2 rounded-3xl border-4 border-slate-300 shadow-soft"
      >
        <canvas ref={canvasRef} className="h-full w-full" />

        {/* Start Overlay */}
        {!isPlaying && !winner && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/40 text-center backdrop-blur-xs p-4">
            <span className="text-5xl mb-2 animate-bounce">🏓</span>
            <h4 className="font-display text-2xl font-black text-white">
              Toy Air Hockey
            </h4>
            <p className="mt-1 text-xs text-white/90 max-w-xs">
              Drag your blue mallet to hit the puck into the robot&apos;s goal. First to 5 wins!
            </p>
            <button
              type="button"
              onClick={startGame}
              className="mt-4 flex items-center gap-2 rounded-full bg-primary-500 px-7 py-3 text-sm font-bold text-white shadow-lifted hover:bg-primary-600 active:scale-95"
            >
              <Play size={16} fill="currentColor" /> Tap to Face Off
            </button>
          </div>
        )}

        {/* Winner Screen */}
        {winner && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/55 text-center backdrop-blur-xs p-4 animate-sheet-up">
            <div className="rounded-3xl bg-white p-6 shadow-lifted w-full max-w-xs">
              <span className="text-4xl">{winner === "player" ? "🏆" : "🤖"}</span>
              <h4 className="mt-2 font-display text-xl font-extrabold text-ink-900">
                {winner === "player" ? "You Won the Match!" : "Toy Bot Won!"}
              </h4>
              <p className="my-2 font-display text-2xl font-black text-ink-700">
                {playerScore} - {botScore}
              </p>
              <button
                type="button"
                onClick={startGame}
                className="w-full flex items-center justify-center gap-2 rounded-full bg-primary-500 py-3 text-sm font-bold text-white shadow-soft active:scale-95"
              >
                <RotateCcw size={16} /> Play Rematch
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
