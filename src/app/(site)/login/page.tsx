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

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();
  const { refresh } = useAuth();
  const { refresh: refreshCart } = useCart();
  const { refresh: refreshWishlist } = useWishlist();
  const { showToast } = useToast();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.message);
      // Cart/wishlist merge server-side on login, but the client stores are already-mounted
      // singletons that only fetch once — re-pull them here instead of forcing a router.refresh(),
      // which raced with the router.push() below and could leave the browser stuck on this page
      // even though the login itself had already succeeded.
      await Promise.all([refresh(), refreshCart(), refreshWishlist()]);
      router.push("/");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Login failed", "error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col lg:min-h-[calc(100vh-5rem)] lg:flex-row">
      <div className="relative hidden overflow-hidden bg-gradient-to-br from-primary-50 via-primary-100/70 to-accent-50 lg:flex lg:w-1/2 lg:flex-col lg:items-center lg:justify-center lg:px-12 lg:py-16">
        <DecorativeBlobs variant="auth" />
        <AuthIllustration className="relative w-full max-w-sm" />
        <h2 className="relative mt-4 text-center font-display text-2xl font-bold text-ink-900">Where Playtime Begins!</h2>
        <p className="relative mt-2 max-w-xs text-center text-sm text-ink-500">Log in to pick up right where the fun left off.</p>
      </div>

      <div className="relative flex flex-1 flex-col items-center justify-center px-4 py-10 lg:px-12">
        <div className="lg:hidden">
          <DecorativeBlobs variant="auth" />
        </div>

        <div className="relative w-full max-w-md">
          <AuthIllustration className="mx-auto mb-2 w-28 lg:hidden" />
          <h1 className="mb-1 text-center font-display text-2xl font-bold text-ink-900">Welcome Back!</h1>
          <p className="mb-6 text-center text-sm text-ink-500">Log in to continue shopping for toys</p>

          <form onSubmit={handleSubmit} className="space-y-4 rounded-3xl border border-ink-100 bg-white p-6 shadow-soft">
            <Input label="Email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
            <div>
              <PasswordInput label="Password" required value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
              <Link href="/forgot-password" className="mt-1 inline-block text-xs font-semibold text-primary-600 hover:underline">
                Forgot password?
              </Link>
            </div>
            <Button type="submit" variant="primary" fullWidth size="lg" loading={submitting}>
              Log In
            </Button>
          </form>

          <p className="mt-4 text-center text-sm text-ink-500">
            New to ToyStore?{" "}
            <Link href="/signup" className="font-semibold text-primary-600 hover:underline">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
