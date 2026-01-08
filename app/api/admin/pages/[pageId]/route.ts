import prisma from "@/lib/prisma";
import { updatePageSchema } from "@/schemas/page";
import { NextResponse } from "next/server";
import { z } from "zod";

export const runtime = 'nodejs';

// Handlers use the Next.js App Router expected signature: (req: Request, { params }: { params: Promise<{ pageId: string }> })

export async function GET(
  req: Request,
  { params }: { params: Promise<{ pageId: string }> }
) {
  try {
    const { pageId } = await params;
    if (!pageId) return NextResponse.json({ error: "Missing pageId" }, { status: 400 });

    const p = await prisma.page.findUnique({ where: { id: pageId }, include: { seo: true } });
    if (!p) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(p, { status: 200 });
  } catch (err) {
    console.error("GET /api/pages/[pageId] error", err);
    return NextResponse.json({ error: "Failed to fetch page" }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ pageId: string }> }
) {
  try {
    const { pageId } = await params;
    if (!pageId) return NextResponse.json({ error: "Missing pageId" }, { status: 400 });

    const body = await req.json();
    const parsed = updatePageSchema.parse(body);

    const allowed: Record<string, any> = {};
    ["title", "handle", "body", "bodySummary", "seoId"].forEach((k) => {
      if (Object.prototype.hasOwnProperty.call(parsed, k)) allowed[k] = (parsed as any)[k];
    });

    const updated = await prisma.page.update({
      where: { id: pageId },
      data: allowed,
      include: { seo: true },
    });

    return NextResponse.json(updated, { status: 200 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation failed", issues: err.format() }, { status: 400 });
    }
    console.error("PATCH /api/pages/[pageId] error", err);
    const e = err as any;
    if (e?.code === "P2025") return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (e?.code === "P2002") return NextResponse.json({ error: "Unique constraint failed (handle)", meta: e.meta }, { status: 409 });
    return NextResponse.json({ error: "Failed to update page" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ pageId: string }> }
) {
  try {
    const { pageId } = await params;
    if (!pageId) return NextResponse.json({ error: "Missing pageId" }, { status: 400 });

    await prisma.page.delete({ where: { id: pageId } });
    return NextResponse.json({ message: "Page deleted" }, { status: 200 });
  } catch (err) {
    console.error("DELETE /api/pages/[pageId] error", err);
    const e = err as any;
    if (e?.code === "P2025") return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ error: "Failed to delete page" }, { status: 500 });
  }
}
