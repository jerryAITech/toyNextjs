"use client";

import { useEffect, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { getPasswordStrength } from "@/lib/utils/passwordStrength";

export default function AdminProfilePage() {
  const { user, refresh } = useAuth();
  const { showToast } = useToast();

  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({});
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordDone, setPasswordDone] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setMobile(user.mobile || "");
    }
  }, [user]);

  async function handleProfileSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const res = await fetch("/api/auth/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, mobile }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.message);
      await refresh();
      showToast("Profile updated", "success");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Could not update profile", "error");
    } finally {
      setSavingProfile(false);
    }
  }

  function validatePassword() {
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
    setPasswordErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validatePassword()) return;

    setSavingPassword(true);
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
          setPasswordErrors(fieldErrors);
        }
        throw new Error(json.message || "Could not change password");
      }
      showToast("Password changed successfully", "success");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPasswordErrors({});
      setPasswordDone(true);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Could not change password", "error");
    } finally {
      setSavingPassword(false);
    }
  }

  return (
    <div className="max-w-lg space-y-6">
      <h1 className="font-display text-xl font-bold text-ink-900">Admin Profile</h1>

      <form onSubmit={handleProfileSubmit} className="space-y-4 rounded-2xl border border-ink-100 bg-white p-5 shadow-soft">
        <h2 className="font-display text-base font-bold text-ink-900">Profile Information</h2>
        <Input label="Full Name" required value={name} onChange={(e) => setName(e.target.value)} />
        <Input label="Email" value={user?.email || ""} disabled hint="Email cannot be changed" />
        <Input label="Mobile Number" value={mobile} onChange={(e) => setMobile(e.target.value)} />
        <Button type="submit" variant="primary" loading={savingProfile}>
          Save Changes
        </Button>
      </form>

      <div className="space-y-4 rounded-2xl border border-ink-100 bg-white p-5 shadow-soft">
        <h2 className="font-display text-base font-bold text-ink-900">Change Password</h2>
        {passwordDone ? (
          <div className="flex flex-col items-center gap-2 rounded-2xl bg-mint-100 p-5 text-center">
            <CheckCircle2 size={30} className="text-mint-700" />
            <p className="text-sm font-medium text-ink-800">Password updated successfully.</p>
            <Button variant="ghost" size="sm" onClick={() => setPasswordDone(false)}>
              Change it again
            </Button>
          </div>
        ) : (
          <form onSubmit={handlePasswordSubmit} className="space-y-4" noValidate>
            <PasswordInput
              label="Current Password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              error={passwordErrors.currentPassword}
              autoComplete="current-password"
            />
            <PasswordInput
              label="New Password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              error={passwordErrors.newPassword}
              showStrength
              autoComplete="new-password"
            />
            <PasswordInput
              label="Confirm New Password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              error={passwordErrors.confirmPassword}
              autoComplete="new-password"
            />
            <Button type="submit" variant="primary" loading={savingPassword}>
              Update Password
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
