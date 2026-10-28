"use client";

import { useEffect, useState } from "react";
import { X, Star, MessageSquare, User, Calendar, ExternalLink } from "lucide-react";
import { TMDBReview } from "@/types/tmdb";

type Props = {
  movieId: string;
  type?: "movie" | "tv";
  title?: string;
  toggleReviews: (value: boolean) => void;
};

export default function Reviews({
  movieId,
  type = "movie",
  title,
  toggleReviews,
}: Props) {
  const [reviews, setReviews] = useState<TMDBReview[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedReviews, setExpandedReviews] = useState<Record<string, boolean>>({});

  useEffect(() => {
    let isMounted = true;
    async function loadReviews() {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/reviews?id=${movieId}&type=${type}`);
        if (!res.ok) throw new Error("Failed to load reviews");
        const json = await res.json();
        if (isMounted) {
          setReviews(json.reviews || []);
        }
      } catch (err) {
        if (isMounted) {
          console.error("Error loading reviews:", err);
          setError("Failed to load reviews. Please try again later.");
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    if (movieId) {
      loadReviews();
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        toggleReviews(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      isMounted = false;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [movieId, type, toggleReviews]);

  const toggleExpand = (id: string) => {
    setExpandedReviews((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const getAvatarUrl = (path?: string | null) => {
    if (!path) return null;
    if (path.startsWith("/http") || path.startsWith("http")) {
      return path.replace(/^\//, "");
    }
    return `https://image.tmdb.org/t/p/w185${path}`;
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 transition-all duration-300 animate-in fade-in"
      onClick={() => toggleReviews(false)}
    >
      <div
        className="relative flex h-[82vh] w-[92vw] max-w-4xl flex-col rounded-2xl border border-zinc-800 bg-zinc-950/95 shadow-[0_0_50px_rgba(245,197,24,0.15)] text-zinc-100 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800/80 px-6 py-5 bg-zinc-900/40">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F5C518]/10 text-[#F5C518] ring-1 ring-[#F5C518]/30">
              <MessageSquare size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                Audience Reviews
                <span className="text-xs font-normal px-2.5 py-0.5 rounded-full bg-zinc-800 text-zinc-400">
                  {reviews.length} {reviews.length === 1 ? "review" : "reviews"}
                </span>
              </h2>
              {title && (
                <p className="text-xs text-zinc-400 truncate max-w-md">
                  for <span className="text-zinc-200 font-medium">{title}</span>
                </p>
              )}
            </div>
          </div>

          <button
            onClick={() => toggleReviews(false)}
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-800/60 text-zinc-400 transition hover:bg-zinc-800 hover:text-white cursor-pointer"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-thin scrollbar-thumb-zinc-800">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-full min-h-[300px] gap-3 text-zinc-400">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#F5C518] border-t-transparent" />
              <p className="text-sm">Fetching verified reviews from TMDB...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-full min-h-[300px] gap-2 text-center text-zinc-400">
              <p className="text-red-400 font-medium">{error}</p>
              <button
                onClick={() => {
                  setIsLoading(true);
                  setError(null);
                  fetch(`/api/reviews?id=${movieId}&type=${type}`)
                    .then((r) => r.json())
                    .then((j) => setReviews(j.reviews || []))
                    .catch(() => setError("Failed to reload reviews."))
                    .finally(() => setIsLoading(false));
                }}
                className="mt-2 text-xs text-[#F5C518] underline underline-offset-4 cursor-pointer"
              >
                Try again
              </button>
            </div>
          ) : reviews.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full min-h-[320px] text-center p-8">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-zinc-900 border border-zinc-800 text-zinc-500 mb-4">
                <MessageSquare size={28} />
              </div>
              <h3 className="text-lg font-semibold text-zinc-200">No reviews found yet</h3>
              <p className="text-sm text-zinc-400 mt-1 max-w-sm">
                There are no published TMDB community reviews for this title yet.
              </p>
            </div>
          ) : (
            reviews.map((review) => {
              const avatar = getAvatarUrl(review.author_details?.avatar_path);
              const rating = review.author_details?.rating;
              const isLong = review.content.length > 360;
              const isExpanded = expandedReviews[review.id];
              const dateStr = review.created_at
                ? new Date(review.created_at).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })
                : null;

              return (
                <div
                  key={review.id}
                  className="rounded-xl border border-zinc-800/80 bg-zinc-900/50 p-5 transition-all hover:border-zinc-700/80 hover:bg-zinc-900/70"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      {avatar ? (
                        <img
                          src={avatar}
                          alt={review.author}
                          className="h-10 w-10 rounded-full object-cover ring-1 ring-zinc-700"
                          onError={(e) => {
                            (e.currentTarget as HTMLElement).style.display = "none";
                          }}
                        />
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-800 font-semibold text-zinc-300 ring-1 ring-zinc-700">
                          {review.author ? review.author[0].toUpperCase() : <User size={16} />}
                        </div>
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-zinc-100">{review.author}</span>
                          {review.author_details?.username && (
                            <span className="text-xs text-zinc-500">
                              @{review.author_details.username}
                            </span>
                          )}
                        </div>
                        {dateStr && (
                          <div className="flex items-center gap-1.5 text-xs text-zinc-500 mt-0.5">
                            <Calendar size={12} />
                            <span>{dateStr}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {rating !== null && rating !== undefined && (
                      <div className="flex items-center gap-1 rounded-full bg-[#F5C518]/15 px-2.5 py-1 text-xs font-bold text-[#F5C518] ring-1 ring-[#F5C518]/30">
                        <Star size={12} className="fill-[#F5C518]" />
                        <span>{rating}/10</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-3 text-sm leading-relaxed text-zinc-300">
                    <p className="whitespace-pre-line">
                      {isLong && !isExpanded
                        ? `${review.content.slice(0, 360)}...`
                        : review.content}
                    </p>
                    {isLong && (
                      <button
                        onClick={() => toggleExpand(review.id)}
                        className="mt-2 text-xs font-medium text-[#F5C518] hover:underline cursor-pointer"
                      >
                        {isExpanded ? "Show less" : "Read full review"}
                      </button>
                    )}
                  </div>

                  {review.url && (
                    <div className="mt-3 flex justify-end">
                      <a
                        href={review.url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-300 transition"
                      >
                        <span>View on TMDB</span>
                        <ExternalLink size={11} />
                      </a>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
