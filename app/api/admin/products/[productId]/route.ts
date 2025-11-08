// app/api/products/[productId]/route.ts
import prisma from "@/lib/prisma";
import { updateProductSchema } from "@/schemas/product-api";
import { NextResponse } from "next/server";
import { z } from "zod";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ productId: string }>}
) {
  try {
    const { productId } = await params;
    if (!productId) return NextResponse.json({ error: "Missing productId" }, { status: 400 });

    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: { images: true, variants: true, featuredImage: true, seo: true },
    });

    if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(product, { status: 200 });
  } catch (err) {
    console.error("GET /api/products/[productId] error", err);
    return NextResponse.json({ error: "Failed to fetch product" }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    const { productId } = await params;
    if (!productId) {
      return NextResponse.json({ error: "Missing productId" }, { status: 400 });
    }

    const body = await req.json();
    const parsed = updateProductSchema.parse(body);
    
    const p = parsed as Record<string, any>;

    // Whitelist top-level scalar keys
    const allowedKeys = [
      "title",
      "description",
      "descriptionHtml",
      "availableForSale",
      "options",
      "minVariantPriceAmount",
      "minVariantPriceCurrency",
      "maxVariantPriceAmount",
      "maxVariantPriceCurrency",
      "featuredImageId",
      "tags",
      "seoId",
      "handle",
      "featured",
      "gender"
    ] as const;

    // Build scalar data
    const dataScalars: Record<string, unknown> = {};
    for (const key of allowedKeys) {
      const value = p[key];
      if (value === undefined) continue;

      // Convert numeric-like values safely for price amounts
      if (key === "minVariantPriceAmount" || key === "maxVariantPriceAmount") {
        if (value == null) {
          dataScalars[key] = null;
          continue;
        }
        const num = Number(value);
        if (!Number.isFinite(num)) {
          return NextResponse.json({ error: `${key} must be a valid number` }, { status: 400 });
        }
        // store as integer (your model uses Int)
        dataScalars[key] = Math.trunc(num);
        continue;
      }

      // options -> keep as JSON or null
      if (key === "options") {
        dataScalars[key] = value ?? null;
        continue;
      }

      if (key === "tags") {
        if (!Array.isArray(value)) {
          return NextResponse.json({ error: "tags must be an array" }, { status: 400 });
        }
        dataScalars[key] = value;
        continue;
      }

      dataScalars[key] = value;
    }

    const imagesPayload = Array.isArray(p.images) ? p.images : null;
    const variantsPayload = Array.isArray(p.variants) ? p.variants : null;
    const collectionsPayload = Array.isArray(p.collectionIds) ? p.collectionIds : null;
    const clientProvidedFeaturedImageId = Object.prototype.hasOwnProperty.call(p, "featuredImageId");

    // Basic validation for provided payloads
    if (imagesPayload) {
      for (const [i, img] of imagesPayload.entries()) {
        if (!img || typeof img.url !== "string" || img.url.trim() === "") {
          return NextResponse.json({ error: `images[${i}].url is required` }, { status: 400 });
        }
      }
    }
    if (variantsPayload) {
      for (const [i, v] of variantsPayload.entries()) {
        if (!v || typeof v.title !== "string") {
          return NextResponse.json({ error: `variants[${i}].title is required` }, { status: 400 });
        }
      }
    }

    // If no relational changes -- do a simple scalar update and return
    if (!imagesPayload && !variantsPayload && !collectionsPayload) {
      const updated = await prisma.product.update({
        where: { id: productId },
        data: dataScalars,
        include: {
          images: true,
          variants: true,
          featuredImage: true,
          seo: true,
          CollectionProduct: { include: { collection: true } },
        },
      });
      return NextResponse.json(updated, { status: 200 });
    }

    // === perform operations sequentially (no long transaction) ===

    // 1) Update scalar fields first (if any)
    if (Object.keys(dataScalars).length > 0) {
      await prisma.product.update({
        where: { id: productId },
        data: dataScalars,
      });
    }

    // 2) Collections: replace join rows if provided
    if (collectionsPayload) {
      // delete old joins
      await prisma.collectionProduct.deleteMany({ where: { productId } });

      if (collectionsPayload.length > 0) {
        const createJoins = collectionsPayload.map((collectionId: string) => ({
          collectionId,
          productId,
        }));
        await prisma.collectionProduct.createMany({
          data: createJoins,
          skipDuplicates: true,
        });
      }
    }

    // 3) Images: replace if provided
    if (imagesPayload) {
      // delete existing images for product
      await prisma.image.deleteMany({ where: { productId } });

      // bulk create
      const imagesToCreate = imagesPayload.map((img: any) => ({
        url: img.url,
        altText: img.altText ?? null,
        width: img.width ?? null,
        height: img.height ?? null,
        productId,
      }));

      if (imagesToCreate.length > 0) {
        await prisma.image.createMany({ data: imagesToCreate });
      }

      // If client did NOT provide featuredImageId, set featuredImageId to the first image created (by createdAt asc)
      if (!clientProvidedFeaturedImageId && imagesToCreate.length > 0) {
        const firstImage = await prisma.image.findFirst({
          where: { productId },
          select: { id: true },
        });
        if (firstImage?.id) {
          await prisma.product.update({
            where: { id: productId },
            data: { featuredImageId: firstImage.id },
          });
        }
      }
    }

    // 4) Variants: replace if provided
    if (variantsPayload) {
      await prisma.productVariant.deleteMany({ where: { productId } });

      // Prepare variants for createMany
      const variantsToCreate = variantsPayload.map((v: any) => {
        const raw = v.priceAmount;
        const priceStr = raw !== undefined && raw !== null && raw !== "" ? String(raw) : "0";
        return {
          productId,
          title: v.title ?? "",
          availableForSale: v.availableForSale ?? true,
          selectedOptions: v.selectedOptions ?? undefined,
          priceAmount: priceStr, // Prisma accepts string for Decimal in createMany
          priceCurrency: v.priceCurrency ?? "KES",
          sku: v.sku ?? null,
        };
      });

      if (variantsToCreate.length > 0) {
        await prisma.productVariant.createMany({ data: variantsToCreate });
      }
    }

    // 5) Finally, fetch the updated product with includes and return
    const updatedFinal = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        images: true,
        variants: true,
        featuredImage: true,
        seo: true,
        CollectionProduct: { include: { collection: true } },
      },
    });

    if (!updatedFinal) {
      return NextResponse.json({ error: "Product not found after update" }, { status: 404 });
    }

    return NextResponse.json(updatedFinal, { status: 200 });
  } catch (err: unknown) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation failed", issues: err.format() }, { status: 400 });
    }

    if ((err as any)?.code) {
      console.error("Prisma error code:", (err as any).code);
      console.error("Prisma error meta:", (err as any).meta);
      console.error("Prisma error message:", (err as any).message);
    } else {
      console.error("PATCH /api/products/[productId] error", err);
    }

    return NextResponse.json({ error: "Failed to update product (see server logs)" }, { status: 500 });
  }
}


export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ productId: string }>}
) {
  try {
    const { productId } = await params;
    if (!productId) return NextResponse.json({ error: "Missing productId" }, { status: 400 });

    // Hard delete (consider soft-delete in production).
    await prisma.product.delete({ where: { id: productId } });
    return NextResponse.json({ message: "Deleted" }, { status: 200 });
  } catch (err: unknown) {
    console.error("DELETE /api/products/[productId] error", err);
    const e = err as any;
    if (e?.code === "P2025") {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}
