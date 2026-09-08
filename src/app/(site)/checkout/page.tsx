"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Plus, ShieldCheck, Wallet, CreditCard } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { AddressCard, type AddressData } from "@/components/site/AddressCard";
import { AddressForm } from "@/components/site/AddressForm";
import { Button } from "@/components/ui/Button";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { Skeleton } from "@/components/ui/Skeleton";
import { formatINR } from "@/lib/utils/pricing";
import { openRazorpayCheckout } from "@/lib/utils/razorpayCheckout";
import { cn } from "@/lib/utils/cn";
import { CheckoutStepper } from "@/components/site/CheckoutStepper";

export default function CheckoutPage() {
  const { cart, loading: cartLoading, refresh: refreshCart } = useCart();
  const { user } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();

  const [addresses, setAddresses] = useState<AddressData[] | null>(null);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [addAddressOpen, setAddAddressOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"RAZORPAY" | "COD">("RAZORPAY");
  const [placingOrder, setPlacingOrder] = useState(false);

  async function loadAddresses() {
    const res = await fetch("/api/addresses");
    const json = await res.json();
    const list: AddressData[] = json.data?.addresses ?? [];
    setAddresses(list);
    if (!selectedAddressId) {
      const def = list.find((a) => a.isDefault) || list[0];
      if (def) setSelectedAddressId(def._id);
    }
  }

  useEffect(() => {
    loadAddresses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!cartLoading && (!cart || cart.items.length === 0)) {
      router.replace("/cart");
    }
  }, [cartLoading, cart, router]);

  if (cartLoading || addresses === null || !cart || cart.items.length === 0) {
    return (
      <div className="mx-auto max-w-4xl space-y-3 px-4 py-6">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  const hasUnavailable = cart.items.some((i) => i.unavailable);

  async function placeOrder() {
    if (!selectedAddressId) {
      showToast("Please select a delivery address", "error");
      return;
    }
    if (hasUnavailable) {
      showToast("Please remove unavailable items from your cart", "error");
      return;
    }

    setPlacingOrder(true);
    try {
      if (paymentMethod === "COD") {
        const res = await fetch("/api/checkout/cod", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ addressId: selectedAddressId }),
        });
        const json = await res.json();
        if (!json.success) throw new Error(json.message);
        await refreshCart();
        router.push(`/orders/${json.data.orderId}?success=1`);
        return;
      }

      const createRes = await fetch("/api/checkout/razorpay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ addressId: selectedAddressId }),
      });
      const createJson = await createRes.json();
      if (!createJson.success) throw new Error(createJson.message);

      const { orderId, razorpayOrderId, amount, currency, keyId } = createJson.data;

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
            await refreshCart();
            router.push(`/orders/${orderId}?success=1`);
          } catch (err) {
            showToast(err instanceof Error ? err.message : "Payment verification failed", "error");
            router.push(`/orders/${orderId}`);
          }
        },
        onDismiss: async () => {
          await fetch("/api/checkout/razorpay/cancel", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ orderId }),
          });
          setPlacingOrder(false);
        },
      });
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Could not place order", "error");
      setPlacingOrder(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 pb-32 sm:pb-10">
      <h1 className="mb-4 font-display text-xl font-bold text-ink-900 sm:text-2xl">Checkout</h1>

      <CheckoutStepper
        steps={[
          { label: "Address", done: !!selectedAddressId },
          { label: "Summary", done: !!selectedAddressId },
          { label: "Payment", done: !!selectedAddressId && !!paymentMethod },
        ]}
      />

      <div className="flex flex-col gap-6 lg:flex-row">
        <div className="flex-1 space-y-6">
          <section>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-500">1. Delivery Address</h2>
              <button onClick={() => setAddAddressOpen(true)} className="flex items-center gap-1 text-sm font-semibold text-primary-600">
                <Plus size={15} /> Add New
              </button>
            </div>
            {addresses.length === 0 ? (
              <p className="rounded-2xl bg-ink-50 p-4 text-sm text-ink-500">No saved addresses. Add one to continue.</p>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {addresses.map((a) => (
                  <AddressCard key={a._id} address={a} selected={selectedAddressId === a._id} onSelect={() => setSelectedAddressId(a._id)} />
                ))}
              </div>
            )}
          </section>

          <section>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink-500">2. Order Summary</h2>
            <div className="space-y-2 rounded-2xl border border-ink-100 bg-white p-4 shadow-soft">
              {cart.items.map((item) => (
                <div key={item.productId} className="flex items-center gap-3 border-b border-ink-50 pb-2 last:border-0 last:pb-0">
                  <div className="relative size-12 shrink-0 overflow-hidden rounded-lg bg-ink-50">
                    {item.image && <Image src={item.image} alt={item.name} fill sizes="48px" className="object-cover" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-ink-800">{item.name}</p>
                    <p className="text-xs text-ink-400">Qty: {item.quantity}</p>
                  </div>
                  <span className="text-sm font-semibold text-ink-800">{formatINR(item.lineTotal)}</span>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink-500">3. Payment Method</h2>
            <div className="space-y-2">
              <PaymentOption
                icon={CreditCard}
                title="Pay Online (Razorpay)"
                subtitle="UPI, Cards, Netbanking, Wallets"
                selected={paymentMethod === "RAZORPAY"}
                onSelect={() => setPaymentMethod("RAZORPAY")}
              />
              <PaymentOption
                icon={Wallet}
                title="Cash on Delivery"
                subtitle="Pay when your order arrives"
                selected={paymentMethod === "COD"}
                onSelect={() => setPaymentMethod("COD")}
              />
            </div>
          </section>
        </div>

        <div className="w-full shrink-0 lg:w-80">
          <div className="rounded-2xl border border-ink-100 bg-white p-4 shadow-soft">
            <h2 className="mb-3 text-sm font-semibold text-ink-800">Price Details</h2>
            <div className="space-y-2 text-sm text-ink-600">
              <Row label="Subtotal" value={formatINR(cart.subtotal)} />
              {cart.productDiscount > 0 && <Row label="Product Discount" value={`− ${formatINR(cart.productDiscount)}`} />}
              {cart.couponDiscount > 0 && <Row label={`Coupon (${cart.couponCode})`} value={`− ${formatINR(cart.couponDiscount)}`} />}
              <Row label="Delivery" value={cart.shipping === 0 ? "FREE" : formatINR(cart.shipping)} />
              <div className="border-t border-dashed border-ink-200 pt-2">
                <Row label="Total" value={formatINR(cart.total)} bold />
              </div>
            </div>
            <Button variant="primary" fullWidth size="lg" className="mt-4" loading={placingOrder} onClick={placeOrder}>
              Place Order
            </Button>
            <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-ink-400">
              <ShieldCheck size={13} /> Secure checkout, prices verified server-side
            </p>
          </div>
        </div>
      </div>

      <BottomSheet open={addAddressOpen} onClose={() => setAddAddressOpen(false)} title="Add New Address">
        <AddressForm
          onSaved={() => {
            setAddAddressOpen(false);
            loadAddresses();
          }}
          onCancel={() => setAddAddressOpen(false)}
        />
      </BottomSheet>
    </div>
  );
}

function PaymentOption({
  icon: Icon,
  title,
  subtitle,
  selected,
  onSelect,
}: {
  icon: typeof CreditCard;
  title: string;
  subtitle: string;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      onClick={onSelect}
      className={cn(
        "flex w-full items-center gap-3 rounded-2xl border-2 bg-white p-4 text-left shadow-soft",
        selected ? "border-primary-500" : "border-ink-100"
      )}
    >
      <div className={cn("flex size-10 items-center justify-center rounded-full", selected ? "bg-primary-500 text-white" : "bg-ink-100 text-ink-500")}>
        <Icon size={18} />
      </div>
      <div>
        <p className="text-sm font-semibold text-ink-800">{title}</p>
        <p className="text-xs text-ink-400">{subtitle}</p>
      </div>
    </button>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className={`flex justify-between ${bold ? "text-base font-bold text-ink-900" : ""}`}>
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}
