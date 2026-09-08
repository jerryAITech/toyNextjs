"use client";

import { useEffect, useState, useCallback } from "react";
import { Star } from "lucide-react";
import { StarRating } from "@/components/ui/StarRating";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { cn } from "@/lib/utils/cn";

type Review = {
  _id: string;
  rating: number;
  comment: string;
  verifiedPurchase: boolean;
  userName: string;
  createdAt: string;
};

type ReviewsData = {
  reviews: Review[];
  distribution: { star: number; count: number }[];
  average: number;
  total: number;
  eligibility: { canReview: boolean; alreadyReviewed: boolean; verifiedPurchase: boolean } | null;
};

export function ProductReviews({ slug }: { slug: string }) {
  const [data, setData] = useState<ReviewsData | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { user } = useAuth();
  const { showToast } = useToast();

  const load = useCallback(async () => {
    const res = await fetch(`/api/products/${slug}/reviews`);
    const json = await res.json();
    if (json.success) setData(json.data);
  }, [slug]);

  useEffect(() => {
    load();
  }, [load]);

  async function submitReview(e: React.FormEvent) {
    e.preventDefault();
    if (comment.trim().length < 5) {
      showToast("Please write at least a few words", "error");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`/api/products/${slug}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, comment }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.message);
      showToast("Review submitted. Thank you!", "success");
      setComment("");
      setRating(5);
      load();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Could not submit review", "error");
    } finally {
      setSubmitting(false);
    }
  }

  if (!data) return null;

  return (
    <div>
      <div className="flex flex-col gap-6 sm:flex-row sm:gap-10">
        <div className="flex shrink-0 flex-col items-center gap-1 sm:items-start">
          <span className="font-display text-4xl font-extrabold text-ink-900">{data.average.toFixed(1)}</span>
          <StarRating rating={data.average} size={18} />
          <span className="text-sm text-ink-400">{data.total} reviews</span>
        </div>

        <div className="flex-1 space-y-1.5">
          {data.distribution.map((d) => (
            <div key={d.star} className="flex items-center gap-2 text-sm">
              <span className="flex w-10 items-center gap-1 text-ink-500">
                {d.star} <Star size={12} className="fill-sun-500 text-sun-500" />
              </span>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-ink-100">
                <div
                  className="h-full rounded-full bg-sun-400"
                  style={{ width: data.total ? `${(d.count / data.total) * 100}%` : "0%" }}
                />
              </div>
              <span className="w-6 text-right text-xs text-ink-400">{d.count}</span>
            </div>
          ))}
        </div>
      </div>

      {user && data.eligibility?.canReview && (
        <form onSubmit={submitReview} className="mt-6 rounded-2xl border border-ink-100 bg-ink-50 p-4">
          <p className="mb-2 text-sm font-semibold text-ink-800">Write a review</p>
          <div className="mb-3 flex gap-1">
            {[1, 2, 3, 4, 5].map((i) => (
              <button key={i} type="button" onClick={() => setRating(i)} aria-label={`Rate ${i} stars`}>
                <Star size={22} className={cn(i <= rating ? "fill-sun-500 text-sun-500" : "text-ink-200")} />
              </button>
            ))}
          </div>
          <Textarea placeholder="Share your experience with this toy..." value={comment} onChange={(e) => setComment(e.target.value)} />
          <Button type="submit" variant="primary" size="sm" className="mt-2" loading={submitting}>
            Submit Review
          </Button>
        </form>
      )}

      {user && data.eligibility?.alreadyReviewed === false && data.eligibility?.verifiedPurchase === false && (
        <p className="mt-4 text-sm text-ink-400">Only customers who purchased and received this product can write a review.</p>
      )}

      <div className="mt-6 space-y-4">
        {data.reviews.length === 0 ? (
          <p className="text-sm text-ink-400">No reviews yet. Be the first to review this toy!</p>
        ) : (
          data.reviews.map((r) => (
            <div key={r._id} className="border-b border-ink-100 pb-4">
              <div className="flex items-center gap-2">
                <StarRating rating={r.rating} size={13} />
                {r.verifiedPurchase && <Badge tone="success">Verified Purchase</Badge>}
              </div>
              <p className="mt-1.5 text-sm text-ink-700">{r.comment}</p>
              <p className="mt-1 text-xs text-ink-400">
                {r.userName} · {new Date(r.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
