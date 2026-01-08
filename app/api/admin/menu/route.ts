// app/api/menus/route.ts
import prisma from "@/lib/prisma";
import { createMenuSchema } from "@/schemas/menu";
import { NextResponse } from "next/server";
import { z } from "zod";

export const runtime = 'nodejs';

export async function GET(req: Request) {
  try {
    const items = await prisma.menu.findMany({ orderBy: { createdAt: "desc" } });
    return NextResponse.json(items);
  } catch (err) {
    console.error("GET /api/menus", err);
    return NextResponse.json({ error: "Failed to fetch menus" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = createMenuSchema.parse(body);

    const created = await prisma.menu.create({
      data: {
        handle: parsed.handle,
        items: parsed.items as any,
      },
    });

    return NextResponse.json(created, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation failed", issues: err.format() }, { status: 400 });
    }
    console.error("POST /api/menus", err);
    if ((err as any)?.code === "P2002") return NextResponse.json({ error: "Unique constraint failed (handle)" }, { status: 409 });
    return NextResponse.json({ error: "Failed to create menu" }, { status: 500 });
  }
}
