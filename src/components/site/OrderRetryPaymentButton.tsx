"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CreditCard } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { openRazorpayCheckout } from "@/lib/utils/razorpayCheckout";

export function OrderRetryPaymentButton({ orderId }: { orderId: string }) {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();

  async function handleRetry() {
    setLoading(true);
    try {
      const res = await fetch(`/api/orders/${orderId}/retry-payment`, { method: "POST" });
      const json = await res.json();
      if (!json.success) throw new Error(json.message);

      const { razorpayOrderId, amount, currency, keyId } = json.data;

      await openRazorpayCheckout({
        orderId,
        razorpayOrderId,
        amount,
        currency,
        keyId,
        prefill: { name: user?.name, email: user?.email, contact: user?.mobile },
        onSuccess: async (response) => {
          try {
            const verifyRes = await fetch("/api/checkout/razorpay/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ orderId, ...response }),
            });
            const verifyJson = await verifyRes.json();
            if (!verifyJson.success) throw new Error(verifyJson.message);
            showToast("Payment successful!", "success");
            router.push(`/orders/${orderId}?success=1`);
            router.refresh();
          } catch (err) {
            showToast(err instanceof Error ? err.message : "Payment verification failed", "error");
          } finally {
            setLoading(false);
          }
        },
        onDismiss: () => setLoading(false),
      });
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Could not start payment", "error");
      setLoading(false);
    }
  }

  return (
    <Button variant="accent" size="sm" loading={loading} onClick={handleRetry}>
      <CreditCard size={15} className="mr-1.5" /> Complete Payment
    </Button>
  );
}
