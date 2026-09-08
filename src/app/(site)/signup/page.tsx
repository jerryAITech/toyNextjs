"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useToast } from "@/context/ToastContext";
import { DecorativeBlobs } from "@/components/site/DecorativeBlobs";
import { AuthIllustration } from "@/components/site/AuthIllustration";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();
  const { refresh } = useAuth();
  const { refresh: refreshCart } = useCart();
  const { refresh: refreshWishlist } = useWishlist();
  const { showToast } = useToast();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});
    setSubmitting(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, mobile, password }),
      });
      const json = await res.json();
      if (!json.success) {
        if (json.issues) {
          const fieldErrors: Record<string, string> = {};
          for (const issue of json.issues) fieldErrors[issue.path] = issue.message;
          setErrors(fieldErrors);
        }
        throw new Error(json.message || "Signup failed");
      }
      // Cart/wishlist merge server-side on signup, but the client stores are already-mounted
      // singletons that only fetch once — re-pull them here instead of forcing a router.refresh(),
      // which raced with the router.push() below and could leave the browser stuck on this page
      // even though the signup itself had already succeeded.
      await Promise.all([refresh(), refreshCart(), refreshWishlist()]);
      showToast("Welcome to ToyStore!", "success");
      router.push("/");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Signup failed", "error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col lg:min-h-[calc(100vh-5rem)] lg:flex-row">
      <div className="relative hidden overflow-hidden bg-gradient-to-br from-primary-50 via-primary-100/70 to-accent-50 lg:flex lg:w-1/2 lg:flex-col lg:items-center lg:justify-center lg:px-12 lg:py-16">
        <DecorativeBlobs variant="auth" />
        <AuthIllustration className="relative w-full max-w-sm" />
        <h2 className="relative mt-4 text-center font-display text-2xl font-bold text-ink-900">Join the Fun!</h2>
        <p className="relative mt-2 max-w-xs text-center text-sm text-ink-500">Create an account for wishlists, faster checkout and order tracking.</p>
      </div>

      <div className="relative flex flex-1 flex-col items-center justify-center px-4 py-10 lg:px-12">
        <div className="lg:hidden">
          <DecorativeBlobs variant="auth" />
        </div>

        <div className="relative w-full max-w-md">
          <AuthIllustration className="mx-auto mb-2 w-28 lg:hidden" />
          <h1 className="mb-1 text-center font-display text-2xl font-bold text-ink-900">Create Your Account</h1>
          <p className="mb-6 text-center text-sm text-ink-500">Join ToyStore for a world of playful discoveries</p>

          <form onSubmit={handleSubmit} className="space-y-4 rounded-3xl border border-ink-100 bg-white p-6 shadow-soft">
            <Input label="Full Name" required value={name} onChange={(e) => setName(e.target.value)} error={errors.name} />
            <Input label="Email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} error={errors.email} />
            <Input label="Mobile Number" value={mobile} onChange={(e) => setMobile(e.target.value)} error={errors.mobile} />
            <PasswordInput
              label="Password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={errors.password}
              hint="At least 8 characters, with an uppercase letter and a number"
              showStrength
              autoComplete="new-password"
            />
            <Button type="submit" variant="primary" fullWidth size="lg" loading={submitting}>
              Create Account
            </Button>
          </form>

          <p className="mt-4 text-center text-sm text-ink-500">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-primary-600 hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
