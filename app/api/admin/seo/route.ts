// app/api/seo/route.ts
import prisma from "@/lib/prisma";
import { createSeoSchema } from "@/schemas/seo";
import { NextResponse } from "next/server";
import { z } from "zod";

export const runtime = 'nodejs';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const page = Math.max(Number(url.searchParams.get("page") ?? 1), 1);
    const limit = Math.min(Number(url.searchParams.get("limit") ?? 20), 100);

    const [total, items] = await Promise.all([
      prisma.sEO.count(), // <--- If this throws, try prisma.seo (see note above)
      prisma.sEO.findMany({
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" } as any,
      }),
    ]);

    return NextResponse.json({ data: items, meta: { total, page, limit, pages: Math.ceil(total / limit) } });
  } catch (err) {
    console.error("GET /api/seo", err);
    return NextResponse.json({ error: "Failed to fetch SEO entries" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = createSeoSchema.parse(body);

    const created = await prisma.sEO.create({ data: { title: parsed.title ?? null, description: parsed.description ?? null } });

    return NextResponse.json(created, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation failed", issues: err.format() }, { status: 400 });
    }
    console.error("POST /api/seo", err);
    return NextResponse.json({ error: "Failed to create SEO entry" }, { status: 500 });
  }
}
