export function AdminFilterBar({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-4 flex flex-wrap items-center gap-3 overflow-x-auto rounded-2xl border border-ink-100 bg-white p-3 sm:flex-nowrap">
      {children}
    </div>
  );
}
