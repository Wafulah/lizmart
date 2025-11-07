// app/orders/client-orders.tsx
"use client";

import { ArrowLeft, ShoppingCart } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

const COLORS = {
  primary: "#1A7431",
  textMuted: "#6B7280",
  borderGray: "#E5E7EB",
  background: "#FFFFFF",
  bgLight: "#F9FAFB",
  textDark: "#111827",
};

type OrderItem = { name: string; quantity: number; price: number };
type Order = {
  id: string;
  restaurant: string;
  items: OrderItem[];
  orderDate: string;
  total: number;
  status: "active" | "past";
};

export default function OrdersClient({ userId }: { userId?: string | null }) {
  const [activeTab, setActiveTab] = useState<"active" | "past">("active");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // coerce to string early to satisfy TypeScript and keep logic clear
    const uid = userId ?? "";

    // if no user, don't fetch; optionally show a message prompting login
    if (!uid) {
      setOrders([]);
      setLoading(false);
      setError(null);
      return;
    }

    const abort = new AbortController();
    async function load() {
      setLoading(true);
      setError(null);
      try {
        // ensure uid is a string and encoded safely
        const url = `/api/orders?userId=${encodeURIComponent(String(uid))}`;
        const res = await fetch(url, {
          signal: abort.signal,
        });

        if (!res.ok) {
          const j = await res.json().catch(() => ({}));
          throw new Error(j?.message ?? `Failed to fetch orders (${res.status})`);
        }

        const json = await res.json();
        const remoteOrders = json.orders ?? [];

        // Map server OrderLite -> UI Order shape
        const mapped: Order[] = remoteOrders.map((o: any) => {
          const firstItem = o.items?.[0];
          // determine past/active from status (DELIVERED => past)
          const status =
            String(o.status ?? "").toUpperCase() === "DELIVERED" ? "past" : "active";

          return {
            id: o.id,
            restaurant: firstItem?.productTitle ?? "Order",
            items:
              (o.items ?? []).map((it: any) => ({
                name: it.productTitle ?? "Product",
                quantity: Number(it.quantity ?? 1),
                price: Number(it.lineTotalAmount ?? 0),
              })) ?? [],
            orderDate: o.createdAt ? new Date(o.createdAt).toLocaleDateString() : "",
            total: Number(o.totalAmount ?? 0),
            status,
          };
        });

        setOrders(mapped);
      } catch (err: any) {
        if (err.name === "AbortError") return;
        console.error("Orders load error:", err);
        setError(err?.message ?? "Failed to load orders");
      } finally {
        setLoading(false);
      }
    }

    load();
    return () => abort.abort();
  }, [userId]);

  const activeOrders = orders.filter((o) => o.status === "active");
  const pastOrders = orders.filter((o) => o.status === "past");

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
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Header />

        <TabBar activeTab={activeTab} setActiveTab={setActiveTab} />

        <div style={{ overflowY: "auto", flexGrow: 1, background: COLORS.background, padding: 16 }}>
          {loading && <div style={{ padding: 16 }}>Loading orders...</div>}
          {error && <div style={{ padding: 16, color: "red" }}>{error}</div>}

          {activeTab === "active" && <ActiveOrders orders={activeOrders} />}
          {activeTab === "past" && <PastOrders orders={pastOrders} />}
        </div>
      </div>
    </div>
  );
}

function Header() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        padding: "16px 20px",
        borderBottom: `1px solid ${COLORS.borderGray}`,
        background: COLORS.background,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <ArrowLeft size={20} color={COLORS.textDark} />
        <h1 style={{ margin: 0, fontSize: 20, fontWeight: 600, color: COLORS.textDark }}>My Orders</h1>
      </div>
      <div style={{ flex: 1 }} />
    </div>
  );
}

function TabBar({
  activeTab,
  setActiveTab,
}: {
  activeTab: "active" | "past";
  setActiveTab: (tab: "active" | "past") => void;
}) {
  return (
    <div
      style={{
        display: "flex",
        gap: 24,
        padding: "12px 20px",
        borderBottom: `1px solid ${COLORS.borderGray}`,
        background: COLORS.background,
      }}
    >
      {(["active", "past"] as const).map((tab) => (
        <button
          key={tab}
          onClick={() => setActiveTab(tab)}
          style={{
            paddingBottom: 8,
            paddingTop: 8,
            borderBottom:
              activeTab === tab ? `3px solid ${COLORS.primary}` : "3px solid transparent",
            fontWeight: activeTab === tab ? 700 : 500,
            color: activeTab === tab ? COLORS.primary : COLORS.textMuted,
            background: "transparent",
            cursor: "pointer",
          }}
        >
          {tab === "active" ? "Active Orders" : "Past Orders"}
        </button>
      ))}
    </div>
  );
}

function ActiveOrders({ orders }: { orders: Order[] }) {
  if (!orders.length)
    return (
      <div style={{ padding: 24 }}>
        <div
          style={{
            background: "rgba(255,198,0,0.04)",
            padding: 28,
            borderRadius: 12,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 12,
          }}
        >
          <ShoppingCart size={48} strokeWidth={1} color={COLORS.primary} />
          <p style={{ color: COLORS.textMuted, fontWeight: 500, textAlign: "center" }}>
            You have no active orders.
          </p>
        </div>
      </div>
    );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {orders.map((order) => (
        <OrderCard key={order.id} order={order} />
      ))}
    </div>
  );
}

function PastOrders({ orders }: { orders: Order[] }) {
  if (!orders.length) return <div style={{ padding: 24 }}>No past orders.</div>;
  return (
    <div style={{ display: "grid", gap: 12 }}>
      {orders.map((order) => (
        <OrderCard key={order.id} order={order} />
      ))}
    </div>
  );
}

function OrderCard({ order }: { order: Order }) {
  return (
    <div
      style={{
        display: "flex",
        gap: 16,
        padding: 16,
        borderRadius: 12,
        background: COLORS.background,
        border: `1px solid ${COLORS.borderGray}`,
        alignItems: "flex-start",
      }}
    >
      <div
        style={{
          width: 96,
          height: 96,
          borderRadius: 8,
          background: "#F3F4F6",
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: COLORS.textMuted,
          fontSize: 12,
        }}
      >
        <img
          src="/1.webp"
          alt={order.items[0]?.name}
          style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 8 }}
        />
      </div>

      <div style={{ flex: 1 }}>
        <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: COLORS.textDark }}>
          {order.restaurant}
        </h3>
        <p style={{ margin: "8px 0 0 0", color: COLORS.textMuted, fontSize: 14 }}>
          {order?.items[0]?.quantity}x {order?.items[0]?.name}
        </p>

        <div style={{ marginTop: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <p style={{ margin: 0, color: COLORS.primary, fontWeight: 800, fontSize: 16 }}>
              KSh {order.total.toFixed(2)}
            </p>
            <p style={{ margin: "4px 0 0 0", color: COLORS.textMuted, fontSize: 12 }}>
              Order date: {order.orderDate}
            </p>
          </div>

          <div>
            <Link
              href={`/orders/${order.id}`}
              style={{
                padding: "8px 14px",
                borderRadius: 8,
                background: "transparent",
                color: COLORS.primary,
                fontWeight: 700,
                border: `1px solid ${COLORS.primary}`,
                textDecoration: "none",
              }}
            >
              View details
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
