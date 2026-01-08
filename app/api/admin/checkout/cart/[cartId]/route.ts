// File: app/api/admin/checkout/cart/[cartId]/route.ts

import { Prisma } from "@/generated/prisma";
import { MpesaPay } from "@/lib/mpesa_lib";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";

export const runtime = 'nodejs';

const corsHeaders = {
  "Access-Control-Allow-Origin": process.env.FRONTEND_STORE_URL ?? "https://neocommerce.vercel.app",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

const checkoutSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  email: z.string().email().optional(),
  phone: z.string().min(1, "Phone is required"),
  county: z.string().min(1, "County is required"),
  town: z.string().min(1, "Town is required"),
  mpesaNumber: z.string().min(1, "MPESA number is required"),
  userId: z.string()
});

export async function OPTIONS(request: NextRequest) {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ cartId: string }> }
) {
  const { cartId } = await params;
  if (!cartId) {
    return NextResponse.json(
      { success: false, message: "cartId is required in path" },
      { status: 400, headers: corsHeaders }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Invalid JSON" },
      { status: 400, headers: corsHeaders }
    );
  }

  const parsed = checkoutSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, message: "Invalid request body", errors: parsed.error.format() },
      { status: 400, headers: corsHeaders }
    );
  }

  const { fullName, email, phone, county, town, mpesaNumber, userId } = parsed.data;

  // Fetch the cart by ID using prisma
  let cart;
  try {
    cart = await prisma.cart.findUnique({
      where: { id: cartId },
      include: {
        lines: {
          include: {
            variant: {
              include: {
                product: {
                  include: {
                    featuredImage: true,
                    images: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!cart) {
      return NextResponse.json(
        { success: false, message: "Cart not found" },
        { status: 404, headers: corsHeaders }
      );
    }
  } catch (error) {
    console.error("Error fetching cart:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch cart" },
      { status: 500, headers: corsHeaders }
    );
  }

  // Optional: Making sure the cart has lines, not empty
  if (!cart.lines || cart.lines.length === 0) {
    return NextResponse.json(
      { success: false, message: "Cart is empty" },
      { status: 400, headers: corsHeaders }
    );
  }

  if (!cart.userId && userId) {
  try {
    await prisma.cart.update({
      where: { id: cartId },
      data: { userId },
    });
    cart.userId = userId; 
  } catch (error) {
    console.warn("Failed to update cart userId:", error);
  }
}

  try {
    // Save address (shipping) information
    const addressRecord = await prisma.address.create({
      data: {
        fullName,
        email: email ?? null,
        phone,
        county,
        town,
        mpesaNumber,
        userId
      },
    });

    // Create order with required orderNumber
 const order = await prisma.order.create({
  data: {
    orderNumber: uuidv4(),
    userId: userId,
    shippingAddressId: addressRecord.id,
    status: "PENDING",
    paymentStatus: "PENDING",
    currency: cart.totalCurrency ?? "KES",  // if totalCurrency exists
    subtotalAmount: cart.subtotalAmount ?? new Prisma.Decimal(0),
    totalAmount: cart.totalAmount ?? new Prisma.Decimal(0),
    totalQuantity: cart.totalQuantity,
    items: {
      create: cart.lines.map((line) => {
        const qty = line.quantity;
        // line.totalAmount is the full line cost (price * qty), so unit price = line.totalAmount / qty
        // Prisma.Decimal operations might be needed
        const lineTotal = line.totalAmount;
        // Use Decimal operations if needed, or convert to numbers/strings if simpler
        const unitPrice = qty > 0 
          ? (typeof lineTotal === "object" && "toNumber" in lineTotal
              ? lineTotal.toNumber() / qty 
              : Number(lineTotal) / qty
            )
          : 0;

             // parsed snapshot or null
    const snapshotRaw = line.merchandiseSnapshot ?? null;
    // selected options part
    let selectedOpts: any = null;
    if (
      snapshotRaw &&
      typeof snapshotRaw === "object" &&
      !Array.isArray(snapshotRaw) &&
      "selectedOptions" in snapshotRaw
    ) {
      selectedOpts = (snapshotRaw as any).selectedOptions;
    }

        return {
          productId: line.variant?.productId ?? "",  // or error / omit if missing
          variantId: line.variantId ?? undefined,
          productTitle: line.variant?.product?.title ?? "",
          variantTitle: line.variant?.title ?? "",
          quantity: qty,
          unitPriceAmount: unitPrice,  // number
          unitPriceCurrency: line.variant?.priceCurrency ?? "KES",
          lineTotalAmount: typeof lineTotal === "object" && "toNumber" in lineTotal 
            ? lineTotal.toNumber() 
            : Number(lineTotal),
          lineTotalCurrency: line.currency,
        merchandiseSnapshot: snapshotRaw !== null
  ? (snapshotRaw as Prisma.InputJsonValue)
  : Prisma.JsonNull,
selectedOptions: selectedOpts != null
  ? (selectedOpts as Prisma.InputJsonValue)
  : Prisma.JsonNull,
        };
      }),
    },
  },
  include: {
    shippingAddress: true,
    items: true,
  },
});

    // MPESA payment initiation
    const amountNumber = parseFloat(cart.totalAmount!.toString());
    if (isNaN(amountNumber) || amountNumber <= 0) {
      return NextResponse.json(
        { success: false, message: "Cart total amount invalid" },
        { status: 400, headers: corsHeaders }
      );
    }

    const mpesaResult = await MpesaPay(Number(mpesaNumber), amountNumber, [order.id]);

    const successUrl = `${process.env.FRONTEND_STORE_URL}/checkout/success?orderId=${order.id}`;
    return NextResponse.json(
      { success: true, message: "Checkout initiated", redirectUrl: successUrl, mpesaResult },
      { status: 200, headers: corsHeaders }
    );
  } catch (error) {
    console.error("Checkout route error:", error);
    const cancelUrl = `${process.env.FRONTEND_STORE_URL}/checkout/failure?cartId=${cartId}`;
    return NextResponse.json(
      { success: false, message: "Checkout failed", redirectUrl: cancelUrl },
      { status: 500, headers: corsHeaders }
    );
  }
}
