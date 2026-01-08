// app/api/mpesa-webhook/route.ts
import { sendOrderAlert } from "@/lib/new-order-alert";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export const runtime = 'nodejs';

const corsHeaders = {
  "Access-Control-Allow-Origin": process.env.FRONTEND_STORE_URL ?? "https://lizmart.vercel.app",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};


const allowedIPs = [
  "196.201.214.200","196.201.214.206","196.201.213.114","196.201.214.207",
  "196.201.214.208","196.201.213.44","196.201.212.127","196.201.212.138",
  "196.201.212.129","196.201.212.136","196.201.212.74","196.201.212.69",
];

export async function OPTIONS(req: Request) {
  return new NextResponse(null, { headers: corsHeaders });
}

export async function POST(req: Request) {
  console.log("entered");
  const clientIP = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "";
  console.log("--entered", clientIP);
  // Optional IP check
  if (allowedIPs.length > 0 && !allowedIPs.includes(clientIP)) {
    console.log("rejected one");
    return new NextResponse(JSON.stringify({ message: "Forbidden" }), {
      status: 403,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const body = await req.json();
    console.log("body", body);
    const { Body } = body || {};
    const { stkCallback } = Body || {};

    console.log("stkCallback", stkCallback);

    if (!stkCallback) {
      return new NextResponse("Invalid MPESA callback body", { status: 400 });
    }

    const {
      MerchantRequestID,
      CheckoutRequestID,
      ResultCode,
      ResultDesc,
      CallbackMetadata,
    } = stkCallback;

    if (!CallbackMetadata || !Array.isArray(CallbackMetadata.Item)) {
      return new NextResponse("Invalid MPESA callback metadata", { status: 400 });
    }

    const items = CallbackMetadata.Item;
    const amount = items.find((i: any) => i.Name === "Amount")?.Value;
    const mpesaReceiptNumber = items.find((i: any) => i.Name === "MpesaReceiptNumber")?.Value;
    const transactionDateValue = items.find((i: any) => i.Name === "TransactionDate")?.Value;
    const phoneNumber = items.find((i: any) => i.Name === "PhoneNumber")?.Value;

    const transactionDate = transactionDateValue ? new Date(String(transactionDateValue)) : null;

    // Idempotency: skip if we already have this callback recorded
    const existing = await prisma.stkCallback.findUnique({
      where: { checkoutRequestId: CheckoutRequestID },
    });

   if (!existing) {
  // create StkCallback + CallbackMetadata (do NOT include checkoutRequestId in nested create)
  await prisma.stkCallback.create({
    data: {
      merchantRequestId: MerchantRequestID ?? "",
      checkoutRequestId: CheckoutRequestID,
      resultCode: Number(ResultCode) ?? 1032,
      resultDesc: ResultDesc ?? "",
      callbackMetadata: {
        create: {
          // DO NOT set checkoutRequestId here — Prisma sets it automatically
          amount: amount != null ? String(amount) : null,
          mpesaReceiptNumber: mpesaReceiptNumber ? String(mpesaReceiptNumber) : null,
          transactionDate: transactionDate ?? undefined,
          phoneNumber: phoneNumber ? String(phoneNumber) : null,
          resultDesc: ResultDesc ?? null,
        },
      },
    },
  });
}
 // else: already recorded, we still proceed to ensure order status is correct

    if (Number(ResultCode) === 0) {
      // Payment success: update orders linked to this checkoutRequestId
      await prisma.order.updateMany({
        where: { stkCallbackId: CheckoutRequestID },
        data: {
          paymentStatus: "CAPTURED",
          status: "CONFIRMED",
          paidAt: new Date(),
          stkCallbackId: CheckoutRequestID, // idempotent set
        },
      });

      // Optional: notify admin/owner for each order (lightweight)
      const adminEmail = process.env.ADMIN_EMAIL;
      if (adminEmail) {
        // fetch orders (light) and notify
        const orders = await prisma.order.findMany({
          where: { stkCallbackId: CheckoutRequestID },
          include: { shippingAddress: true, items: true },
        });
        for (const order of orders) {
          try {
            await sendOrderAlert(adminEmail, order); // implement this separately
          } catch (err) {
            console.error("notifyAdminOfOrder error:", err);
          }
        }
      }
    } else {
      // Payment failed or cancelled
      await prisma.order.updateMany({
        where: { stkCallbackId: CheckoutRequestID },
        data: { paymentStatus: "FAILED" },
      });
    }

    return new NextResponse("Callback processed", { status: 200, headers: corsHeaders });
  } catch (err) {
    console.error("MPESA webhook error:", err);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
