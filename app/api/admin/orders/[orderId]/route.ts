import prisma from "@/lib/prisma";
import { updateOrderSchema } from "@/schemas/order";
import { NextResponse } from "next/server";
import { z } from "zod";

export const runtime = 'nodejs';

// Next.js App Router expects the second argument to be the shape: { params: Promise<{ orderId: string }>}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ orderId: string }>}
) {
  try {
    const { orderId } = await params;
    if (!orderId) return NextResponse.json({ error: "Missing orderId" }, { status: 400 });

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true, payments: true, shipments: true, shippingAddress: true },
    });

    if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(order, { status: 200 });
  } catch (err) {
    console.error("GET /api/orders/[orderId] error", err);
    return NextResponse.json({ error: "Failed to fetch order" }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ orderId: string }>}
) {
  try {
    const { orderId } = await params;
    if (!orderId) return NextResponse.json({ error: "Missing orderId" }, { status: 400 });

    const body = await req.json();
    const parsed = updateOrderSchema.parse(body);

    const updates: Record<string, any> = {};
    if (parsed.status) updates.status = parsed.status;
    if (parsed.paymentStatus) updates.paymentStatus = parsed.paymentStatus;
    if (parsed.notes) updates.notes = parsed.notes;
    if (parsed.metadata) updates.metadata = parsed.metadata;

    // set timestamp fields based on status transitions
    if (parsed.status === "CANCELLED") updates.cancelledAt = new Date();
    if (parsed.status === "FULFILLED") updates.fulfilledAt = new Date();
    if (parsed.status === "DELIVERED") updates.deliveredAt = new Date();

    const updated = await prisma.order.update({
      where: { id: orderId },
      data: updates,
      include: { items: true, payments: true, shipments: true, shippingAddress: true },
    });

    return NextResponse.json(updated, { status: 200 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation failed", issues: err.format() }, { status: 400 });
    }

    console.error("PATCH /api/orders/[orderId] error", err);
    const e = err as any;
    if (e?.code === "P2025") return NextResponse.json({ error: "Order not found" }, { status: 404 });
    return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ orderId: string }>}
) {
  try {
    const { orderId } = await params;
    if (!orderId) return NextResponse.json({ error: "Missing orderId" }, { status: 400 });

    // soft-cancel / archive
    const updated = await prisma.order.update({
      where: { id: orderId },
      data: { status: "CANCELLED", cancelledAt: new Date(), archivedAt: new Date() },
    });

    return NextResponse.json(updated, { status: 200 });
  } catch (err) {
    console.error("DELETE /api/orders/[orderId] error", err);
    const e = err as any;
    if (e?.code === "P2025") return NextResponse.json({ error: "Order not found" }, { status: 404 });
    return NextResponse.json({ error: "Failed to cancel order" }, { status: 500 });
  }
}
