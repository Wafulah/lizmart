// app/api/addresses/route.ts
import prisma from "@/lib/prisma";
import { addressInputSchema } from "@/schemas/order";
import { NextResponse } from "next/server";
import { z } from "zod";

export const runtime = 'nodejs';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const userId = url.searchParams.get("userId") ?? undefined;
    const page = Math.max(Number(url.searchParams.get("page") ?? 1), 1);
    const limit = Math.min(Number(url.searchParams.get("limit") ?? 20), 100);

    const where: any = {};
    if (userId) where.userId = userId;

    const [total, items] = await Promise.all([
      prisma.address.count({ where }),
      prisma.address.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    return NextResponse.json({ data: items, meta: { total, page, limit, pages: Math.ceil(total / limit) } });
  } catch (err) {
    console.error("GET /api/addresses", err);
    return NextResponse.json({ error: "Failed to fetch addresses" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = addressInputSchema.parse(body);

    const created = await prisma.address.create({
      data: {
        fullName: parsed.fullName,
        email: parsed.email ?? null,
        phone: parsed.phone,
        county: parsed.county,
        town: parsed.town,
        userId: parsed.userId ?? null,
        mpesaNumber: parsed.mpesaNumber
      },
    });

    return NextResponse.json(created, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation failed", issues: err.format() }, { status: 400 });
    }
    console.error("POST /api/addresses", err);
    return NextResponse.json({ error: "Failed to create address" }, { status: 500 });
  }
}
