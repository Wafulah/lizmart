import prisma from "@/lib/prisma";
import { createPaymentSchema } from "@/schemas/order";
import { NextResponse } from "next/server";
import { z } from "zod";

export const runtime = 'nodejs';

// Next.js App Router expects handler signatures like:
// export async function GET(req: Request, { params }: { params: Promise<{ orderId: string }>})

export async function GET(
  req: Request,
  { params }: { params: Promise<{ orderId: string }>}
) {
  try {
    const { orderId } = await params;
    if (!orderId) return NextResponse.json({ error: "Missing orderId" }, { status: 400 });

    const payments = await prisma.payment.findMany({
      where: { orderId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(payments, { status: 200 });
  } catch (err) {
    console.error("GET /api/orders/[orderId]/payments error", err);
    return NextResponse.json({ error: "Failed to fetch payments" }, { status: 500 });
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
    const parsed = createPaymentSchema.parse(body);

    const result = await prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({ where: { id: orderId } });
      if (!order) throw { status: 404, message: "Order not found" };

      const paymentData: any = {
  orderId,
  provider: parsed.provider,
  ...(parsed.providerPaymentId ? { providerPaymentId: parsed.providerPaymentId } : {}),
  ...(parsed.method ? { method: parsed.method } : {}),
  ...(parsed.amount != null ? { amount: String(parsed.amount) } : {}), // convert when present
  currency: parsed.currency,
  status: parsed.status ?? "PENDING",
  ...(parsed.rawResponse ? { rawResponse: parsed.rawResponse } : {}),
};

const payment = await tx.payment.create({
  data: paymentData,
});

      if ((parsed.status ?? "PENDING") === "CAPTURED") {
        await tx.order.update({ where: { id: orderId }, data: { paymentStatus: "CAPTURED", paidAt: new Date() } });
      }

      return payment;
    });

    return NextResponse.json(result, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation failed", issues: err.format() }, { status: 400 });
    }

    console.error("POST /api/orders/[orderId]/payments error", err);
    const e = err as any;
    if (e?.status) return NextResponse.json({ error: e.message ?? "Error" }, { status: e.status });
    return NextResponse.json({ error: "Failed to record payment" }, { status: 500 });
  }
}
