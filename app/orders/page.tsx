import OrdersClient, { Order } from "@/components/OrdersClient";
import { getOrdersByUser } from "@/actions/api/orders";
import { currentUser } from "@/lib/auth";
import Link from "next/link";
import Footer from "@/components/layout/footer";

export default async function OrdersPage() {
  const user = await currentUser();

  
  if (!user) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "70vh",
          textAlign: "center",
          padding: 20,
        }}
      >
        <h2 style={{ fontSize: 24, fontWeight: 600, marginBottom: 12 }}>
          Please log in to see your orders
        </h2>
        <p style={{ fontSize: 16, color: "#6B7280", marginBottom: 20 }}>
          You need to be logged in to view your orders.
        </p>
        <Link
          href="/dashboard/login"
          style={{
            padding: "10px 20px",
            backgroundColor: "#1A7431",
            color: "#fff",
            borderRadius: 8,
            fontWeight: 600,
            textDecoration: "none",
          }}
        >
          Log In
        </Link>
      </div>
    );
  }

  
  const ordersData = await getOrdersByUser(user.id);

  const orders: Order[] = ordersData.map((o) => ({
    id: o.id,
    createdAt: o.createdAt,
    totalAmount: o.totalAmount,
    status: String(o.status).toUpperCase() === "DELIVERED" ? "past" : "active",
    items: (o.items || []).map((it) => ({
      productTitle: it.productTitle ?? "Product",
      variantTitle: it.variantTitle ?? "",
      quantity: it.quantity,
      lineTotalAmount: it.lineTotalAmount,
      image: it.image ?? "/1.webp",
    })),
  }));

  return (
  <>
    <OrdersClient orders={orders} />
    <Footer />
  </>
);
}
