// app/api/orders/route.ts
import { Prisma } from "@/generated/prisma";
import prisma from "@/lib/prisma";
import { createOrderFromCartSchema } from "@/schemas/order";
import { Decimal } from "@prisma/client/runtime/library";
import { NextResponse } from "next/server";
import { z } from "zod";

export const runtime = 'nodejs';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const page = Math.max(Number(url.searchParams.get("page") ?? 1), 1);
    const limit = Math.min(Number(url.searchParams.get("limit") ?? 20), 100);
    const userId = url.searchParams.get("userId") ?? undefined;
    const status = url.searchParams.get("status") ?? undefined;

    const where: any = {};
    if (userId) where.userId = userId;
    if (status) where.status = status;

    const [total, orders] = await Promise.all([
      prisma.order.count({ where }),
      prisma.order.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        include: { items: true, payments: true, shipments: true, shippingAddress: true },
      }),
    ]);

    return NextResponse.json({ data: orders, meta: { total, page, limit, pages: Math.ceil(total / limit) } });
  } catch (err) {
    console.error("GET /api/orders", err);
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}

function genOrderNumber(): string {
  // Simple generator: YYYYMMDD-<random4> — replace with robust generator in prod
  const d = new Date();
  const ymd = d.toISOString().slice(0, 10).replace(/-/g, "");
  const rand = Math.floor(Math.random() * 9000) + 1000;
  return `ORD-${ymd}-${rand}`;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = createOrderFromCartSchema.parse(body);

    const order = await prisma.$transaction(async (tx) => {
      const cart = await tx.cart.findUnique({
        where: { id: parsed.cartId },
        include: { lines: { include: { variant: { include: { product: true } } } } },
      });
      if (!cart) throw { status: 404, message: "Cart not found" };
      if (!cart.lines || cart.lines.length === 0) throw { status: 400, message: "Cart has no items" };

      
      let shippingAddressId = parsed.shippingAddressId ?? null;
      if (!shippingAddressId && parsed.shippingAddress) {
        const s = parsed.shippingAddress;
        const created = await tx.address.create({ data: { ...s, userId: parsed.userId ?? undefined } });
        shippingAddressId = created.id;
      }

      const subtotal = cart.lines.reduce((acc, l) => acc.add(new Decimal(l.totalAmount.toString())), new Decimal(0));
      const totalQty = cart.lines.reduce((s, l) => s + l.quantity, 0);
      const currency = cart.subtotalCurrency ?? cart.lines[0]?.currency ?? "KES";

      const orderNumber = genOrderNumber();

      const createdOrder = await tx.order.create({
        data: {
          orderNumber,
          userId: parsed.userId ?? null,
          status: "PENDING",
          paymentStatus: "PENDING",
          currency,
          subtotalAmount: subtotal.toString(),
          shippingAmount: "0",
          taxAmount: "0",
          totalAmount: subtotal.toString(),
          totalQuantity: totalQty,
          shippingAddressId: shippingAddressId ?? undefined,
          placedAt: new Date(),
          notes: parsed.notes ?? undefined,
          metadata: parsed.metadata ?? undefined,
        },
      });

      // order items
      for (const line of cart.lines) {
        const v = line.variant!;
        await tx.orderItem.create({
          data: {
            orderId: createdOrder.id,
            productId: v.productId ?? undefined,
            variantId: v.id,
            productTitle: v.product?.title ?? null,
            variantTitle: v.title,
            sku: v.sku ?? null,
            selectedOptions: v.selectedOptions ?? Prisma.JsonNull,
            quantity: line.quantity,
            unitPriceAmount: v.priceAmount.toString(),
            unitPriceCurrency: v.priceCurrency,
            lineTotalAmount: line.totalAmount.toString(),
            lineTotalCurrency: line.currency,
            merchandiseSnapshot: {
              product: { id: v.productId, title: v.product?.title },
              variant: { id: v.id, title: v.title, sku: v.sku },
            },
          },
        });
      }

      if (parsed.paymentProvider) {
        await tx.payment.create({
          data: {
            orderId: createdOrder.id,
            provider: parsed.paymentProvider,
            method: parsed.paymentMethod ?? undefined,
            amount: subtotal.toString(),
            currency,
            status: "PENDING",
          },
        });
      }

      // clear cart items
      await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

      return tx.order.findUnique({
        where: { id: createdOrder.id },
        include: { items: true, payments: true, shipments: true, shippingAddress: true },
      });
    });

    return NextResponse.json(order, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation failed", issues: err.format() }, { status: 400 });
    }
    console.error("POST /api/orders error", err);
    if ((err as any)?.status) return NextResponse.json({ error: (err as any).message }, { status: (err as any).status });
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}
