"use client";
import { ChartContainer } from '@/components/ui/chart';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import React from 'react';

export interface StockPricePoint {
  date: string; // e.g. '2025-11-06'
  price: number;
}

interface StockPriceChartProps {
  data: StockPricePoint[];
  color?: string;
}

export default function StockPriceChart({ data, color = '#2563eb' }: StockPriceChartProps) {
  return (
    <ChartContainer config={{ price: { color } }}>
      <LineChart data={data} margin={{ top: 16, right: 24, left: 0, bottom: 8 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 12 }} domain={['auto', 'auto']} />
        <Tooltip />
        <Line type="monotone" dataKey="price" stroke={color} dot={false} strokeWidth={2} />
      </LineChart>
    </ChartContainer>
  );
}
