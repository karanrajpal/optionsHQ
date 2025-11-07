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
};

interface StockPriceChartProps {
    data: StockPricePoint[];
    color?: string;
}

// Format date as 'Mon YYYY' (e.g., 'Nov 2025') without external libraries
const formatMonthYear = (dateString: string) => {
    const months = [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
    ];
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return `${months[d.getMonth()]} ${d.getFullYear()}`;
};

export default function StockPriceChart({ data, color = '#2563eb' }: StockPriceChartProps) {
    return (
        <ChartContainer config={{ price: { color } }}>
            <LineChart data={data} margin={{ top: 16, right: 24, left: 0, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                    dataKey="date"
                    tick={{ fontSize: 12 }}
                    tickFormatter={formatMonthYear}
                />
                <YAxis tick={{ fontSize: 12 }} domain={['auto', 'auto']} />
                <Tooltip
                    formatter={(value: number, name: string) => [`$${value.toFixed(2)}`, 'Price']}
                    labelFormatter={(label: string) => formatMonthYear(label)}
                    contentStyle={{
                        backgroundColor: '#1f2937', // Dark background for dark mode
                        border: 'none',
                        borderRadius: '8px',
                        color: '#f9fafb', // Light text for dark mode
                    }}
                    itemStyle={{ color }} // Use the line color for the tooltip label
                />
                <Line type="monotone" dataKey="price" stroke={color} dot={false} strokeWidth={2} />
            </LineChart>
        </ChartContainer>
    );
}
