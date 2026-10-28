"use client";

import { useEffect, useMemo, useState } from "react";
import { X, Play, ExternalLink, Film } from "lucide-react";
import type { TMDBVideo } from "@/types/tmdb";
import { cn } from "@/lib/utils";

type Props = {
  title: string;
  videos?: TMDBVideo[];
  onClose: () => void;
};

export default function TrailerModal({ title, videos = [], onClose }: Props) {
  const youtubeVideos = useMemo(() => {
    const filtered = videos.filter((v) => v.site === "YouTube" && v.key);
    const typePriority: Record<string, number> = {
      Trailer: 1,
      Teaser: 2,
      Clip: 3,
      Featurette: 4,
      "Behind the Scenes": 5,
    };
    return [...filtered].sort((a, b) => {
      const pA = typePriority[a.type] ?? 99;
      const pB = typePriority[b.type] ?? 99;
      if (pA !== pB) return pA - pB;
      if (a.official !== b.official) return a.official ? -1 : 1;
      return 0;
    });
  }, [videos]);

  const [selectedVideo, setSelectedVideo] = useState<TMDBVideo | null>(
    youtubeVideos[0] ?? null,
  );

  useEffect(() => {
    setSelectedVideo(youtubeVideos[0] ?? null);
  }, [youtubeVideos]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const youtubeSearchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(
    title,
  )}+trailer`;

  return (
    <div
      className="fixed inset-0 z-1002 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 transition-all duration-300 animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="relative flex max-h-[88vh] w-[94vw] max-w-4xl flex-col rounded-2xl border border-zinc-800 bg-zinc-950/95 shadow-[0_0_50px_rgba(245,197,24,0.15)] text-zinc-100 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800/80 px-6 py-4 bg-zinc-900/40">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F5C518]/10 text-[#F5C518] ring-1 ring-[#F5C518]/30">
              <Play size={20} className="fill-[#F5C518]" />
            </div>
            <div className="min-w-0">
              <h2 className="text-lg font-bold tracking-tight text-white truncate">
                {selectedVideo ? selectedVideo.name : `${title} — Trailer`}
              </h2>
              <p className="text-xs text-zinc-400 truncate">
                {selectedVideo
                  ? `${selectedVideo.type}${selectedVideo.official ? " · Official" : ""}`
                  : `Videos for ${title}`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <a
              href={
                selectedVideo
                  ? `https://www.youtube.com/watch?v=${selectedVideo.key}`
                  : youtubeSearchUrl
              }
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 rounded-lg bg-zinc-800/70 px-3 py-2 text-xs font-semibold text-zinc-200 transition hover:bg-zinc-800 hover:text-[#F5C518]"
            >
              <span>YouTube</span>
              <ExternalLink size={13} />
            </a>
            <button
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-800/60 text-zinc-400 transition hover:bg-zinc-800 hover:text-white cursor-pointer"
              aria-label="Close modal"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Video Player */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {selectedVideo ? (
            <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-black ring-1 ring-zinc-800">
              <iframe
                key={selectedVideo.key}
                src={`https://www.youtube.com/embed/${selectedVideo.key}?autoplay=1&rel=0`}
                title={selectedVideo.name}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="h-full w-full border-0"
              />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-zinc-900 border border-zinc-800 text-zinc-500">
                <Film size={28} />
              </div>
              <h3 className="text-lg font-semibold text-zinc-200">
                No embedded trailer found on TMDB
              </h3>
              <p className="mt-1 max-w-sm text-sm text-zinc-400">
                You can still watch the trailer directly on YouTube.
              </p>
              <a
                href={youtubeSearchUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#F5C518] px-5 py-2.5 text-sm font-bold text-black transition hover:bg-[#e0b414]"
              >
                <Play size={15} className="fill-black" />
                <span>Search Trailer on YouTube</span>
                <ExternalLink size={14} />
              </a>
            </div>
          )}

          {/* Video Selector Strip */}
          {youtubeVideos.length > 1 && (
            <div>
              <p className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-zinc-400">
                More Videos ({youtubeVideos.length})
              </p>
              <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-thin">
                {youtubeVideos.map((video) => {
                  const active = selectedVideo?.id === video.id;
                  return (
                    <button
                      key={video.id}
                      type="button"
                      onClick={() => setSelectedVideo(video)}
                      className={cn(
                        "flex shrink-0 flex-col items-start gap-1 rounded-xl border px-3.5 py-2.5 text-left transition cursor-pointer max-w-56",
                        active
                          ? "border-[#F5C518] bg-[#F5C518]/15 text-white"
                          : "border-zinc-800 bg-zinc-900/60 text-zinc-300 hover:border-zinc-700 hover:bg-zinc-900",
                      )}
                    >
                      <span className="line-clamp-1 text-xs font-semibold">
                        {video.name}
                      </span>
                      <span className="text-[10px] text-[#F5C518]">
                        {video.type}
                        {video.official ? " · Official" : ""}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

