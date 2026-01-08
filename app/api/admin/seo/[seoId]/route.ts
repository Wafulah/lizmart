// app/api/seo/[seoId]/route.ts
import prisma from "@/lib/prisma";
import { updateSeoSchema } from "@/schemas/seo";
import { NextResponse } from "next/server";
import { z } from "zod";

export const runtime = 'nodejs';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ seoId: string }>}
) {
  try {
    const { seoId } = await params;
    if (!seoId) return NextResponse.json({ error: "Missing seoId" }, { status: 400 });

    const seo = await prisma.sEO.findUnique({ where: { id: seoId } });
    if (!seo) return NextResponse.json({ error: "Not found" }, { status: 404 });

    return NextResponse.json(seo, { status: 200 });
  } catch (err) {
    console.error("GET /api/seo/[seoId] error", err);
    return NextResponse.json({ error: "Failed to fetch SEO" }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ seoId: string }>}
) {
  try {
    const { seoId } = await params;
    if (!seoId) return NextResponse.json({ error: "Missing seoId" }, { status: 400 });

    const body = await req.json();
    const parsed = updateSeoSchema.parse(body);

    const updated = await prisma.sEO.update({
      where: { id: seoId },
      data: {
        ...(parsed.title !== undefined && { title: parsed.title }),
        ...(parsed.description !== undefined && { description: parsed.description }),
      },
    });

    return NextResponse.json(updated, { status: 200 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation failed", issues: err.format() }, { status: 400 });
    }

    console.error("PATCH /api/seo/[seoId] error", err);
    const e = err as any;
    if (e?.code === "P2025") {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ error: "Failed to update SEO" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ seoId: string }>}
) {
  try {
    const { seoId } = await params;
    if (!seoId) return NextResponse.json({ error: "Missing seoId" }, { status: 400 });

    await prisma.$transaction(async (tx) => {
      await tx.product.updateMany({ where: { seoId }, data: { seoId: null } });
      await tx.collection.updateMany({ where: { seoId }, data: { seoId: null } });
      await tx.page.updateMany({ where: { seoId }, data: { seoId: null } });
      await tx.sEO.delete({ where: { id: seoId } });
    });

    return NextResponse.json({ message: "SEO removed and unlinked" }, { status: 200 });
  } catch (err) {
    console.error("DELETE /api/seo/[seoId] error", err);
    const e = err as any;
    if (e?.code === "P2025") {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ error: "Failed to delete SEO" }, { status: 500 });
  }
}
