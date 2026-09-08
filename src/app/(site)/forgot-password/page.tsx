"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MailCheck, KeyRound } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/context/ToastContext";
import { DecorativeBlobs } from "@/components/site/DecorativeBlobs";

const RESEND_COOLDOWN = 30;

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [devResetUrl, setDevResetUrl] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);
  const { showToast } = useToast();

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  async function requestReset(e?: React.FormEvent) {
    e?.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.message);
      setSent(true);
      setCooldown(RESEND_COOLDOWN);
      setDevResetUrl(json.data?.devResetUrl ?? null);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Something went wrong", "error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="relative mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-10">
      <DecorativeBlobs variant="auth" />
      <h1 className="mb-1 text-center font-display text-2xl font-bold text-ink-900">Forgot Password?</h1>
      <p className="mb-6 text-center text-sm text-ink-500">
        {sent ? "Check your email for a link to reset it" : "Enter your email and we'll send you a reset link"}
      </p>

      <div className="rounded-3xl border border-ink-100 bg-white p-6 shadow-soft">
        {sent ? (
          <div className="space-y-4 text-center">
            <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-primary-50 text-primary-500">
              <MailCheck size={26} />
            </div>
            <p className="text-sm text-ink-600">
              If an account exists for <span className="font-semibold text-ink-800">{email}</span>, a reset link has
              been sent. The link expires in 30 minutes.
            </p>

            {devResetUrl && (
              <div className="rounded-xl bg-sun-100 p-3 text-left text-xs text-ink-700">
                <p className="mb-2 flex items-center gap-1.5 font-semibold">
                  <KeyRound size={13} /> Dev mode — no email provider configured
                </p>
                <Link
                  href={devResetUrl}
                  className="inline-flex w-full items-center justify-center rounded-full bg-white px-3 py-2 text-center font-semibold text-primary-600 shadow-soft hover:bg-primary-50"
                >
                  Open Reset Link
                </Link>
              </div>
            )}

            <Button
              variant="ghost"
              size="sm"
              fullWidth
              disabled={cooldown > 0}
              loading={submitting}
              onClick={() => requestReset()}
            >
              {cooldown > 0 ? `Resend link in ${cooldown}s` : "Didn't get it? Resend link"}
            </Button>
          </div>
        ) : (
          <form onSubmit={requestReset} className="space-y-4">
            <Input label="Email" type="email" required autoFocus value={email} onChange={(e) => setEmail(e.target.value)} />
            <Button type="submit" variant="primary" fullWidth size="lg" loading={submitting}>
              Send Reset Link
            </Button>
          </form>
        )}
      </div>

      <p className="mt-4 text-center text-sm text-ink-500">
        <Link href="/login" className="font-semibold text-primary-600 hover:underline">
          Back to Log In
        </Link>
      </p>
    </div>
  );
}
