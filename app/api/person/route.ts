import { NextRequest, NextResponse } from "next/server";
import { getPersonDetails } from "@/lib/tmdb";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Missing person ID" }, { status: 400 });
  }

  try {
    const person = await getPersonDetails(id);
    if (!person) {
      return NextResponse.json({ error: "Person not found" }, { status: 404 });
    }
    return NextResponse.json({ person });
  } catch (error) {
    console.error("Error fetching person details:", error);
    return NextResponse.json(
      { error: "Failed to fetch person details" },
      { status: 500 },
    );
  }
}

