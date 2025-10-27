import { SnaptradeService } from "@/utils/snaptrade/service";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    try {
        const accountId = request.nextUrl.searchParams.get("accountId");

        const userId = request.headers.get("user-id");
        const userSecret = request.headers.get("user-secret");
        if (!userId || !userSecret) {
            return NextResponse.json({ error: "Missing user ID or secret" }, { status: 400 });
        }

        if (!accountId) {
            return NextResponse.json({ error: "Missing accountId" }, { status: 400 });
        }

        const snaptradeService = new SnaptradeService(
            userId as string,
            userSecret as string,
            accountId,
        );
        const data = await snaptradeService.getAccountHoldings();
        return NextResponse.json(data.data);
    } catch (error) {
        console.error("Error fetching account holdings:", error);
        return NextResponse.json({ error: "Failed to fetch account holdings" }, { status: 500 });
    }
}
