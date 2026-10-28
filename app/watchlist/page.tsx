"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import {
  Bookmark,
  Film,
  Tv,
  Trash2,
  Star,
  ArrowRight,
  Play,
  Search,
  X,
  Check,
  Pin,
  LayoutGrid,
  List,
  Shuffle,
  Undo2,
  ListChecks,
  Eye,
  Cloud,
  HardDrive,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import {
  getGuestWatchlist,
  saveGuestWatchlist,
} from "@/lib/watchlist-client";
import SimilarModal from "@/components/SimilarModal";
import type { SearchItem } from "@/types/tmdb";

/* -------------------------------------------------------------------------- */
/*  Types & Constants                                                         */
/* -------------------------------------------------------------------------- */

type MediaType = "movie" | "tv";

export interface WishlistItem {
  id: number;
  title: string;
  type: MediaType;
  year: string;
  rating: number;
  genre: string;
  poster: string;
  overview: string;
  addedAt: number;
  watched: boolean;
  pinned: boolean;
}

type SortKey = "recent" | "rating" | "year" | "title";
type StatusFilter = "all" | "unwatched" | "watched";
type ViewMode = "grid" | "list";

const DAY = 86_400_000;

const DEFAULT_DEMO_ITEMS: WishlistItem[] = [
  {
    id: 550,
    title: "Fight Club",
    type: "movie",
    year: "1999",
    rating: 8.4,
    genre: "Drama / Thriller",
    poster: "https://image.tmdb.org/t/p/w500/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg",
    overview:
      "A ticking-time-bomb insomniac and a slippery soap salesman channel primal male aggression into a shocking new form of therapy.",
  },
  {
    id: 1399,
    title: "Game of Thrones",
    type: "tv",
    year: "2011",
    rating: 8.4,
    genre: "Sci-Fi & Fantasy / Drama",
    poster: "https://image.tmdb.org/t/p/w500/1XS1oqL89opfnbLl8WnZY1O1uJx.jpg",
    overview:
      "Nine noble families fight for control over the lands of Westeros, while an ancient enemy returns after being dormant for millennia.",
  },
  {
    id: 157336,
    title: "Interstellar",
    type: "movie",
    year: "2014",
    rating: 8.4,
    genre: "Adventure / Drama / Sci-Fi",
    poster: "https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",
    overview:
      "The adventures of a group of explorers who make use of a newly discovered wormhole to surpass the limitations on human space travel.",
  },
  {
    id: 66732,
    title: "Stranger Things",
    type: "tv",
    year: "2016",
    rating: 8.6,
    genre: "Sci-Fi & Fantasy / Mystery",
    poster: "https://image.tmdb.org/t/p/w500/49WJfeN0moxb9IPfGn8AIqMGskD.jpg",
    overview:
      "When a young boy vanishes, a small town uncovers a mystery involving secret experiments, terrifying supernatural forces and one strange little girl.",
  },
  {
    id: 27205,
    title: "Inception",
    type: "movie",
    year: "2010",
    rating: 8.4,
    genre: "Action / Sci-Fi / Adventure",
    poster: "https://image.tmdb.org/t/p/w500/oYuLEt3zVCKq57qu2F8dT7NIa6f.jpg",
    overview:
      "Cobb, a skilled thief who commits corporate espionage by infiltrating the subconscious of his targets is offered a chance to regain his old life.",
  },
].map((item, i) => ({
  ...item,
  type: item.type as MediaType,
  addedAt: Date.now() - i * DAY,
  watched: false,
  pinned: false,
}));

const SORT_LABELS: Record<SortKey, string> = {
  recent: "Recently added",
  rating: "Highest rated",
  year: "Newest release",
  title: "Title A–Z",
};

const cn = (...parts: Array<string | false | null | undefined>) =>
  parts.filter(Boolean).join(" ");

const genresOf = (item: WishlistItem) =>
  item.genre
    ? item.genre.split("/").map((g) => g.trim()).filter(Boolean)
    : ["Cinema"];

const trailerUrl = (title: string) =>
  `https://www.youtube.com/results?search_query=${encodeURIComponent(title)}+trailer`;

/* -------------------------------------------------------------------------- */
/*  UI Components                                                             */
/* -------------------------------------------------------------------------- */

function Poster({
  src,
  alt,
  className,
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  if (failed || !src) {
    return (
      <div
        className={cn(
          "flex items-center justify-center bg-zinc-900 text-zinc-600",
          className
        )}
        role="img"
        aria-label={alt}
      >
        <Film size={28} />
      </div>
    );
  }
  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      onError={() => setFailed(true)}
      className={className}
    />
  );
}

