"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import MovizzLogo from "@/components/svgs/MovizzLogo";
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
} from "lucide-react";

/* -------------------------------------------------------------------------- */
/*  Types & data                                                              */
/* -------------------------------------------------------------------------- */

type MediaType = "movie" | "tv";

interface WishlistItem {
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

const STORAGE_KEY = "movizz:wishlist:v2";
const DAY = 86_400_000;

// DUMMY WISHLIST DATA
// Developer Note: Replace this with your Neon DB / Better Auth user wishlist logic.
// localStorage below is only a stopgap so changes survive a refresh while you build the backend.
const INITIAL_WISHLIST: WishlistItem[] = [
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

/* -------------------------------------------------------------------------- */
/*  Small helpers                                                             */
/* -------------------------------------------------------------------------- */

const cn = (...parts: Array<string | false | null | undefined>) =>
  parts.filter(Boolean).join(" ");

const genresOf = (item: WishlistItem) =>
  item.genre
    .split("/")
    .map((g) => g.trim())
    .filter(Boolean);

const trailerUrl = (title: string) =>
  `https://www.youtube.com/results?search_query=${encodeURIComponent(title)}+trailer`;

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
          className,
        )}
        role="img"
        aria-label={alt}
      >
        <Film size={28} />
      </div>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      loading="lazy"
      onError={() => setFailed(true)}
      className={className}
    />
  );
}

/* -------------------------------------------------------------------------- */
/*  Item action buttons (shared by grid + list)                               */
/* -------------------------------------------------------------------------- */

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
            : "bg-zinc-900 text-zinc-400 hover:bg-zinc-800 hover:text-white",
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
/*  Page                                                                      */
/* -------------------------------------------------------------------------- */

