export function AuthIllustration({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 400 400" className={className} aria-hidden fill="none">
      <circle cx="200" cy="210" r="170" className="fill-primary-100" />

      {/* Balloons */}
      <line x1="90" y1="150" x2="80" y2="90" stroke="#c9c2e6" strokeWidth="2" />
      <circle cx="80" cy="70" r="26" className="fill-berry-400" />
      <line x1="320" y1="130" x2="330" y2="80" stroke="#c9c2e6" strokeWidth="2" />
      <circle cx="330" cy="60" r="20" className="fill-sun-300" />

      {/* Stars */}
      <path d="M60 190l4.5 9.6 10.5 1.5-7.6 7.4 1.8 10.5L60 213.5 50.8 219l1.8-10.5-7.6-7.4 10.5-1.5z" className="fill-sun-400" />
      <path d="M345 220l3.6 7.7 8.4 1.2-6 5.9 1.4 8.4-7.4-3.9-7.4 3.9 1.4-8.4-6-5.9 8.4-1.2z" className="fill-accent-400" />

      {/* Ground shadow */}
      <ellipse cx="200" cy="332" rx="130" ry="12" className="fill-primary-200/60" />

      {/* Building blocks stack */}
      <rect x="120" y="270" width="60" height="60" rx="10" className="fill-mint-400" />
      <text x="150" y="308" textAnchor="middle" className="fill-white font-display text-2xl font-bold">A</text>

      <rect x="185" y="230" width="60" height="60" rx="10" className="fill-accent-400" transform="rotate(-6 215 260)" />
      <text x="215" y="268" textAnchor="middle" className="fill-white font-display text-2xl font-bold" transform="rotate(-6 215 260)">B</text>

      <rect x="150" y="190" width="60" height="60" rx="10" className="fill-primary-500" transform="rotate(5 180 220)" />
      <text x="180" y="228" textAnchor="middle" className="fill-white font-display text-2xl font-bold" transform="rotate(5 180 220)">C</text>

      {/* Teddy bear */}
      <g transform="translate(228 250)">
        <circle cx="0" cy="34" r="8" className="fill-sun-500" />
        <circle cx="72" cy="34" r="8" className="fill-sun-500" />
        <rect x="8" y="14" width="56" height="52" rx="26" className="fill-sun-500" />
        <circle cx="36" cy="-6" r="26" className="fill-sun-500" />
        <circle cx="18" cy="-24" r="9" className="fill-sun-500" />
        <circle cx="54" cy="-24" r="9" className="fill-sun-500" />
        <circle cx="27" cy="-8" r="3" className="fill-ink-800" />
        <circle cx="45" cy="-8" r="3" className="fill-ink-800" />
        <circle cx="36" cy="0" r="3.5" className="fill-ink-800" />
        <path d="M28 6q8 6 16 0" stroke="#2b2344" strokeWidth="2" strokeLinecap="round" fill="none" />
      </g>

      {/* Sparkles */}
      <circle cx="120" cy="120" r="4" className="fill-primary-400" />
      <circle cx="300" cy="180" r="3" className="fill-berry-400" />
      <circle cx="270" cy="330" r="4" className="fill-mint-400" />
    </svg>
  );
}
