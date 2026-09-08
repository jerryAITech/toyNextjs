"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import { ShieldCheck } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { Button } from "@/components/ui/Button";
import { Logo, LogoMark } from "@/components/site/Logo";

export default function AdminLoginPage() {
  return (
    <Suspense>
      <AdminLoginForm />
    </Suspense>
  );
}

function AdminLoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const searchParams = useSearchParams();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.message);
      window.location.href = searchParams.get("redirect") || "/admin/dashboard";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen bg-ink-950">
      {/* Brand / imagery panel — hidden below lg, where the form takes the full screen instead. */}
      <div className="relative hidden w-1/2 overflow-hidden lg:block">
        <Image src="/admin-login-bg.jpg" alt="" fill priority sizes="50vw" className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/80 to-ink-950/40" />

        <div className="relative z-10 flex h-full flex-col justify-between p-10 xl:p-14">
          <Logo size={32} wordmarkClassName="text-2xl text-white" />

          <div>
            <div className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white/80 backdrop-blur">
              <ShieldCheck size={14} /> Admin Access
            </div>
            <h2 className="max-w-md font-display text-3xl font-bold leading-tight text-white xl:text-4xl">
              Run the store behind the scenes
            </h2>
            <p className="mt-3 max-w-sm text-sm text-white/70">
              Manage products, orders, banners and more — everything that keeps ToyStore running smoothly.
            </p>
          </div>
        </div>
      </div>

      {/* Form panel */}
      <div className="flex w-full flex-col items-center justify-center px-4 py-10 lg:w-1/2">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex flex-col items-center gap-2 text-center lg:hidden">
            <LogoMark size={40} />
            <h1 className="font-display text-xl font-bold text-white">ToyStore Admin</h1>
            <p className="text-sm text-white/60">Sign in to manage your store</p>
          </div>

          <div className="rounded-3xl bg-white p-8 shadow-lifted">
            <div className="mb-6 hidden lg:block">
              <h1 className="font-display text-xl font-bold text-ink-900">Welcome back</h1>
              <p className="mt-1 text-sm text-ink-500">Sign in to manage your store</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Email"
                type="email"
                required
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <PasswordInput
                label="Password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              {error && <p className="text-sm text-danger">{error}</p>}
              <Button type="submit" variant="primary" fullWidth size="lg" loading={submitting}>
                Log In
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
