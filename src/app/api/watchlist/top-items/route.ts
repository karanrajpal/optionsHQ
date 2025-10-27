import { OptionsDatabase } from "@/utils/neon/service";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    try {
        const userId = request.nextUrl.searchParams.get("user_id");
        const limit = parseInt(request.nextUrl.searchParams.get("limit") || "5");
        
        if (!userId) {
            return NextResponse.json({ error: "User ID is required" }, { status: 400 });
        }

        const db = new OptionsDatabase();
        const topItems = await db.getTopWatchlistItems(userId, limit);
        return NextResponse.json(topItems);
    } catch (error) {
        console.error("Error fetching top watchlist items:", error);
        return NextResponse.json({ error: "Failed to fetch top watchlist items" }, { status: 500 });
    }
}
