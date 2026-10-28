import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import {
  getUserWatchlist,
  addOrUpdateWatchlistItem,
  removeWatchlistItem,
  updateWatchlistStatus,
  clearUserWatchlist,
} from "@/lib/watchlist";

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({
        authenticated: false,
        items: [],
      });
    }

    const items = await getUserWatchlist(session.user.id);
    return NextResponse.json({
      authenticated: true,
      items,
    });
  } catch (error) {
    console.error("GET /api/watchlist error:", error);
    return NextResponse.json(
      { error: "Failed to fetch watchlist from database" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized. Please sign in or use guest mode." },
        { status: 401 }
      );
    }

    const body = await request.json();
    if (!body || !body.id || !body.title) {
      return NextResponse.json(
        { error: "Invalid movie item payload" },
        { status: 400 }
      );
    }

    const saved = await addOrUpdateWatchlistItem(session.user.id, body);
    return NextResponse.json({ success: true, item: saved });
  } catch (error) {
    console.error("POST /api/watchlist error:", error);
    return NextResponse.json(
      { error: "Failed to add movie to watchlist" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { ids, patch } = body;
    if (!Array.isArray(ids) || ids.length === 0 || !patch) {
      return NextResponse.json(
        { error: "Invalid patch request" },
        { status: 400 }
      );
    }

    const success = await updateWatchlistStatus(session.user.id, ids, patch);
    return NextResponse.json({ success });
  } catch (error) {
    console.error("PATCH /api/watchlist error:", error);
    return NextResponse.json(
      { error: "Failed to update watchlist item status" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const clearAll = searchParams.get("all") === "true";

    if (clearAll) {
      const ok = await clearUserWatchlist(session.user.id);
      return NextResponse.json({ success: ok });
    }

    const idStr = searchParams.get("id");
    const type = searchParams.get("type") || undefined;

    if (!idStr) {
      return NextResponse.json({ error: "Missing item id" }, { status: 400 });
    }

    const tmdbId = parseInt(idStr, 10);
    const ok = await removeWatchlistItem(session.user.id, tmdbId, type);
    return NextResponse.json({ success: ok });
  } catch (error) {
    console.error("DELETE /api/watchlist error:", error);
    return NextResponse.json(
      { error: "Failed to delete watchlist item" },
      { status: 500 }
    );
  }
}
