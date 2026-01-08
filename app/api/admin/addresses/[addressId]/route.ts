// app/api/addresses/[addressId]/route.ts
import prisma from "@/lib/prisma";
import { addressInputSchema } from "@/schemas/order";
import { NextResponse } from "next/server";
import { z } from "zod";

export const runtime = 'nodejs';

interface Params { params: { addressId: string } }

export async function GET(req: Request, ctx: { params: Promise<{ addressId: string }> }) {
  try {
    const { addressId } = await ctx.params;
    const address = await prisma.address.findUnique({ where: { id: addressId } });
    if (!address) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(address);
  } catch (err) {
    console.error("GET /api/addresses/[id]", err);
    return NextResponse.json({ error: "Failed to fetch address" }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ addressId: string }> }
) {
  try {
    const { addressId } = await params;
    const body = await req.json();
    const parsed = addressInputSchema.partial().parse(body);

    const allowed: any = {};
    ["fullName", "email", "phone", "county", "town", "userId"].forEach((k) => {
      if (Object.prototype.hasOwnProperty.call(parsed, k)) allowed[k] = (parsed as any)[k];
    });

    const updated = await prisma.address.update({
      where: { id: addressId },
      data: allowed,
    });

    return NextResponse.json(updated);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation failed", issues: err.format() }, { status: 400 });
    }
    console.error("PATCH /api/addresses/[id]", err);
    return NextResponse.json({ error: "Failed to update address" }, { status: 500 });
  }
}


export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ addressId: string }> }
) {
  try {
    const { addressId } = await params;
    await prisma.address.delete({ where: { id: addressId } });
    return NextResponse.json({ message: "Address deleted" });
  } catch (err) {
    console.error("DELETE /api/addresses/[id]", err);
    if ((err as any)?.code === "P2025")
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ error: "Failed to delete address" }, { status: 500 });
  }
}
