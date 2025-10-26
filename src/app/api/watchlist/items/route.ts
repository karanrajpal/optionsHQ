import { OptionsDatabase } from "@/utils/neon/service";
import { createAlpacaStocksService } from "@/lib/alpaca";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    try {
        const watchlistId = request.nextUrl.searchParams.get("watchlist_id");
        const alpacaApiKey = request.headers.get("alpaca-api-key");
        const alpacaApiSecret = request.headers.get("alpaca-api-secret");

        if (!watchlistId) {
            return NextResponse.json({ error: "Watchlist ID is required" }, { status: 400 });
        }

        const db = new OptionsDatabase();
        const items = await db.getWatchlistItems(parseInt(watchlistId));

        // Enrich with Alpaca data if credentials are provided
        if (alpacaApiKey && alpacaApiSecret && items.length > 0) {
            try {
                const alpacaService = createAlpacaStocksService(alpacaApiKey, alpacaApiSecret);
                const symbols = items.map((item: any) => item.ticker_symbol);
                const snapshots = await alpacaService.getSnapshots(symbols);

                // Create a map of snapshots by symbol for quick lookup
                const snapshotMap = new Map();
                if (Array.isArray(snapshots)) {
                    snapshots.forEach((snapshot: any) => {
                        snapshotMap.set(snapshot.Symbol, snapshot);
                    });
                }

                // Enrich items with Alpaca data
                const enrichedItems = items.map((item: any) => {
                    const snapshot = snapshotMap.get(item.ticker_symbol);
                    return {
                        ...item,
                        name: null, // Will try to get from asset endpoint if needed
                        latest_price: snapshot?.LatestTrade?.Price || null,
                        latest_quote_bid: snapshot?.LatestQuote?.BidPrice || null,
                        latest_quote_ask: snapshot?.LatestQuote?.AskPrice || null,
                        prev_close: snapshot?.PrevDailyBar?.Close || null,
                        change: snapshot?.DailyBar?.Close && snapshot?.PrevDailyBar?.Close
                            ? snapshot.DailyBar.Close - snapshot.PrevDailyBar.Close
                            : null,
                        change_percent: snapshot?.DailyBar?.Close && snapshot?.PrevDailyBar?.Close
                            ? ((snapshot.DailyBar.Close - snapshot.PrevDailyBar.Close) / snapshot.PrevDailyBar.Close) * 100
                            : null,
                    };
                });

                return NextResponse.json(enrichedItems);
            } catch (alpacaError) {
                console.error("Error enriching with Alpaca data:", alpacaError);
                // Return items without enrichment if Alpaca call fails
                return NextResponse.json(items);
            }
        }

        return NextResponse.json(items);
    } catch (error) {
        console.error("Error fetching watchlist items:", error);
        return NextResponse.json({ error: "Failed to fetch watchlist items" }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const { watchlistId, tickerSymbol } = await request.json();
        if (!watchlistId || !tickerSymbol) {
            return NextResponse.json({ error: "Watchlist ID and ticker symbol are required" }, { status: 400 });
        }

        const db = new OptionsDatabase();
        const item = await db.addWatchlistItem(watchlistId, tickerSymbol);
        return NextResponse.json(item);
    } catch (error) {
        console.error("Error adding watchlist item:", error);
        return NextResponse.json({ error: "Failed to add watchlist item" }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const watchlistId = request.nextUrl.searchParams.get("watchlist_id");
        const tickerSymbol = request.nextUrl.searchParams.get("ticker_symbol");
        
        if (!watchlistId || !tickerSymbol) {
            return NextResponse.json({ error: "Watchlist ID and ticker symbol are required" }, { status: 400 });
        }

        const db = new OptionsDatabase();
        await db.removeWatchlistItem(parseInt(watchlistId), tickerSymbol);
        return NextResponse.json({ message: "Watchlist item deleted successfully" });
    } catch (error) {
        console.error("Error deleting watchlist item:", error);
        return NextResponse.json({ error: "Failed to delete watchlist item" }, { status: 500 });
    }
}
