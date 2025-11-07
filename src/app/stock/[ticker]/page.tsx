"use client";

import React, { useEffect, useState } from 'react';
import type { StockInfo } from '@/lib/alpaca/types';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { TickerPriceItem } from '@/components/StockCard';

const StockPriceChart = dynamic(() => import('@/components/StockPriceChart'), { ssr: false });

interface StockPageProps {
    params: { ticker: string };
}

export default function StockPage({ params }: StockPageProps) {
    // Next.js: params may be a Promise in future, so unwrap with React.use()
    // For now, support both direct and future usage
    // @ts-ignore
    const unwrappedParams = typeof params.then === 'function' ? React.use(params) : params;
    const { ticker } = unwrappedParams as { ticker: string };
    const [stockInfo, setStockInfo] = useState<StockInfo | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchStockInfo() {
            setLoading(true);
            try {
                const res = await fetch(`/api/stock/${ticker}`);
                if (!res.ok) {
                    setStockInfo(null);
                } else {
                    const data = await res.json();
                    setStockInfo(data);
                }
            } catch {
                setStockInfo(null);
            } finally {
                setLoading(false);
            }
        }
        fetchStockInfo();
    }, [ticker]);

    if (loading) {
        return <div className="flex flex-col items-center justify-center h-96">Loading...</div>;
    }
    if (!stockInfo) {
        return <div className="flex flex-col items-center justify-center h-96">Stock not found.</div>;
    }
    const { snapshot, historicalBars, asset } = stockInfo;
    const logoUrl = `https://raw.githubusercontent.com/nvstly/icons/refs/heads/main/ticker_icons/${ticker}.png`;
    const companyName = asset.name;

    const mockChartData = historicalBars.map(bar => ({
        date: bar.Timestamp,
        price: bar.ClosePrice,
    }));

    return (
        <div className="flex flex-col items-center mt-16 w-full max-w-2xl mx-auto">
            <div className="flex items-center gap-4">
                <Image src={logoUrl} alt={companyName} width={64} height={64} className="rounded-full bg-white" />
                <div className="flex flex-col items-start">
                    <h1 className="text-3xl font-bold">{companyName}</h1>
                    <span className="text-gray-500 text-lg mt-1">{ticker.toUpperCase()}</span>
                </div>
            </div>
            <div>
                <TickerPriceItem
                    ticker={ticker}
                    latestPrice={snapshot.LatestQuote?.AskPrice}
                    changePercent={0}
                />
            </div>
            <div className="w-full mt-8">
                <StockPriceChart data={mockChartData} />
            </div>
            <div className="mt-8 text-xl text-center">
                {companyName} is a great company
            </div>
        </div>
    );
}
