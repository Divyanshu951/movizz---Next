"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { X, Sparkles, Star, Film } from "lucide-react";
import type { SearchItem } from "@/types/tmdb";
import { cn } from "@/lib/utils";

type Props = {
  title: string;
  defaultType: "movie" | "tv";
  recommendations?: SearchItem[];
  similar?: SearchItem[];
  onClose: () => void;
};

export default function SimilarModal({
  title,
  defaultType,
  recommendations = [],
  similar = [],
  onClose,
}: Props) {
  const [tab, setTab] = useState<"recommendations" | "similar">(
    recommendations.length > 0 ? "recommendations" : "similar",
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const items = tab === "recommendations" ? recommendations : similar;

  return (
    <div
      className="fixed inset-0 z-1002 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 transition-all duration-300 animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="relative flex h-[84vh] w-[94vw] max-w-4xl flex-col rounded-2xl border border-zinc-800 bg-zinc-950/95 shadow-[0_0_50px_rgba(245,197,24,0.15)] text-zinc-100 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800/80 px-6 py-4 bg-zinc-900/40">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F5C518]/10 text-[#F5C518] ring-1 ring-[#F5C518]/30">
              <Sparkles size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-white">
                More Like This
              </h2>
              <p className="text-xs text-zinc-400 truncate max-w-sm">
                Based on <span className="text-zinc-200 font-medium">{title}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex rounded-xl bg-zinc-900 p-1 ring-1 ring-zinc-800">
              <button
                type="button"
                onClick={() => setTab("recommendations")}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-xs font-semibold transition cursor-pointer",
                  tab === "recommendations"
                    ? "bg-[#F5C518] text-black"
                    : "text-zinc-400 hover:text-white",
                )}
              >
                Recommended ({recommendations.length})
              </button>
              <button
                type="button"
                onClick={() => setTab("similar")}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-xs font-semibold transition cursor-pointer",
                  tab === "similar"
                    ? "bg-[#F5C518] text-black"
                    : "text-zinc-400 hover:text-white",
                )}
              >
                Similar ({similar.length})
              </button>
            </div>

            <button
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-800/60 text-zinc-400 transition hover:bg-zinc-800 hover:text-white cursor-pointer"
              aria-label="Close modal"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full min-h-64 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-zinc-900 border border-zinc-800 text-zinc-500">
                <Sparkles size={28} />
              </div>
              <h3 className="text-lg font-semibold text-zinc-200">
                No {tab} titles found
              </h3>
              <p className="mt-1 max-w-sm text-sm text-zinc-400">
                Try switching tabs above to discover related titles.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
              {items.slice(0, 20).map((item) => {
                const mediaType =
                  item.media_type === "tv" || item.media_type === "movie"
                    ? item.media_type
                    : defaultType;
                const itemTitle =
                  mediaType === "tv"
                    ? item.name || item.title
                    : item.title || item.name;
                const rawDate =
                  mediaType === "tv"
                    ? item.first_air_date || item.release_date
                    : item.release_date || item.first_air_date;
                const year = rawDate ? rawDate.split("-")[0] : "N/A";

                return (
                  <Link
                    key={item.id}
                    href={`/title/${item.id}?type=${mediaType}`}
                    onClick={onClose}
                    className="group flex flex-col overflow-hidden rounded-xl border border-zinc-800/80 bg-zinc-900/50 transition hover:border-[#F5C518]/50 hover:-translate-y-1"
                  >
                    <div className="relative aspect-2/3 w-full overflow-hidden bg-zinc-900">
                      {item.poster_path ? (
                        <img
                          src={`https://image.tmdb.org/t/p/w342${item.poster_path}`}
                          alt={itemTitle || ""}
                          loading="lazy"
                          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-zinc-600">
                          <Film size={28} />
                        </div>
                      )}
                      {typeof item.vote_average === "number" &&
                        item.vote_average > 0 && (
                          <span className="absolute top-2.5 right-2.5 flex items-center gap-1 rounded-md bg-black/80 px-2 py-0.5 text-[10px] font-bold text-[#F5C518] backdrop-blur-md">
                            <Star size={10} className="fill-current" />
                            {item.vote_average.toFixed(1)}
                          </span>
                        )}
                    </div>
                    <div className="p-3">
                      <p className="line-clamp-1 text-xs font-bold text-white group-hover:text-[#F5C518]">
                        {itemTitle}
                      </p>
                      <p className="mt-0.5 text-[11px] text-zinc-400">
                        {year} · {mediaType === "tv" ? "Series" : "Movie"}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

