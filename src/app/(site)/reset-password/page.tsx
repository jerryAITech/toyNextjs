"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, ShieldAlert } from "lucide-react";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/context/ToastContext";
import { DecorativeBlobs } from "@/components/site/DecorativeBlobs";
import { getPasswordStrength } from "@/lib/utils/passwordStrength";

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  );
}

const REDIRECT_SECONDS = 3;

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [tokenInvalid, setTokenInvalid] = useState(false);
  const [redirectIn, setRedirectIn] = useState(REDIRECT_SECONDS);
  const router = useRouter();
  const { showToast } = useToast();

  useEffect(() => {
    if (!done) return;
    if (redirectIn <= 0) {
      router.push("/login");
      return;
    }
    const t = setTimeout(() => setRedirectIn((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [done, redirectIn, router]);

  function validate() {
    const next: Record<string, string> = {};
    if (password.length < 8) next.password = "Password must be at least 8 characters";
    else if (!/[A-Z]/.test(password) || !/[0-9]/.test(password)) {
      next.password = "Include at least one uppercase letter and one number";
    } else if (getPasswordStrength(password).score <= 1) {
      next.password = "This password is too weak — try adding numbers, symbols or length";
    }
    if (confirmPassword !== password) next.confirmPassword = "Passwords do not match";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const json = await res.json();
      if (!json.success) {
        if (/invalid|expired/i.test(json.message || "")) setTokenInvalid(true);
        if (json.issues) {
          const fieldErrors: Record<string, string> = {};
          for (const issue of json.issues) fieldErrors[issue.path] = issue.message;
          setErrors(fieldErrors);
        }
        throw new Error(json.message || "Could not reset password");
      }
      setDone(true);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Could not reset password", "error");
    } finally {
      setSubmitting(false);
    }
  }

  if (!token || tokenInvalid) {
    return (
      <div className="relative mx-auto flex min-h-[70vh] max-w-md flex-col items-center justify-center px-4 text-center">
        <DecorativeBlobs variant="auth" />
        <div className="flex size-14 items-center justify-center rounded-full bg-red-50 text-danger">
          <ShieldAlert size={26} />
        </div>
        <h1 className="mt-3 font-display text-lg font-bold text-ink-900">
          {token ? "This reset link has expired" : "This reset link is invalid"}
        </h1>
        <p className="mt-1 max-w-xs text-sm text-ink-500">
          Reset links are only valid for 30 minutes and can only be used once. Request a new one to continue.
        </p>
        <Link
          href="/forgot-password"
          className="mt-4 inline-flex h-11 items-center justify-center rounded-full bg-primary-500 px-6 text-sm font-semibold text-white shadow-soft hover:bg-primary-600"
        >
          Request a New Link
        </Link>
      </div>
    );
  }

  return (
    <div className="relative mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-10">
      <DecorativeBlobs variant="auth" />
      <h1 className="mb-1 text-center font-display text-2xl font-bold text-ink-900">Reset Password</h1>
      <p className="mb-6 text-center text-sm text-ink-500">Choose a new password for your account</p>

      <div className="rounded-3xl border border-ink-100 bg-white p-6 shadow-soft">
        {done ? (
          <div className="flex flex-col items-center gap-2 text-center">
            <CheckCircle2 size={36} className="text-mint-700" />
            <p className="font-display font-bold text-ink-900">Password reset!</p>
            <p className="text-sm text-ink-500">Redirecting to login in {redirectIn}s...</p>
            <Link href="/login" className="text-sm font-semibold text-primary-600 hover:underline">
              Go now
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <PasswordInput
              label="New Password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={errors.password}
              hint={errors.password ? undefined : "At least 8 characters, with an uppercase letter and a number"}
              showStrength
              autoComplete="new-password"
            />
            <PasswordInput
              label="Confirm Password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              error={errors.confirmPassword}
              autoComplete="new-password"
            />
            <Button type="submit" variant="primary" fullWidth size="lg" loading={submitting}>
              Reset Password
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
