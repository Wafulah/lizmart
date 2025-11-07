
import { NextResponse } from "next/server";
import { getOrdersByUser } from "@/actions/api/orders";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const userId = url.searchParams.get("userId") ?? undefined;

    
    const orders = await getOrdersByUser(userId);

    return NextResponse.json({ success: true, orders }, { status: 200 });
  } catch (err) {
    console.error("GET /api/orders error", err);
    return NextResponse.json({ success: false, message: "Failed to fetch orders" }, { status: 500 });
  }
}
