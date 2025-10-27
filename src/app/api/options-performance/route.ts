import { SnaptradeService } from "@/utils/snaptrade/service";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    try {
        const accountId = request.nextUrl.searchParams.get("accountId");
        const startDate = request.nextUrl.searchParams.get("startDate");
        const endDate = request.nextUrl.searchParams.get("endDate");

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

        // Filter for option-related transactions
        const optionTypes = "BUY,SELL,OPTIONEXPIRATION,OPTIONASSIGNMENT,OPTIONEXERCISE";
        
        const response = await snaptradeService.getAccountActivities(
            startDate || undefined,
            endDate || undefined,
            optionTypes
        );
        return NextResponse.json(response.data);
    } catch (error) {
        console.error("Error fetching options performance:", error);
        return NextResponse.json({ error: "Failed to fetch options performance" }, { status: 500 });
    }
}
