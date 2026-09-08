import Link from "next/link";

const PURPOSES = [
  { emoji: "🧠", title: "Learn & Grow", desc: "Build skills through play", href: "/products?category=educational-toys" },
  { emoji: "🎨", title: "Creativity", desc: "Express ideas & build things", href: "/products?category=building-blocks" },
  { emoji: "🏃", title: "Outdoor Fun", desc: "Stay active outside", href: "/products?category=outdoor-toys" },
  { emoji: "👨‍👩‍👧", title: "Family Games", desc: "Play together", href: "/products?category=board-games" },
  { emoji: "🤖", title: "STEM & Coding", desc: "Think like an inventor", href: "/products?category=educational-toys&ageGroup=9-12" },
  { emoji: "🧩", title: "Brain Games", desc: "Puzzles & brain teasers", href: "/products?category=puzzles" },
  { emoji: "❤️", title: "Baby Development", desc: "Gentle, sensory-friendly", href: "/products?category=baby-toys&ageGroup=0-2" },
];

export function ShopByPurpose() {
  return (
    <div className="grid grid-cols-2 gap-3 px-4 sm:grid-cols-3 sm:gap-4 sm:px-0 lg:grid-cols-4">
      {PURPOSES.map((p) => (
        <Link
          key={p.title}
          href={p.href}
          className="flex flex-col gap-2 rounded-2xl border border-ink-100 bg-white p-4 shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card"
        >
          <span className="text-2xl">{p.emoji}</span>
          <span className="font-display text-sm font-bold text-ink-900">{p.title}</span>
          <span className="text-xs text-ink-400">{p.desc}</span>
        </Link>
      ))}
    </div>
  );
}
