// app/api/products/route.ts
import { Prisma } from "@/generated/prisma";
import prisma from "@/lib/prisma";
import { createProductSchema } from "@/schemas/product-api";
import { NextResponse } from "next/server";
import { z } from "zod";

export const runtime = 'nodejs';

export async function GET(req: Request) {
  // pagination & filters
  const url = new URL(req.url);
  const page = Number(url.searchParams.get("page") ?? 1);
  const limit = Math.min(Number(url.searchParams.get("limit") ?? 20), 100);
  const q = url.searchParams.get("q") ?? undefined;
  const tag = url.searchParams.get("tag") ?? undefined;

  const where: any = {};
  if (q) {
    where.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { description: { contains: q, mode: "insensitive" } },
      { handle: { contains: q, mode: "insensitive" } },
    ];
  }
  if (tag) {
    where.tags = { has: tag };
  }

  try {
    const [total, products] = await Promise.all([
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
        include: { images: true, variants: true, featuredImage: true, seo: true },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    return NextResponse.json({
      data: products,
      meta: { total, page, limit, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error("GET /api/products error", err);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}


export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = createProductSchema.parse(body);
    const healthTopicIds = parsed.healthTopic && parsed.healthTopic.length > 0
    ? parsed.healthTopic.map(ht => ht.id)
    : undefined;

    const healthTopicsConnect =
  healthTopicIds
    ? healthTopicIds.map(id => ({
        healthTopicId: id
      }))
    : undefined;


    // Build variant rows for nested create (use Prisma.Decimal)
    const variantsData =
      parsed.variants?.length && parsed.variants.length > 0
        ? parsed.variants.map((v) => ({
            title: v.title,
            availableForSale: v.availableForSale ?? true,
            // pass undefined (not null) for optional JSON fields so Prisma typing matches
            selectedOptions: v.selectedOptions ?? undefined,
            priceAmount: v.priceAmount
              ? new Prisma.Decimal(String(v.priceAmount))
              : new Prisma.Decimal("0"),
            priceCurrency: v.priceCurrency ?? "KES",
            sku: v.sku ?? null,
          }))
        : undefined;

    // Build images array
    const imagesData =
      parsed.images?.length && parsed.images.length > 0
        ? parsed.images.map((i) => ({
            url: i.url,
            altText: i.altText ?? null,
            width: i.width ?? null,
            height: i.height ?? null,
          }))
        : undefined;

    // Collections connect payload for CollectionProduct.create
    // create join rows with { collectionId } to match CollectionProduct schema
    const collectionsConnect =
      parsed.collectionIds?.length && parsed.collectionIds.length > 0
        ? parsed.collectionIds.map((id) => ({ collectionId: id }))
        : undefined;

    // --- compute min/max & ensure single currency ---
    let computedMinCents: number | null = null;
    let computedMaxCents: number | null = null;
    let currencyToUse: string | null = null;

    if (parsed.variants && parsed.variants.length > 0) {
      const currencies = new Set(
        parsed.variants.map(
          (v) =>
            v.priceCurrency ??
            parsed.minVariantPriceCurrency ??
            parsed.maxVariantPriceCurrency ??
            "KES"
        )
      );

      if (currencies.size > 1) {
        return NextResponse.json(
          { error: "All variants must use the same currency" },
          { status: 400 }
        );
      }

      const arr = [...currencies];
      currencyToUse = arr[0] ?? null;

      const cents = parsed.variants
        .map((v) => {
          const n =
            typeof v.priceAmount === "string"
              ? parseFloat(v.priceAmount)
              : Number(v.priceAmount ?? 0);
          return Math.round(n);
        })
        .filter((c) => !Number.isNaN(c));

      if (cents.length > 0) {
        computedMinCents = Math.min(...cents);
        computedMaxCents = Math.max(...cents);
      }
    }

    const minVariantPriceAmount =
      parsed.minVariantPriceAmount != null
        ? Number(parsed.minVariantPriceAmount)
        : computedMinCents;
    const minVariantPriceCurrency =
      parsed.minVariantPriceCurrency ?? (currencyToUse ?? null);

    const maxVariantPriceAmount =
      parsed.maxVariantPriceAmount != null
        ? Number(parsed.maxVariantPriceAmount)
        : computedMaxCents;
    const maxVariantPriceCurrency =
      parsed.maxVariantPriceCurrency ?? (currencyToUse ?? null);

    // Create product transactionally
    // Create product transactionally and set featuredImageId to first image if not provided
const created = await prisma.$transaction(async (tx) => {
  // 1) create product with nested creates
  const prod = await tx.product.create({
    data: {
      handle: parsed.handle,
      title: parsed.title,
      description: parsed.description ?? null,
      descriptionHtml: parsed.descriptionHtml ?? null,
      availableForSale: parsed.availableForSale ?? true,
      options: parsed.options ?? null,
      gender: parsed.gender ?? "general",
      minVariantPriceAmount: minVariantPriceAmount ?? null,
      minVariantPriceCurrency: minVariantPriceCurrency ?? null,
      maxVariantPriceAmount: maxVariantPriceAmount ?? null,
      maxVariantPriceCurrency: maxVariantPriceCurrency ?? null,
      featuredImageId: parsed.featuredImageId ?? null,
      tags: parsed.tags ?? [],
      featured: parsed.featured ?? false,
      seo:
        parsed.seoTitle || parsed.seoDescription
          ? { create: { title: parsed.seoTitle ?? null, description: parsed.seoDescription ?? null } }
          : undefined,
      variants: variantsData ? { create: variantsData } : undefined,
      images: imagesData ? { create: imagesData } : undefined,
      CollectionProduct: collectionsConnect ? { create: collectionsConnect } : undefined,
      healthTopics: healthTopicsConnect ? { create: healthTopicsConnect } : undefined,

    },
    include: {
      images: true,
      variants: true,
      featuredImage: true,
      seo: true,
      CollectionProduct: { include: { collection: true } },
    },
  });

  // 2) if no featuredImageId provided and we created images, set the first image as featured
  if ((!prod.featuredImageId || prod.featuredImageId === null) && prod.images?.length > 0) {
    const firstImageId = prod.images[0]?.id;
    const updated = await tx.product.update({
      where: { id: prod.id },
      data: { featuredImageId: firstImageId },
      include: {
        images: true,
        variants: true,
        featuredImage: true,
        seo: true,
        CollectionProduct: { include: { collection: true } },
        healthTopics: { include: { healthTopic: true } },
      },
    });
    return updated;
  }

  return prod;
});

 

    return NextResponse.json(created, { status: 201 });
  } catch (err: unknown) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", issues: err.format() },
        { status: 400 }
      );
    }

    console.error("POST /api/products error", err);
    const e = err as { code?: string; meta?: unknown };
    if (e?.code === "P2002") {
      return NextResponse.json(
        { error: "Unique constraint failed", meta: e.meta },
        { status: 409 }
      );
    }

    return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
  }
}