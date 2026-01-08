import prisma from "@/lib/prisma";
import { createShipmentSchema } from "@/schemas/order";
import { NextResponse } from "next/server";
import { z } from "zod";

export const runtime = 'nodejs';

// Fixed handler signatures to the Next.js App Router expected shape:
// (req: Request, { params }: { params: Promise<{ orderId: string }>})

export async function GET(
  req: Request,
  { params }: { params: Promise<{ orderId: string }>}
) {
  try {
    const { orderId } = await params;
    if (!orderId) return NextResponse.json({ error: "Missing orderId" }, { status: 400 });

    const shipments = await prisma.shipment.findMany({
      where: { orderId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(shipments, { status: 200 });
  } catch (err) {
    console.error("GET /api/orders/[orderId]/shipments error", err);
    return NextResponse.json({ error: "Failed to fetch shipments" }, { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ orderId: string }>}
) {
  try {
    const { orderId } = await params;
    if (!orderId) return NextResponse.json({ error: "Missing orderId" }, { status: 400 });

    const body = await req.json();
    const parsed = createShipmentSchema.parse(body);

    const shipment = await prisma.shipment.create({
      data: {
        orderId,
        carrier: parsed.carrier ?? undefined,
        service: parsed.service ?? undefined,
        trackingNumber: parsed.trackingNumber ?? undefined,
        costAmount: parsed.costAmount != null ? String(parsed.costAmount) : undefined,
        costCurrency: parsed.costCurrency ?? undefined,
        status: parsed.status ?? undefined,
        shippedAt: parsed.shippedAt ? new Date(parsed.shippedAt) : undefined,
        deliveredAt: parsed.deliveredAt ? new Date(parsed.deliveredAt) : undefined,
        shipmentAddress: parsed.shipmentAddress ?? undefined,
        trackingEvents: parsed.trackingEvents ?? undefined,
      },
    });

    return NextResponse.json(shipment, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation failed", issues: err.format() }, { status: 400 });
    }

    console.error("POST /api/orders/[orderId]/shipments error", err);
    return NextResponse.json({ error: "Failed to create shipment" }, { status: 500 });
  }
}
