/**
 * Path: src/app/api/stock/news/route.ts
 */
import { NextRequest, NextResponse } from 'next/server';
import { createAlpacaStocksService } from '@/lib/alpaca';

export async function POST(req: NextRequest) {
    const { tickers } = await req.json();
    if (!tickers || !Array.isArray(tickers) || tickers.length === 0) {
        return NextResponse.json({ error: 'Tickers are required' }, { status: 400 });
    }
    const stocksService = createAlpacaStocksService();
    try {
        const news = await stocksService.getNews(tickers, { limit: 50 });
        return NextResponse.json(news);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch news' }, { status: 500 });
    }
}
