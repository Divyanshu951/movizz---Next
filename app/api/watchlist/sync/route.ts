import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { syncGuestWatchlistToUser, getUserWatchlist } from "@/lib/watchlist";

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json(
        { error: "Must be signed in to sync guest watchlist to account" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const guestItems = body?.items || [];

    const syncedCount = await syncGuestWatchlistToUser(session.user.id, guestItems);
    const updatedList = await getUserWatchlist(session.user.id);

    return NextResponse.json({
      success: true,
      syncedCount,
      items: updatedList,
    });
  } catch (error) {
    console.error("POST /api/watchlist/sync error:", error);
    return NextResponse.json(
      { error: "Failed to sync guest items to account" },
      { status: 500 }
    );
  }
}
