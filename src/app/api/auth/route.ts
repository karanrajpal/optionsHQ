import { NextRequest, NextResponse } from "next/server";
import { Snaptrade } from "snaptrade-typescript-sdk/dist/client";
import { LoginRedirectURI } from "snaptrade-typescript-sdk/dist/models/login-redirect-uri";

// Return the redirectURL from SnapTrade so the UI can use it
export async function GET(request: NextRequest) {
    try {
        console.log("Received request for SnapTrade login");
        console.log(process.env.NEXT_SNAPTRADE_CLIENT_ID, process.env.NEXT_SNAPTRADE_CONSUMER_KEY);
        const snaptrade = new Snaptrade({
            clientId: process.env.NEXT_SNAPTRADE_CLIENT_ID as string,
            consumerKey: process.env.NEXT_SNAPTRADE_CONSUMER_KEY as string,
        });

        const userId = request.headers.get("x-snaptrade-user-id");
        const userSecret = request.headers.get("x-snaptrade-user-secret");

        const broker = request.nextUrl.searchParams.get("broker") ?? "CHASE";
        console.log("Broker from URL:", broker);

        if (!userId || !userSecret) {
            return NextResponse.json(
                { error: "Missing x-snaptrade-user-id or x-snaptrade-user-secret in headers" },
                { status: 400 }
            );
        }

        if (!broker) {
            return NextResponse.json(
                { error: "Missing broker in query parameters" },
                { status: 400 }
            );
        }

        const response = await snaptrade.authentication.loginSnapTradeUser(
            {
                userId,
                userSecret,
                broker,
            },
        );
        console.log(response.data);

        const data = response.data as LoginRedirectURI;
        return NextResponse.json(data);
    } catch (error) {
        console.error("Error fetching data:", error);
        return NextResponse.error();
    }
}