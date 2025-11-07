import { NextRequest, NextResponse } from 'next/server';
import { createAlpacaStocksService } from '@/lib/alpaca';
import type { StockInfo } from '@/lib/alpaca/types';

export async function GET(req: NextRequest, ctx: RouteContext<'/api/stock/[ticker]'>) {
    const { ticker } = await ctx.params;
    if (!ticker) {
        return NextResponse.json({ error: 'Ticker is required' }, { status: 400 });
    }
    const stocksService = createAlpacaStocksService();
    try {
        const snapshot = await stocksService.getSnapshot(ticker);
        const asset = await stocksService.getAsset(ticker);
        const historicalBars = await stocksService.getBars(ticker, '1Day', '2023-01-01', new Date().toISOString());
        const stockInfo: StockInfo = { snapshot, asset, historicalBars };
        return NextResponse.json(stockInfo);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch stock info' }, { status: 500 });
    }
}
