// app/api/collections/route.ts
import prisma from "@/lib/prisma";
import { createCollectionSchema } from "@/schemas/collection";
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
        { description: { contains: q, mode: "insensitive" } },
      ];
    }

    const [total, collections] = await Promise.all([
      prisma.collection.count({ where }),
      prisma.collection.findMany({
        where,
        include: { _count: { select: { products: true } } },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    return NextResponse.json({ data: collections, meta: { total, page, limit, pages: Math.ceil(total / limit) } });
  } catch (err) {
    console.error("GET /api/collections error", err);
    return NextResponse.json({ error: "Failed to fetch collections" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = createCollectionSchema.parse(body);
    

    const created = await prisma.collection.create({
      data: {
        handle: parsed.handle,
        title: parsed.title,
        description: parsed.description,
        seoId: parsed.seoId,
        parentId: parsed.parentId,
        gender: parsed.gender 
      },
    });

    return NextResponse.json(created, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation failed", issues: err.format() }, { status: 400 });
    }
    console.error("POST /api/collections error", err);
    if ((err as any)?.code === "P2002") {
      return NextResponse.json({ error: "Unique constraint failed", meta: (err as any).meta }, { status: 409 });
    }
    return NextResponse.json({ error: "Failed to create collection" }, { status: 500 });
  }
}
