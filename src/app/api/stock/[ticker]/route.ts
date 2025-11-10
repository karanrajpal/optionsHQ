import { NextRequest, NextResponse } from 'next/server';
import { AlpacaCompositeService } from '@/lib/alpaca/composite-service';

/**
 * 
 * @returns StockInfo type containing snapshot, asset, and historical bars
 */
export async function GET(req: NextRequest, ctx: RouteContext<'/api/stock/[ticker]'>) {
    const { ticker } = await ctx.params;
    if (!ticker) {
        return NextResponse.json({ error: 'Ticker is required' }, { status: 400 });
    }
    const alpacaCompositeService = new AlpacaCompositeService();
    try {
        const stockInfo = await alpacaCompositeService.getStockInfo(ticker);
        return NextResponse.json(stockInfo);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch stock info' }, { status: 500 });
    }
}
