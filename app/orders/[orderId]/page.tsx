// app/orders/[orderId]/page.tsx
import React from "react";
import Link from "next/link";
import { ArrowLeft, Clock, MapPin, CreditCard, Truck } from "lucide-react";
import { getOrderById } from "@/actions/api/orders";
import { notFound } from "next/navigation";

const COLORS = {
  primary: "#1A7431",
  secondary: "#FFC600",
  accent: "#653100",
  background: "#FFFFFF",
  textDark: "#111827",
  textMuted: "#6B7280",
  borderGray: "#E5E7EB",
  bgLight: "#F9FAFB",
};

function numberToFixedSafe(n?: number | null, digits = 2) {
  if (n == null || Number.isNaN(Number(n))) return "0.00";
  return Number(n).toFixed(digits);
}

export default async function OrderDetailsPage({
  params,
}: {
  params: { orderId: string };
}) {
  const { orderId } = params;

  // fetch using your server action
  const order = await getOrderById(orderId);

  if (!order) return notFound();

  
  const items = order.items ?? [];
  const firstItem = items[0] ?? null;

  return (
    <div style={{ background: COLORS.bgLight, minHeight: "100vh", padding: "40px 20px" }}>
      <div
        style={{
          width: "100%",
          maxWidth: 1100,
          margin: "0 auto",
          background: COLORS.background,
          boxShadow: "0 6px 18px rgba(16,24,40,0.06)",
          borderRadius: 12,
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "16px 20px",
            borderBottom: `1px solid ${COLORS.borderGray}`,
            background: COLORS.background,
          }}
        >
          <Link href="/orders" style={{ color: COLORS.textDark, display: "inline-flex", alignItems: "center", gap: 8 }}>
            <ArrowLeft size={20} />
            <span style={{ fontWeight: 700, color: COLORS.textDark }}>Back</span>
          </Link>

          <div style={{ marginLeft: 12 }}>
            <div style={{ color: COLORS.primary, fontWeight: 700 }}>
              Order# {order.orderNumber}
            </div>
            <div style={{ color: COLORS.textMuted, fontSize: 13 }}>
              {order.placedAt ? new Date(order.placedAt).toLocaleString() : new Date(order.createdAt).toLocaleString()}
            </div>
          </div>

          <div style={{ flex: 1 }} />

          <div style={{ color: COLORS.textMuted, fontSize: 13, textAlign: "right" }}>
            <div style={{ fontWeight: 700 }}>{order.status}</div>
            <div style={{ fontSize: 12, color: COLORS.textMuted }}>{order.paymentStatus}</div>
          </div>
        </div>

        {/* Info Row */}
        <div style={{ padding: 20, borderBottom: `1px solid ${COLORS.borderGray}`, display: "grid", gap: 12 }}>
          <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
            <Clock size={16} color={COLORS.textMuted} />
            <div>
              <div style={{ fontWeight: 600, color: COLORS.textDark }}>Order from</div>
              <div style={{ color: COLORS.textMuted }}>{firstItem?.productTitle ?? "—"}</div>
            </div>
          </div>

          <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
            <MapPin size={16} color={COLORS.textMuted} />
            <div>
              <div style={{ fontWeight: 600, color: COLORS.textDark }}>Delivery address</div>
              <div style={{ color: COLORS.textMuted }}>
                {order.shippingAddress
                  ? `${order.shippingAddress.fullName ?? ""} ${order.shippingAddress.town ?? ""} ${order.shippingAddress.county ?? ""}`
                  : "—"}
              </div>
            </div>
          </div>
        </div>

        {/* Items */}
        <div style={{ padding: 20 }}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: COLORS.textDark }}>Items</h3>

          <div style={{ marginTop: 12, display: "grid", gap: 12 }}>
            {items.length === 0 && (
              <div style={{ color: COLORS.textMuted }}>No items on this order.</div>
            )}

            {items.map((it) => (
              <div
                key={it.id}
                style={{
                  display: "flex",
                  gap: 16,
                  alignItems: "center",
                  padding: 12,
                  borderRadius: 8,
                  border: `1px solid ${COLORS.borderGray}`,
                }}
              >
                <div style={{ width: 84, height: 84, borderRadius: 8, overflow: "hidden", background: "#F3F4F6" }}>
                  <img src={it.image ?? "/1.webp"} alt={String(it.productTitle ?? "")} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, color: COLORS.textDark }}>{it.productTitle ?? "Product"}</div>
                  {it.variantTitle && <div style={{ color: COLORS.textMuted, fontSize: 13 }}>{it.variantTitle}</div>}
                  <div style={{ marginTop: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ color: COLORS.textMuted }}>Qty: {it.quantity}</div>
                    <div style={{ fontWeight: 800, color: COLORS.primary }}>KSh {numberToFixedSafe(it.lineTotalAmount)}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div style={{ marginTop: 18, borderTop: `1px dashed ${COLORS.borderGray}`, paddingTop: 12, display: "flex", justifyContent: "space-between", gap: 12 }}>
            <div style={{ color: COLORS.textMuted }}>Subtotal</div>
            <div style={{ fontWeight: 700 }}>KSh {numberToFixedSafe(items.reduce((s, it) => s + (Number(it.lineTotalAmount) || 0), 0))}</div>
          </div>

          <div style={{ marginTop: 8, display: "flex", justifyContent: "space-between", gap: 12 }}>
            <div style={{ color: COLORS.textMuted }}>Delivery</div>
            <div style={{ fontWeight: 700 }}>{order.shippingAddress ? "KSh " + numberToFixedSafe(order.shippingAddress ? 0 : 0) : "Free"}</div>
          </div>

          <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px dashed ${COLORS.borderGray}`, display: "flex", justifyContent: "space-between", fontWeight: 900 }}>
            <div>Total (incl. VAT)</div>
            <div style={{ color: COLORS.primary }}>KSh {numberToFixedSafe(order.totalAmount)}</div>
          </div>
        </div>

        {/* Payment summary */}
        <div style={{ padding: 20, borderTop: `1px solid ${COLORS.borderGray}` }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <CreditCard size={18} color={COLORS.primary} />
              <div>
                <div style={{ fontWeight: 700 }}>Paid with</div>
                <div style={{ color: COLORS.textMuted }}>{order.payments && order.payments.length ? order?.payments[0]?.provider : order.paymentStatus}</div>
              </div>
            </div>

            <div>
              <Truck size={18} color={COLORS.primary} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
