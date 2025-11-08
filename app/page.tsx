import { getFeaturedProducts } from "@/actions/api/get-featured-products";
import { getProductsByCollection } from "@/actions/api/get-products-by-collection";
import { getProducts } from "@/actions/api/products";
import { Carousel } from "@/components/carousel";
import FeaturedProductsSection from "@/components/FeaturedProductSection";
import CollectionGrid from "@/components/grid/collection-grid";
import ProductGrid from "@/components/grid/product-grid";
import { ThreeItemGrid } from "@/components/grid/three-items";
import Footer from "@/components/layout/footer";
import PromotionSection from "@/components/PromotionSection";
import TrustBanner from "@/components/TrustBanner";
import { FooterServices } from "@/components/FooterServices";

export const metadata = {
  description: "Lizmart Naturals",
  openGraph: { type: "website" },
};


export default async function HomePage({
  searchParams,
}: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const pageParam = Array.isArray(params?.page) ? params?.page[0] : params?.page;
  const page = Number(pageParam || 1);

  const perPage = 12;

const [productsResult, sexualHealthItems, supplimentItems, featuredProducts] = await Promise.all([
  getProducts({ page, perPage }),
  getProductsByCollection({ collectionHandle: "sexual-health", limit: 8 }),
  getProductsByCollection({ collectionHandle: "supplements", limit: 8 }),
  getFeaturedProducts(8),
]);


const { items, totalPages } = productsResult;

  

  return (
    <>
    <PromotionSection />
     
      <section className="bg-[#f0f4f8] ">
       <CollectionGrid
  title="Sexual Health"
  description="Explore our carefully curated sexual health products for men and women."
  items={sexualHealthItems}
  collectionHandle="sexual-health"
/>
</section>
      <ProductGrid items={items} currentPage={page} totalPages={totalPages} />

      <CollectionGrid
  title="Supplements"
  description="Discover our premium range of supplements, designed to support overall health, energy, and wellness. From vitamins and minerals to herbal and specialty formulas, find natural, high-quality products to help you feel your best every day."
  items={supplimentItems}
  collectionHandle="supplements"
/>
<FeaturedProductsSection
  products={featuredProducts}
/>
<TrustBanner />
 <section className="bg-[#f0f4f8] ">
<FooterServices />
 </section>

      <Footer />
    </>
  );
}
