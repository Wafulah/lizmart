"use client";

import Image from "next/image";
import React from "react";

const BRAND = {
  // Enhanced primary color for better contrast
  primaryGreen: "#15654E",
  primaryGold: "#FFC107", // Slightly more saturated gold
  accentGreen: "#38A169",
  accentBrown: "#A0522D",
  bg: "#FFFFFF",
  sectionBg: "#F7F7F7", // Cleaner, slightly lighter background
  darkText: "#374151",
  whiteText: "#FFFFFF",
};

type Promo = {
  id: number;
  title: string;
  subtitle?: string;
  badge?: string | null;
  link?: string;
  bg?: string;
  imageSrc?: string | null;
  imageAlt?: string | null;
  buttonBg?: string | null;
  buttonText?: string | null;
  titleClass?: string;
  subtitleClass?: string;
  description?: string | null;
};

const promos: Promo[] = [
  {
    id: 1,
    title: "Vitamins & Supplements",
    subtitle: "Boost Your Immunity Naturally",
    badge: "Big Sale 45% Off",
    link: "#",
    bg: "linear-gradient(180deg,#E6F6EE 0%, #D7EFE3 100%)",
    imageSrc: "/1.png",
    imageAlt: "Large bottle and capsules",
    buttonBg: BRAND.primaryGreen,
    buttonText: BRAND.whiteText,
    // Increased size and weight for primary card title
    titleClass: "text-4xl lg:text-5xl font-extrabold leading-tight",
    subtitleClass: "text-base font-medium",
  },
  {
    id: 2,
    title: "Young & Healthy",
    subtitle: "Essential Oils",
    badge: "Sale 45% OFF",
    link: "#",
    bg: "linear-gradient(135deg,#FFFBEB 0%, #FEF3C7 100%)",
    imageSrc: "/2.webp",
    imageAlt: "Stack of blue bottles",
    buttonBg: BRAND.primaryGold,
    // FIX: Changed button text to DarkText for strong contrast on gold button
    buttonText: BRAND.darkText,
    titleClass: "text-2xl md:text-3xl font-bold",
    subtitleClass: "text-sm",
  },
  {
    id: 3,
    title: "Within Nairobi",
    subtitle: "Free Shipping",
    badge: null,
    link: "#",
    bg: BRAND.primaryGreen,
    imageSrc: null, 
    imageAlt: null,
    buttonBg: null,
    buttonText: null,
    titleClass: "text-4xl lg:text-5xl font-extrabold",
    subtitleClass: "text-lg font-bold",
    description:
      "Get free shipping on all orders within Nairobi. Enjoy fast and reliable delivery straight to your doorstep.",
  },
  {
    id: 4,
    title: "Joint's and Muscles",
    subtitle: "Pharmacy",
    badge: "Big Sale 65% Off",
    link: "#",
    bg: "linear-gradient(90deg,#E8F8E9 0%, #D5F0D6 100%)",
    imageSrc: "/3.png",
    imageAlt: "Three black supplement bottles",
    buttonBg: BRAND.accentGreen,
    buttonText: BRAND.whiteText,
    titleClass: "text-2xl lg:text-3xl font-bold",
    subtitleClass: "text-sm",
  },
];

