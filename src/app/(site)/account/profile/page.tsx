"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { AccountBackLink } from "@/components/site/AccountBackLink";

export default function ProfilePage() {
  const { user, loading, refresh } = useAuth();
  const { showToast } = useToast();
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setMobile(user.mobile || "");
    }
  }, [user]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
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
      setSaving(false);
    }
  }

  if (loading || !user) {
    return (
      <div className="mx-auto max-w-lg px-4 py-6">
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-6">
      <AccountBackLink />
      <h1 className="mb-4 font-display text-xl font-bold text-ink-900">Personal Information</h1>
      <form onSubmit={handleSave} className="space-y-4 rounded-2xl border border-ink-100 bg-white p-5 shadow-soft">
        <Input label="Full Name" required value={name} onChange={(e) => setName(e.target.value)} />
        <Input label="Email" value={user.email} disabled hint="Email cannot be changed" />
        <Input label="Mobile Number" value={mobile} onChange={(e) => setMobile(e.target.value)} placeholder="10-digit mobile number" />
        <Button type="submit" variant="primary" loading={saving}>
          Save Changes
        </Button>
      </form>
    </div>
  );
}
