import { db } from "./db";
import { watchlistItems, type WatchlistItemRow } from "./db/schema";
import { eq, and, desc, inArray } from "drizzle-orm";

export interface WatchlistMovie {
  id: number; // TMDB ID
  title: string;
  type: "movie" | "tv";
  year: string;
  rating: number;
  genre: string;
  poster: string;
  overview: string;
  addedAt: number;
  watched: boolean;
  pinned: boolean;
}

export function formatRowToItem(row: WatchlistItemRow): WatchlistMovie {
  return {
    id: row.tmdbId,
    title: row.title,
    type: (row.type as "movie" | "tv") || "movie",
    year: row.year || "N/A",
    rating: row.rating ? Number(row.rating.toFixed(1)) : 0,
    genre: row.genre || "Cinema",
    poster: row.poster || "",
    overview: row.overview || "",
    addedAt: row.addedAt ? new Date(row.addedAt).getTime() : Date.now(),
    watched: Boolean(row.watched),
    pinned: Boolean(row.pinned),
  };
}

export async function getUserWatchlist(userId: string): Promise<WatchlistMovie[]> {
  try {
    const rows = await db
      .select()
      .from(watchlistItems)
      .where(eq(watchlistItems.userId, userId))
      .orderBy(desc(watchlistItems.pinned), desc(watchlistItems.addedAt));

    return rows.map(formatRowToItem);
  } catch (err) {
    console.error("Error getting user watchlist from Drizzle:", err);
    return [];
  }
}

export async function addOrUpdateWatchlistItem(
  userId: string,
  item: Omit<WatchlistMovie, "addedAt"> & { addedAt?: number }
): Promise<WatchlistMovie | null> {
  const rowId = `${userId}_${item.id}_${item.type}`;
  const now = new Date();

  try {
    const existing = await db
      .select()
      .from(watchlistItems)
      .where(
        and(
          eq(watchlistItems.userId, userId),
          eq(watchlistItems.tmdbId, item.id),
          eq(watchlistItems.type, item.type)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      const updated = await db
        .update(watchlistItems)
        .set({
          title: item.title,
          year: item.year,
          rating: item.rating,
          genre: item.genre,
          poster: item.poster,
          overview: item.overview,
          watched: item.watched ?? existing[0].watched,
          pinned: item.pinned ?? existing[0].pinned,
          updatedAt: now,
        })
        .where(eq(watchlistItems.id, existing[0].id))
        .returning();

      return formatRowToItem(updated[0]);
    } else {
      const inserted = await db
        .insert(watchlistItems)
        .values({
          id: rowId,
          userId,
          tmdbId: item.id,
          title: item.title,
          type: item.type,
          year: item.year,
          rating: item.rating,
          genre: item.genre,
          poster: item.poster,
          overview: item.overview,
          watched: item.watched ?? false,
          pinned: item.pinned ?? false,
          addedAt: item.addedAt ? new Date(item.addedAt) : now,
          updatedAt: now,
        })
        .returning();

      return formatRowToItem(inserted[0]);
    }
  } catch (err) {
    console.error("Error adding/updating watchlist item with Drizzle:", err);
    throw err;
  }
}

export async function removeWatchlistItem(
  userId: string,
  tmdbId: number,
  type?: string
): Promise<boolean> {
  try {
    const conditions = [
      eq(watchlistItems.userId, userId),
      eq(watchlistItems.tmdbId, tmdbId),
    ];
    if (type) {
      conditions.push(eq(watchlistItems.type, type));
    }

    await db.delete(watchlistItems).where(and(...conditions));
    return true;
  } catch (err) {
    console.error("Error removing watchlist item with Drizzle:", err);
    return false;
  }
}

export async function updateWatchlistStatus(
  userId: string,
  tmdbIds: number[],
  patch: { watched?: boolean; pinned?: boolean }
): Promise<boolean> {
  try {
    const updates: Partial<WatchlistItemRow> = {
      updatedAt: new Date(),
    };
    if (typeof patch.watched === "boolean") {
      updates.watched = patch.watched;
    }
    if (typeof patch.pinned === "boolean") {
      updates.pinned = patch.pinned;
    }

    await db
      .update(watchlistItems)
      .set(updates)
      .where(
        and(
          eq(watchlistItems.userId, userId),
          inArray(watchlistItems.tmdbId, tmdbIds)
        )
      );

    return true;
  } catch (err) {
    console.error("Error updating watchlist items status with Drizzle:", err);
    return false;
  }
}

export async function clearUserWatchlist(userId: string): Promise<boolean> {
  try {
    await db
      .delete(watchlistItems)
      .where(eq(watchlistItems.userId, userId));
    return true;
  } catch (err) {
    console.error("Error clearing watchlist with Drizzle:", err);
    return false;
  }
}

export async function syncGuestWatchlistToUser(
  userId: string,
  guestItems: WatchlistMovie[]
): Promise<number> {
  if (!guestItems || guestItems.length === 0) return 0;
  let count = 0;
  for (const item of guestItems) {
    try {
      await addOrUpdateWatchlistItem(userId, item);
      count++;
    } catch (e) {
      console.warn("Failed to sync item:", item.id, e);
    }
  }
  return count;
}
