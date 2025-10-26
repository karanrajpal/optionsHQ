
import { OptionsDatabase } from "@/utils/neon/service";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    try {
        const userId = request.nextUrl.searchParams.get("user_id");
        if (!userId) {
            return NextResponse.json({ error: "User ID is required" }, { status: 400 });
        }

        const db = new OptionsDatabase();
        const data = (await db.getUserDataAccounts(userId))[0];
        return NextResponse.json(data);
    } catch (error) {
        console.error("Error fetching options transactions:", error);
        return NextResponse.json({ error: "Failed to fetch options transactions" }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const { userId, snaptradeUserId, snaptradeUserSecret, alpacaApiKey, alpacaApiSecret } = await request.json();
        if (!userId) {
            return NextResponse.json({ error: "User ID is required" }, { status: 400 });
        }
        if (!(snaptradeUserId && snaptradeUserSecret) && !(alpacaApiKey && alpacaApiSecret)) {
            return NextResponse.json({ error: "One of Snaptrade or Alpaca credentials are required" }, { status: 400 });
        }

        const db = new OptionsDatabase();
        if (snaptradeUserId && snaptradeUserSecret) {
            await db.saveSnaptradeCredentials(userId, snaptradeUserId, snaptradeUserSecret);
        }
        if (alpacaApiKey && alpacaApiSecret) {
            await db.saveAlpacaCredentials(userId, alpacaApiKey, alpacaApiSecret);
        }
        return NextResponse.json({ message: "Credentials saved successfully" });
    } catch (error) {
        console.error("Error saving credentials:", error);
        return NextResponse.json({ error: "Failed to save credentials" }, { status: 500 });
    }
}
