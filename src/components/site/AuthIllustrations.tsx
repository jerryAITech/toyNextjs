// Self-contained SVG illustrations for the login/signup panels — no external photo dependency
// (loremflickr was intermittently failing to load there), and each page gets its own distinct
// scene rather than reusing one graphic with different text.

export function SignupIllustration({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 200" className={className} aria-hidden="true">
      <ellipse cx="100" cy="172" rx="70" ry="10" className="fill-ink-900/10" />

      <rect x="34" y="98" width="52" height="52" rx="10" transform="rotate(-8 60 124)" className="fill-primary-400" />
      <text x="60" y="132" transform="rotate(-8 60 124)" textAnchor="middle" className="fill-white text-[28px] font-bold" style={{ fontFamily: "inherit" }}>C</text>

      <rect x="82" y="112" width="58" height="58" rx="10" transform="rotate(6 111 141)" className="fill-accent-500" />
      <text x="111" y="150" transform="rotate(6 111 141)" textAnchor="middle" className="fill-white text-[30px] font-bold" style={{ fontFamily: "inherit" }}>B</text>

      <rect x="46" y="128" width="46" height="46" rx="10" className="fill-mint-400" />
      <text x="69" y="159" textAnchor="middle" className="fill-white text-[24px] font-bold" style={{ fontFamily: "inherit" }}>A</text>

      <g transform="translate(126 88)">
        <ellipse cx="24" cy="70" rx="26" ry="8" className="fill-ink-900/10" />
        <circle cx="8" cy="4" r="9" className="fill-sun-400" />
        <circle cx="40" cy="4" r="9" className="fill-sun-400" />
        <circle cx="24" cy="14" r="20" className="fill-sun-300" />
        <circle cx="17" cy="12" r="2.4" className="fill-ink-900" />
        <circle cx="31" cy="12" r="2.4" className="fill-ink-900" />
        <ellipse cx="24" cy="19" rx="4" ry="2.6" className="fill-ink-900/70" />
        <circle cx="24" cy="46" r="26" className="fill-sun-300" />
        <circle cx="6" cy="40" r="9" className="fill-sun-300" />
        <circle cx="42" cy="40" r="9" className="fill-sun-300" />
      </g>
    </svg>
  );
}

export function LoginIllustration({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 320 260" className={className} aria-hidden="true">
      <ellipse cx="160" cy="222" rx="120" ry="14" className="fill-ink-900/10" />

      <g transform="translate(30 110)">
        <ellipse cx="34" cy="88" rx="38" ry="8" className="fill-ink-900/10" />
        <rect x="0" y="30" width="68" height="40" rx="16" className="fill-accent-500" />
        <rect x="8" y="10" width="24" height="26" rx="8" className="fill-ink-900" />
        <rect x="36" y="10" width="24" height="26" rx="8" className="fill-ink-900" />
        <rect x="10" y="38" width="18" height="16" rx="5" className="fill-accent-200" />
        <rect x="40" y="38" width="18" height="16" rx="5" className="fill-primary-100" />
        <circle cx="16" cy="72" r="12" className="fill-ink-900" />
        <circle cx="16" cy="72" r="5" className="fill-ink-200" />
        <circle cx="52" cy="72" r="12" className="fill-ink-900" />
        <circle cx="52" cy="72" r="5" className="fill-ink-200" />
      </g>

      <g transform="translate(150 40)">
        <ellipse cx="30" cy="176" rx="26" ry="7" className="fill-ink-900/10" />
        <path d="M30 0 C 46 26 52 58 52 90 L 8 90 C 8 58 14 26 30 0 Z" className="fill-primary-500" />
        <circle cx="30" cy="56" r="13" className="fill-primary-50" />
        <circle cx="30" cy="56" r="7" className="fill-primary-300" />
        <path d="M8 78 L -12 108 L 12 100 Z" className="fill-accent-500" />
        <path d="M52 78 L 72 108 L 48 100 Z" className="fill-accent-500" />
        <path d="M18 90 L 42 90 L 34 118 L 26 118 Z" className="fill-accent-400" />
      </g>

      <g transform="translate(234 132)">
        <circle cx="18" cy="18" r="18" className="fill-mint-400" />
        <path d="M0 18 A 18 18 0 0 1 36 18" className="fill-none stroke-mint-100" strokeWidth="2.5" />
        <path d="M0 18 A 18 18 0 0 0 36 18" className="fill-none stroke-mint-100" strokeWidth="2.5" />
        <path d="M18 0 V 36" className="stroke-mint-100" strokeWidth="2.5" />
      </g>

      <path d="M70 40 l4.5 12.5 13.5 0 -11 8.5 4 13 -11-8 -11 8 4-13-11-8.5 13.5 0z" className="fill-sun-300" />
      <path d="M270 60 l3.4 9.4 10.1 0 -8.2 6.4 3 9.8 -8.3-6 -8.3 6 3-9.8-8.2-6.4 10.1 0z" className="fill-sun-300" />
    </svg>
  );
}
