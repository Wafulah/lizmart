// components/grid/product-grid.tsx
import Image from "next/image";
import Link from "next/link";
import { AddSmallButton } from "../cart/add-small-button";

export type Product = {
  id: string;
  handle?: string; // must exist for linking to product page
  title: string;
  src?: string; // optional top-level image
  alt?: string;
  price: number;
  currencyCode?: string;
  isNew?: boolean;
  active?: boolean;
  tags?: string[]; // used to show 'collection' (first tag)
  featuredImage?: { id: string; src: string; alt?: string } | null;
  images?: { id: string; src: string; alt?: string }[];
  availableForSale?: boolean;
  variants?: any[];
};

export default function ProductGrid({
  items,
  currentPage,
  totalPages,
  collection,
}: {
  items: Product[];
  currentPage?: number;
  totalPages?: number;
  collection: string;
}) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-8 mt-16 md:mt-24 mb-24">
      <h1 className="text-5xl md:text-6xl font-extrabold text-[#1D7A39] mb-6">
    Explore Our <span className="text-amber-400">Products</span> 
  </h1>
  <p className="text-mb md:text-lg text-[#135628]/75 max-w-3xl mb-9">
    Discover a wide range of health, wellness, and natural solutions designed to elevate your lifestyle. From supplements and creams to herbal teas and specialized wellness products, we have something for everyone.
  </p>
     <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4 sm:gap-6 w-full max-w-none">
  {items.map((p) => {
    const imgSrc =
      p.featuredImage?.src || p.images?.[0]?.src || p.src || "/placeholder-image.png";
    const imgAlt = p.featuredImage?.alt || p.alt || p.title;
    const collection = p.tags?.[0] ?? "Trending";

    return (
      <article
        key={p.id}
        className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-md hover:shadow-lg transition-all duration-300"
      >
  {/* IMAGE SECTION */}
  <div className="relative mb-3">
    <Link
      href={`/product/${p.handle ?? p.id}`}
      className="block"
      aria-label={`View ${p.title}`}
      prefetch
    >
      <div className="relative w-full h-48 md:h-64 overflow-hidden rounded-t-2xl bg-gray-100">
    <Image
      src={imgSrc}
      alt={imgAlt}
      fill
      className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
    />
  </div>
    </Link>

    {/* Top-Left Badge */}
    {/* <div className="absolute top-3 left-3 bg-white text-xs font-semibold px-3 py-1 rounded-full shadow-sm">
      Best Seller
    </div> */}

    {/* Top-Right Wishlist Heart */}
    <button
      type="button"
      className="absolute top-3 right-3 bg-white p-2 rounded-full shadow-sm hover:bg-gray-100 transition"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="red"
        className="w-5 h-5"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21 8.25c0-2.485-2.014-4.5-4.5-4.5-1.739 0-3.232.995-4 2.448A4.497 4.497 0 008.5 3.75 4.5 4.5 0 004 8.25c0 7.22 8 12 8 12s8-4.78 8-12z"
        />
      </svg>
    </button>
  </div>

  {/* TEXT SECTION */}
  <div className="px-4 flex flex-col flex-grow">
    {/* Brand or Tag */}
    <p className="text-xs text-green-600 mb-1">{p.tags?.[0] ?? ""}</p>

    {/* Title */}
    <Link href={`/product/${p.handle ?? p.id}`} prefetch className="hover:underline">
      <h2 className="text-base font-bold text-gray-900 line-clamp-2">{p.title}</h2>
    </Link>

    {/* Price */}
    <p className="text-sm font-semibold text-gray-700 mt-2 mb-4">
      {p.currencyCode ?? "KES"} {p.price?.toFixed(2)}
    </p>
  </div>

  {/* BUY BUTTON */}
  <div className="px-4 pb-4 w-11/12 mx-auto">
    <AddSmallButton product={p as any} />
  </div>
</article>

    );
  })}
</div>


      {/* Pagination */}
      {totalPages && totalPages > 1 && (
        <div className="mt-8 flex justify-center gap-4">
          {currentPage && currentPage > 1 && (
            <Link
              href={`/search/${collection}?page=${currentPage - 1}`}
              className="rounded-md border px-3 py-1 text-sm hover:bg-neutral-100"
            >
              ← Previous
            </Link>
          )}
          <span className="text-sm font-medium">
            Page {currentPage ?? 1} of {totalPages}
          </span>
          {currentPage && totalPages && currentPage < totalPages && (
            <Link
              href={`/search/${collection}?page=${currentPage + 1}`}
              className="rounded-md border px-3 py-1 text-sm hover:bg-neutral-100"
            >
              Next →
            </Link>
          )}
        </div>
      )}
    </section>
  );
}
