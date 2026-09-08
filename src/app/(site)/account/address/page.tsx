"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MapPin, Plus, Pencil, Trash2 } from "lucide-react";
import { AddressCard, type AddressData } from "@/components/site/AddressCard";
import { AccountBackLink } from "@/components/site/AccountBackLink";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { useToast } from "@/context/ToastContext";

export default function AddressBookPage() {
  const [addresses, setAddresses] = useState<AddressData[] | null>(null);
  const { showToast } = useToast();

  async function load() {
    const res = await fetch("/api/addresses");
    const json = await res.json();
    setAddresses(json.data?.addresses ?? []);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleDelete(id: string) {
    if (!confirm("Delete this address?")) return;
    const res = await fetch(`/api/addresses/${id}`, { method: "DELETE" });
    const json = await res.json();
    if (json.success) {
      showToast("Address deleted", "success");
      load();
    } else {
      showToast(json.message, "error");
    }
  }

  async function handleSetDefault(id: string) {
    await fetch(`/api/addresses/${id}/default`, { method: "POST" });
    load();
  }

  if (addresses === null) {
    return (
      <div className="mx-auto max-w-2xl space-y-3 px-4 py-6">
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <AccountBackLink />
      <div className="mb-4 flex items-center justify-between">
        <h1 className="font-display text-xl font-bold text-ink-900">My Addresses</h1>
        <Link href="/account/address/new" className="flex items-center gap-1 text-sm font-semibold text-primary-600">
          <Plus size={16} /> Add New
        </Link>
      </div>

      {addresses.length === 0 ? (
        <EmptyState icon={MapPin} title="No addresses saved" description="Add an address to speed up checkout." />
      ) : (
        <div className="space-y-3">
          {addresses.map((a) => (
            <AddressCard
              key={a._id}
              address={a}
              actions={
                <>
                  <Link href={`/account/address/${a._id}/edit`} className="flex items-center gap-1 text-xs font-semibold text-primary-600">
                    <Pencil size={13} /> Edit
                  </Link>
                  <button onClick={() => handleDelete(a._id)} className="flex items-center gap-1 text-xs font-semibold text-danger">
                    <Trash2 size={13} /> Delete
                  </button>
                  {!a.isDefault && (
                    <button onClick={() => handleSetDefault(a._id)} className="text-xs font-semibold text-ink-500">
                      Set as Default
                    </button>
                  )}
                </>
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}
