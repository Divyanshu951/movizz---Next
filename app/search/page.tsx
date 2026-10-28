"use client";

import SearchResultCard from "@/components/ui/SearchResultCard";
import { cn } from "@/lib/utils";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
// import SearchResultCard from "@/components/SearchResultCard";

type SearchItem = {
  id: number;
  media_type: "movie" | "tv";
  [key: string]: unknown;
};

type SearchResponse = {
  page: number;
  results: SearchItem[];
  total_pages: number;
  total_results: number;
};

export default function SearchResultsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black" />}>
      <SearchResults />
    </Suspense>
  );
}

function SearchResults() {
  const searchParams = useSearchParams();
  const [type, setType] = useState<"movie" | "tv" | "all">("all");

  const query = searchParams.get("q");

  if (!query) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black p-10 font-sans text-gray-500">
        <p className="text-center text-2xl tracking-tight">
          Begin your journey. Use the search bar below to find movies and shows.
        </p>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#050505] text-white">
      <div className="absolute inset-0 bg-linear-to-b from-zinc-900 via-black to-black" />

      <div className="pointer-events-none fixed bottom-[-8%] left-0 z-0 w-full text-center text-[28vw] leading-none font-bold tracking-tighter text-[#151515] uppercase select-none">
        MOVIEZZ
      </div>

      <div className="relative z-10 mx-auto max-w-5xl px-4 pt-8 pb-32 md:px-6 md:pt-10 md:pb-20">
        <div className="mb-8 md:mb-14 relative">
          <p className="mb-2 md:mb-3 text-xs md:text-sm tracking-[0.3em] text-yellow-500/70 uppercase">
            Search Results
          </p>
          <h1 className="max-w-3xl text-3xl sm:text-4xl leading-tight font-black tracking-tight md:text-6xl">
            Explore results for{" "}
            <span className="text-[#F5C518]">&quot;{query}&quot;</span>
            {/* in{" "}            {type === "movie" ? "movies" : "series"} */}
          </h1>
          <div className="mt-4 md:mt-6 h-0.5 w-40 md:w-55 bg-linear-to-r from-[#F5C518] to-transparent" />
          <div className="mt-5 flex border-gray-400 md:mt-0 md:absolute md:bottom-0 md:right-0 h-10 w-full max-w-64 md:w-64 items-center rounded-2xl bg-muted p-1">
            <button
              onClick={() => setType("all")}
              className={cn(
                type === "all" && "bg-primary text-black ",
                "flex-1 cursor-pointer rounded-xl  px-3 py-2 text-sm font-medium transition-colors hover:bg-gray-400",
              )}
            >
              All
            </button>
            <button
              onClick={() => setType("movie")}
              className={cn(
                type === "movie" && "bg-primary text-black ",
                "flex-1 cursor-pointer rounded-xl  px-3 py-2 text-sm font-medium transition-colors hover:bg-gray-400",
              )}
            >
              Movies
            </button>
            <button
              onClick={() => setType("tv")}
              className={cn(
                type === "tv" && "bg-primary text-black ",
                "flex-1 cursor-pointer rounded-xl  px-3 py-2 text-sm font-medium transition-colors hover:bg-gray-400",
              )}
            >
              TV
            </button>
          </div>{" "}
        </div>

        {/* key resets page + data whenever the search changes */}
        <SearchContent query={query} type={type} />
      </div>
    </div>
  );
}

function SearchContent({
  query,
  type,
}: {
  query: string;
  type: "movie" | "tv" | "all";
}) {
  const [page, setPage] = useState(1);
  const [data, setData] = useState<SearchResponse | null>(null);
  const [isFetching, setIsFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    setIsFetching(true);
    setError(null);

    const params = new URLSearchParams({
      query,
      page: String(page),
    });

    fetch(`/api/search?${params}`, { signal: controller.signal })
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed to fetch results");
        return (await res.json()) as SearchResponse;
      })
      .then((json) => {
        setData(json);
        setIsFetching(false);
      })
      .catch((err) => {
        if (err.name === "AbortError") return;
        setError(err.message);
        setIsFetching(false);
      });

    return () => controller.abort();
  }, [query, type, page]);

  console.log(data);

  // First load only; later page changes keep old data visible (dimmed)
  if (!data && isFetching) return <SearchSkeleton />;

  if (error) {
    return <p className="text-center text-red-400">{error}</p>;
  }

  if (!data || data.results.length === 0) {
    return (
      <p className="text-center text-xl text-gray-500">No results found.</p>
    );
  }

  // TMDB caps pagination at 500 pages
  const totalPages = Math.min(data.total_pages, 500);

  return (
    <div className="relative">
      <div className="fixed bottom-18 right-4 z-50 md:bottom-auto md:top-1/2 md:right-6 md:-translate-y-1/2">
        <div className="flex flex-row items-center gap-3 rounded-2xl border border-white/10 bg-black/80 p-2 backdrop-blur-xl md:flex-col md:gap-4 md:rounded-3xl md:bg-black/40 md:p-3">
          <button
            onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
            disabled={page === 1 || isFetching}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-xl text-white transition-all duration-300 hover:scale-110 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-30 md:h-12 md:w-12 md:rounded-2xl md:text-2xl"
          >
            -
          </button>

          <div className="flex flex-col items-center px-1 md:px-0">
            <span className="text-xl font-black text-white md:text-3xl">{page}</span>
            <span className="text-[10px] tracking-[0.2em] text-white/40 uppercase md:text-xs md:tracking-[0.3em]">
              / {totalPages}
            </span>
          </div>

          <button
            onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={page >= totalPages || isFetching}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-xl text-white transition-all duration-300 hover:scale-110 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-30 md:h-12 md:w-12 md:rounded-2xl md:text-2xl"
          >
            +
          </button>
        </div>
      </div>

      <div
        className={`grid grid-cols-2 gap-4 sm:gap-6 transition-opacity duration-300 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 ${
          isFetching ? "opacity-70" : "opacity-100"
        }`}
      >
        {type === "all"
          ? data.results.map((item) => (
              <SearchResultCard key={item.id} item={item} />
            ))
          : data.results
              .filter((item) => item.media_type === type)
              .map((item) => <SearchResultCard key={item.id} item={item} />)}
      </div>
    </div>
  );
}

function SearchSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-6 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 20 }).map((_, index) => (
        <div
          key={index}
          className="overflow-hidden rounded-3xl border border-white/5 bg-white/5"
        >
          <div className="aspect-2/3 animate-pulse bg-white/10" />
          <div className="space-y-3 p-4">
            <div className="h-5 w-3/4 animate-pulse rounded-full bg-white/10" />
            <div className="h-4 w-1/2 animate-pulse rounded-full bg-white/10" />
          </div>
        </div>
      ))}
    </div>
  );
}
