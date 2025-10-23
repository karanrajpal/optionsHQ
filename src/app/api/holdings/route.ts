import { SnaptradeService } from "@/utils/snaptrade/service";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const snaptradeService = new SnaptradeService(
            process.env.NEXT_SNAPTRADE_USER_ID as string,
            process.env.NEXT_SNAPTRADE_USER_SECRET as string,
            process.env.NEXT_SNAPTRADE_ACCOUNT_ID as string
        );
        const data = await snaptradeService.getAccountHoldings();
        return NextResponse.json(data);
    } catch (error) {
        console.error("Error fetching account holdings:", error);
        return NextResponse.json({ error: "Failed to fetch account holdings" }, { status: 500 });
    }
}
