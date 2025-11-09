"use client";

import { useEffect, useState } from 'react';
import type { StockInfo } from '@/lib/alpaca/types';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { TickerPriceItem } from '@/components/StockCard';
import { Skeleton } from '@/components/ui/skeleton';
import { AlpacaNews } from '@alpacahq/alpaca-trade-api/dist/resources/datav2/entityv2';
import { useParams } from 'next/navigation';
import { decodeHtmlEntities } from '@/lib/formatters';

const StockPriceChart = dynamic(() => import('@/components/StockPriceChart'), { ssr: false });

export default function StockPage() {
    const { ticker } = useParams<{ ticker: string }>();
    const [stockInfo, setStockInfo] = useState<StockInfo | null>(null);
    const [loading, setLoading] = useState(true);
    const [stockInfoError, setStockInfoError] = useState('');
    const [news, setNews] = useState<AlpacaNews[]>([]);
    const [newsLoading, setNewsLoading] = useState(true);
    const [newsError, setNewsError] = useState('');

    useEffect(() => {
        async function fetchStockInfo() {
            setLoading(true);
            try {
                const res = await fetch(`/api/stock/${ticker}`);
                if (!res.ok) {
                    setStockInfo(null);
                    setStockInfoError('Failed to fetch stock information');
                } else {
                    const data = await res.json();
                    setStockInfo(data);
                }
            } catch {
                setStockInfo(null);
                setStockInfoError('Failed to fetch stock information');
            } finally {
                setLoading(false);
            }
        }
        async function fetchNews() {
            setNewsLoading(true);
            try {
                const res = await fetch(`/api/stock/news`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ tickers: [ticker] }),
                });
                if (res.ok) {
                    const data = await res.json();
                    setNews(data);
                } else {
                    setNews([]);
                    setNewsError('Failed to fetch news');
                }
            } catch {
                setNews([]);
                setNewsError('Failed to fetch news');
            } finally {
                setNewsLoading(false);
            }
        }
        fetchStockInfo();
        fetchNews();
    }, [ticker]);

    if (loading) {
        return (
            <div className="flex flex-col items-center mt-16 w-full max-w-2xl mx-auto">
                <div className="flex items-center gap-4">
                    <Skeleton className="w-16 h-16 rounded-full bg-white" />
                    <div className="flex flex-col items-start flex-1">
                        <Skeleton className="h-8 w-48 mb-2" />
                        <Skeleton className="h-5 w-24" />
                    </div>
                </div>
                <div className="mt-4 w-full max-w-xs">
                    <Skeleton className="h-8 w-full" />
                </div>
                <div className="w-full mt-8">
                    <Skeleton className="h-64 w-full" />
                </div>
                <div className="mt-8 w-full">
                    <Skeleton className="h-8 w-2/3 mx-auto" />
                </div>
            </div>
        );
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
                    <div className="text-muted-foreground text-sm">{asset.symbol} | {asset.exchange}</div>
                </div>
            </div>
            <div>
                <TickerPriceItem
                    latestPrice={snapshot.DailyBar?.ClosePrice}
                    changePrice={snapshot.PrevDailyBar ? snapshot.DailyBar!.ClosePrice - snapshot.PrevDailyBar.ClosePrice : 0}
                    changePercent={snapshot.PrevDailyBar ? ((snapshot.DailyBar!.ClosePrice - snapshot.PrevDailyBar.ClosePrice) / snapshot.PrevDailyBar.ClosePrice) * 100 : 0}
                />
            </div>
            <div className="mt-8 text-xl text-center">
                {companyName} is a great company
            </div>
            {stockInfoError ? (
                <div className="text-red-500">{stockInfoError}</div>
            ) : (
                <div className="w-full mt-8">
                    <StockPriceChart data={mockChartData} />
                </div>
            )}
            <div className="w-full mt-8 p-1">
                <h2 className="text-2xl font-bold mb-4">Latest News</h2>
                {newsError ? (
                    <div className="text-red-500">{newsError}</div>
                ) : newsLoading ? (
                    <Skeleton className="h-48 w-full" />
                ) : news.length === 0 ? (
                    <div>No news available.</div>
                ) : (
                    <ul className="space-y-4">
                        {news.map((article) => (
                            <li key={article.ID} className="border-b pb-4">
                                <a href={article.URL} target="_blank" rel="noopener noreferrer" className="text-lg font-semibold text-blue-600 hover:underline">
                                    {article.Headline}
                                </a>
                                <p className="text-gray-600 mt-1">{decodeHtmlEntities(article.Summary)}</p>
                                <span className="text-sm text-gray-400">{new Date(article.UpdatedAt).toLocaleDateString()}</span>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}
