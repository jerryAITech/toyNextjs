// Small floating toy accents scattered around the form card on the auth pages' right/form side —
// desktop only (mobile already gets DecorativeBlobs there), purely decorative so pointer-events
// stays off and nothing can block the form's own clicks/taps.
export function AuthFormAccents() {
  return (
    <div className="pointer-events-none absolute inset-0 hidden overflow-hidden lg:block" aria-hidden="true">
      <span className="animate-float absolute right-[10%] top-[10%] text-3xl opacity-70" style={{ animationDelay: "0s" }}>
        🎲
      </span>
      <span className="animate-float absolute left-[8%] top-[32%] text-3xl opacity-60" style={{ animationDelay: "0.8s" }}>
        🧩
      </span>
      <span className="animate-float absolute right-[12%] bottom-[16%] text-2xl opacity-60" style={{ animationDelay: "1.6s" }}>
        ⭐
      </span>
      <span className="animate-float absolute left-[10%] bottom-[22%] text-2xl opacity-50" style={{ animationDelay: "2.2s" }}>
        🎈
      </span>
    </div>
  );
}
