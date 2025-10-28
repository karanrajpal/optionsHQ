import { OptionsDatabase } from "@/utils/neon/service";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    try {
        const userId = request.nextUrl.searchParams.get("user_id");
        if (!userId) {
            return NextResponse.json({ error: "User ID is required" }, { status: 400 });
        }

        const db = new OptionsDatabase();
        const preferences = await db.getModulePreferences(userId);
        
        if (!preferences) {
            return NextResponse.json({ error: "Preferences not found" }, { status: 404 });
        }
        
        return NextResponse.json(preferences);
    } catch (error) {
        console.error("Error fetching module preferences:", error);
        return NextResponse.json({ error: "Failed to fetch module preferences" }, { status: 500 });
    }
}

export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();
        const { userId, ...preferences } = body;
        
        if (!userId) {
            return NextResponse.json({ error: "User ID is required" }, { status: 400 });
        }

        const db = new OptionsDatabase();
        const updatedPreferences = await db.updateModulePreferences(userId, preferences);
        return NextResponse.json(updatedPreferences);
    } catch (error) {
        console.error("Error updating module preferences:", error);
        return NextResponse.json({ error: "Failed to update module preferences" }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { userId, ...preferences } = body;
        
        if (!userId) {
            return NextResponse.json({ error: "User ID is required" }, { status: 400 });
        }

        const db = new OptionsDatabase();
        const newPreferences = await db.createModulePreferences(userId, preferences);
        return NextResponse.json(newPreferences);
    } catch (error) {
        console.error("Error creating module preferences:", error);
        return NextResponse.json({ error: "Failed to create module preferences" }, { status: 500 });
    }
}
