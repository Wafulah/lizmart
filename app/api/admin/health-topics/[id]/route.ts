// app/api/admin/health-topics/[id]/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import * as z from "zod";

export const runtime = 'nodejs';

const patchSchema = z.object({
  title: z.string().min(1),
  handle: z.string().min(1),
  description: z.string().optional().default(""),
  seo: z
    .object({
      title: z.string().optional().nullable().default(""),
      description: z.string().optional().nullable().default(""),
    })
    .optional()
    .nullable(),
  relatedProductIds: z.array(z.string()).optional().default([]),
});

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {

  try {
    const { id } = await params;
    if (!id) return NextResponse.json({ message: "Missing id" }, { status: 400 });

    const body = await req.json();
    const parsed = patchSchema.parse(body);

    // Ensure topic exists
    const topic = await prisma.healthTopic.findUnique({ where: { id } });
    if (!topic) return NextResponse.json({ message: "Topic not found" }, { status: 404 });

    // Update SEO: create if none, update if exists
    let seoId = topic.seoId;
    if (parsed.seo) {
      if (seoId) {
        await prisma.sEO.update({
          where: { id: seoId },
          data: { title: parsed.seo.title ?? "", description: parsed.seo.description ?? "" },
        });
      } else {
        const createdSeo = await prisma.sEO.create({
          data: { title: parsed.seo.title ?? "", description: parsed.seo.description ?? "" },
        });
        seoId = createdSeo.id;
      }
    }

    // Update topic core fields
    await prisma.healthTopic.update({
      where: { id },
      data: {
        title: parsed.title,
        handle: parsed.handle,
        description: parsed.description ?? "",
        seoId: seoId ?? undefined,
      },
    });

    // Sync related products (join table)
    const existing = await prisma.healthTopicProduct.findMany({
      where: { healthTopicId: id },
      select: { id: true, productId: true },
    });

    const existingIds = existing.map((r) => r.productId);
    const newIds = parsed.relatedProductIds || [];

    const toAdd = newIds.filter((nid) => !existingIds.includes(nid));
    const toRemove = existing.filter((r) => !newIds.includes(r.productId)).map((r) => r.id);

    const tx: any[] = [];

    if (toAdd.length) {
      const createManyData = toAdd.map((productId, idx) => ({
        healthTopicId: id,
        productId,
        order: newIds.indexOf(productId), // set order to position in newIds
      }));
      tx.push(prisma.healthTopicProduct.createMany({ data: createManyData, skipDuplicates: true }));
    }

    if (toRemove.length) {
      tx.push(prisma.healthTopicProduct.deleteMany({ where: { id: { in: toRemove } } }));
    }

    // Update order for all provided ids
    for (let i = 0; i < newIds.length; i++) {
      tx.push(
        prisma.healthTopicProduct.updateMany({
          where: { healthTopicId: id, productId: newIds[i] },
          data: { order: i },
        })
      );
    }

    if (tx.length) await prisma.$transaction(tx);

    const updated = await prisma.healthTopic.findUnique({
      where: { id },
      include: {
        relatedProducts: { include: { product: true }, orderBy: { order: "asc" } },
        seo: true,
      },
    });

    return NextResponse.json(updated);
  } catch (err: any) {
    console.error("PATCH /api/admin/health-topics/[id] error:", err);
    if (err?.name === "ZodError") {
      return NextResponse.json({ message: "Invalid payload", errors: err.errors }, { status: 400 });
    }
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params:  Promise<{ id: string }> }
) {

  try {
    const { id } = await params;
    
    if (!id) return NextResponse.json({ message: "Missing id" }, { status: 400 });

    // find topic and seoId (so we can optionally delete SEO)
    const topic = await prisma.healthTopic.findUnique({ where: { id }, select: { seoId: true } });
    if (!topic) return NextResponse.json({ message: "Topic not found" }, { status: 404 });

    const ops: any[] = [];

    // delete join rows
    ops.push(prisma.healthTopicProduct.deleteMany({ where: { healthTopicId: id } }));

    // delete the topic
    ops.push(prisma.healthTopic.delete({ where: { id } }));

    // Optionally delete SEO row (if you want to clean up orphan SEO rows)
    // Use deleteMany because prisma.sEO.delete requires the unique key to be found first
    if (topic.seoId) {
      ops.push(prisma.sEO.deleteMany({ where: { id: topic.seoId } }));
    }

    await prisma.$transaction(ops);

    return NextResponse.json({ message: "Deleted" }, { status: 200 });
  } catch (err: any) {
    console.error("DELETE /api/admin/health-topics/[id] error:", err);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}