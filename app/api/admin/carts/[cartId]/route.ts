// app/api/carts/[cartId]/route.ts
import prisma from "@/lib/prisma";
import { Decimal } from "@prisma/client/runtime/library.js"; // used for safe sums
import { NextRequest, NextResponse } from "next/server";

export const runtime = 'nodejs';

export async function GET(req: NextRequest, ctx: { params: Promise<{ cartId: string }> }) {
  try {
    const { cartId } = await ctx.params;
    const cart = await prisma.cart.findUnique({
      where: { id: cartId },
      include: {
        lines: { include: { variant: { include: { product: true } } } },
        User: true,
      },
    });
    if (!cart) return NextResponse.json({ error: "Cart not found" }, { status: 404 });

    // compute totals (subtotal & totalQuantity) from lines
    const subtotal = cart.lines.reduce((acc, l) => acc.add(new Decimal(l.totalAmount.toString())), new Decimal(0));
    const qty = cart.lines.reduce((s, l) => s + l.quantity, 0);

    const response = {
      ...cart,
      subtotalAmount: subtotal.toString(),
      totalAmount: subtotal.toString(), // taxes not applied here
      totalQuantity: qty,
    };

    return NextResponse.json(response);
  } catch (err) {
    console.error("GET /api/carts/[cartId]", err);
    return NextResponse.json({ error: "Failed to fetch cart" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ cartId: string }> }) {
  try {
    const { cartId } = await ctx.params;
    const body = await req.json();
    const allowed: any = {};
    if (body.checkoutUrl !== undefined) allowed.checkoutUrl = body.checkoutUrl;
    if (body.userId !== undefined) allowed.userId = body.userId;

    const updated = await prisma.cart.update({
      where: { id: cartId },
      data: allowed,
      include: { lines: true },
    });

    return NextResponse.json(updated);
  } catch (err) {
    console.error("PATCH /api/carts/[cartId]", err);
    return NextResponse.json({ error: "Failed to update cart" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, ctx: { params: Promise<{ cartId: string }> }) {
  try {
    const { cartId } = await ctx.params;
    await prisma.$transaction(async (tx) => {
      await tx.cartItem.deleteMany({ where: { cartId } });
      await tx.cart.delete({ where: { id: cartId } });
    });

    return NextResponse.json({ message: "Cart deleted" });
  } catch (err) {
    console.error("DELETE /api/carts/[cartId]", err);
    return NextResponse.json({ error: "Failed to delete cart" }, { status: 500 });
  }
}
