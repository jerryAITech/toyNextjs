"use client";

import { useState } from "react";
import { Tabs } from "@/components/ui/Tabs";

export function ProductInfoTabs({
  description,
  features,
  specifications,
  whatsIncluded,
  reviews,
}: {
  description?: React.ReactNode;
  features?: React.ReactNode;
  specifications?: React.ReactNode;
  whatsIncluded?: React.ReactNode;
  reviews: React.ReactNode;
}) {
  const tabs = [
    description ? { value: "description", label: "Description" } : null,
    features ? { value: "features", label: "Features" } : null,
    specifications ? { value: "specifications", label: "Specifications" } : null,
    whatsIncluded ? { value: "included", label: "What's Included" } : null,
    { value: "reviews", label: "Reviews" },
  ].filter((t): t is { value: string; label: string } => t !== null);

  const [active, setActive] = useState(tabs[0].value);

  return (
    <div>
      <Tabs tabs={tabs} active={active} onChange={setActive} className="mb-6 border-b border-ink-100 pb-3" />
      {active === "description" && description}
      {active === "features" && features}
      {active === "specifications" && specifications}
      {active === "included" && whatsIncluded}
      {active === "reviews" && reviews}
    </div>
  );
}
