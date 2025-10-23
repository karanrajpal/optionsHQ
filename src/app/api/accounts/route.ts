import { SnaptradeService } from "@/utils/snaptrade/service";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    try {
        const userId = request.headers.get("user-id");
        const userSecret = request.headers.get("user-secret");
        if (!userId || !userSecret) {
            return NextResponse.json({ error: "Missing user ID or secret" }, { status: 400 });
        }
        const snaptradeService = new SnaptradeService(
            userId as string,
            userSecret as string
        );
        const data = await snaptradeService.listUserAccounts();
        return NextResponse.json(data.data);
    } catch (error) {
        console.error("Error fetching user accounts:", error);
        return NextResponse.json({ error: "Failed to fetch user accounts" }, { status: 500 });
    }
}
