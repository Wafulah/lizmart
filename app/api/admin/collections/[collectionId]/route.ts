import prisma from "@/lib/prisma";
import { updateCollectionSchema } from "@/schemas/collection";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

export const runtime = 'nodejs';

// Fixed route handler signatures to use the exact shape Next.js expects:
// export async function HANDLER(req: Request, { params }: { params: { collectionId: string } })

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ collectionId: string }> }
) {
   try {
     const { collectionId } = await params;
    if (!collectionId) {
      return NextResponse.json({ error: "Missing collectionId" }, { status: 400 });
    }

    const collection = await prisma.collection.findUnique({
      where: { id: collectionId },
      include: {
        products: {
          include: {
            product: {
              include: {
                images: true,
                variants: true,
                featuredImage: true,
                seo: true,
              },
            },
          },
          orderBy: { order: "asc" },
        },
        seo: true,
      },
    });

    if (!collection) {
      return NextResponse.json({ error: "Collection not found" }, { status: 404 });
    }

    // Flatten the join table objects to return an array of products
    const products = collection.products?.map((cp) => cp.product) ?? [];

    // Omit the original `products` join objects and return a cleaner payload
    // by spreading the rest of the collection fields and replacing products.
    const { products: _join, ...rest } = collection as any;
    return NextResponse.json({ ...rest, products }, { status: 200 });
  } catch (err) {
    console.error("GET /api/collections/[collectionId] error", err);
    return NextResponse.json({ error: "Failed to fetch collection" }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ collectionId: string }> }
) {
  try {
    const { collectionId } = await params;
    if (!collectionId) {
      return NextResponse.json({ error: "Missing collectionId" }, { status: 400 });
    }

    const body = await req.json();
    const parsed = updateCollectionSchema.parse(body);
    

    const allowed: Record<string, any> = {};
    ["handle", "title", "description", "seoId", "parentId","gender"].forEach((k) => {
      if (Object.prototype.hasOwnProperty.call(parsed, k)) allowed[k] = (parsed as any)[k];
    });

    const updated = await prisma.collection.update({
      where: { id: collectionId },
      data: allowed,
    });

    return NextResponse.json(updated, { status: 200 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation failed", issues: err.format() }, { status: 400 });
    }

    console.error("PATCH /api/collections/[collectionId] error", err);

    const e = err as any;
    if (e?.code === "P2025") {
      return NextResponse.json({ error: "Collection not found" }, { status: 404 });
    }
    if (e?.code === "P2002") {
      return NextResponse.json({ error: "Unique constraint failed", meta: e.meta }, { status: 409 });
    }

    return NextResponse.json({ error: "Failed to update collection" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params:  Promise<{ collectionId: string }> }
) {
  try {
    const { collectionId } = await params;
    if (!collectionId) {
      return NextResponse.json({ error: "Missing collectionId" }, { status: 400 });
    }

    // Transactional delete: remove join rows then collection
    await prisma.$transaction(async (tx) => {
      await tx.collectionProduct.deleteMany({ where: { collectionId } });
      await tx.collection.delete({ where: { id: collectionId } });
    });

    return NextResponse.json({ message: "Collection and links removed" }, { status: 200 });
  } catch (err) {
    console.error("DELETE /api/collections/[collectionId] error", err);
    const e = err as any;
    if (e?.code === "P2025") {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ error: "Failed to delete collection" }, { status: 500 });
  }
}
