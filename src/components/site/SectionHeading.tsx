export function SectionHeading({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-4 px-4 sm:px-0">
      <h2 className="font-display text-lg font-bold text-ink-900 sm:text-2xl">{title}</h2>
      {subtitle && <p className="text-xs text-ink-400 sm:text-sm">{subtitle}</p>}
    </div>
  );
}
