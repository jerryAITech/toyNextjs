"use client";

import { useEffect, useState, useCallback, useTransition } from "react";
import { RotateCcw, Trophy, Star, Sparkles } from "lucide-react";
import { playFlipSound, playMatchSound, playWinSound } from "@/lib/games/soundEffects";

type Card = {
  id: number;
  toy: string;
  name: string;
  isFlipped: boolean;
  isMatched: boolean;
};

const ALL_TOYS = [
  { toy: "🧸", name: "Teddy" },
  { toy: "🤖", name: "Robot" },
  { toy: "🚀", name: "Rocket" },
  { toy: "🚗", name: "Car" },
  { toy: "🚂", name: "Train" },
  { toy: "🦖", name: "Dino" },
  { toy: "🦆", name: "Duck" },
  { toy: "🪀", name: "Yo-Yo" },
];

type Difficulty = "easy" | "medium" | "hard";

const CONFIG: Record<Difficulty, { pairs: number; cols: string; maxMovesFor3Stars: number }> = {
  easy: { pairs: 4, cols: "grid-cols-4", maxMovesFor3Stars: 6 },
  medium: { pairs: 6, cols: "grid-cols-4", maxMovesFor3Stars: 10 },
  hard: { pairs: 8, cols: "grid-cols-4", maxMovesFor3Stars: 14 },
};

