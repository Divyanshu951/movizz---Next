import { NextRequest, NextResponse } from "next/server";
import { getTitleDetails } from "@/lib/tmdb";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  const type = (searchParams.get("type") as "movie" | "tv") || "movie";

  if (!id) {
    return NextResponse.json({ error: "Missing title ID" }, { status: 400 });
  }

  try {
    const details = await getTitleDetails(id, type);
    return NextResponse.json({
      recommendations: details.recommendations?.results || [],
      similar: details.similar?.results || [],
    });
  } catch (error) {
    console.error("Error fetching recommendations:", error);
    return NextResponse.json(
      { error: "Failed to fetch recommendations" },
      { status: 500 },
    );
  }
}

