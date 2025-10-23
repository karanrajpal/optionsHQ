
import { OptionsDatabase } from "@/utils/neon/service";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const db = new OptionsDatabase();
        const data = await db.getData();
        return NextResponse.json(data);
    } catch (error) {
        console.error("Error fetching options transactions:", error);
        return NextResponse.json({ error: "Failed to fetch options transactions" }, { status: 500 });
    }
}
