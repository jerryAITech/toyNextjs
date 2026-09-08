"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2, ShieldCheck } from "lucide-react";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/context/ToastContext";
import { getPasswordStrength } from "@/lib/utils/passwordStrength";
import { AccountBackLink } from "@/components/site/AccountBackLink";

export default function ChangePasswordPage() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const { showToast } = useToast();

  function validate() {
    const next: Record<string, string> = {};
    if (!currentPassword) next.currentPassword = "Enter your current password";
    if (newPassword.length < 8) next.newPassword = "Password must be at least 8 characters";
    else if (!/[A-Z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
      next.newPassword = "Include at least one uppercase letter and one number";
    } else if (getPasswordStrength(newPassword).score <= 1) {
      next.newPassword = "This password is too weak — try adding numbers, symbols or length";
    }
    if (currentPassword && newPassword && currentPassword === newPassword) {
      next.newPassword = "New password must be different from your current password";
    }
    if (confirmPassword !== newPassword) next.confirmPassword = "Passwords do not match";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setSaving(true);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const json = await res.json();
      if (!json.success) {
        if (json.issues) {
          const fieldErrors: Record<string, string> = {};
          for (const issue of json.issues) fieldErrors[issue.path] = issue.message;
          setErrors(fieldErrors);
        }
        throw new Error(json.message || "Could not change password");
      }
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setErrors({});
      setDone(true);
      showToast("Password changed successfully", "success");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Could not change password", "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-6">
      <AccountBackLink />
      <h1 className="mb-4 font-display text-xl font-bold text-ink-900">Change Password</h1>

      {done ? (
        <div className="flex flex-col items-center gap-2 rounded-2xl border border-ink-100 bg-mint-100 p-6 text-center shadow-soft">
          <CheckCircle2 size={36} className="text-mint-700" />
          <p className="font-display font-bold text-ink-900">Password updated</p>
          <p className="text-sm text-ink-600">Your password has been changed. You'll stay signed in on this device.</p>
          <Button variant="ghost" size="sm" className="mt-2" onClick={() => setDone(false)}>
            Change it again
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-ink-100 bg-white p-5 shadow-soft" noValidate>
          <PasswordInput
            label="Current Password"
            required
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            error={errors.currentPassword}
            autoComplete="current-password"
          />
          <PasswordInput
            label="New Password"
            required
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            error={errors.newPassword}
            hint={errors.newPassword ? undefined : "At least 8 characters, with an uppercase letter and a number"}
            showStrength
            autoComplete="new-password"
          />
          <PasswordInput
            label="Confirm New Password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            error={errors.confirmPassword}
            autoComplete="new-password"
          />
          <Button type="submit" variant="primary" fullWidth loading={saving}>
            Update Password
          </Button>
          <p className="flex items-center justify-center gap-1.5 text-xs text-ink-400">
            <ShieldCheck size={13} /> Forgot your current password?{" "}
            <Link href="/forgot-password" className="font-semibold text-primary-600 hover:underline">
              Reset it instead
            </Link>
          </p>
        </form>
      )}
    </div>
  );
}
