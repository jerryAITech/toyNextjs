"use client";

import { useRouter } from "next/navigation";
import { AddressForm } from "@/components/site/AddressForm";
import { AccountBackLink } from "@/components/site/AccountBackLink";

export default function NewAddressPage() {
  const router = useRouter();

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <AccountBackLink href="/account/address" label="Back to Addresses" />
      <h1 className="mb-4 font-display text-xl font-bold text-ink-900">Add New Address</h1>
      <div className="rounded-2xl border border-ink-100 bg-white p-5 shadow-soft">
        <AddressForm onSaved={() => router.push("/account/address")} onCancel={() => router.push("/account/address")} />
      </div>
    </div>
  );
}
