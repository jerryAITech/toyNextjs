import { loadRazorpayScript } from "./loadRazorpayScript";

type RazorpayHandlerResponse = {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
};

type RazorpayInstance = { open: () => void };
type RazorpayConstructor = new (opts: Record<string, unknown>) => RazorpayInstance;

export async function openRazorpayCheckout(opts: {
  orderId: string;
  razorpayOrderId: string;
  amount: number;
  currency: string;
  keyId: string;
  prefill?: { name?: string; email?: string; contact?: string };
  onSuccess: (response: RazorpayHandlerResponse) => void | Promise<void>;
  onDismiss: () => void | Promise<void>;
}) {
  const scriptLoaded = await loadRazorpayScript();
  if (!scriptLoaded) throw new Error("Could not load payment gateway. Please check your connection.");

  const Razorpay = (window as unknown as { Razorpay: RazorpayConstructor }).Razorpay;

  const razorpay = new Razorpay({
    key: opts.keyId,
    amount: opts.amount,
    currency: opts.currency,
    name: "ToyStore",
    description: "Order Payment",
    order_id: opts.razorpayOrderId,
    prefill: opts.prefill,
    theme: { color: "#3366ff" },
    handler: opts.onSuccess,
    modal: { ondismiss: opts.onDismiss },
  });

  razorpay.open();
}
