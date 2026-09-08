import { listCategories } from "@/lib/services/categoryService";
import { getSettings } from "@/lib/services/settingsService";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { MobileBottomNav } from "@/components/site/MobileBottomNav";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [categories, settings] = await Promise.all([
    listCategories({ activeOnly: true, topLevelOnly: true }),
    getSettings(),
  ]);
  const navCategories = categories.map((c) => ({ name: c.name, slug: c.slug }));

  return (
    <div className="flex min-h-screen flex-col">
      <Header categories={navCategories} freeShippingThreshold={settings.freeShippingThreshold} />
      <main className="flex-1 pb-16 md:pb-0">{children}</main>
      <Footer />
      <MobileBottomNav />
    </div>
  );
}
