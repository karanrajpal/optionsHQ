import { OptionsDatabase } from "@/utils/neon/service";
import { createAlpacaStocksService } from "@/lib/alpaca";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    try {
        const userId = request.nextUrl.searchParams.get("user_id");
        if (!userId) {
            return NextResponse.json({ error: "User ID is required" }, { status: 400 });
        }

        const db = new OptionsDatabase();
        const watchlists = await db.getWatchlists(userId);
        return NextResponse.json(watchlists);
    } catch (error) {
        console.error("Error fetching watchlists:", error);
        return NextResponse.json({ error: "Failed to fetch watchlists" }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const { userId, name } = await request.json();
        if (!userId || !name) {
            return NextResponse.json({ error: "User ID and name are required" }, { status: 400 });
        }

        const db = new OptionsDatabase();
        const watchlist = await db.createWatchlist(userId, name);
        return NextResponse.json(watchlist);
    } catch (error) {
        console.error("Error creating watchlist:", error);
        return NextResponse.json({ error: "Failed to create watchlist" }, { status: 500 });
    }
}

export async function PUT(request: NextRequest) {
    try {
        const { watchlistId, name } = await request.json();
        if (!watchlistId || !name) {
            return NextResponse.json({ error: "Watchlist ID and name are required" }, { status: 400 });
        }

        const db = new OptionsDatabase();
        const watchlist = await db.updateWatchlist(watchlistId, name);
        return NextResponse.json(watchlist);
    } catch (error) {
        console.error("Error updating watchlist:", error);
        return NextResponse.json({ error: "Failed to update watchlist" }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const watchlistId = request.nextUrl.searchParams.get("watchlist_id");
        if (!watchlistId) {
            return NextResponse.json({ error: "Watchlist ID is required" }, { status: 400 });
        }

        const db = new OptionsDatabase();
        await db.deleteWatchlist(parseInt(watchlistId));
        return NextResponse.json({ message: "Watchlist deleted successfully" });
    } catch (error) {
        console.error("Error deleting watchlist:", error);
        return NextResponse.json({ error: "Failed to delete watchlist" }, { status: 500 });
    }
}