function createShuffledDeck(diff: Difficulty): Card[] {
  const currentCfg = CONFIG[diff];
  const selectedToys = ALL_TOYS.slice(0, currentCfg.pairs);
  const deck: Card[] = [];

  selectedToys.forEach((item, index) => {
    deck.push({ id: index * 2, toy: item.toy, name: item.name, isFlipped: false, isMatched: false });
    deck.push({ id: index * 2 + 1, toy: item.toy, name: item.name, isFlipped: false, isMatched: false });
  });

  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

export function GameMemoryMatch({ active }: { active: boolean }) {
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [cards, setCards] = useState<Card[]>(() => createShuffledDeck("medium"));
  const [flippedIds, setFlippedIds] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [matches, setMatches] = useState(0);
  const [time, setTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isWon, setIsWon] = useState(false);
  const [bestMoves, setBestMoves] = useState<number | null>(() => {
    try {
      const saved = typeof window !== "undefined" ? localStorage.getItem("toystore_memory_best_medium") : null;
      return saved ? parseInt(saved, 10) : null;
    } catch {
      return null;
    }
  });
  const [, startTransition] = useTransition();

  const cfg = CONFIG[difficulty];
  const effectivelyPlaying = isPlaying && active && !isWon;

  // Initialize deck on user action
  const initializeGame = useCallback(
    (diff: Difficulty = difficulty) => {
      setCards(createShuffledDeck(diff));
      setFlippedIds([]);
      setMoves(0);
      setMatches(0);
      setTime(0);
      setIsWon(false);
      setIsPlaying(true);

      // Load best score for difficulty
      try {
        const saved = localStorage.getItem(`toystore_memory_best_${diff}`);
        if (saved) setBestMoves(parseInt(saved, 10));
        else setBestMoves(null);
      } catch {}
    },
    [difficulty]
  );

  // Stopwatch timer
  useEffect(() => {
    if (!effectivelyPlaying) return;
    const interval = setInterval(() => {
      setTime((t) => t + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [effectivelyPlaying]);

  // Handle card click
  const handleCardClick = (id: number) => {
    if (!isPlaying || isWon) return;
    if (flippedIds.length >= 2) return;

    const clickedCard = cards.find((c) => c.id === id);
    if (!clickedCard || clickedCard.isFlipped || clickedCard.isMatched) return;

    playFlipSound();

    const newFlipped = [...flippedIds, id];
    setFlippedIds(newFlipped);

    setCards((prev) =>
      prev.map((c) => (c.id === id ? { ...c, isFlipped: true } : c))
    );

    if (newFlipped.length === 2) {
      setMoves((m) => m + 1);
      const [firstId, secondId] = newFlipped;
      const firstCard = cards.find((c) => c.id === firstId);
      const secondCard = cards.find((c) => c.id === secondId);

      if (firstCard && secondCard && firstCard.toy === secondCard.toy) {
        // MATCH!
        setTimeout(() => {
          playMatchSound();
          setCards((prev) =>
            prev.map((c) =>
              c.id === firstId || c.id === secondId ? { ...c, isMatched: true } : c
            )
          );
          setFlippedIds([]);
          setMatches((m) => {
            const nextMatches = m + 1;
            if (nextMatches === cfg.pairs) {
              // ALL MATCHED - WON!
              setIsWon(true);
              setIsPlaying(false);
              playWinSound();

              const finalMoves = moves + 1;
              if (!bestMoves || finalMoves < bestMoves) {
                setBestMoves(finalMoves);
                try {
                  localStorage.setItem(`toystore_memory_best_${difficulty}`, String(finalMoves));
                } catch {}
              }
            }
            return nextMatches;
          });
        }, 320);
      } else {
        // NO MATCH - FLIP BACK
        setTimeout(() => {
          setCards((prev) =>
            prev.map((c) =>
              c.id === firstId || c.id === secondId ? { ...c, isFlipped: false } : c
            )
          );
          setFlippedIds([]);
        }, 750);
      }
    }
  };

  // Star rating calculation
  const getStars = () => {
    if (moves <= cfg.maxMovesFor3Stars) return 3;
    if (moves <= cfg.maxMovesFor3Stars * 1.5) return 2;
    return 1;
  };

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden select-none bg-gradient-to-b from-indigo-50 via-purple-50 to-pink-50">
      {/* Game Header Bar */}
      <div className="relative z-20 flex items-center justify-between px-4 pt-3 pb-2">
        <div className="flex items-center gap-2">
          <span className="flex size-9 items-center justify-center rounded-2xl bg-white shadow-xs text-xl">
            🧸
          </span>
          <div>
            <h3 className="font-display text-base font-extrabold text-ink-900 leading-tight">
              Toy Match Flip
            </h3>
            <p className="text-[11px] font-medium text-ink-500">Find all the matching pairs</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {bestMoves !== null && (
            <div className="flex items-center gap-1 rounded-full bg-sun-100/90 px-2.5 py-1 text-xs font-bold text-ink-800 shadow-xs">
              <Trophy size={13} className="text-sun-500" />
              <span>{bestMoves} moves</span>
            </div>
          )}

          <button
            type="button"
            onClick={() => initializeGame(difficulty)}
            aria-label="Restart"
            className="flex size-8 items-center justify-center rounded-full bg-white text-ink-700 shadow-xs active:scale-95"
          >
            <RotateCcw size={14} />
          </button>
        </div>
      </div>

      {/* Difficulty Tabs */}
      <div className="relative z-20 flex justify-center gap-2 px-4 pb-2">
        {(["easy", "medium", "hard"] as Difficulty[]).map((d) => (
          <button
            key={d}
            type="button"
            onClick={() => {
              startTransition(() => {
                setDifficulty(d);
                initializeGame(d);
              });
            }}
            className={`rounded-full px-3.5 py-1 text-xs font-bold transition-all ${
              difficulty === d
                ? "bg-primary-500 text-white shadow-xs"
                : "bg-white/80 text-ink-600 hover:bg-white"
            }`}
          >
            {d === "easy" ? "4 Pairs" : d === "medium" ? "6 Pairs" : "8 Pairs"}
          </button>
        ))}
      </div>

      {/* Stats Pill */}
      <div className="relative z-20 mx-4 flex items-center justify-between rounded-2xl bg-white/80 px-4 py-1.5 backdrop-blur shadow-xs text-center">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-wider text-ink-400">Moves</span>
          <p className="font-display text-lg font-black text-ink-900">{moves}</p>
        </div>
        <div>
          <span className="text-[10px] uppercase font-bold tracking-wider text-ink-400">Pairs</span>
          <p className="font-display text-lg font-black text-primary-600">
            {matches} / {cfg.pairs}
          </p>
        </div>
        <div>
          <span className="text-[10px] uppercase font-bold tracking-wider text-ink-400">Time</span>
          <p className="font-display text-lg font-black text-ink-900">{formatTimer(time)}</p>
        </div>
      </div>

      {/* Card Grid Area */}
      <div className="relative flex-1 flex items-center justify-center p-4">
        <div className={`grid w-full max-w-sm gap-2.5 ${cfg.cols}`}>
          {cards.map((card) => {
            const isRevealed = card.isFlipped || card.isMatched;

            return (
              <button
                key={card.id}
                type="button"
                onClick={() => handleCardClick(card.id)}
                disabled={card.isMatched || card.isFlipped}
                className={`relative aspect-square w-full rounded-2xl transition-all duration-300 transform-gpu ${
                  isRevealed ? "scale-95" : "hover:scale-102 active:scale-95"
                } ${card.isMatched ? "opacity-75 ring-2 ring-mint-400" : ""}`}
                style={{ perspective: "1000px" }}
                aria-label={`Toy card ${card.id}`}
              >
                <div
                  className={`relative h-full w-full rounded-2xl shadow-soft transition-transform duration-300 flex items-center justify-center ${
                    isRevealed
                      ? "bg-white border-2 border-primary-200"
                      : "bg-gradient-to-br from-primary-500 to-primary-700 text-white"
                  }`}
                >
                  {isRevealed ? (
                    <span className="text-3xl sm:text-4xl animate-bounce-short">
                      {card.toy}
                    </span>
                  ) : (
                    <span className="font-display text-lg font-black text-white/70">
                      ?
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Victory Modal */}
        {isWon && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/50 px-6 text-center backdrop-blur-sm animate-sheet-up">
            <div className="rounded-3xl bg-white p-6 shadow-lifted w-full max-w-xs">
              <span className="text-5xl animate-bounce">🏆</span>
              <h4 className="mt-2 font-display text-2xl font-black text-ink-900">
                Puzzle Solved!
              </h4>

              {/* Star Rating */}
              <div className="flex justify-center gap-1.5 my-3">
                {[1, 2, 3].map((star) => (
                  <Star
                    key={star}
                    size={28}
                    className={
                      star <= getStars()
                        ? "fill-sun-400 text-sun-400 animate-pop"
                        : "text-ink-200"
                    }
                  />
                ))}
              </div>

              <div className="my-3 rounded-2xl bg-ink-50 p-3 flex justify-around">
                <div>
                  <span className="text-[11px] font-semibold text-ink-400">Moves</span>
                  <p className="font-display text-xl font-bold text-ink-800">{moves}</p>
                </div>
                <div className="h-9 w-px bg-ink-200" />
                <div>
                  <span className="text-[11px] font-semibold text-ink-400">Time</span>
                  <p className="font-display text-xl font-bold text-ink-800">{formatTimer(time)}</p>
                </div>
              </div>

              {moves === bestMoves && (
                <p className="inline-flex items-center gap-1 text-xs font-bold text-accent-600 mb-3">
                  <Sparkles size={14} /> New Record!
                </p>
              )}

              <button
                type="button"
                onClick={() => initializeGame(difficulty)}
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
