// app/api/pages/route.ts
import prisma from "@/lib/prisma";
import { createPageSchema } from "@/schemas/page";
import { NextResponse } from "next/server";
import { z } from "zod";

export const runtime = 'nodejs';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const page = Math.max(Number(url.searchParams.get("page") ?? 1), 1);
    const limit = Math.min(Number(url.searchParams.get("limit") ?? 20), 100);
    const q = url.searchParams.get("q") ?? undefined;

    const where: any = {};
    if (q) {
      where.OR = [
        { title: { contains: q, mode: "insensitive" } },
        { handle: { contains: q, mode: "insensitive" } },
        { body: { contains: q, mode: "insensitive" } },
      ];
    }

    const [total, items] = await Promise.all([
      prisma.page.count({ where }),
      prisma.page.findMany({
        where,
        include: { seo: true },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    return NextResponse.json({ data: items, meta: { total, page, limit, pages: Math.ceil(total / limit) } });
  } catch (err) {
    console.error("GET /api/pages", err);
    return NextResponse.json({ error: "Failed to fetch pages" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = createPageSchema.parse(body);

    const created = await prisma.page.create({
      data: {
        title: parsed.title,
        handle: parsed.handle,
        body: parsed.body,
        bodySummary: parsed.bodySummary,
        seoId: parsed.seoId,
      },
      include: { seo: true },
    });

    return NextResponse.json(created, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation failed", issues: err.format() }, { status: 400 });
    }
    console.error("POST /api/pages", err);
    if ((err as any)?.code === "P2002") return NextResponse.json({ error: "Unique constraint failed (handle)" }, { status: 409 });
    return NextResponse.json({ error: "Failed to create page" }, { status: 500 });
  }
}
