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
import { AuthFormAccents } from "@/components/site/AuthFormAccents";
import { Logo } from "@/components/site/Logo";
import { SignupIllustration } from "@/components/site/AuthIllustrations";

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
      <div className="relative flex flex-1 flex-col items-center justify-center px-4 py-10 lg:order-1 lg:px-12">
        <AuthFormAccents />
        <div className="lg:hidden">
          <DecorativeBlobs variant="auth" />
        </div>

        <div className="relative w-full max-w-md">
          <div className="mb-5 flex aspect-[16/9] w-full items-center justify-center overflow-hidden rounded-3xl bg-gradient-to-bl from-mint-200 via-mint-100 to-primary-100 shadow-soft lg:hidden">
            <SignupIllustration className="h-full max-w-[220px]" />
          </div>
          <div className="mb-4 flex justify-center">
            <Logo size={34} wordmarkClassName="text-xl text-primary-600" />
          </div>
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

      <div className="relative hidden overflow-hidden bg-gradient-to-br from-primary-500 via-primary-600 to-accent-600 lg:order-2 lg:flex lg:w-1/2 lg:flex-col lg:items-center lg:justify-center">
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
          <svg className="absolute -left-16 -top-16 h-72 w-72 text-white/10" viewBox="0 0 200 200" fill="currentColor">
            <path d="M45.3,-58.3C58.6,-49.5,69.2,-35.4,73.6,-19.7C78,-4,76.2,13.4,68.8,27.7C61.4,42,48.4,53.2,33.8,61.5C19.2,69.8,3,75.2,-13.6,74.3C-30.2,73.4,-47.2,66.2,-58.8,53.6C-70.4,41,-76.6,23,-77.1,4.6C-77.6,-13.8,-72.4,-32.6,-60.8,-45.8C-49.2,-59,-31.2,-66.6,-13.1,-68.4C5,-70.2,25.9,-67.1,45.3,-58.3Z" transform="translate(100 100)" />
          </svg>
          <svg className="absolute -bottom-24 -right-16 h-80 w-80 text-white/10" viewBox="0 0 200 200" fill="currentColor">
            <path d="M39.6,-51.7C50.2,-42.6,56.6,-28.6,60.4,-13.6C64.2,1.5,65.4,17.6,59.1,30.6C52.8,43.6,39,53.5,23.9,60.1C8.8,66.7,-7.6,70,-22.9,66.1C-38.2,62.2,-52.4,51.1,-60.8,36.5C-69.2,21.9,-71.8,3.8,-68.1,-12.5C-64.4,-28.8,-54.4,-43.3,-41.4,-52.3C-28.4,-61.3,-14.2,-64.8,0.8,-66.1C15.8,-67.4,29,-60.8,39.6,-51.7Z" transform="translate(100 100)" />
          </svg>
          <span className="animate-float absolute right-[14%] top-[26%] text-2xl opacity-70" style={{ animationDelay: "0.7s" }}>🎈</span>
          <span className="animate-float absolute left-[16%] bottom-[18%] text-2xl opacity-70" style={{ animationDelay: "1.4s" }}>⭐</span>
          <span className="animate-float absolute right-[18%] bottom-[28%] text-3xl opacity-70" style={{ animationDelay: "2.1s" }}>🎲</span>
        </div>

        <div className="relative z-10 flex flex-col items-center gap-6 px-12 text-center text-white">
          <div>
            <h2 className="font-display text-3xl font-bold">Join the Fun!</h2>
            <p className="mt-2 max-w-sm text-white/85">Create an account for wishlists, faster checkout and order tracking.</p>
          </div>
          <div className="flex aspect-[4/5] w-64 -rotate-2 items-center justify-center overflow-hidden rounded-3xl border-4 border-white/30 bg-white/10 p-6 shadow-2xl">
            <SignupIllustration className="h-full w-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
