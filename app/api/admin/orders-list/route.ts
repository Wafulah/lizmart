// app/api/orders/route.ts
import { getOrdersByDate } from "@/actions/getUndeliveredOrders"; // your server helper
import { NextResponse } from "next/server";

export const runtime = 'nodejs';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const dateParam = url.searchParams.get("date"); 
    const date = dateParam ? new Date(dateParam) : undefined;

    const orders = await getOrdersByDate(date);
    return NextResponse.json(orders);
  } catch (err) {
    console.error("GET /api/orders error:", err);
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}