function IconButton({
  label,
  onClick,
  active,
  danger,
  children,
}: {
  label: string;
  onClick: () => void;
  active?: boolean;
  danger?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      aria-pressed={active}
      className={cn(
        "flex h-8 w-8 items-center justify-center rounded-lg transition cursor-pointer",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F5C518]",
        active
          ? "bg-[#F5C518] text-black"
          : danger
          ? "bg-zinc-900 text-zinc-400 hover:bg-red-950/60 hover:text-red-400"
          : "bg-zinc-900 text-zinc-400 hover:bg-zinc-800 hover:text-white"
      )}
    >
      {children}
    </button>
  );
}

function ItemActions({
  item,
  onWatched,
  onPin,
  onRemove,
}: {
  item: WishlistItem;
  onWatched: () => void;
  onPin: () => void;
  onRemove: () => void;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <IconButton
        label={item.watched ? "Mark as not watched" : "Mark as watched"}
        active={item.watched}
        onClick={onWatched}
      >
        <Check size={15} strokeWidth={3} />
      </IconButton>
      <IconButton
        label={item.pinned ? "Unpin" : "Pin to top"}
        active={item.pinned}
        onClick={onPin}
      >
        <Pin size={14} className={item.pinned ? "fill-black" : ""} />
      </IconButton>
      <a
        href={trailerUrl(item.title)}
        target="_blank"
        rel="noreferrer"
        title="Watch trailer"
        aria-label={`Watch ${item.title} trailer`}
        className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-900 text-zinc-400 transition hover:bg-zinc-800 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F5C518]"
      >
        <Play size={13} className="fill-current" />
      </a>
      <IconButton label="Remove from wishlist" danger onClick={onRemove}>
        <Trash2 size={14} />
      </IconButton>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Main Watchlist Page Component                                             */
/* -------------------------------------------------------------------------- */

export default function WishlistPage() {
  const { data: session, isPending: sessionLoading } = authClient.useSession();
  const user = session?.user;

  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loadingItems, setLoadingItems] = useState(true);
  const [guestCountToSync, setGuestCountToSync] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);

  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | MediaType>("all");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [genre, setGenre] = useState("all");
  const [sort, setSort] = useState<SortKey>("recent");
  const [view, setView] = useState<ViewMode>("grid");

  const [selectMode, setSelectMode] = useState(false);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [pickId, setPickId] = useState<number | null>(null);
  const [recState, setRecState] = useState<{
    open: boolean;
    seedTitle: string;
    seedType: MediaType;
    recommendations: SearchItem[];
    similar: SearchItem[];
  } | null>(null);
  const [loadingRecs, setLoadingRecs] = useState(false);

  const [toast, setToast] = useState<{
    message: string;
    undo: () => void;
  } | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* ---- Load items: DB (if logged in) or LocalStorage (if guest) ---- */
  const loadData = useCallback(async () => {
    setLoadingItems(true);

    if (user) {
      try {
        const res = await fetch("/api/watchlist");
        if (res.ok) {
          const data = await res.json();
          const dbItems = Array.isArray(data.items) ? data.items : [];
          setItems(dbItems);

          // Check if user has un-synced guest items in localStorage
          const localGuestItems = getGuestWatchlist();
          if (localGuestItems.length > 0) {
            const dbIds = new Set(dbItems.map((i: any) => `${i.id}_${i.type}`));
            const unSynced = localGuestItems.filter(
              (g) => !dbIds.has(`${g.id}_${g.type}`)
            );
            setGuestCountToSync(unSynced.length);
          }
        }
      } catch (err) {
        console.error("Error loading DB watchlist:", err);
      }
    } else {
      // Guest mode: Read from localStorage
      const local = getGuestWatchlist();
      if (local.length > 0) {
        setItems(local);
      } else {
        // Initialize guest with defaults if first time
        saveGuestWatchlist(DEFAULT_DEMO_ITEMS);
        setItems(DEFAULT_DEMO_ITEMS);
      }
    }
    setLoadingItems(false);
  }, [user]);

  useEffect(() => {
    if (!sessionLoading) {
      loadData();
    }
  }, [user, sessionLoading, loadData]);

  // Sync guest items to DB
  const handleSyncGuestItems = async () => {
    if (!user || isSyncing) return;
    setIsSyncing(true);
    try {
      const guestItems = getGuestWatchlist();
      const res = await fetch("/api/watchlist/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: guestItems }),
      });
      if (res.ok) {
        const data = await res.json();
        setItems(data.items);
        setGuestCountToSync(0);
        showToast(
          `Synced ${data.syncedCount} titles from your guest session to the cloud!`,
          () => {}
        );
      }
    } catch (e) {
      console.error("Sync error:", e);
    } finally {
      setIsSyncing(false);
    }
  };

  const showToast = useCallback((message: string, undo: () => void) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ message, undo });
    toastTimer.current = setTimeout(() => setToast(null), 6000);
  }, []);

  /* ---- Mutations: remove, patch, clear ---- */
  const removeItems = async (ids: number[]) => {
    const snapshot = items;
    const count = ids.length;
    const removedItem = snapshot.find((i) => i.id === ids[0]);

    // Optimistic local state update
    setItems((prev) => prev.filter((i) => !ids.includes(i.id)));
    setSelected(new Set());
    if (pickId !== null && ids.includes(pickId)) setPickId(null);

    try {
      if (user) {
        for (const id of ids) {
          await fetch(`/api/watchlist?id=${id}`, { method: "DELETE" });
        }
      } else {
        // Guest mode update localStorage
        const updated = snapshot.filter((i) => !ids.includes(i.id));
        saveGuestWatchlist(updated);
      }
    } catch (err) {
      console.error("Failed to delete items:", err);
    }

    showToast(
      count === 1
        ? `Removed “${removedItem?.title}”`
        : `Removed ${count} titles`,
      async () => {
        // Undo action
        setItems(snapshot);
        if (user) {
          for (const item of snapshot.filter((i) => ids.includes(i.id))) {
            await fetch("/api/watchlist", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(item),
            });
          }
        } else {
          saveGuestWatchlist(snapshot);
        }
        setToast(null);
      }
    );
  };

  const patchItems = async (ids: number[], patch: Partial<WishlistItem>) => {
    // Optimistic update
    setItems((prev) =>
      prev.map((i) => (ids.includes(i.id) ? { ...i, ...patch } : i))
    );

    try {
      if (user) {
        await fetch("/api/watchlist", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ids, patch }),
        });
      } else {
        const next = items.map((i) =>
          ids.includes(i.id) ? { ...i, ...patch } : i
        );
        saveGuestWatchlist(next);
      }
    } catch (err) {
      console.error("Failed to patch items:", err);
    }
  };

  const toggleWatched = (item: WishlistItem) =>
    patchItems([item.id], { watched: !item.watched });

  const togglePin = (item: WishlistItem) =>
    patchItems([item.id], { pinned: !item.pinned });

  const toggleSelected = (id: number) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const exitSelectMode = () => {
    setSelectMode(false);
    setSelected(new Set());
  };

  /* ---- Derived data ---- */
  const allGenres = useMemo(() => {
    const set = new Set<string>();
    items.forEach((i) => genresOf(i).forEach((g) => set.add(g)));
    return Array.from(set).sort();
  }, [items]);

  const stats = useMemo(() => {
    const watched = items.filter((i) => i.watched).length;
    return {
      total: items.length,
      movies: items.filter((i) => i.type === "movie").length,
      series: items.filter((i) => i.type === "tv").length,
      watched,
      pct: items.length ? Math.round((watched / items.length) * 100) : 0,
    };
  }, [items]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = items.filter((i) => {
      if (typeFilter !== "all" && i.type !== typeFilter) return false;
      if (status === "watched" && !i.watched) return false;
      if (status === "unwatched" && i.watched) return false;
      if (genre !== "all" && !genresOf(i).includes(genre)) return false;
      if (q && !`${i.title} ${i.genre} ${i.year}`.toLowerCase().includes(q))
        return false;
      return true;
    });

    const cmp: Record<SortKey, (a: WishlistItem, b: WishlistItem) => number> = {
      recent: (a, b) => b.addedAt - a.addedAt,
      rating: (a, b) => b.rating - a.rating,
      year: (a, b) => Number(b.year) - Number(a.year),
      title: (a, b) => a.title.localeCompare(b.title),
    };

    return [...list].sort(
      (a, b) => Number(b.pinned) - Number(a.pinned) || cmp[sort](a, b)
    );
  }, [items, query, typeFilter, status, genre, sort]);

  const hasActiveFilters =
    query !== "" || typeFilter !== "all" || status !== "all" || genre !== "all";

  const resetFilters = () => {
    setQuery("");
    setTypeFilter("all");
    setStatus("all");
    setGenre("all");
  };

  const pickForMe = () => {
    const pool = visible.filter((i) => !i.watched && i.id !== pickId);
    const fallback = visible.filter((i) => !i.watched);
    const source = pool.length ? pool : fallback;
    if (!source.length) {
      showToast("Nothing unwatched to pick from", () => setToast(null));
      return;
    }
    setPickId(source[Math.floor(Math.random() * source.length)].id);
  };

  const spotlight = items.find((i) => i.id === pickId) ?? null;
  const selectAllVisible = () => setSelected(new Set(visible.map((i) => i.id)));

  const chip = (active: boolean) =>
    cn(
      "flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition cursor-pointer",
      "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F5C518]",
      active
        ? "bg-[#F5C518] text-black"
        : "bg-zinc-900 text-zinc-400 ring-1 ring-zinc-800 hover:text-white hover:ring-zinc-700"
    );

  return (
    <div className="min-h-screen bg-black px-4 pb-40 pt-6 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        {/* Guest Mode / Cloud Sync Banner */}
        <div className="mb-6">
          {user ? (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-emerald-900/40 bg-emerald-950/20 px-4 py-3 text-xs text-emerald-300 backdrop-blur-md">
              <div className="flex items-center gap-2">
                <Cloud size={16} className="text-emerald-400" />
                <span>
                  <strong>Cloud Synced</strong> active for{" "}
                  <span className="text-white font-medium">{user.email}</span>
                </span>
              </div>
              {guestCountToSync > 0 && (
                <button
                  type="button"
                  onClick={handleSyncGuestItems}
                  disabled={isSyncing}
                  className="flex items-center gap-1.5 rounded-xl bg-[#F5C518] px-3 py-1.5 font-bold text-black transition hover:bg-amber-400 cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw size={13} className={isSyncing ? "animate-spin" : ""} />
                  <span>Sync {guestCountToSync} guest items to cloud</span>
                </button>
              )}
            </div>
          ) : (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-amber-900/40 bg-amber-950/20 px-4 py-3 text-xs text-amber-200 backdrop-blur-md">
              <div className="flex items-center gap-2">
                <HardDrive size={16} className="text-amber-400 shrink-0" />
                <span>
                  <strong>Guest Mode Active</strong> · Your watchlist is securely saved in your browser&apos;s localStorage.
                </span>
              </div>
              <Link
                href="/login"
                className="flex items-center gap-1.5 rounded-xl bg-[#F5C518] px-3.5 py-1.5 font-bold text-black transition hover:bg-amber-400"
              >
                <span>Sign in with Google to Sync</span>
                <ArrowRight size={12} />
              </Link>
            </div>
          )}
        </div>

        {/* ---------------------------- Header ---------------------------- */}
        <header className="mb-8 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
              Watch next
            </h1>
            <p className="mt-1.5 text-sm text-zinc-400">
              {stats.total === 0
                ? "Nothing saved yet."
                : `${stats.total - stats.watched} left to watch · ${stats.watched} done`}
            </p>
          </div>

          {stats.total > 0 && (
            <div className="w-full lg:max-w-sm">
              <div className="mb-2 flex items-baseline justify-between text-xs text-zinc-400">
                <span>
                  {stats.movies} {stats.movies === 1 ? "movie" : "movies"} ·{" "}
                  {stats.series} {stats.series === 1 ? "series" : "series"}
                </span>
                <span className="font-semibold text-[#F5C518]">
                  {stats.pct}% watched
                </span>
              </div>
              <div
                className="h-1.5 overflow-hidden rounded-full bg-zinc-900"
                role="progressbar"
                aria-valuenow={stats.pct}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="Wishlist watched progress"
              >
                <div
                  className="h-full rounded-full bg-[#F5C518] transition-[width] duration-500"
                  style={{ width: `${stats.pct}%` }}
                />
              </div>
            </div>
          )}
        </header>

        {/* ------------------------ Tonight's pick ------------------------ */}
        {spotlight && (
          <section
            aria-label="Tonight's pick"
            className="relative mb-8 overflow-hidden rounded-3xl border border-[#F5C518]/30 bg-zinc-950"
          >
            <div
              aria-hidden
              className="absolute inset-0 bg-cover bg-center opacity-20 blur-2xl"
              style={{ backgroundImage: `url(${spotlight.poster})` }}
            />
            <div className="relative flex flex-col gap-5 p-5 sm:flex-row sm:p-6">
              <Poster
                src={spotlight.poster}
                alt={spotlight.title}
                className="h-56 w-36 shrink-0 self-center rounded-xl object-cover ring-1 ring-white/10 sm:self-auto"
              />
              <div className="flex flex-1 flex-col justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-[#F5C518]">
                    Tonight’s pick
                  </p>
                  <h2 className="mt-1 text-2xl font-extrabold sm:text-3xl">
                    {spotlight.title}
                  </h2>
                  <p className="mt-1 text-sm text-zinc-400">
                    {spotlight.type === "tv" ? "Series" : "Movie"} ·{" "}
                    {spotlight.year} · {spotlight.genre}
                  </p>
                  <p className="mt-3 max-w-xl text-sm leading-relaxed text-zinc-300">
                    {spotlight.overview}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Link
                    href={`/title/${spotlight.id}?type=${spotlight.type}`}
                    className="flex items-center gap-1.5 rounded-lg bg-[#F5C518] px-4 py-2 text-sm font-bold text-black transition hover:bg-[#e0b414]"
                  >
                    <span>View title</span>
                    <ArrowRight size={15} />
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      toggleWatched(spotlight);
                      setPickId(null);
                    }}
                    className="flex items-center gap-1.5 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-zinc-200 ring-1 ring-zinc-700 transition hover:bg-zinc-800 cursor-pointer"
                  >
                    <Check size={15} />
                    <span>Mark watched</span>
                  </button>
                  <button
                    type="button"
                    onClick={pickForMe}
                    className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm text-zinc-400 transition hover:text-white cursor-pointer"
                  >
                    <Shuffle size={14} />
                    <span>Pick another</span>
                  </button>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPickId(null)}
                aria-label="Dismiss pick"
                className="absolute right-3 top-3 rounded-lg p-1.5 text-zinc-500 transition hover:bg-black/40 hover:text-white cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>
          </section>
        )}

        {/* --------------------------- Toolbar ---------------------------- */}
        {stats.total > 0 && (
          <div className="mb-6 space-y-3">
            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative flex-1">
                <Search
                  size={16}
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500"
                />
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search your watchlist"
                  aria-label="Search your watchlist"
                  className="w-full rounded-xl bg-zinc-900 py-2.5 pl-10 pr-9 text-sm text-white placeholder:text-zinc-500 ring-1 ring-zinc-800 transition focus:outline-none focus:ring-2 focus:ring-[#F5C518]"
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => setQuery("")}
                    aria-label="Clear search"
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-1 text-zinc-500 hover:text-white cursor-pointer"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value as SortKey)}
                  aria-label="Sort watchlist"
                  className="h-10 rounded-xl bg-zinc-900 px-3 text-xs font-semibold text-zinc-200 ring-1 ring-zinc-800 transition focus:outline-none focus:ring-2 focus:ring-[#F5C518] cursor-pointer"
                >
                  {(Object.keys(SORT_LABELS) as SortKey[]).map((key) => (
                    <option key={key} value={key} className="bg-zinc-900">
                      {SORT_LABELS[key]}
                    </option>
                  ))}
                </select>

                <div className="flex rounded-xl bg-zinc-900 p-1 ring-1 ring-zinc-800">
                  <button
                    type="button"
                    onClick={() => setView("grid")}
                    aria-label="Grid view"
                    className={cn(
                      "rounded-lg p-2 transition cursor-pointer",
                      view === "grid"
                        ? "bg-[#F5C518] text-black"
                        : "text-zinc-400 hover:text-white"
                    )}
                  >
                    <LayoutGrid size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setView("list")}
                    aria-label="List view"
                    className={cn(
                      "rounded-lg p-2 transition cursor-pointer",
                      view === "list"
                        ? "bg-[#F5C518] text-black"
                        : "text-zinc-400 hover:text-white"
                    )}
                  >
                    <List size={16} />
                  </button>
                </div>
              </div>
            </div>

            {/* Filter Chips */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => setTypeFilter("all")}
                className={chip(typeFilter === "all")}
              >
                All formats
              </button>
              <button
                type="button"
                onClick={() => setTypeFilter("movie")}
                className={chip(typeFilter === "movie")}
              >
                <Film size={13} /> Movies
              </button>
              <button
                type="button"
                onClick={() => setTypeFilter("tv")}
                className={chip(typeFilter === "tv")}
              >
                <Tv size={13} /> Series
              </button>

              <span className="mx-1 h-4 w-px bg-zinc-800" />

              <button
                type="button"
                onClick={() => setStatus("all")}
                className={chip(status === "all")}
              >
                All status
              </button>
              <button
                type="button"
                onClick={() => setStatus("unwatched")}
                className={chip(status === "unwatched")}
              >
                <Eye size={13} /> Unwatched
              </button>
              <button
                type="button"
                onClick={() => setStatus("watched")}
                className={chip(status === "watched")}
              >
                <Check size={13} /> Watched
              </button>

              {allGenres.length > 1 && (
                <>
                  <span className="mx-1 h-4 w-px bg-zinc-800" />
                  <select
                    value={genre}
                    onChange={(e) => setGenre(e.target.value)}
                    aria-label="Filter by genre"
                    className="h-8 rounded-full bg-zinc-900 px-3 text-xs font-semibold text-zinc-300 ring-1 ring-zinc-800 focus:outline-none focus:ring-2 focus:ring-[#F5C518] cursor-pointer"
                  >
                    <option value="all">All genres</option>
                    {allGenres.map((g) => (
                      <option key={g} value={g} className="bg-zinc-900">
                        {g}
                      </option>
                    ))}
                  </select>
                </>
              )}

              <div className="ml-auto flex items-center gap-2">
                <button
                  type="button"
                  disabled={loadingRecs}
                  onClick={async () => {
                    const seed =
                      visible.find((i) => i.pinned) ||
                      visible[0] ||
                      items[0];
                    if (!seed) return;
                    setLoadingRecs(true);
                    try {
                      const res = await fetch(
                        `/api/recommendations?id=${seed.id}&type=${seed.type}`,
                      );
                      const data = await res.json();
                      setRecState({
                        open: true,
                        seedTitle: seed.title,
                        seedType: seed.type,
                        recommendations: data.recommendations || [],
                        similar: data.similar || [],
                      });
                    } catch (e) {
                      console.error("Failed to fetch recommendations:", e);
                    } finally {
                      setLoadingRecs(false);
                    }
                  }}
                  className="flex items-center gap-1.5 rounded-full bg-zinc-900 px-3.5 py-1.5 text-xs font-semibold text-[#F5C518] ring-1 ring-[#F5C518]/30 transition hover:bg-zinc-800 cursor-pointer disabled:opacity-50"
                >
                  <Sparkles size={13} />
                  <span>{loadingRecs ? "Loading..." : "For You"}</span>
                </button>
                <button
                  type="button"
                  onClick={pickForMe}
                  className="flex items-center gap-1.5 rounded-full bg-zinc-900 px-3.5 py-1.5 text-xs font-semibold text-zinc-300 ring-1 ring-zinc-800 transition hover:bg-zinc-800 hover:text-white cursor-pointer"
                >
                  <Shuffle size={13} />
                  <span>Pick for me</span>
                </button>
                <button
                  type="button"
                  onClick={() =>
                    selectMode ? exitSelectMode() : setSelectMode(true)
                  }
                  className={cn(
                    "flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition cursor-pointer",
                    selectMode
                      ? "bg-zinc-800 text-white ring-1 ring-zinc-700"
                      : "bg-zinc-900 text-zinc-400 ring-1 ring-zinc-800 hover:text-white"
                  )}
                >
                  <ListChecks size={13} />
                  <span>{selectMode ? "Done" : "Select"}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* --------------------------- Titles List --------------------------- */}
        {loadingItems ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 py-12">
            {[1, 2, 3, 4, 5].map((n) => (
              <div
                key={n}
                className="aspect-2/3 animate-pulse rounded-2xl bg-zinc-900"
              />
            ))}
          </div>
        ) : visible.length > 0 ? (
          view === "grid" ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {visible.map((item) => (
                <div
                  key={`${item.id}_${item.type}`}
                  className={cn(
                    "group relative flex flex-col overflow-hidden rounded-2xl bg-zinc-950 ring-1 transition-all duration-300",
                    selected.has(item.id)
                      ? "ring-2 ring-[#F5C518]"
                      : "ring-zinc-800/80 hover:ring-zinc-700 hover:shadow-xl hover:-translate-y-1"
                  )}
                >
                  {/* Select Mode Checkbox Overlay */}
                  {selectMode && (
                    <button
                      type="button"
                      onClick={() => toggleSelected(item.id)}
                      className="absolute inset-0 z-20 flex items-start justify-end p-2.5 bg-black/40 cursor-pointer"
                    >
                      <div
                        className={cn(
                          "flex h-6 w-6 items-center justify-center rounded-lg border text-black font-bold",
                          selected.has(item.id)
                            ? "bg-[#F5C518] border-[#F5C518]"
                            : "border-white/50 bg-black/60 text-transparent"
                        )}
                      >
                        <Check size={14} strokeWidth={3} />
                      </div>
                    </button>
                  )}

                  {/* Poster Link */}
                  <Link
                    href={`/title/${item.id}?type=${item.type}`}
                    className="relative aspect-2/3 overflow-hidden bg-zinc-900"
                  >
                    <Poster
                      src={item.poster}
                      alt={item.title}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />

                    {/* Gradient */}
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />

                    {/* Top Badges */}
                    <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                      {item.pinned && (
                        <span className="flex items-center gap-1 rounded-md bg-[#F5C518] px-2 py-0.5 text-[10px] font-bold text-black shadow-md">
                          <Pin size={10} className="fill-black" />
                          <span>Pinned</span>
                        </span>
                      )}
                      {item.watched && (
                        <span className="flex items-center gap-1 rounded-md bg-emerald-500 px-2 py-0.5 text-[10px] font-bold text-black shadow-md">
                          <Check size={10} strokeWidth={3} />
                          <span>Watched</span>
                        </span>
                      )}
                    </div>

                    {item.rating > 0 && (
                      <div className="absolute top-2.5 right-2.5 flex items-center gap-1 rounded-md bg-black/80 px-2 py-0.5 text-[10px] font-bold text-[#F5C518] backdrop-blur-md">
                        <Star size={10} className="fill-current" />
                        <span>{item.rating}</span>
                      </div>
                    )}
                  </Link>

                  {/* Details Card Content */}
                  <div className="flex flex-1 flex-col justify-between p-3.5">
                    <div>
                      <Link
                        href={`/title/${item.id}?type=${item.type}`}
                        className="line-clamp-1 text-sm font-bold text-white hover:text-[#F5C518] transition"
                      >
                        {item.title}
                      </Link>
                      <p className="mt-1 text-[11px] text-zinc-400">
                        {item.year} · {item.type === "tv" ? "Series" : "Movie"}
                      </p>
                    </div>

                    {!selectMode && (
                      <div className="mt-3 pt-3 border-t border-zinc-900 flex items-center justify-between">
                        <ItemActions
                          item={item}
                          onWatched={() => toggleWatched(item)}
                          onPin={() => togglePin(item)}
                          onRemove={() => removeItems([item.id])}
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* List View */
            <div className="divide-y divide-zinc-900 rounded-2xl border border-zinc-800 bg-zinc-950 overflow-hidden">
              {visible.map((item) => (
                <div
                  key={`${item.id}_${item.type}`}
                  className={cn(
                    "flex items-center gap-4 p-3.5 transition hover:bg-zinc-900/50",
                    selected.has(item.id) && "bg-zinc-900/80"
                  )}
                >
                  {selectMode && (
                    <button
                      type="button"
                      onClick={() => toggleSelected(item.id)}
                      className={cn(
                        "flex h-5 w-5 shrink-0 items-center justify-center rounded border cursor-pointer",
                        selected.has(item.id)
                          ? "bg-[#F5C518] border-[#F5C518] text-black"
                          : "border-zinc-700 bg-zinc-900 text-transparent"
                      )}
                    >
                      <Check size={12} strokeWidth={3} />
                    </button>
                  )}

                  <Link
                    href={`/title/${item.id}?type=${item.type}`}
                    className="h-16 w-11 shrink-0 overflow-hidden rounded-lg bg-zinc-900"
                  >
                    <Poster
                      src={item.poster}
                      alt={item.title}
                      className="h-full w-full object-cover"
                    />
                  </Link>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/title/${item.id}?type=${item.type}`}
                        className="truncate text-sm font-bold text-white hover:text-[#F5C518]"
                      >
                        {item.title}
                      </Link>
                      {item.pinned && (
                        <span className="rounded bg-[#F5C518]/20 px-1.5 py-0.5 text-[9px] font-bold text-[#F5C518]">
                          PINNED
                        </span>
                      )}
                      {item.watched && (
                        <span className="rounded bg-emerald-500/20 px-1.5 py-0.5 text-[9px] font-bold text-emerald-400">
                          WATCHED
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 text-xs text-zinc-400">
                      {item.year} · {item.type === "tv" ? "Series" : "Movie"} · {item.genre}
                    </p>
                  </div>

                  {!selectMode && (
                    <ItemActions
                      item={item}
                      onWatched={() => toggleWatched(item)}
                      onPin={() => togglePin(item)}
                      onRemove={() => removeItems([item.id])}
                    />
                  )}
                </div>
              ))}
            </div>
          )
        ) : stats.total === 0 ? (
          /* Empty state */
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-900 text-zinc-500 ring-1 ring-zinc-800">
              <Bookmark size={28} />
            </div>
            <h2 className="text-xl font-bold">Your watchlist is empty</h2>
            <p className="mt-1 max-w-sm text-sm text-zinc-400">
              Browse movies and series, then click &ldquo;Add to Watchlist&rdquo; to save them here.
            </p>
            <Link
              href="/home"
              className="mt-6 flex items-center gap-2 rounded-xl bg-[#F5C518] px-5 py-2.5 text-sm font-bold text-black transition hover:bg-[#e0b414]"
            >
              <span>Browse trending titles</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        ) : (
          /* No filter match */
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-900 text-zinc-500 ring-1 ring-zinc-800">
              <Search size={26} />
            </div>
            <h2 className="text-xl font-bold">No titles match</h2>
            <p className="mt-1 max-w-sm text-sm text-zinc-400">
              Try adjusting your query or filters.
            </p>
            <button
              type="button"
              onClick={resetFilters}
              className="mt-6 rounded-xl bg-zinc-900 px-5 py-2.5 text-sm font-semibold text-white ring-1 ring-zinc-700 transition hover:bg-zinc-800 cursor-pointer"
            >
              Reset filters
            </button>
          </div>
        )}

        {/* Clear all */}
        {stats.total > 0 && !selectMode && (
          <div className="mt-12 flex justify-center">
            <button
              type="button"
              onClick={() => removeItems(items.map((i) => i.id))}
              className="flex items-center gap-1.5 text-xs text-zinc-500 transition hover:text-red-400 cursor-pointer"
            >
              <Trash2 size={13} />
              <span>Clear entire watchlist</span>
            </button>
          </div>
        )}
      </div>

      {/* ---------------------- Bulk action bar ----------------------- */}
      {selectMode && (
        <div className="fixed inset-x-0 bottom-6 z-40 mx-auto flex w-[calc(100%-2rem)] max-w-xl flex-wrap items-center gap-2 rounded-2xl bg-zinc-900 p-3 shadow-2xl ring-1 ring-zinc-700">
          <span className="px-2 text-sm font-semibold">
            {selected.size} selected
          </span>
          <button
            type="button"
            onClick={
              selected.size === visible.length
                ? () => setSelected(new Set())
                : selectAllVisible
            }
            className="rounded-lg px-2.5 py-1.5 text-xs text-zinc-400 hover:text-white cursor-pointer"
          >
            {selected.size === visible.length ? "Deselect all" : "Select all"}
          </button>
          <div className="ml-auto flex items-center gap-2">
            <button
              type="button"
              disabled={!selected.size}
              onClick={() => {
                patchItems(Array.from(selected), { watched: true });
                exitSelectMode();
              }}
              className="flex items-center gap-1.5 rounded-lg bg-zinc-800 px-3 py-1.5 text-xs font-semibold transition hover:bg-zinc-700 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
            >
              <Check size={13} /> Mark watched
            </button>
            <button
              type="button"
              disabled={!selected.size}
              onClick={() => {
                removeItems(Array.from(selected));
                exitSelectMode();
              }}
              className="flex items-center gap-1.5 rounded-lg bg-red-950/60 px-3 py-1.5 text-xs font-semibold text-red-300 transition hover:bg-red-900/60 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
            >
              <Trash2 size={13} /> Remove
            </button>
          </div>
        </div>
      )}

      {/* ------------------------- Undo toast ------------------------- */}
      {toast && (
        <div
          role="status"
          className="fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-4 rounded-xl bg-zinc-100 px-4 py-3 text-sm text-black shadow-2xl"
          style={selectMode ? { bottom: "6.5rem" } : undefined}
        >
          <span>{toast.message}</span>
          <button
            type="button"
            onClick={toast.undo}
            className="flex items-center gap-1 font-bold underline-offset-2 hover:underline cursor-pointer"
          >
            <Undo2 size={14} /> Undo
          </button>
        </div>
      )}

      {recState?.open && (
        <SimilarModal
          title={recState.seedTitle}
          defaultType={recState.seedType}
          recommendations={recState.recommendations}
          similar={recState.similar}
          onClose={() => setRecState(null)}
        />
      )}
    </div>
  );
}
