"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Volume2,
  VolumeX,
  Sparkles,
  Gamepad2,
  List,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { isAudioMuted, toggleAudioMuted } from "@/lib/games/soundEffects";
import { MobileBottomNav } from "@/components/site/MobileBottomNav";

import { GameBalloonPop } from "./GameBalloonPop";
import { GameMemoryMatch } from "./GameMemoryMatch";
import { GameToyTrain } from "./GameToyTrain";
import { GameWhackAToy } from "./GameWhackAToy";
import { GameCarTrack } from "./GameCarTrack";
import { GameTicTacToe } from "./GameTicTacToe";
import { GameFlappyRocket } from "./GameFlappyRocket";
import { GameBrickBreaker } from "./GameBrickBreaker";
import { GameDinoRunner } from "./GameDinoRunner";
import { GameSimonSays } from "./GameSimonSays";
import { GameTowerStacker } from "./GameTowerStacker";
import { GameAirHockey } from "./GameAirHockey";
import { GameTargetToss } from "./GameTargetToss";
import { Game2048 } from "./Game2048";

export type GameItem = {
  id: string;
  name: string;
  emoji: string;
  tag: string;
  category: "Action" | "Puzzle" | "Arcade" | "Classic" | "Sports";
  accentColor: string;
  component: React.ComponentType<{ active: boolean }>;
};

const GAMES: GameItem[] = [
  {
    id: "balloon-pop",
    name: "Balloon Pop Carnival",
    emoji: "🎈",
    tag: "Reflex & Pop",
    category: "Action",
    accentColor: "from-sky-400 to-indigo-500",
    component: GameBalloonPop,
  },
  {
    id: "memory-match",
    name: "Toy Match Flip",
    emoji: "🧸",
    tag: "Brain & Memory",
    category: "Puzzle",
    accentColor: "from-purple-400 to-pink-500",
    component: GameMemoryMatch,
  },
  {
    id: "toy-train",
    name: "Toy Train Express",
    emoji: "🚂",
    tag: "Snake Adventure",
    category: "Arcade",
    accentColor: "from-amber-400 to-emerald-500",
    component: GameToyTrain,
  },
  {
    id: "flappy-rocket",
    name: "Flappy Toy Rocket",
    emoji: "🪂",
    tag: "Tap & Fly",
    category: "Arcade",
    accentColor: "from-indigo-400 to-pink-500",
    component: GameFlappyRocket,
  },
  {
    id: "brick-breaker",
    name: "Toy Brick Breaker",
    emoji: "🧱",
    tag: "Smash & Bounce",
    category: "Arcade",
    accentColor: "from-rose-500 to-amber-500",
    component: GameBrickBreaker,
  },
  {
    id: "dino-runner",
    name: "Dino Jump Runner",
    emoji: "🦕",
    tag: "Endless Sprint",
    category: "Action",
    accentColor: "from-sky-400 to-emerald-500",
    component: GameDinoRunner,
  },
  {
    id: "simon-says",
    name: "Toy Simon Says",
    emoji: "🎨",
    tag: "Musical Pattern",
    category: "Puzzle",
    accentColor: "from-indigo-500 to-purple-600",
    component: GameSimonSays,
  },
  {
    id: "tower-stacker",
    name: "Toy Tower Stacker",
    emoji: "🏗️",
    tag: "Timing & Stacking",
    category: "Arcade",
    accentColor: "from-orange-400 to-pink-500",
    component: GameTowerStacker,
  },
  {
    id: "air-hockey",
    name: "Toy Air Hockey",
    emoji: "🏓",
    tag: "Fast Table Match",
    category: "Sports",
    accentColor: "from-blue-500 to-red-500",
    component: GameAirHockey,
  },
  {
    id: "target-toss",
    name: "Toy Target Pop",
    emoji: "🎯",
    tag: "Shooting Gallery",
    category: "Action",
    accentColor: "from-amber-400 to-red-500",
    component: GameTargetToss,
  },
  {
    id: "toy-2048",
    name: "Toy 2048 Blocks",
    emoji: "🔢",
    tag: "Merge & Grow",
    category: "Puzzle",
    accentColor: "from-amber-300 to-orange-500",
    component: Game2048,
  },
  {
    id: "whack-a-toy",
    name: "Whack-a-Toy",
    emoji: "🦔",
    tag: "Tap Speed",
    category: "Action",
    accentColor: "from-orange-400 to-rose-500",
    component: GameWhackAToy,
  },
  {
    id: "car-drift",
    name: "Toy Car Drift Arena",
    emoji: "🏎️",
    tag: "Drift & Steer",
    category: "Arcade",
    accentColor: "from-mint-400 to-primary-600",
    component: GameCarTrack,
  },
  {
    id: "tic-tac-toe",
    name: "Tic-Tac-Toe",
    emoji: "❌",
    tag: "Classic X vs O",
    category: "Classic",
    accentColor: "from-indigo-400 to-primary-500",
    component: GameTicTacToe,
  },
];

