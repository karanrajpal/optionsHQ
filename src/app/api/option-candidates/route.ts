import { NextRequest, NextResponse } from "next/server";
import { OptionCandidatesService } from "@/lib/option-candidates-service";

export async function GET(request: NextRequest) {
    try {
        const strategy = request.nextUrl.searchParams.get("strategy");
        if (!strategy) {
            return NextResponse.json({ error: "Missing strategy parameter" }, { status: 400 });
        }
        const userId = request.headers.get("user-id");
        const userSecret = request.headers.get("user-secret");
        const accountId = request.nextUrl.searchParams.get("accountId");
        if (!userId || !userSecret || !accountId) {
            return NextResponse.json({ error: "Missing user credentials or accountId" }, { status: 400 });
        }
        const service = new OptionCandidatesService(userId, userSecret, accountId);
        let candidates = [];
        if (strategy === "make-premiums") {
            candidates = await service.getMakePremiumsCandidates();
        } else {
            return NextResponse.json({ error: "Unknown strategy" }, { status: 400 });
        }
        return NextResponse.json(candidates);
    } catch (error) {
        console.error("Error in option-candidates API:", error);
        return NextResponse.json({ error: "Failed to fetch option candidates" }, { status: 500 });
    }
}
