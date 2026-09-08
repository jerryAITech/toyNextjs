import { Pagination } from "@/components/ui/Pagination";

export function AdminPaginationFooter({
  page,
  totalPages,
  onChange,
}: {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;

  return (
    <div className="sticky bottom-0 z-10 -mx-4 mt-4 border-t border-ink-100 bg-white/95 px-4 py-3 backdrop-blur lg:-mx-6 lg:px-6">
      <Pagination page={page} totalPages={totalPages} onChange={onChange} />
    </div>
  );
}