export default function WishlistPage() {
  const [items, setItems] = useState<WishlistItem[]>(INITIAL_WISHLIST);
  const [hydrated, setHydrated] = useState(false);

  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | MediaType>("all");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [genre, setGenre] = useState("all");
  const [sort, setSort] = useState<SortKey>("recent");
  const [view, setView] = useState<ViewMode>("grid");

  const [selectMode, setSelectMode] = useState(false);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [pickId, setPickId] = useState<number | null>(null);

  const [toast, setToast] = useState<{
    message: string;
    undo: () => void;
  } | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* ---- persistence (replace with DB calls) ---- */
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as {
          items: WishlistItem[];
          view?: ViewMode;
        };
        if (Array.isArray(parsed.items)) setItems(parsed.items);
        if (parsed.view) setView(parsed.view);
      }
    } catch {
      /* ignore corrupt storage */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ items, view }));
    } catch {
      /* storage full or unavailable */
    }
  }, [items, view, hydrated]);

  useEffect(
    () => () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    },
    [],
  );

  const showToast = useCallback((message: string, undo: () => void) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ message, undo });
    toastTimer.current = setTimeout(() => setToast(null), 6000);
  }, []);

  /* ---- mutations ---- */
  const removeItems = (ids: number[]) => {
    // TODO: await deleteWishlistItems(userId, ids)
    const snapshot = items;
    const count = ids.length;
    setItems((prev) => prev.filter((i) => !ids.includes(i.id)));
    setSelected(new Set());
    if (pickId !== null && ids.includes(pickId)) setPickId(null);
    showToast(
      count === 1
        ? `Removed “${snapshot.find((i) => i.id === ids[0])?.title}”`
        : `Removed ${count} titles`,
      () => {
        // TODO: re-insert in DB
        setItems(snapshot);
        setToast(null);
      },
    );
  };

  const patchItems = (ids: number[], patch: Partial<WishlistItem>) => {
    // TODO: await updateWishlistItems(userId, ids, patch)
    setItems((prev) =>
      prev.map((i) => (ids.includes(i.id) ? { ...i, ...patch } : i)),
    );
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

  /* ---- derived data ---- */
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
    // Pinned titles always float to the top, then the chosen sort applies.
    return [...list].sort(
      (a, b) => Number(b.pinned) - Number(a.pinned) || cmp[sort](a, b),
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

  /* ---------------------------------------------------------------------- */
  /*  Render                                                                */
  /* ---------------------------------------------------------------------- */

  const chip = (active: boolean) =>
    cn(
      "flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition cursor-pointer",
      "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F5C518]",
      active
        ? "bg-[#F5C518] text-black"
        : "bg-zinc-900 text-zinc-400 ring-1 ring-zinc-800 hover:text-white hover:ring-zinc-700",
    );

  return (
    <div className="min-h-screen bg-black px-4 pb-40 pt-6 text-white sm:px-6 lg:px-8">
      <div className="flex justify-center pb-8">
        <Link href="/home" aria-label="Movizz home">
          <MovizzLogo />
        </Link>
      </div>

      <div className="mx-auto max-w-6xl">
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
                  placeholder="Search your wishlist"
                  aria-label="Search your wishlist"
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
                  aria-label="Sort wishlist"
                  className="rounded-xl bg-zinc-900 px-3 py-2.5 text-sm text-zinc-200 ring-1 ring-zinc-800 focus:outline-none focus:ring-2 focus:ring-[#F5C518] cursor-pointer"
                >
                  {(Object.keys(SORT_LABELS) as SortKey[]).map((k) => (
                    <option key={k} value={k}>
                      {SORT_LABELS[k]}
                    </option>
                  ))}
                </select>

                <div
                  className="flex rounded-xl bg-zinc-900 p-1 ring-1 ring-zinc-800"
                  role="group"
                  aria-label="Layout"
                >
                  {(
                    [
                      ["grid", LayoutGrid, "Grid view"],
                      ["list", List, "List view"],
                    ] as const
                  ).map(([mode, Icon, label]) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setView(mode)}
                      aria-label={label}
                      aria-pressed={view === mode}
                      title={label}
                      className={cn(
                        "rounded-lg p-2 transition cursor-pointer",
                        view === mode
                          ? "bg-zinc-700 text-white"
                          : "text-zinc-500 hover:text-white",
                      )}
                    >
                      <Icon size={15} />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                className={chip(typeFilter === "all")}
                onClick={() => setTypeFilter("all")}
              >
                All
              </button>
              <button
                type="button"
                className={chip(typeFilter === "movie")}
                onClick={() => setTypeFilter("movie")}
              >
                <Film size={12} /> Movies
              </button>
              <button
                type="button"
                className={chip(typeFilter === "tv")}
                onClick={() => setTypeFilter("tv")}
              >
                <Tv size={12} /> Series
              </button>

              <span
                className="mx-1 hidden h-5 w-px bg-zinc-800 sm:block"
                aria-hidden
              />

              <button
                type="button"
                className={chip(status === "unwatched")}
                onClick={() =>
                  setStatus(status === "unwatched" ? "all" : "unwatched")
                }
              >
                To watch
              </button>
              <button
                type="button"
                className={chip(status === "watched")}
                onClick={() =>
                  setStatus(status === "watched" ? "all" : "watched")
                }
              >
                <Eye size={12} /> Watched
              </button>

              <select
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                aria-label="Filter by genre"
                className="rounded-full bg-zinc-900 px-3.5 py-1.5 text-xs font-semibold text-zinc-300 ring-1 ring-zinc-800 focus:outline-none focus:ring-2 focus:ring-[#F5C518] cursor-pointer"
              >
                <option value="all">Any genre</option>
                {allGenres.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>

              <div className="ml-auto flex items-center gap-2">
                <button
                  type="button"
                  onClick={pickForMe}
                  className="flex items-center gap-1.5 rounded-full bg-[#F5C518]/10 px-3.5 py-1.5 text-xs font-semibold text-[#F5C518] ring-1 ring-[#F5C518]/30 transition hover:bg-[#F5C518]/20 cursor-pointer"
                >
                  <Shuffle size={13} />
                  <span>Pick for me</span>
                </button>
                <button
                  type="button"
                  onClick={() =>
                    selectMode ? exitSelectMode() : setSelectMode(true)
                  }
                  aria-pressed={selectMode}
                  className={chip(selectMode)}
                >
                  <ListChecks size={13} />
                  <span>{selectMode ? "Done" : "Select"}</span>
                </button>
              </div>
            </div>

            <p className="text-xs text-zinc-500" aria-live="polite">
              Showing {visible.length} of {stats.total}
              {hasActiveFilters && (
                <>
                  {" · "}
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="text-[#F5C518] underline-offset-2 hover:underline cursor-pointer"
                  >
                    Reset filters
                  </button>
                </>
              )}
            </p>
          </div>
        )}

        {/* ----------------------------- Items ---------------------------- */}
        {visible.length > 0 ? (
          <ul
            className={cn(
              view === "grid"
                ? "grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
                : "grid grid-cols-1 gap-3 md:grid-cols-2",
            )}
          >
            {visible.map((item) => {
              const isSelected = selected.has(item.id);
              const actions = (
                <ItemActions
                  item={item}
                  onWatched={() => toggleWatched(item)}
                  onPin={() => togglePin(item)}
                  onRemove={() => removeItems([item.id])}
                />
              );

              const selectBadge = selectMode && (
                <span
                  aria-hidden
                  className={cn(
                    "absolute right-2 top-2 z-10 flex h-6 w-6 items-center justify-center rounded-full ring-2 transition",
                    isSelected
                      ? "bg-[#F5C518] text-black ring-[#F5C518]"
                      : "bg-black/70 text-transparent ring-white/60",
                  )}
                >
                  <Check size={14} strokeWidth={3} />
                </span>
              );

              if (view === "grid") {
                return (
                  <li key={item.id} className="group">
                    <div className="relative">
                      {selectMode ? (
                        <button
                          type="button"
                          onClick={() => toggleSelected(item.id)}
                          aria-pressed={isSelected}
                          aria-label={`Select ${item.title}`}
                          className="absolute inset-0 z-20 rounded-2xl cursor-pointer"
                        />
                      ) : (
                        <Link
                          href={`/title/${item.id}?type=${item.type}`}
                          aria-label={`View ${item.title}`}
                          className="absolute inset-0 z-10 rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F5C518]"
                        />
                      )}
                      <div
                        className={cn(
                          "relative aspect-[2/3] overflow-hidden rounded-2xl bg-zinc-900 ring-1 transition",
                          isSelected
                            ? "ring-2 ring-[#F5C518]"
                            : "ring-white/10 group-hover:ring-white/25",
                        )}
                      >
                        <Poster
                          src={item.poster}
                          alt={item.title}
                          className={cn(
                            "h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]",
                            item.watched && "opacity-45 saturate-50",
                          )}
                        />
                        <div className="absolute left-2 top-2 flex items-center gap-1 rounded-full bg-black/80 px-2 py-0.5 text-[11px] font-bold text-[#F5C518] backdrop-blur-md">
                          <Star size={10} className="fill-[#F5C518]" />
                          <span>{item.rating.toFixed(1)}</span>
                        </div>
                        {item.watched && (
                          <div className="absolute inset-x-0 bottom-0 bg-black/70 py-1.5 text-center text-xs font-semibold text-zinc-200">
                            Watched
                          </div>
                        )}
                        {item.pinned && !selectMode && (
                          <Pin
                            size={14}
                            className="absolute right-2 top-2 fill-[#F5C518] text-[#F5C518]"
                            aria-label="Pinned"
                          />
                        )}
                        {selectBadge}
                      </div>
                    </div>

                    <div className="mt-3">
                      <h2 className="line-clamp-1 text-sm font-bold">
                        {item.title}
                      </h2>
                      <p className="mt-0.5 flex items-center gap-1.5 text-xs text-zinc-500">
                        {item.type === "tv" ? (
                          <Tv size={11} />
                        ) : (
                          <Film size={11} />
                        )}
                        {item.year}
                        <span aria-hidden>·</span>
                        <span className="line-clamp-1">
                          {genresOf(item)[0]}
                        </span>
                      </p>
                      {!selectMode && <div className="mt-2.5">{actions}</div>}
                    </div>
                  </li>
                );
              }

              // List view
              return (
                <li
                  key={item.id}
                  className={cn(
                    "group relative flex gap-4 overflow-hidden rounded-2xl border bg-zinc-950 p-3.5 transition",
                    isSelected
                      ? "border-[#F5C518]"
                      : "border-zinc-800/80 hover:border-zinc-700",
                  )}
                >
                  {selectMode && (
                    <button
                      type="button"
                      onClick={() => toggleSelected(item.id)}
                      aria-pressed={isSelected}
                      aria-label={`Select ${item.title}`}
                      className="absolute inset-0 z-20 cursor-pointer"
                    />
                  )}
                  <div className="relative h-40 w-28 shrink-0 overflow-hidden rounded-xl bg-zinc-900 ring-1 ring-white/10">
                    <Poster
                      src={item.poster}
                      alt={item.title}
                      className={cn(
                        "h-full w-full object-cover",
                        item.watched && "opacity-45 saturate-50",
                      )}
                    />
                    <div className="absolute left-2 top-2 flex items-center gap-1 rounded-full bg-black/80 px-2 py-0.5 text-[10px] font-bold text-[#F5C518] backdrop-blur-md">
                      <Star size={10} className="fill-[#F5C518]" />
                      <span>{item.rating.toFixed(1)}</span>
                    </div>
                  </div>

                  <div className="flex min-w-0 flex-1 flex-col justify-between py-0.5">
                    <div>
                      <p className="flex items-center gap-1.5 text-xs text-zinc-500">
                        {item.type === "tv" ? (
                          <Tv size={11} />
                        ) : (
                          <Film size={11} />
                        )}
                        {item.type === "tv" ? "Series" : "Movie"} · {item.year}
                        {item.watched && (
                          <span className="text-[#F5C518]">· Watched</span>
                        )}
                        {item.pinned && (
                          <Pin
                            size={11}
                            className="fill-[#F5C518] text-[#F5C518]"
                          />
                        )}
                      </p>
                      <h2 className="mt-0.5 line-clamp-1 text-lg font-bold">
                        {item.title}
                      </h2>
                      <div className="mt-1.5 flex flex-wrap gap-1.5">
                        {genresOf(item).map((g) => (
                          <span
                            key={g}
                            className="rounded-full bg-zinc-900 px-2 py-0.5 text-[11px] text-zinc-400 ring-1 ring-zinc-800"
                          >
                            {g}
                          </span>
                        ))}
                      </div>
                      <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-zinc-400">
                        {item.overview}
                      </p>
                    </div>
                    <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                      <Link
                        href={`/title/${item.id}?type=${item.type}`}
                        className="flex items-center gap-1.5 rounded-lg bg-[#F5C518] px-3.5 py-1.5 text-xs font-bold text-black transition hover:bg-[#e0b414]"
                      >
                        <span>View title</span>
                        <ArrowRight size={13} />
                      </Link>
                      {!selectMode && actions}
                    </div>
                  </div>
                  {selectBadge}
                </li>
              );
            })}
          </ul>
        ) : stats.total === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-900 text-zinc-500 ring-1 ring-zinc-800">
              <Bookmark size={28} />
            </div>
            <h2 className="text-xl font-bold">Your wishlist is empty</h2>
            <p className="mt-1 max-w-sm text-sm text-zinc-400">
              Tap the bookmark on any title in Movizz to save it here for later.
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
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-900 text-zinc-500 ring-1 ring-zinc-800">
              <Search size={26} />
            </div>
            <h2 className="text-xl font-bold">No titles match</h2>
            <p className="mt-1 max-w-sm text-sm text-zinc-400">
              Try a different search or clear your filters to see everything
              you’ve saved.
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

        {/* Clear all (undoable) */}
        {stats.total > 0 && !selectMode && (
          <div className="mt-12 flex justify-center">
            <button
              type="button"
              onClick={() => removeItems(items.map((i) => i.id))}
              className="flex items-center gap-1.5 text-xs text-zinc-500 transition hover:text-red-400 cursor-pointer"
            >
              <Trash2 size={13} />
              <span>Clear entire wishlist</span>
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
    </div>
  );
}
