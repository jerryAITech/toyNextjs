"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { AddressForm } from "@/components/site/AddressForm";
import { AccountBackLink } from "@/components/site/AccountBackLink";
import { type AddressData } from "@/components/site/AddressCard";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { MapPin } from "lucide-react";

export default function EditAddressPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const [address, setAddress] = useState<AddressData | null | undefined>(undefined);

  useEffect(() => {
    fetch("/api/addresses")
      .then((r) => r.json())
      .then((json) => {
        const found = (json.data?.addresses as AddressData[] | undefined)?.find((a) => a._id === params.id);
        setAddress(found ?? null);
      });
  }, [params.id]);

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <AccountBackLink href="/account/address" label="Back to Addresses" />
      <h1 className="mb-4 font-display text-xl font-bold text-ink-900">Edit Address</h1>

      {address === undefined ? (
        <Skeleton className="h-96 w-full" />
      ) : address === null ? (
        <EmptyState icon={MapPin} title="Address not found" description="It may have already been deleted." actionLabel="Back to Addresses" actionHref="/account/address" />
      ) : (
        <div className="rounded-2xl border border-ink-100 bg-white p-5 shadow-soft">
          <AddressForm
            addressId={address._id}
            initial={{ ...address, area: address.area ?? "", landmark: address.landmark ?? "" }}
            onSaved={() => router.push("/account/address")}
            onCancel={() => router.push("/account/address")}
          />
        </div>
      )}
    </div>
  );
}
