import { SnaptradeService } from "@/utils/snaptrade/service";
import { Position } from "snaptrade-typescript-sdk";

const CASH_LIKE_TICKERS = new Set(['SPAXX']);

export class OptionCandidatesService {
    private userId: string;
    private userSecret: string;
    private accountId: string;

    constructor(userId: string, userSecret: string, accountId: string) {
        this.userId = userId;
        this.userSecret = userSecret;
        this.accountId = accountId;
    }

    async getCoveredCallsCandidates(): Promise<Position[]> {
        const snaptradeService = new SnaptradeService(
            this.userId,
            this.userSecret,
            this.accountId
        );
        // Get holdings from Snaptrade
        const holdingsResponse = await snaptradeService.getAccountHoldings();
        const holdings = holdingsResponse?.data?.positions || [];
        // Filter stocks with units > 100, sort by value descending
        const filtered = holdings
            .filter((h) => h.units && h.units >= 100)
            .filter((h) => !CASH_LIKE_TICKERS.has(h.symbol?.symbol?.symbol || ''));
        return filtered;
    }
}
