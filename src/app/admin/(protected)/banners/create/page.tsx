import { BannerForm } from "@/components/admin/BannerForm";

export default async function CreateBannerPage({ searchParams }: { searchParams: Promise<{ type?: string }> }) {
  const { type } = await searchParams;

  return (
    <div>
      <h1 className="mb-5 font-display text-xl font-bold text-ink-900">Create Banner</h1>
      <BannerForm defaultType={type === "CATEGORY" ? "CATEGORY" : "HOME"} />
    </div>
  );
}
