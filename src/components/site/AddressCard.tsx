import { MapPin, Home, Briefcase } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils/cn";

export type AddressData = {
  _id: string;
  fullName: string;
  mobile: string;
  house: string;
  street: string;
  area?: string | null;
  city: string;
  state: string;
  pincode: string;
  landmark?: string | null;
  type: "HOME" | "WORK" | "OTHER";
  isDefault: boolean;
};

const TYPE_ICON = { HOME: Home, WORK: Briefcase, OTHER: MapPin };

export function AddressCard({
  address,
  selected,
  onSelect,
  actions,
}: {
  address: AddressData;
  selected?: boolean;
  onSelect?: () => void;
  actions?: React.ReactNode;
}) {
  const Icon = TYPE_ICON[address.type];

  return (
    <div
      onClick={onSelect}
      className={cn(
        "rounded-2xl border-2 bg-white p-4 shadow-soft transition-colors",
        onSelect && "cursor-pointer",
        selected ? "border-primary-500" : "border-ink-100"
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <Icon size={15} className="text-primary-500" />
          <span className="text-sm font-semibold text-ink-800">{address.fullName}</span>
          <Badge tone="neutral">{address.type}</Badge>
          {address.isDefault && <Badge tone="primary">Default</Badge>}
        </div>
      </div>
      <p className="mt-2 text-sm text-ink-600">
        {address.house}, {address.street}
        {address.area ? `, ${address.area}` : ""}, {address.city}, {address.state} - {address.pincode}
      </p>
      {address.landmark && <p className="text-xs text-ink-400">Landmark: {address.landmark}</p>}
      <p className="mt-1 text-sm text-ink-500">Mobile: {address.mobile}</p>
      {actions && <div className="mt-3 flex gap-3">{actions}</div>}
    </div>
  );
}
