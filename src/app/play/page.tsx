import type { Metadata } from "next";
import { PlayArena } from "@/components/site/PlayArena";

export const metadata: Metadata = {
  title: "Play",
  description: "Pick a track and take the toy car for a drive.",
};

export default function PlayPage() {
  return <PlayArena />;
}
