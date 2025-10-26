
import { OptionsDatabase } from "@/utils/neon/service";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    try {
        const userId = request.nextUrl.searchParams.get("user_id");
        if (!userId) {
            return NextResponse.json({ error: "User ID is required" }, { status: 400 });
        }

        const db = new OptionsDatabase();
        const data = await db.getUserDataAccounts(userId);
        return NextResponse.json(data);
    } catch (error) {
        console.error("Error fetching options transactions:", error);
        return NextResponse.json({ error: "Failed to fetch options transactions" }, { status: 500 });
    }
}
