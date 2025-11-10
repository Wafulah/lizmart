"use client";

import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { useEffect, useState } from "react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";

const chartConfig = {
    carts: {
        label: "Carts",
        color: "var(--chart-1)",
    },
    orders: {
        label: "Orders",
        color: "var(--chart-2)",
    },
} satisfies ChartConfig;

const CartVsOrdersChart = () => {
    const [data, setData] = useState<any[]>([]);

    useEffect(() => {
        (async () => {
            
            const res = await fetch("/api/admin/metrics/cart-vs-orders"); 
            
            const json = await res.json();
            setData(json);
        })();
    }, []);

    return (
        <div>
           
            <h1 className="text-lg font-medium mb-6">Carts vs Orders (Monthly)</h1>
            <ChartContainer config={chartConfig} className="min-h-[250px] w-full">
                <AreaChart data={data}>
                    <CartesianGrid vertical={false} />
                    
                    <XAxis dataKey="month" tickLine={false} axisLine={false} /> 
                    <YAxis tickLine={false} axisLine={false} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <ChartLegend content={<ChartLegendContent />} />

                    <defs>
                        <linearGradient id="fillCarts" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="var(--chart-1)" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="var(--chart-1)" stopOpacity={0.1} />
                        </linearGradient>
                        <linearGradient id="fillOrders" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="var(--chart-2)" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="var(--chart-2)" stopOpacity={0.1} />
                        </linearGradient>
                    </defs>

                    <Area
                        dataKey="carts"
                        type="natural"
                        fill="url(#fillCarts)"
                        stroke="var(--chart-1)"
                        stackId="a"
                    />
                    <Area
                        dataKey="orders"
                        type="natural"
                        fill="url(#fillOrders)"
                        stroke="var(--chart-2)"
                        stackId="a"
                    />
                </AreaChart>
            </ChartContainer>
        </div>
    );
};

export default CartVsOrdersChart;