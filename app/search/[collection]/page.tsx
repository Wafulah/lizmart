import { getProductsByCollection } from "@/actions/api/get-collection-products";
import ProductGrid from "@/components/grid/product-grid";
import { getCollection } from "@/lib/neondb";
import { defaultSort, sorting } from "lib/constants";
import { Metadata } from "next";
import { notFound } from "next/navigation";

export async function generateMetadata(props: {
  params: Promise<{ collection: string }>;
}): Promise<Metadata> {
  const params = await props.params;
  const collection = await getCollection(params.collection);

  if (!collection) return notFound();

  return {
    title: collection.seo?.title || collection.title,
    description:
      collection.seo?.description ||
      collection.description ||
      `${collection.title} products`,
  };
}

export default async function CategoryPage(props: {
  params: Promise<{ collection: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await props.params;
  const searchParams = (await props.searchParams) || {};

  const { collection } = params;
  const sortSlug = typeof searchParams.sort === "string" ? searchParams.sort : undefined;
  const genderSlug = typeof searchParams.gender === "string" ? searchParams.gender : undefined;
  const page = parseInt(typeof searchParams.page === "string" ? searchParams.page : "1", 10) || 1;

  const { sortKey, reverse } = sorting.find((item) => item.slug === sortSlug) || defaultSort;

  const { items, totalPages } = await getProductsByCollection({
    collectionHandle: collection,
    page,
    sortKey,
    reverse,
    gender: genderSlug,
  });

  return (
    <section>
      {items.length === 0 ? (
        <p className="py-3 text-lg">No products found in this collection</p>
      ) : (
        <ProductGrid items={items} currentPage={page} totalPages={totalPages} />
      )}
    </section>
  );
}
