// components/grid/collection-grid.tsx
import Image from "next/image";
import Link from "next/link";
import { AddSmallButton } from "../cart/add-small-button";

export type Product = {
  id: string;
  handle?: string;
  title: string;
  src?: string;
  alt?: string;
  price: number;
  currencyCode?: string;
  isNew?: boolean;
  tags?: string[];
  featuredImage?: { id: string; src: string; alt?: string } | null;
  images?: { id: string; src: string; alt?: string }[];
};

type CollectionGridProps = {
  title: string;
  description?: string;
  items: Product[];
  collectionHandle: string; // used for "View More" link
};

export default function CollectionGrid({
  title,
  description,
  items,
  collectionHandle,
}: CollectionGridProps) {
  // cap at 8 items
  const visibleItems = items.slice(0, 8);

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 mt-16 md:mt-24 mb-24">
      {/* Heading */}
      <h1 className="text-5xl md:text-6xl font-extrabold text-[#1D7A39] mb-6">
        {title} <span className="text-[#FBC02D]">Products</span>
      </h1>

      {/* Optional Description */}
      {description && (
        <p className="text-mb md:text-lg text-[#135628]/75 max-w-3xl mb-9">
          {description}
        </p>
      )}

      {/* Products Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4 sm:gap-6 w-full max-w-none">
        {visibleItems.map((p) => {
          const imgSrc =
            p.featuredImage?.src || p.images?.[0]?.src || p.src || "/placeholder-image.png";
          const imgAlt = p.featuredImage?.alt || p.alt || p.title;

          return (
            <article
              key={p.id}
              className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-md hover:shadow-lg transition-all duration-300"
            >
              {/* Image */}
              <div className="relative mb-3">
                <Link href={`/product/${p.handle ?? p.id}`} className="block" prefetch>
                  <div className="relative w-full h-48 md:h-64 overflow-hidden rounded-t-2xl bg-gray-100">
                    <Image
                      src={imgSrc}
                      alt={imgAlt}
                      fill
                      className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                </Link>

                {/* Wishlist Heart */}
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

              {/* Text */}
              <div className="px-4 flex flex-col flex-grow">
                <p className="text-xs text-green-600 mb-1">{p.tags?.[0] ?? ""}</p>
                <Link href={`/product/${p.handle ?? p.id}`} prefetch className="hover:underline">
                  <h2 className="text-base font-bold text-gray-900 line-clamp-2">{p.title}</h2>
                </Link>
                <p className="text-sm font-semibold text-gray-700 mt-2 mb-4">
                  {p.currencyCode ?? "KES"} {p.price?.toFixed(2)}
                </p>
              </div>

              {/* Buy Button */}
              <div className="px-4 pb-4 w-11/12 mx-auto">
                <AddSmallButton product={p as any} />
              </div>
            </article>
          );
        })}
      </div>

      {/* View More Link */}
      {items.length > 8 && (
        <div className="mt-6 text-right">
          <Link
            href={`/search/${collectionHandle}`}
            className="text-[#FBC02D] font-semibold hover:underline"
          >
            View More →
          </Link>
        </div>
      )}
    </section>
  );
}