// Helper for the arrow icon
function ArrowIcon({ color = "#fff" }: { color?: string }) {
  return (
    <svg className="ml-2 h-4 w-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M5 12h14M13 5l7 7-7 7" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function PromotionSection(): React.ReactElement {
  if (promos.length < 4) {
    return <section aria-label="Promotions" className="mx-auto max-w-7xl px-4 py-8">No promotions available</section>;
  }

  const p1 = promos[0]!;
  const p2 = promos[1]!;
  const p3 = promos[2]!;
  const p4 = promos[3]!;

  // Consistent badge style
  const badgeStyle = {
    background: BRAND.primaryGold,
    color: BRAND.darkText, 
    borderRadius: '9999px',
    paddingLeft: '0.75rem',
    paddingRight: '0.75rem',
    paddingTop: '0.25rem',
    paddingBottom: '0.25rem',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  };

  return (
    <section aria-label="Promotions"  className="mx-auto max-w-7xl px-4 py-8 md:py-12 font-['Inter',_sans-serif]">
      {/* OUTER GRID: Left (50%) | Right (50%) */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 md:h-[520px]">

        {/* LEFT - big card (Card 1) */}
        <div className="h-full">
          <article className="relative h-full overflow-hidden rounded-2xl p-6 shadow-xl transition-shadow duration-300 hover:shadow-2xl" style={{ background: p1.bg }} aria-labelledby="promo-left-title">
            {p1.badge && (
              <span className="absolute left-6 top-6 text-xs font-semibold uppercase tracking-wider" style={badgeStyle}>
                {p1.badge}
              </span>
            )}

            {/* Changed flex-col to accommodate image better at the bottom */}
            <div className="flex flex-col justify-between h-full pb-0 md:pb-2 "> {/* Added pb-0/pb-2 to adjust spacing */}
              <div>
                <p className="mt-14 text-sm" style={{ color: BRAND.accentBrown }}>{p1.subtitle}</p>
                <h3 id="promo-left-title" className={`mt-2 ${p1.titleClass}`} style={{ color: BRAND.primaryGreen }}>
                  {p1.title}
                </h3>
              </div>

              <div className="mt-4 flex items-center gap-4">
                <a href={p1.link || "#"} className="inline-flex items-center rounded-full px-6 py-3 text-base font-bold shadow-xl transition-all duration-150 hover:scale-[1.03] active:scale-[0.98]" style={{ background: p1.buttonBg || BRAND.primaryGreen, color: p1.buttonText || BRAND.whiteText }} aria-label={`Shop ${p1.title}`}>
                  <span>Shop Now</span>
                  <ArrowIcon color={p1.buttonText || BRAND.whiteText} />
                </a>
              </div>
            </div>

            {p1.imageSrc && (
              // **FIXED**: Removed negative margins. Set explicit width and height on container.
            <div 
  className="pointer-events-none absolute bottom-0 right-0 w-64 h-64 md:w-80 md:h-80" 
  style={{ transform: "translateZ(0)" }}
>
  <Image
    src={p1.imageSrc}
    alt={p1.imageAlt || ""}
    width={320}
    height={320}
    className="object-contain h-0 w-0 md:w-full md:h-full "
  />
</div>
            )}
          </article>
        </div>

        {/* RIGHT - inner layout with 2 columns x 2 rows */}
        <div className="h-full">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 md:grid-rows-2 h-full">

            {/* Top-left: Card 2 */}
            <div className="h-full">
              <article className="relative h-full overflow-hidden rounded-2xl p-6 shadow-md transition-shadow duration-300 hover:shadow-lg" style={{ background: p2.bg }}>
                {p2.badge && (
                  <span className="absolute left-6 top-6 text-xs font-semibold uppercase tracking-wider" style={badgeStyle}>
                    {p2.badge}
                  </span>
                )}

                {/* Adjusted content to make space for the image */}
                <div className="flex flex-col justify-between h-full pr-0 md:pr-10"> {/* Added pr-0/pr-10 for spacing */}
                  <div>
                    <p className="mt-12 text-sm" style={{ color: BRAND.accentBrown }}>{p2.subtitle}</p>
                    <h4 className={`mt-2 ${p2.titleClass}`} style={{ color: BRAND.primaryGreen }}>{p2.title}</h4>
                  </div>

                  <div className="mt-4 flex items-center gap-4">
                    <a href={p2.link || "#"} className="inline-flex items-center rounded-full px-4 py-2 text-sm font-bold shadow-lg transition-all duration-150 hover:scale-[1.05] active:scale-[0.98]"
                      style={{ background: p2.buttonBg || BRAND.primaryGold, color: p2.buttonText || BRAND.darkText }}>
                      <span>Buy Now</span>
                      <ArrowIcon color={p2.buttonText || BRAND.darkText} />
                    </a>
                  </div>
                </div>

                {p2.imageSrc && (
                  // **FIXED**: Removed negative margins. Set explicit width and height on container.
                  <div className="pointer-events-none absolute bottom-0 right-0 w-36 h-36 md:w-44 md:h-44">
                    <Image
                      src={p2.imageSrc}
                      alt={p2.imageAlt || ""}
                      width={176} // Optimal width (w-44 = 176px)
                      height={176} // Optimal height
                      className="object-contain w-full h-full"
                    />
                  </div>
                )}
              </article>
            </div>

            {/* Top-right: Card 3 (Type-based promotion) - No image for this card in the ref image */}
            <div className="h-full">
              <article className="relative h-full overflow-hidden rounded-2xl p-6 shadow-md transition-shadow duration-300 hover:shadow-lg" style={{ background: p3.bg }}>
                <div className="flex h-full flex-col justify-center">
                  <div>
                    <h5 className={`${p3.subtitleClass}`} style={{ color: BRAND.primaryGold }}>{p3.subtitle}</h5>
                    <h2 className={`mt-2 ${p3.titleClass}`} style={{ color: BRAND.whiteText }}>{p3.title}</h2>
                    {p3.description && <p className="mt-3 text-base" style={{ color: BRAND.whiteText }}>{p3.description}</p>}
                  </div>
                </div>
              </article>
            </div>

            {/* Bottom: Card 4 spans two columns */}
            <div className="col-span-1 md:col-span-2 h-full">
              <article className="relative h-full overflow-hidden rounded-2xl p-6 shadow-md transition-shadow duration-300 hover:shadow-lg" style={{ background: p4.bg }}>
                {p4.badge && (
                  <span className="absolute left-6 top-6 text-xs font-semibold uppercase tracking-wider" style={badgeStyle}>
                    {p4.badge}
                  </span>
                )}

                {/* Adjusted content to make space for the image */}
                <div className="flex flex-col justify-between h-full pr-0 md:pr-24"> {/* Added pr-0/pr-24 for spacing */}
                  <div>
                    <p className="mt-12 text-sm" style={{ color: BRAND.accentBrown }}>{p4.subtitle}</p>
                    <h3 className={`mt-2 ${p4.titleClass}`} style={{ color: BRAND.primaryGreen }}>{p4.title}</h3>
                  </div>

                  <div className="mt-4 flex items-center gap-4">
                    <a href={p4.link || "#"} className="inline-flex items-center rounded-full px-6 py-3 text-base font-bold shadow-lg transition-all duration-150 hover:scale-[1.03] active:scale-[0.98]" style={{ background: p4.buttonBg || BRAND.primaryGreen, color: p4.buttonText || BRAND.whiteText }}>
                      Shop Now
                      <ArrowIcon color={p4.buttonText || BRAND.whiteText} />
                    </a>
                  </div>
                </div>

                {p4.imageSrc && (
                  // **FIXED**: Removed negative margins. Set explicit width and height on container.
                  <div className="pointer-events-none absolute bottom-0 -right-12 md:right-0 w-48 h-48 md:w-64 md:h-64">
                    <Image
                      src={p4.imageSrc}
                      alt={p4.imageAlt || ""}
                      width={256} 
                      height={256} 
                      className="object-contain w-3/4 h-full md:w-full md:h-full"
                    />
                  </div>
                )}
              </article>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}