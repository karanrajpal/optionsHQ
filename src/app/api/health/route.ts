import { NextResponse } from "next/server";
import { AlpacaStocksService } from "@/lib/alpaca/stocks-service";
import { Snaptrade } from "snaptrade-typescript-sdk";

export async function GET() {
    const results: Record<string, { status: "ok" | "error"; message?: string }> = {};

    // Alpaca check
    try {
        const service = new AlpacaStocksService();
        const account = await service.checkAccount();
        results.alpaca = { status: "ok" };
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        results.alpaca = { status: "error", message };
    }

    // Snaptrade check
    try {
        const snaptrade = new Snaptrade({
            clientId: process.env.NEXT_SNAPTRADE_CLIENT_ID as string,
            consumerKey: process.env.NEXT_SNAPTRADE_CONSUMER_KEY as string,
        });
        const response = await snaptrade.apiStatus.check();
        results.snaptrade = { status: response.data.online ? "ok" : "error", message: response.data.online ? `v${response.data.version}` : "API offline" };
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        results.snaptrade = { status: "error", message };
    }

    return NextResponse.json(results);
}
