"use client";

import type { WatchlistMovie } from "./watchlist";

export const GUEST_STORAGE_KEY = "movizz:wishlist:v2";
export const BACKUP_GUEST_KEY = "movizz:guest:watchlist";

export function getGuestWatchlist(): WatchlistMovie[] {
  if (typeof window === "undefined") return [];
  try {
    const raw =
      localStorage.getItem(GUEST_STORAGE_KEY) ||
      localStorage.getItem(BACKUP_GUEST_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed;
    if (parsed && Array.isArray(parsed.items)) return parsed.items;
    return [];
  } catch (e) {
    console.error("Failed to read guest watchlist from localStorage", e);
    return [];
  }
}

export function saveGuestWatchlist(items: WatchlistMovie[]) {
  if (typeof window === "undefined") return;
  try {
    const payload = JSON.stringify({
      version: 2,
      updatedAt: Date.now(),
      items,
    });
    localStorage.setItem(GUEST_STORAGE_KEY, payload);
    localStorage.setItem(BACKUP_GUEST_KEY, payload);
    window.dispatchEvent(new Event("movizz-watchlist-updated"));
  } catch (e) {
    console.error("Failed to save guest watchlist to localStorage", e);
  }
}

export function addGuestItem(
  item: Omit<WatchlistMovie, "addedAt" | "watched" | "pinned"> & {
    watched?: boolean;
    pinned?: boolean;
  }
): WatchlistMovie[] {
  const current = getGuestWatchlist();
  const exists = current.some(
    (i) => i.id === item.id && (!item.type || i.type === item.type)
  );

  let updated: WatchlistMovie[];
  if (exists) {
    updated = current.map((i) =>
      i.id === item.id && (!item.type || i.type === item.type)
        ? {
            ...i,
            ...item,
            watched: item.watched ?? i.watched,
            pinned: item.pinned ?? i.pinned,
          }
        : i
    );
  } else {
    const newItem: WatchlistMovie = {
      ...item,
      addedAt: Date.now(),
      watched: item.watched ?? false,
      pinned: item.pinned ?? false,
    };
    updated = [newItem, ...current];
  }

  saveGuestWatchlist(updated);
  return updated;
}

export function removeGuestItem(id: number, type?: string): WatchlistMovie[] {
  const current = getGuestWatchlist();
  const updated = current.filter(
    (i) => !(i.id === id && (!type || i.type === type))
  );
  saveGuestWatchlist(updated);
  return updated;
}

export function clearGuestWatchlist(): WatchlistMovie[] {
  saveGuestWatchlist([]);
  return [];
}
