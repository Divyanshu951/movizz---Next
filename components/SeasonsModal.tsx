"use client";

import { useEffect, useMemo, useState } from "react";
import { X, Layers, Star, Clock, Calendar, Film } from "lucide-react";
import type { TMDBSeasonDetails } from "@/types/tmdb";
import { cn } from "@/lib/utils";

type SeasonSummary = {
  id: number;
  name: string;
  season_number: number;
  episode_count: number;
};

type Props = {
  tvId: string | number;
  title: string;
  seasons?: SeasonSummary[];
  onClose: () => void;
};

export default function SeasonsModal({
  tvId,
  title,
  seasons = [],
  onClose,
}: Props) {
  const validSeasons = useMemo(() => {
    const nonSpecials = seasons.filter((s) => s.season_number > 0);
    return nonSpecials.length > 0 ? nonSpecials : seasons;
  }, [seasons]);

  const [selectedSeasonNum, setSelectedSeasonNum] = useState<number>(
    validSeasons[0]?.season_number ?? 1,
  );
  const [seasonData, setSeasonData] = useState<TMDBSeasonDetails | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  useEffect(() => {
    let active = true;
    setLoading(true);

    fetch(`/api/season?id=${tvId}&season=${selectedSeasonNum}`)
      .then((res) => res.json())
      .then((data) => {
        if (active && data.season) {
          setSeasonData(data.season);
        }
      })
      .catch((err) => console.error("Failed to fetch season:", err))
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [tvId, selectedSeasonNum]);

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
        <div className="flex items-center justify-between border-b border-zinc-800/80 px-6 py-4 bg-zinc-900/40">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F5C518]/10 text-[#F5C518] ring-1 ring-[#F5C518]/30">
              <Layers size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-white">
                Season & Episode Guide
              </h2>
              <p className="text-xs text-zinc-400 truncate max-w-md">
                {title} · {validSeasons.length}{" "}
                {validSeasons.length === 1 ? "Season" : "Seasons"}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-800/60 text-zinc-400 transition hover:bg-zinc-800 hover:text-white cursor-pointer"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Season Tabs */}
        {validSeasons.length > 0 && (
          <div className="flex gap-2 overflow-x-auto border-b border-zinc-800/70 bg-zinc-900/20 px-6 py-3 scrollbar-thin">
            {validSeasons.map((s) => {
              const active = s.season_number === selectedSeasonNum;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setSelectedSeasonNum(s.season_number)}
                  className={cn(
                    "shrink-0 rounded-xl px-3.5 py-1.5 text-xs font-bold transition cursor-pointer",
                    active
                      ? "bg-[#F5C518] text-black shadow"
                      : "bg-zinc-900 text-zinc-400 ring-1 ring-zinc-800 hover:text-white",
                  )}
                >
                  {s.name || `Season ${s.season_number}`}
                  <span className="ml-1.5 opacity-75 text-[10px]">
                    ({s.episode_count})
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* Episode List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full min-h-64 gap-3 text-zinc-400">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#F5C518] border-t-transparent" />
              <p className="text-sm">
                Loading Season {selectedSeasonNum} episodes...
              </p>
            </div>
          ) : !seasonData || !seasonData.episodes?.length ? (
            <p className="text-center text-sm text-zinc-400 py-14">
              No episode details found for this season.
            </p>
          ) : (
            seasonData.episodes.map((ep) => (
              <div
                key={ep.id}
                className="flex flex-col gap-4 rounded-xl border border-zinc-800/80 bg-zinc-900/50 p-4 transition hover:border-zinc-700/80 sm:flex-row"
              >
                <div className="relative aspect-video w-full shrink-0 overflow-hidden rounded-lg bg-zinc-900 sm:w-48">
                  {ep.still_path ? (
                    <img
                      src={`https://image.tmdb.org/t/p/w300${ep.still_path}`}
                      alt={ep.name}
                      loading="lazy"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-zinc-600">
                      <Film size={24} />
                    </div>
                  )}
                  <span className="absolute bottom-2 left-2 rounded bg-black/80 px-2 py-0.5 text-[10px] font-bold text-[#F5C518]">
                    E{ep.episode_number}
                  </span>
                </div>

                <div className="flex flex-1 flex-col justify-between gap-2">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-sm font-bold text-white">
                        {ep.episode_number}. {ep.name}
                      </h3>
                      {typeof ep.vote_average === "number" &&
                        ep.vote_average > 0 && (
                          <span className="flex shrink-0 items-center gap-1 rounded-full bg-[#F5C518]/15 px-2 py-0.5 text-[11px] font-bold text-[#F5C518]">
                            <Star size={11} className="fill-[#F5C518]" />
                            {ep.vote_average.toFixed(1)}
                          </span>
                        )}
                    </div>

                    <div className="mt-1 flex flex-wrap items-center gap-3 text-[11px] text-zinc-400">
                      {ep.air_date && (
                        <span className="flex items-center gap-1">
                          <Calendar size={11} />
                          {ep.air_date}
                        </span>
                      )}
                      {ep.runtime && (
                        <span className="flex items-center gap-1">
                          <Clock size={11} />
                          {ep.runtime} min
                        </span>
                      )}
                    </div>

                    {ep.overview && (
                      <p className="mt-2 text-xs leading-relaxed text-zinc-300">
                        {ep.overview}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

