import { OptionInformationService } from "@/lib/option-strategies/option-information-service";
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
        const data = await snaptradeService.getOptionHoldings();
        const stockHoldings = (await snaptradeService.getAccountHoldings()).data;
        const optionsHoldings = data.data || [];
        const optionsWithStrategyInformation = OptionInformationService.categorizeOptionsByStrategy(optionsHoldings, stockHoldings);
        return NextResponse.json(optionsWithStrategyInformation);
    } catch (error) {
        console.error("Error fetching option holdings:", error);
        return NextResponse.json({ error: "Failed to fetch option holdings" }, { status: 500 });
    }
}
