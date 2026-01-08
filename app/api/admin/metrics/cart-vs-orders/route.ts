import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = 'nodejs';

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

type MonthKey = `${number}-${string}`; // "YYYY-MM"
type ChartRow = { month: string; carts: number; orders: number };

function keyFromDate(d: Date | string): MonthKey {
  const date = new Date(d);
  if (Number.isNaN(date.getTime())) {
    throw new Error("Invalid date provided to keyFromDate");
  }
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0"); // 01..12
  return `${year}-${month}` as MonthKey;
}

function labelFromKey(key: string): string {
  const parts = key.split("-");
  if (parts.length !== 2) return key;
  const year = parts[0];
  const monthNum = Number(parts[1]);
  if (Number.isNaN(monthNum) || monthNum < 1 || monthNum > 12) return key;
  const mi = Math.max(0, Math.min(11, monthNum - 1));
  return `${MONTHS[mi]} ${String(year).slice(2)}`; // "Jan 23"
}

/**
 * Builds an inclusive range of month keys from startKey to endKey.
 * startKey/endKey must be "YYYY-MM".
 */
function monthRange(startKey: string, endKey: string): MonthKey[] {
  const [syStr = "", smStr = ""] = startKey.split("-");
  const [eyStr = "", emStr = ""] = endKey.split("-");

  const sy = parseInt(syStr, 10);
  const sm = parseInt(smStr, 10);
  const ey = parseInt(eyStr, 10);
  const em = parseInt(emStr, 10);

  if ([sy, sm, ey, em].some((n) => Number.isNaN(n))) {
    throw new Error(`Invalid month key(s): ${startKey} or ${endKey}`);
  }

  let curY = sy;
  let curM = sm;
  const out: MonthKey[] = [];

  while (curY < ey || (curY === ey && curM <= em)) {
    out.push(`${curY}-${String(curM).padStart(2, "0")}` as MonthKey);
    curM++;
    if (curM > 12) {
      curM = 1;
      curY++;
    }
  }

  return out;
}

export async function GET() {
  try {
    // Explicitly type the returned shape to avoid TS widening to `any`
    const carts = (await prisma.cart.findMany({
      select: { createdAt: true },
    })) as { createdAt: Date }[];

    const orders = (await prisma.order.findMany({
      select: { createdAt: true },
    })) as { createdAt: Date }[];

    // If there are no records, return an empty array (consumer should handle it)
    if (carts.length === 0 && orders.length === 0) {
      return NextResponse.json<ChartRow[]>([]);
    }

    // Collect timestamps safely
    const allTimestamps: number[] = [
      ...carts.map((c) => new Date(c.createdAt).getTime()),
      ...orders.map((o) => new Date(o.createdAt).getTime()),
    ].filter((ts) => !Number.isNaN(ts));

    if (allTimestamps.length === 0) {
      return NextResponse.json<ChartRow[]>([]);
    }

    const minTs = Math.min(...allTimestamps);
    const maxTs = Math.max(...allTimestamps);
    const minDate = new Date(minTs);
    const maxDate = new Date(maxTs);

    const minKey = `${minDate.getFullYear()}-${String(minDate.getMonth() + 1).padStart(2, "0")}`;
    const maxKey = `${maxDate.getFullYear()}-${String(maxDate.getMonth() + 1).padStart(2, "0")}`;

    const months = monthRange(minKey, maxKey);

    // initialize map
    const dataMap = new Map<string, ChartRow>();
    months.forEach((k) => dataMap.set(k, { month: labelFromKey(k), carts: 0, orders: 0 }));

    // populate counts
    carts.forEach((c) => {
      const k = keyFromDate(c.createdAt);
      const entry = dataMap.get(k);
      if (entry) entry.carts++;
    });

    orders.forEach((o) => {
      const k = keyFromDate(o.createdAt);
      const entry = dataMap.get(k);
      if (entry) entry.orders++;
    });

    // Build final array (chronological)
    const chartData: ChartRow[] = months.map((k) => {
      const v = dataMap.get(k);
      // map was populated for all months, but guard just in case
      if (!v) return { month: labelFromKey(k), carts: 0, orders: 0 };
      return v;
    });

    return NextResponse.json(chartData);
  } catch (error) {
    console.error("metrics error:", error);
    return NextResponse.json({ error: "Failed to load monthly metrics" }, { status: 500 });
  }
}
