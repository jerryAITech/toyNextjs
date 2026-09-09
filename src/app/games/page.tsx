import type { Metadata } from "next";
import { GamesFeed } from "@/components/games/GamesFeed";

export const metadata: Metadata = {
  title: "Games Arcade",
  description: "Swipe through interactive HTML5 mini-games in an explore-style arcade feed.",
};

export default function GamesPage() {
  return <GamesFeed />;
}
