import { notFound } from "next/navigation";
import { getBannerById } from "@/lib/services/bannerService";
import { BannerForm, type BannerFormValues } from "@/components/admin/BannerForm";

function toDateInput(date: unknown): string {
  if (!date) return "";
  const d = new Date(date as string);
  return Number.isNaN(d.getTime()) ? "" : d.toISOString().slice(0, 10);
}

export default async function EditBannerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const banner = await getBannerById(id);
  if (!banner) notFound();

  const initial: Partial<BannerFormValues> = {
    type: banner.type as "HOME" | "CATEGORY",
    categoryId: banner.categoryId ? banner.categoryId.toString() : "",
    title: banner.title || "",
    subtitle: banner.subtitle || "",
    desktopImage: banner.desktopImage,
    mobileImage: banner.mobileImage,
    ctaText: banner.ctaText || "Shop Now",
    linkType: banner.linkType as BannerFormValues["linkType"],
    productId: banner.productId ? banner.productId.toString() : "",
    linkedCategoryId: banner.linkedCategoryId ? banner.linkedCategoryId.toString() : "",
    customUrl: banner.customUrl || "",
    startDate: toDateInput(banner.startDate),
    endDate: toDateInput(banner.endDate),
    priority: banner.priority,
    status: banner.status as "ACTIVE" | "INACTIVE",
  };

  return (
    <div>
      <h1 className="mb-5 font-display text-xl font-bold text-ink-900">Edit Banner</h1>
      <BannerForm bannerId={id} initial={initial} />
    </div>
  );
}
