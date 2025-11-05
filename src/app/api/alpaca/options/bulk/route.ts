import { NextRequest, NextResponse } from "next/server";
import { OptionCandidatesService } from "@/lib/option-candidates-service";
import { OptionsDiscoveryService } from "@/lib/options-discovery-service";
import { GetOptionChainParams } from "@alpacahq/alpaca-trade-api/dist/resources/datav2/rest_v2";
import { AugmentedAlpacaOptionSnapshot } from "@/app/discover/page";
import { Position } from "snaptrade-typescript-sdk";
import { MakePremiumsOptionsStrategy } from "@/lib/option-strategies/CoveredCallsOptionsStrategy";

/**
 * GET /api/alpaca/options/bulk
 *
 * Query Parameters:
 * - strategy: Strategy type (e.g., "make-premiums") - Required
 * - accountId: Account ID - Required
 * - expiration_date_gte: Filter by expiration date >= this date (YYYY-MM-DD) - Optional
 * - expiration_date_lte: Filter by expiration date <= this date (YYYY-MM-DD) - Optional
 * - strike_price_gte: Filter by strike price >= this value - Optional
 * - strike_price_lte: Filter by strike price <= this value - Optional
 * - limit: Number of results to return (max 10000) - Optional
 *
 * Headers:
 * - user-id: User ID - Required
 * - user-secret: User Secret - Required
 */
export type OptionsWithStockData = {
    symbol: string;
    options: AugmentedAlpacaOptionSnapshot[];
    stockData: Position;
};
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const strategy = searchParams.get("strategyType") || "make-premiums";
        const accountId = searchParams.get("accountId");
        const userId = request.headers.get("user-id");
        const userSecret = request.headers.get("user-secret");
        if (!userId || !userSecret || !accountId) {
            return NextResponse.json({ error: "Missing user credentials or accountId" }, { status: 400 });
        }

        // Build request parameters
        const requestParams: GetOptionChainParams = {
        };

        // Add optional parameters if provided
        const type = searchParams.get('type');
        if (type && (type === 'call' || type === 'put')) {
            requestParams.type = type;
        }

        const expiration_date_gte = searchParams.get('expiration_date_gte');
        if (expiration_date_gte) {
            requestParams.expiration_date_gte = expiration_date_gte;
        }

        const expiration_date_lte = searchParams.get('expiration_date_lte');
        if (expiration_date_lte) {
            requestParams.expiration_date_lte = expiration_date_lte;
        }

        const strike_price_gte = searchParams.get('strike_price_gte');
        if (strike_price_gte) {
            requestParams.strike_price_gte = Number(strike_price_gte);
        }

        const strike_price_lte = searchParams.get('strike_price_lte');
        if (strike_price_lte) {
            requestParams.strike_price_lte = Number(strike_price_lte);
        }

        const limit = searchParams.get('limit');
        if (limit) {
            requestParams.totalLimit = parseInt(limit, 10);
        }

        // Get all symbols for the strategy
        const candidatesService = new OptionCandidatesService(userId, userSecret, accountId);
        let candidates = [];
        if (strategy === "make-premiums") {
            candidates = await candidatesService.getMakePremiumsCandidates();
        } else {
            return NextResponse.json({ error: "Unknown strategy" }, { status: 400 });
        }
        // For each symbol, get options chain
        const result: Record<string, OptionsWithStockData> = {};
        const discoveryService = new OptionsDiscoveryService();
        await Promise.all(
            candidates.map(async (candidate) => {
                const symbol = candidate.symbol?.symbol?.symbol || "";
                requestParams.root_symbol = symbol;
                const options = await discoveryService.getOptionsChainWithAugmentedInformation(requestParams, strategy);
                result[symbol] = {
                    symbol,
                    options,
                    stockData: candidate
                };
            })
        );
        return NextResponse.json(result);
    } catch (error) {
        console.error("Error in /api/alpaca/options/bulk:", error);
        return NextResponse.json({ error: "Failed to fetch bulk options data" }, { status: 500 });
    }
}