export function GamesFeed() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [muted, setMuted] = useState(() => (typeof window !== "undefined" ? isAudioMuted() : false));
  const [menuOpen, setMenuOpen] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const slideRefs = useRef<(HTMLDivElement | null)[]>([]);

  const handleToggleMute = () => {
    const next = toggleAudioMuted();
    setMuted(next);
  };

  // IntersectionObserver for tracking active slide index
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.55) {
            const index = Number((entry.target as HTMLElement).dataset.index);
            setActiveIndex(index);
          }
        }
      },
      { threshold: [0.55] }
    );

    for (const el of slideRefs.current) {
      if (el) observer.observe(el);
    }

    return () => observer.disconnect();
  }, []);

  const showScrollHint = !hasScrolled && activeIndex === 0;

  // Scroll to slide helper
  const scrollToSlide = (index: number) => {
    if (index < 0 || index >= GAMES.length) return;
    const target = slideRefs.current[index];
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const activeGame = GAMES[activeIndex] || GAMES[0];

  return (
    <div className="fixed inset-0 z-40 h-dvh w-full overflow-hidden bg-ink-950">
      {/* Snap Scrollable Game Container */}
      <div
        ref={containerRef}
        onScroll={() => {
          if (!hasScrolled) setHasScrolled(true);
        }}
        className="h-full w-full overflow-y-scroll snap-y-mandatory no-scrollbar"
        style={{
          WebkitOverflowScrolling: "touch",
          overscrollBehaviorY: "contain",
          touchAction: "pan-y",
        }}
      >
        {GAMES.map((game, index) => {
          const GameComponent = game.component;
          const isActive = index === activeIndex;

          return (
            <div
              key={game.id}
              ref={(el) => {
                slideRefs.current[index] = el;
              }}
              data-index={index}
              className="relative flex h-dvh w-full shrink-0 snap-start items-center justify-center bg-ink-950"
            >
              {/* Centered responsive frame: 100% on mobile, 40-50% on desktop (matching Explore) */}
              <div className="relative h-full w-full overflow-hidden lg:mx-auto lg:w-2/5 lg:max-w-2xl pt-14 pb-14">
                <GameComponent active={isActive} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Top Header Bar (Desktop & Mobile centered column matching Explore) */}
      <div className="pointer-events-none fixed inset-x-0 top-0 z-50 mx-auto flex items-center justify-between bg-gradient-to-b from-black/80 via-black/40 to-transparent p-3 lg:w-2/5 lg:max-w-2xl">
        <div className="pointer-events-auto flex items-center gap-2">
          <Link
            href="/"
            aria-label="Back to store"
            className="flex size-9 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur hover:bg-white/25 active:scale-95"
          >
            <ArrowLeft size={18} />
          </Link>
          <span className="font-display text-sm font-extrabold text-white flex items-center gap-1.5 drop-shadow-sm">
            <span>{activeGame.emoji}</span> {activeGame.name}
          </span>
        </div>

        <div className="pointer-events-auto flex items-center gap-2">
          {/* Game index counter */}
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            className="flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-1 text-xs font-bold text-white backdrop-blur hover:bg-white/25"
          >
            <Gamepad2 size={13} />
            <span>{activeIndex + 1} / {GAMES.length}</span>
            <List size={12} className="ml-0.5 opacity-80" />
          </button>

          {/* Sound Toggle */}
          <button
            type="button"
            aria-label={muted ? "Unmute game audio" : "Mute game audio"}
            onClick={handleToggleMute}
            className="flex size-9 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur hover:bg-white/25 active:scale-95"
          >
            {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>
        </div>
      </div>

      {/* Subtle First-Time Scroll Hint */}
      {showScrollHint && activeIndex === 0 && (
        <div className="pointer-events-none fixed bottom-18 inset-x-0 z-40 mx-auto flex justify-center lg:w-2/5 animate-bounce">
          <div className="rounded-full bg-black/70 px-4 py-1.5 text-xs font-bold text-white shadow-soft backdrop-blur flex items-center gap-1.5">
            <Sparkles size={13} className="text-sun-400" />
            <span>Swipe or scroll down for next game ↕</span>
          </div>
        </div>
      )}

      {/* Game Switcher Drawer Modal */}
      {menuOpen && (
        <div
          onClick={() => setMenuOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-sheet-up"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-3xl bg-white p-5 shadow-lifted"
          >
            <div className="flex items-center justify-between pb-3 border-b border-ink-100">
              <h3 className="font-display text-base font-extrabold text-ink-900 flex items-center gap-1.5">
                <Gamepad2 size={18} className="text-primary-600" /> Arcade Games
              </h3>
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                className="text-xs font-bold text-ink-500 hover:text-ink-800"
              >
                Close ✕
              </button>
            </div>

            <div className="mt-3 flex flex-col gap-2 max-h-80 overflow-y-auto pr-1">
              {GAMES.map((game, i) => (
                <button
                  key={game.id}
                  type="button"
                  onClick={() => {
                    scrollToSlide(i);
                    setMenuOpen(false);
                  }}
                  className={cn(
                    "flex items-center justify-between rounded-2xl p-3 text-left transition-all",
                    i === activeIndex
                      ? "bg-primary-50 border-2 border-primary-500 text-primary-900 shadow-xs"
                      : "bg-ink-50 hover:bg-ink-100 text-ink-800"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{game.emoji}</span>
                    <div>
                      <h4 className="text-sm font-bold leading-snug">{game.name}</h4>
                      <p className="text-[11px] text-ink-500">{game.tag}</p>
                    </div>
                  </div>
                  <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-bold text-ink-600 shadow-xs">
                    {game.category}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Bottom Nav docked cleanly outside the scroll stream */}
      <MobileBottomNav />
    </div>
  );
}
