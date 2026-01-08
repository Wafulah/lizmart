// app/api/carts/route.ts
import prisma from "@/lib/prisma";
import { createCartSchema } from "@/schemas/cart";
import { NextResponse } from "next/server";
import { z } from "zod";

export const runtime = 'nodejs';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const page = Math.max(Number(url.searchParams.get("page") ?? 1), 1);
    const limit = Math.min(Number(url.searchParams.get("limit") ?? 20), 100);
    const userId = url.searchParams.get("userId") ?? undefined;

    const where: any = {};
    if (userId) where.userId = userId;

    const [total, carts] = await Promise.all([
      prisma.cart.count({ where }),
      prisma.cart.findMany({
        where,
        include: { lines: { include: { variant: { include: { product: true } } } }, User: true },
        orderBy: { updatedAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    return NextResponse.json({ data: carts, meta: { total, page, limit, pages: Math.ceil(total / limit) } });
  } catch (err) {
    console.error("GET /api/carts", err);
    return NextResponse.json({ error: "Failed to fetch carts" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = createCartSchema.parse(body);

    const created = await prisma.cart.create({
      data: {
        userId: parsed.userId ?? undefined,
        checkoutUrl: parsed.checkoutUrl ?? undefined,
      },
      include: { lines: true },
    });

    return NextResponse.json(created, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation failed", issues: err.format() }, { status: 400 });
    }
    console.error("POST /api/carts", err);
    return NextResponse.json({ error: "Failed to create cart" }, { status: 500 });
  }
}
