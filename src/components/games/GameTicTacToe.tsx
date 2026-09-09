"use client";

import { useState, useCallback } from "react";
import { RotateCcw, Bot, Users } from "lucide-react";
import { playMatchSound, playWinSound, playHitSound } from "@/lib/games/soundEffects";

type Player = "X" | "O";
type BoardState = (Player | null)[];

const WIN_COMBOS = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

export function GameTicTacToe({ active }: { active: boolean }) {
  const [board, setBoard] = useState<BoardState>(Array(9).fill(null));
  const [turn, setTurn] = useState<Player>("X");
  const [winner, setWinner] = useState<Player | "tie" | null>(null);
  const [winningCombo, setWinningCombo] = useState<number[] | null>(null);
  const [vsBot, setVsBot] = useState(true);
  const [scores, setScores] = useState({ xWins: 0, oWins: 0, ties: 0 });

  void active;

  const checkWinner = useCallback((b: BoardState): { winner: Player | "tie" | null; combo: number[] | null } => {
    for (const combo of WIN_COMBOS) {
      const [a, bIndex, c] = combo;
      if (b[a] && b[a] === b[bIndex] && b[a] === b[c]) {
        return { winner: b[a], combo };
      }
    }
    if (b.every((cell) => cell !== null)) {
      return { winner: "tie", combo: null };
    }
    return { winner: null, combo: null };
  }, []);

  const resetGame = useCallback(() => {
    setBoard(Array(9).fill(null));
    setTurn("X");
    setWinner(null);
    setWinningCombo(null);
  }, []);

  const makeBotMove = useCallback((currentBoard: BoardState) => {
    // 1. Check if bot can win
    for (const combo of WIN_COMBOS) {
      const [a, b, c] = combo;
      const vals = [currentBoard[a], currentBoard[b], currentBoard[c]];
      if (vals.filter((v) => v === "O").length === 2 && vals.filter((v) => v === null).length === 1) {
        return [a, b, c].find((idx) => currentBoard[idx] === null)!;
      }
    }
    // 2. Block player from winning
    for (const combo of WIN_COMBOS) {
      const [a, b, c] = combo;
      const vals = [currentBoard[a], currentBoard[b], currentBoard[c]];
      if (vals.filter((v) => v === "X").length === 2 && vals.filter((v) => v === null).length === 1) {
        return [a, b, c].find((idx) => currentBoard[idx] === null)!;
      }
    }
    // 3. Take center
    if (currentBoard[4] === null) return 4;
    // 4. Take random empty
    const empties = currentBoard.map((v, i) => (v === null ? i : null)).filter((v): v is number => v !== null);
    return empties[Math.floor(Math.random() * empties.length)];
  }, []);

  const handleCellClick = (index: number) => {
    if (board[index] || winner) return;

    playHitSound();

    const newBoard = [...board];
    newBoard[index] = turn;
    setBoard(newBoard);

    const result = checkWinner(newBoard);
    if (result.winner) {
      setWinner(result.winner);
      setWinningCombo(result.combo);
      if (result.winner === "X") {
        playWinSound();
        setScores((s) => ({ ...s, xWins: s.xWins + 1 }));
      } else if (result.winner === "O") {
        playMatchSound();
        setScores((s) => ({ ...s, oWins: s.oWins + 1 }));
      } else {
        setScores((s) => ({ ...s, ties: s.ties + 1 }));
      }
      return;
    }

    // Next turn
    const nextTurn = turn === "X" ? "O" : "X";
    setTurn(nextTurn);

    // Bot move
    if (vsBot && nextTurn === "O") {
      setTimeout(() => {
        const botIndex = makeBotMove(newBoard);
        if (botIndex !== undefined) {
          playHitSound();
          const botBoard = [...newBoard];
          botBoard[botIndex] = "O";
          setBoard(botBoard);

          const botResult = checkWinner(botBoard);
          if (botResult.winner) {
            setWinner(botResult.winner);
            setWinningCombo(botResult.combo);
            if (botResult.winner === "O") {
              setScores((s) => ({ ...s, oWins: s.oWins + 1 }));
            } else if (botResult.winner === "tie") {
              setScores((s) => ({ ...s, ties: s.ties + 1 }));
            }
          } else {
            setTurn("X");
          }
        }
      }, 350);
    }
  };

  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden select-none bg-gradient-to-b from-indigo-100 via-sky-50 to-purple-50">
      {/* Game Header Bar */}
      <div className="relative z-20 flex items-center justify-between px-4 pt-3 pb-2">
        <div className="flex items-center gap-2">
          <span className="flex size-9 items-center justify-center rounded-2xl bg-white shadow-xs font-display font-black text-lg text-primary-600">
            ✕
          </span>
          <div>
            <h3 className="font-display text-base font-extrabold text-ink-900 leading-tight">
              Tic-Tac-Toe
            </h3>
            <p className="text-[11px] font-medium text-ink-500">Classic X vs O match</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={resetGame}
            aria-label="Restart Board"
            className="flex size-8 items-center justify-center rounded-full bg-white text-ink-700 shadow-xs active:scale-95"
          >
            <RotateCcw size={14} />
          </button>
        </div>
      </div>

      {/* Opponent Mode Toggle */}
      <div className="relative z-20 flex justify-center gap-2 px-4 pb-2">
        <button
          type="button"
          onClick={() => {
            setVsBot(true);
            resetGame();
          }}
          className={`flex items-center gap-1.5 rounded-full px-3.5 py-1 text-xs font-bold transition-all ${
            vsBot ? "bg-primary-500 text-white shadow-xs" : "bg-white/80 text-ink-600 hover:bg-white"
          }`}
        >
          <Bot size={13} /> vs Bot
        </button>
        <button
          type="button"
          onClick={() => {
            setVsBot(false);
            resetGame();
          }}
          className={`flex items-center gap-1.5 rounded-full px-3.5 py-1 text-xs font-bold transition-all ${
            !vsBot ? "bg-primary-500 text-white shadow-xs" : "bg-white/80 text-ink-600 hover:bg-white"
          }`}
        >
          <Users size={13} /> 2 Players
        </button>
      </div>

      {/* Scoreboard Pill */}
      <div className="relative z-20 mx-4 flex items-center justify-between rounded-2xl bg-white/80 px-4 py-1.5 backdrop-blur shadow-xs text-center">
        <div className={`px-2.5 py-0.5 rounded-xl transition-all ${turn === "X" && !winner ? "bg-primary-100 ring-2 ring-primary-400" : ""}`}>
          <span className="text-xs font-black text-primary-700">Player X: {scores.xWins}</span>
        </div>
        <div className="text-xs font-bold text-ink-400">
          Ties: {scores.ties}
        </div>
        <div className={`px-2.5 py-0.5 rounded-xl transition-all ${turn === "O" && !winner ? "bg-accent-100 ring-2 ring-accent-400" : ""}`}>
          <span className="text-xs font-black text-accent-700">{vsBot ? "Bot O" : "Player O"}: {scores.oWins}</span>
        </div>
      </div>

      {/* 3x3 Tic-Tac-Toe Board */}
      <div className="relative flex-1 flex flex-col items-center justify-center p-4">
        <div className="grid grid-cols-3 gap-2.5 w-full max-w-xs bg-white/60 p-3 rounded-3xl shadow-soft border border-ink-100">
          {board.map((cell, index) => {
            const isWinningCell = winningCombo?.includes(index);

            return (
              <button
                key={index}
                type="button"
                onClick={() => handleCellClick(index)}
                disabled={cell !== null || winner !== null}
                className={`relative aspect-square rounded-2xl bg-white shadow-xs border-2 flex items-center justify-center transition-all ${
                  isWinningCell
                    ? "border-sun-400 bg-sun-50 ring-4 ring-sun-300 scale-102"
                    : "border-ink-100 active:scale-95 hover:border-primary-300"
                }`}
                aria-label={`Cell ${index + 1}`}
              >
                {cell === "X" && (
                  <span className="font-display font-black text-5xl text-primary-600 animate-pop">
                    X
                  </span>
                )}
                {cell === "O" && (
                  <span className="font-display font-black text-5xl text-accent-500 animate-pop">
                    O
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Winner Announcement or Turn indicator */}
        <div className="mt-4 text-center">
          {winner === "X" && (
            <div className="flex items-center gap-2 rounded-full bg-primary-500 px-6 py-2 text-sm font-bold text-white shadow-soft animate-bounce">
              <span>Player X Wins!</span>
            </div>
          )}
          {winner === "O" && (
            <div className="flex items-center gap-2 rounded-full bg-accent-500 px-6 py-2 text-sm font-bold text-white shadow-soft animate-bounce">
              <span>{vsBot ? "Bot O Wins!" : "Player O Wins!"}</span>
            </div>
          )}
          {winner === "tie" && (
            <div className="rounded-full bg-ink-700 px-6 py-2 text-sm font-bold text-white shadow-soft">
              <span>It&apos;s a Tie!</span>
            </div>
          )}
          {!winner && (
            <p className="text-xs font-semibold text-ink-500">
              {turn === "X" ? "Player X's turn" : vsBot ? "Bot O is thinking..." : "Player O's turn"}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
