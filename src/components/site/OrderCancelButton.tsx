"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Input";
import { useToast } from "@/context/ToastContext";

export function OrderCancelButton({ orderId }: { orderId: string }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();
  const { showToast } = useToast();

  async function handleCancel() {
    setSubmitting(true);
    try {
      const res = await fetch(`/api/orders/${orderId}/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: reason || "Cancelled by customer" }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.message);
      showToast("Order cancelled", "success");
      setOpen(false);
      router.refresh();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Could not cancel order", "error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <Button variant="danger" size="sm" onClick={() => setOpen(true)}>
        Cancel Order
      </Button>
      <Modal open={open} onClose={() => setOpen(false)} title="Cancel this order?">
        <p className="mb-3 text-sm text-ink-500">Let us know why you're cancelling (optional).</p>
        <Textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Reason for cancellation" />
        <div className="mt-3 flex gap-2">
          <Button variant="danger" loading={submitting} onClick={handleCancel}>
            Yes, Cancel Order
          </Button>
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Keep Order
          </Button>
        </div>
      </Modal>
    </>
  );
}
