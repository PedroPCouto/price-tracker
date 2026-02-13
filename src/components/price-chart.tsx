"use client";

import { useState, useEffect } from "react";
import { RefreshCw } from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";

interface PriceHistory {
  id: string;
  price: number;
  currency: string;
  checkedAt: string;
}

interface PriceChartProps {
  productId: string;
}

export default function PriceChart({ productId }: PriceChartProps) {
  const [history, setHistory] = useState<PriceHistory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await fetch(`/api/products/${productId}/history`);
        if (!response?.ok) {
          throw new Error("Failed to fetch price history");
        }
        const data = await response.json();
        setHistory(data ?? []);
      } catch (error) {
        console.error("Error fetching price history:", error);
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      fetchHistory();
    }
  }, [productId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (history?.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Ainda não há um histórico de preços</p>
      </div>
    );
  }

  const chartData =
    history?.map?.((entry) => ({
      date:
        new Date(entry?.checkedAt ?? "")?.toLocaleDateString?.("en-US", {
          month: "short",
          day: "numeric",
        }) ?? "",
      price: entry?.price ?? 0,
    })) ?? [];

  const currency = history?.[0]?.currency ?? "BRL";

  return (
    <div className="w-full h-[400px] pt-4">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
          margin={{ top: 10, right: 30, left: 0, bottom: 20 }}
        >
          <XAxis
            dataKey="date"
            tickLine={false}
            tick={{ fontSize: 10 }}
            label={{
              value: "Data",
              position: "insideBottom",
              offset: -15,
              style: { textAnchor: "middle", fontSize: 11 },
            }}
          />
          <YAxis
            tickLine={false}
            tick={{ fontSize: 10 }}
            label={{
              value: `Preço (${currency})`,
              angle: -90,
              position: "insideLeft",
              style: { textAnchor: "middle", fontSize: 11 },
            }}
          />
          <Tooltip
            contentStyle={{ fontSize: 11 }}
            formatter={(value: any) => [
              `${currency} ${value?.toFixed?.(2) ?? "0.00"}`,
              "Preço",
            ]}
          />
          <Legend verticalAlign="top" wrapperStyle={{ fontSize: 11 }} />
          <Line
            type="monotone"
            dataKey="price"
            stroke="#60B5FF"
            strokeWidth={2}
            dot={{ fill: "#60B5FF", r: 4 }}
            activeDot={{ r: 6 }}
            name="Price"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
