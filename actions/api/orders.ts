// app/actions/orders.ts
"use server";

import prisma from "@/lib/prisma";

/* ---------- types (unchanged) ---------- */
export type OrderItemLite = {
  id: string;
  productTitle?: string | null;
  variantTitle?: string | null;
  sku?: string | null;
  quantity: number;
  unitPriceAmount: number;
  lineTotalAmount: number;
  image: string; // url fallback /1.webp
};

export type OrderLite = {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  totalAmount: number;
  totalQuantity: number;
  createdAt: string;
  placedAt?: string | null;
  shippingAddress?: {
    id: string;
    fullName?: string | null;
    phone?: string | null;
    county?: string | null;
    town?: string | null;
  } | null;
  items: OrderItemLite[];
};

/* ---------- helpers ---------- */
function toNumber(value: any): number {
  if (value == null) return 0;
  if (typeof value === "object" && typeof value.toNumber === "function") {
    try {
      return Number(value.toNumber());
    } catch {
      return Number(String(value));
    }
  }
  return Number(value);
}

/**
 * Safely extract `title` from a Prisma Json / merchandiseSnapshot.
 * The snapshot can be string | number | boolean | JsonObject | JsonArray.
 */
function getSnapshotTitle(snapshot: any): string | null {
  if (!snapshot) return null;

  // If snapshot is already an object and has title
  if (typeof snapshot === "object" && !Array.isArray(snapshot)) {
    // use 'in' check to satisfy TS and avoid direct property access on union types
    if ("title" in snapshot && snapshot.title != null) {
      try {
        return String((snapshot as any).title);
      } catch {
        return null;
      }
    }

    // Some snapshots are nested { product: { title: "..." } }
    if ("product" in snapshot && snapshot.product && typeof snapshot.product === "object") {
      if ("title" in snapshot.product && snapshot.product.title != null) {
        return String((snapshot.product as any).title);
      }
    }
  }

  // If snapshot is a string that contains JSON, try parsing it
  if (typeof snapshot === "string") {
    try {
      const parsed = JSON.parse(snapshot);
      if (parsed && typeof parsed === "object") {
        if ("title" in parsed && parsed.title != null) return String((parsed as any).title);
        if ("product" in parsed && parsed.product?.title != null) return String(parsed.product.title);
      }
    } catch {
      // not JSON — ignore
    }
  }

  return null;
}

/* ---------- dummy data & main functions (mapping parts) ---------- */

/* (keep your DUMMY_ORDERS etc.) -- omitted here for brevity, assume unchanged */

/* Example mapping inside getOrdersByUser / getOrderById */
export async function getOrdersByUser(userId?: string): Promise<OrderLite[]> {
  // ... (dummy fallback omitted)
  const orders = await prisma.order.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: {
      items: {
        orderBy: { createdAt: "asc" },
        include: {
          variant: {
            include: {
              product: {
                include: { featuredImage: true },
              },
            },
          },
        },
      },
      shippingAddress: true,
    },
  });

  return orders.map((o) => {
    const items: OrderItemLite[] =
      (o.items || []).map((it) => {
        // featured image from variant->product if available
        const image =
          it.variant?.product?.featuredImage?.url ??
          // merchandiseSnapshot might be an object/string — use helper
          getSnapshotTitle(it.merchandiseSnapshot) ? "/1.webp" : "/1.webp";

        // productTitle resolution (prefer productTitle column, fallback to snapshot title)
        const productTitle =
          it.productTitle ?? getSnapshotTitle(it.merchandiseSnapshot) ?? null;

        return {
          id: it.id,
          productTitle,
          variantTitle: it.variantTitle ?? null,
          sku: it.sku ?? null,
          quantity: it.quantity,
          unitPriceAmount: toNumber(it.unitPriceAmount),
          lineTotalAmount: toNumber(it.lineTotalAmount),
          image,
        };
      }) || [];

    return {
      id: o.id,
      orderNumber: o.orderNumber,
      status: String(o.status),
      paymentStatus: String(o.paymentStatus),
      totalAmount: toNumber(o.totalAmount),
      totalQuantity: o.totalQuantity ?? items.reduce((s, it) => s + (it.quantity ?? 0), 0),
      createdAt: o.createdAt ? o.createdAt.toISOString() : new Date().toISOString(),
      placedAt: o.placedAt ? o.placedAt.toISOString() : null,
      shippingAddress: o.shippingAddress
        ? {
            id: o.shippingAddress.id,
            fullName: o.shippingAddress.fullName,
            phone: o.shippingAddress.phone,
            county: o.shippingAddress.county,
            town: o.shippingAddress.town,
          }
        : null,
      items,
    };
  });
}


