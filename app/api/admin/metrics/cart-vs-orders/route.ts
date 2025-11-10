import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Helper array for formatting month names
const MONTHS = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

export async function GET() {
    try {
        const carts = await prisma.cart.findMany({
            select: { createdAt: true },
        });

        const orders = await prisma.order.findMany({
            select: { createdAt: true },
        });

      
        const getDateInfo = (date: Date) => {
            const d = new Date(date);
            const year = d.getFullYear();
            // Month is 0-indexed, so we format it with padding (e.g., 01, 10)
            const monthIndex = d.getMonth();
            const monthPadded = String(monthIndex + 1).padStart(2, '0');
            
            // Key for sorting: 2023-01
            const key = `${year}-${monthPadded}`;
            // Label for the chart: Jan 23
            const label = `${MONTHS[monthIndex]} ${String(year).slice(2)}`;

            return { key, label };
        };

        // 1. Combine all unique month/year keys (e.g., "2023-01", "2023-02")
        const allKeys = new Set<string>();
        carts.forEach(c => allKeys.add(getDateInfo(c.createdAt).key));
        orders.forEach(o => allKeys.add(getDateInfo(o.createdAt).key));

        // 2. Initialize chart data object
        const dataMap = new Map<string, { month: string, carts: number, orders: number }>();
        
        // Initialize all unique month keys with zero counts and their label
        Array.from(allKeys).sort().forEach(key => {
            const dateInfo = getDateInfo(new Date(key)); // Create date from key for labeling
             dataMap.set(key, { 
                month: dateInfo.label, 
                carts: 0, 
                orders: 0 
            });
        });

        // 3. Count carts by month
        carts.forEach(c => {
            const { key } = getDateInfo(c.createdAt);
            const entry = dataMap.get(key);
            if (entry) {
                entry.carts++;
            }
        });

        // 4. Count orders by month
        orders.forEach(o => {
            const { key } = getDateInfo(o.createdAt);
            const entry = dataMap.get(key);
            if (entry) {
                entry.orders++;
            }
        });

        // 5. Convert map values to array and sort by key (chronological order)
        const sortedKeys = Array.from(dataMap.keys()).sort();
        const chartData = sortedKeys.map(key => dataMap.get(key)!);
        
        return NextResponse.json(chartData);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Failed to load monthly metrics" }, { status: 500 });
    }
}