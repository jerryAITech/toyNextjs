"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Trash2, Star as StarIcon, BadgeCheck } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Tabs } from "@/components/ui/Tabs";
import { StarRating } from "@/components/ui/StarRating";
import { EmptyState } from "@/components/ui/EmptyState";
import { AdminPaginationFooter } from "@/components/admin/AdminPaginationFooter";
import { usePagination } from "@/lib/hooks/usePagination";
import { useToast } from "@/context/ToastContext";
import { InlineLoader } from "@/components/ui/InlineLoader";

type ReviewStatus = "PENDING" | "APPROVED" | "REJECTED" | "HIDDEN";

type AdminReview = {
  _id: string;
  rating: number;
  comment: string;
  status: ReviewStatus;
  verifiedPurchase: boolean;
  createdAt: string;
  userId: { _id: string; name: string; email: string } | null;
  productId: { _id: string; name: string; slug: string } | null;
};

const STATUS_TONE: Record<ReviewStatus, "success" | "warning" | "danger" | "neutral"> = {
  PENDING: "warning",
  APPROVED: "success",
  REJECTED: "danger",
  HIDDEN: "neutral",
};

const ALL_STATUSES: ReviewStatus[] = ["PENDING", "APPROVED", "REJECTED", "HIDDEN"];

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<AdminReview[] | null>(null);
  const [tab, setTab] = useState("all");
  const { showToast } = useToast();

  async function load() {
    const res = await fetch("/api/admin/reviews");
    const json = await res.json();
    setReviews(json.data?.reviews ?? []);
  }

  useEffect(() => {
    load();
  }, []);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: reviews?.length ?? 0 };
    for (const s of ALL_STATUSES) c[s] = reviews?.filter((r) => r.status === s).length ?? 0;
    return c;
  }, [reviews]);

  const filtered = useMemo(() => {
    if (!reviews) return [];
    if (tab === "all") return reviews;
    return reviews.filter((r) => r.status === tab);
  }, [reviews, tab]);

  const { page, setPage, totalPages, paged } = usePagination(filtered, 10);

  useEffect(() => {
    setPage(1);
  }, [tab, setPage]);

  async function updateStatus(id: string, status: ReviewStatus) {
    const res = await fetch(`/api/admin/reviews/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    const json = await res.json();
    if (json.success) {
      setReviews((prev) => prev?.map((r) => (r._id === id ? { ...r, status } : r)) ?? null);
      showToast(`Review ${status.toLowerCase()}`, "success");
    } else {
      showToast(json.message || "Failed to update review", "error");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this review permanently?")) return;
    const res = await fetch(`/api/admin/reviews/${id}`, { method: "DELETE" });
    const json = await res.json();
    if (json.success) {
      setReviews((prev) => prev?.filter((r) => r._id !== id) ?? null);
      showToast("Review deleted", "success");
    } else {
      showToast(json.message || "Failed to delete review", "error");
    }
  }

  const alternativeStatuses = (current: ReviewStatus): ReviewStatus[] => ALL_STATUSES.filter((s) => s !== current && s !== "PENDING");

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-xl font-bold text-ink-900">Reviews</h1>
      </div>

      <Tabs
        className="mb-4"
        active={tab}
        onChange={setTab}
        tabs={[
          { value: "all", label: "All", count: counts.all },
          { value: "PENDING", label: "Pending", count: counts.PENDING },
          { value: "APPROVED", label: "Approved", count: counts.APPROVED },
          { value: "REJECTED", label: "Rejected", count: counts.REJECTED },
          { value: "HIDDEN", label: "Hidden", count: counts.HIDDEN },
        ]}
      />

      {!reviews ? (
        <InlineLoader />
      ) : filtered.length === 0 ? (
        <EmptyState icon={StarIcon} title="No reviews found" description="Try a different tab." />
      ) : (
        <div className="flex flex-col gap-3">
          {paged.map((r) => (
            <div key={r._id} className="rounded-2xl border border-ink-100 bg-white p-4 shadow-soft">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-ink-900">{r.userId?.name || "Deleted user"}</span>
                    <span className="text-xs text-ink-400">{r.userId?.email}</span>
                    {r.verifiedPurchase && (
                      <Badge tone="primary" className="gap-1">
                        <BadgeCheck size={12} /> Verified
                      </Badge>
                    )}
                    <Badge tone={STATUS_TONE[r.status]}>{r.status}</Badge>
                  </div>
                  {r.productId && (
                    <Link href={`/product/${r.productId.slug}`} className="mt-1 inline-block text-sm font-medium text-primary-600 hover:text-primary-700">
                      {r.productId.name}
                    </Link>
                  )}
                  <div className="mt-1.5">
                    <StarRating rating={r.rating} size={14} />
                  </div>
                  <p className="mt-1.5 line-clamp-2 text-sm text-ink-600">{r.comment}</p>
                  <p className="mt-1.5 text-xs text-ink-400">
                    {new Date(r.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </p>
                </div>
                <div className="flex shrink-0 flex-wrap items-center gap-2">
                  {alternativeStatuses(r.status).map((s) => (
                    <button
                      key={s}
                      onClick={() => updateStatus(r._id, s)}
                      className="rounded-full border border-ink-200 px-3 py-1.5 text-xs font-semibold text-ink-600 hover:bg-ink-50"
                    >
                      {s.charAt(0) + s.slice(1).toLowerCase()}
                    </button>
                  ))}
                  <button
                    onClick={() => handleDelete(r._id)}
                    className="flex items-center gap-1 rounded-full border border-danger/30 px-3 py-1.5 text-xs font-semibold text-danger hover:bg-red-50"
                  >
                    <Trash2 size={13} /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <AdminPaginationFooter page={page} totalPages={totalPages} onChange={setPage} />
    </div>
  );
}
