import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { addCartItemSchema } from "@/schemas/cart";
import { z } from "zod";
import { Decimal } from "@prisma/client/runtime/library";

export const runtime = 'nodejs';

export async function POST(req: Request, context: { params: Promise<{ cartId: string }> }) {
  try {
    const body = await req.json();
    const parsed = addCartItemSchema.parse(body);
    const { cartId } = await context.params; // Await the params object

    const result = await prisma.$transaction(async (tx) => {
      // Ensure cart exists
      const cart = await tx.cart.findUnique({ where: { id: cartId } });
      if (!cart) throw { status: 404, message: "Cart not found" };

      // Load variant and product for snapshot + price
      const variant = await tx.productVariant.findUnique({
        where: { id: parsed.variantId },
        include: { product: true },
      });
      if (!variant) throw { status: 404, message: "Variant not found" };

      // Find existing cart line with same variant
      const existing = await tx.cartItem.findFirst({
        where: { cartId, variantId: parsed.variantId },
      });

      const price = new Decimal(variant.priceAmount.toString());
      const qty = parsed.quantity;

      let line;
      if (existing) {
        const newQty = existing.quantity + qty;
        const newTotal = price.mul(newQty);
        line = await tx.cartItem.update({
          where: { id: existing.id },
          data: {
            quantity: newQty,
            totalAmount: newTotal.toString(),
            currency: variant.priceCurrency,
            merchandiseSnapshot: {
              // Snapshot updated to current variant/product state
              title: JSON.stringify({
                productId: variant.productId,
                productTitle: variant.product?.title ?? null,
                variantId: variant.id,
                variantTitle: variant.title,
                selectedOptions: variant.selectedOptions ?? null,
                sku: variant.sku ?? null,
              }),
            },
          },
        });
      } else {
        const totalAmount = price.mul(qty);
        line = await tx.cartItem.create({
          data: {
            cartId,
            variantId: variant.id,
            quantity: qty,
            totalAmount: totalAmount.toString(),
            currency: variant.priceCurrency,
            merchandiseSnapshot: {
              title: JSON.stringify({
                productId: variant.productId,
                productTitle: variant.product?.title ?? null,
                variantId: variant.id,
                variantTitle: variant.title,
                selectedOptions: variant.selectedOptions ?? null,
                sku: variant.sku ?? null,
              }),
            } as any,
          },
        });
      }

      // Recalculate totals
      const lines = await tx.cartItem.findMany({ where: { cartId } });
      const subtotal = lines.reduce((acc, l) => acc.add(new Decimal(l.totalAmount.toString())), new Decimal(0));
      const totalQuantity = lines.reduce((s, l) => s + l.quantity, 0);

      await tx.cart.update({
        where: { id: cartId },
        data: {
          subtotalAmount: subtotal.toString(),
          subtotalCurrency: line.currency,
          totalAmount: subtotal.toString(),
          totalCurrency: line.currency,
          totalQuantity,
        },
      });

      const updatedCart = await tx.cart.findUnique({
        where: { id: cartId },
        include: { lines: { include: { variant: true } } },
      });

      return { line, cart: updatedCart };
    });

    return NextResponse.json(result, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation failed", issues: err.format() }, { status: 400 });
    }
    console.error("POST /api/carts/[id]/items", err);
    if ((err as any)?.status) return NextResponse.json({ error: (err as any).message }, { status: (err as any).status });
    return NextResponse.json({ error: "Failed to add item to cart" }, { status: 500 });
  }
}
