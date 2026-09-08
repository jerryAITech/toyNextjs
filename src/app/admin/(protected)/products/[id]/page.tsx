import { notFound } from "next/navigation";
import { getProductById } from "@/lib/services/productService";
import { ProductForm, type ProductFormValues } from "@/components/admin/ProductForm";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await getProductById(id);
  if (!product) notFound();

  const initial: Partial<ProductFormValues> = {
    name: product.name,
    slug: product.slug,
    sku: product.sku,
    brand: product.brand || "",
    category: product.category.toString(),
    subcategory: product.subcategory ? product.subcategory.toString() : "",
    price: product.price,
    mrp: product.mrp,
    stock: product.stock,
    lowStockThreshold: product.lowStockThreshold,
    ageGroup: product.ageGroup,
    description: product.description || "",
    highlights: product.highlights,
    specifications: product.specifications,
    material: product.material || "",
    dimensions: product.dimensions || "",
    safetyInformation: product.safetyInformation || "",
    whatsIncluded: product.whatsIncluded,
    manufacturer: product.manufacturer || "",
    images: product.images,
    video: product.video || null,
    seoTitle: product.seoTitle || "",
    metaDescription: product.metaDescription || "",
    keywords: product.keywords,
    canonicalUrl: product.canonicalUrl || "",
    ogTitle: product.ogTitle || "",
    ogDescription: product.ogDescription || "",
    ogImage: product.ogImage || "",
    codAvailable: product.codAvailable,
    status: product.status as "ACTIVE" | "INACTIVE",
    isFeatured: product.isFeatured,
    isBestSeller: product.isBestSeller,
    isTrending: product.isTrending,
    isNewArrival: product.isNewArrival,
  };

  return (
    <div>
      <h1 className="mb-5 font-display text-xl font-bold text-ink-900">Edit Product</h1>
      <ProductForm productId={id} initial={initial} />
    </div>
  );
}