export type OrderDetail = OrderLite & {
  notes?: any;
  metadata?: any;
  payments: {
    id: string;
    provider: string;
    providerPaymentId?: string | null;
    method?: string | null;
    amount: number;
    currency: string;
    status: string;
    createdAt: string;
  }[];
  shipments: {
    id: string;
    carrier?: string | null;
    trackingNumber?: string | null;
    status?: string | null;
    shippedAt?: string | null;
    deliveredAt?: string | null;
  }[];
};

export async function getOrderById(orderId: string, userId?: string): Promise<OrderDetail | null> {
  if (!orderId) return null;

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: {
        include: {
          variant: {
            include: {
              product: {
                include: { featuredImage: true },
              },
            },
          },
        },
      },
      shippingAddress: true,
      payments: true,
      shipments: true,
    },
  });

  if (!order) return null;
  if (userId && order.userId && order.userId !== userId) return null;

  const items = (order.items || []).map((it) => {
    const image = it.variant?.product?.featuredImage?.url ?? "/1.webp";
    const productTitle = it.productTitle ?? getSnapshotTitle(it.merchandiseSnapshot) ?? null;

    return {
      id: it.id,
      productTitle,
      variantTitle: it.variantTitle ?? null,
      sku: it.sku ?? null,
      quantity: it.quantity,
      unitPriceAmount: toNumber(it.unitPriceAmount),
      lineTotalAmount: toNumber(it.lineTotalAmount),
      image,
    } as OrderItemLite;
  });

  const payments =
    (order.payments || []).map((p) => ({
      id: p.id,
      provider: p.provider,
      providerPaymentId: p.providerPaymentId ?? null,
      method: p.method ?? null,
      amount: toNumber(p.amount),
      currency: p.currency,
      status: String(p.status),
      createdAt: p.createdAt ? p.createdAt.toISOString() : new Date().toISOString(),
    })) || [];

  const shipments =
    (order.shipments || []).map((s) => ({
      id: s.id,
      carrier: s.carrier ?? null,
      trackingNumber: s.trackingNumber ?? null,
      status: s.status ?? null,
      shippedAt: s.shippedAt ? s.shippedAt.toISOString() : null,
      deliveredAt: s.deliveredAt ? s.deliveredAt.toISOString() : null,
    })) || [];

  const detail: OrderDetail = {
    id: order.id,
    orderNumber: order.orderNumber,
    status: String(order.status),
    paymentStatus: String(order.paymentStatus),
    totalAmount: toNumber(order.totalAmount),
    totalQuantity:
      order.totalQuantity ?? items.reduce((s, it) => s + (it.quantity ?? 0), 0),
    createdAt: order.createdAt ? order.createdAt.toISOString() : new Date().toISOString(),
    placedAt: order.placedAt ? order.placedAt.toISOString() : null,
    shippingAddress: order.shippingAddress
      ? {
          id: order.shippingAddress.id,
          fullName: order.shippingAddress.fullName,
          phone: order.shippingAddress.phone,
          county: order.shippingAddress.county,
          town: order.shippingAddress.town,
        }
      : null,
    items,
    notes: order.notes ?? null,
    metadata: order.metadata ?? null,
    payments,
    shipments,
  };

  return detail;
}