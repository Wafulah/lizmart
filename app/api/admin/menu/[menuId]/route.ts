import prisma from "@/lib/prisma";
import { updateMenuSchema } from "@/schemas/menu";
import { NextResponse } from "next/server";
import { z } from "zod";

export const runtime = 'nodejs';

// Route handlers fixed to use the proper Next.js App Router signature: 
// (req: Request, { params }: { params: Promise<{ menuId: string }> })

export async function GET(
  req: Request,
  { params }: { params: Promise<{ menuId: string }> }
) {
  try {
    const { menuId } = await params;
    if (!menuId) return NextResponse.json({ error: "Missing menuId" }, { status: 400 });

    const m = await prisma.menu.findUnique({ where: { id: menuId } });
    if (!m) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(m, { status: 200 });
  } catch (err) {
    console.error("GET /api/menus/[menuId] error", err);
    return NextResponse.json({ error: "Failed to fetch menu" }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ menuId: string }> }
) {
  try {
    const { menuId } = await params;
    if (!menuId) return NextResponse.json({ error: "Missing menuId" }, { status: 400 });

    const body = await req.json();
    const parsed = updateMenuSchema.parse(body);

    const allowed: Record<string, any> = {};
    ["handle", "items"].forEach((k) => {
      if (Object.prototype.hasOwnProperty.call(parsed, k)) allowed[k] = (parsed as any)[k];
    });

    const updated = await prisma.menu.update({ where: { id: menuId }, data: allowed });
    return NextResponse.json(updated, { status: 200 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation failed", issues: err.format() }, { status: 400 });
    }

    console.error("PATCH /api/menus/[menuId] error", err);
    const e = err as any;
    if (e?.code === "P2025") return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (e?.code === "P2002") return NextResponse.json({ error: "Unique constraint failed (handle)", meta: e.meta }, { status: 409 });
    return NextResponse.json({ error: "Failed to update menu" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ menuId: string }> }
) {
  try {
    const { menuId } = await params;
    if (!menuId) return NextResponse.json({ error: "Missing menuId" }, { status: 400 });

    await prisma.menu.delete({ where: { id: menuId } });
    return NextResponse.json({ message: "Menu deleted" }, { status: 200 });
  } catch (err) {
    console.error("DELETE /api/menus/[menuId] error", err);
    const e = err as any;
    if (e?.code === "P2025") return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ error: "Failed to delete menu" }, { status: 500 });
  }
}
