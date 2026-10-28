import { NextRequest, NextResponse } from "next/server";
import { getTvSeasonDetails } from "@/lib/tmdb";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  const seasonStr = searchParams.get("season") ?? "1";
  const seasonNumber = parseInt(seasonStr, 10);

  if (!id || Number.isNaN(seasonNumber)) {
    return NextResponse.json(
      { error: "Missing TV show ID or season number" },
      { status: 400 },
    );
  }

  try {
    const season = await getTvSeasonDetails(id, seasonNumber);
    if (!season) {
      return NextResponse.json(
        { error: "Season details not found" },
        { status: 404 },
      );
    }
    return NextResponse.json({ season });
  } catch (error) {
    console.error("Error fetching TV season details:", error);
    return NextResponse.json(
      { error: "Failed to fetch TV season details" },
      { status: 500 },
    );
  }
}

