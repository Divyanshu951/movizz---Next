"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  X,
  Users,
  User,
  ArrowLeft,
  Star,
  Calendar,
  MapPin,
  Film,
} from "lucide-react";
import type {
  TMDBCastMember,
  TMDBCrewMember,
  TMDBPersonDetails,
} from "@/types/tmdb";

type Props = {
  title: string;
  cast?: TMDBCastMember[];
  crew?: TMDBCrewMember[];
  createdBy?: Array<{ id: number; name: string; profile_path?: string | null }>;
  onClose: () => void;
};

export default function CastModal({
  title,
  cast = [],
  crew = [],
  createdBy = [],
  onClose,
}: Props) {
  const [selectedPersonId, setSelectedPersonId] = useState<number | null>(null);
  const [personDetails, setPersonDetails] = useState<TMDBPersonDetails | null>(
    null,
  );
  const [loadingPerson, setLoadingPerson] = useState(false);

  const directorsAndCreators = useMemo(() => {
    const directors = crew.filter(
      (c) => c.job === "Director" || c.job === "Series Director",
    );
    const combined: Array<{
      id: number;
      name: string;
      role: string;
      profile_path?: string | null;
    }> = [];

    for (const creator of createdBy) {
      if (!combined.some((p) => p.id === creator.id)) {
        combined.push({
          id: creator.id,
          name: creator.name,
          role: "Creator",
          profile_path: creator.profile_path,
        });
      }
    }
    for (const dir of directors) {
      if (!combined.some((p) => p.id === dir.id)) {
        combined.push({
          id: dir.id,
          name: dir.name,
          role: dir.job || "Director",
          profile_path: dir.profile_path,
        });
      }
    }
    return combined;
  }, [crew, createdBy]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (selectedPersonId) {
          setSelectedPersonId(null);
          setPersonDetails(null);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, selectedPersonId]);

  useEffect(() => {
    if (!selectedPersonId) return;
    let active = true;
    setLoadingPerson(true);
    setPersonDetails(null);

    fetch(`/api/person?id=${selectedPersonId}`)
      .then((res) => res.json())
      .then((data) => {
        if (active && data.person) {
          setPersonDetails(data.person);
        }
      })
      .catch((err) => console.error("Failed to load person:", err))
      .finally(() => {
        if (active) setLoadingPerson(false);
      });

    return () => {
      active = false;
    };
  }, [selectedPersonId]);

  const topKnownCredits = useMemo(() => {
    if (!personDetails?.combined_credits) return [];
    const all = [
      ...(personDetails.combined_credits.cast || []),
      ...(personDetails.combined_credits.crew || []),
    ];
    const seen = new Set<string>();
    return all
      .filter((item) => {
        if (!item.poster_path) return false;
        if (item.media_type !== "movie" && item.media_type !== "tv")
          return false;
        const key = `${item.media_type}_${item.id}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .sort((a, b) => (b.vote_count || 0) - (a.vote_count || 0))
      .slice(0, 12);
  }, [personDetails]);

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
            {selectedPersonId ? (
              <button
                type="button"
                onClick={() => {
                  setSelectedPersonId(null);
                  setPersonDetails(null);
                }}
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-800 text-zinc-200 transition hover:bg-zinc-700 hover:text-white cursor-pointer"
                aria-label="Back to cast list"
              >
                <ArrowLeft size={18} />
              </button>
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F5C518]/10 text-[#F5C518] ring-1 ring-[#F5C518]/30">
                <Users size={20} />
              </div>
            )}
            <div>
              <h2 className="text-xl font-bold tracking-tight text-white">
                {selectedPersonId
                  ? personDetails?.name || "Person Spotlight"
                  : "Cast & Crew"}
              </h2>
              <p className="text-xs text-zinc-400 truncate max-w-md">
                {selectedPersonId
                  ? "Click any title below to explore"
                  : `for ${title} · Click anyone to view their filmography`}
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

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {selectedPersonId ? (
            loadingPerson ? (
              <div className="flex flex-col items-center justify-center h-full min-h-72 gap-3 text-zinc-400">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#F5C518] border-t-transparent" />
                <p className="text-sm">Loading profile & filmography...</p>
              </div>
            ) : personDetails ? (
              <div className="space-y-6">
                <div className="flex flex-col gap-5 sm:flex-row">
                  {personDetails.profile_path ? (
                    <img
                      src={`https://image.tmdb.org/t/p/w342${personDetails.profile_path}`}
                      alt={personDetails.name}
                      className="h-48 w-36 shrink-0 rounded-2xl object-cover ring-1 ring-white/10"
                    />
                  ) : (
                    <div className="flex h-48 w-36 shrink-0 items-center justify-center rounded-2xl bg-zinc-900 text-zinc-600 ring-1 ring-zinc-800">
                      <User size={40} />
                    </div>
                  )}
                  <div className="space-y-3">
                    <div>
                      <span className="inline-block rounded-full bg-[#F5C518]/15 px-2.5 py-0.5 text-[11px] font-bold text-[#F5C518]">
                        {personDetails.known_for_department || "Talent"}
                      </span>
                      <h3 className="mt-1.5 text-2xl font-extrabold text-white">
                        {personDetails.name}
                      </h3>
                    </div>

                    <div className="flex flex-wrap gap-4 text-xs text-zinc-400">
                      {personDetails.birthday && (
                        <span className="flex items-center gap-1.5">
                          <Calendar size={13} className="text-[#F5C518]" />
                          <span>{personDetails.birthday}</span>
                        </span>
                      )}
                      {personDetails.place_of_birth && (
                        <span className="flex items-center gap-1.5">
                          <MapPin size={13} className="text-[#F5C518]" />
                          <span>{personDetails.place_of_birth}</span>
                        </span>
                      )}
                    </div>

                    {personDetails.biography && (
                      <p className="text-xs leading-relaxed text-zinc-300 line-clamp-5">
                        {personDetails.biography}
                      </p>
                    )}
                  </div>
                </div>

                {topKnownCredits.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                      Known For ({topKnownCredits.length})
                    </h4>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                      {topKnownCredits.map((credit) => {
                        const creditTitle =
                          credit.media_type === "tv"
                            ? credit.name || credit.title
                            : credit.title || credit.name;
                        const rawDate =
                          credit.media_type === "tv"
                            ? credit.first_air_date
                            : credit.release_date;
                        const year = rawDate ? rawDate.split("-")[0] : "";

                        return (
                          <Link
                            key={`${credit.media_type}_${credit.id}`}
                            href={`/title/${credit.id}?type=${credit.media_type}`}
                            onClick={onClose}
                            className="group flex flex-col overflow-hidden rounded-xl border border-zinc-800/80 bg-zinc-900/50 transition hover:border-[#F5C518]/50 hover:-translate-y-0.5"
                          >
                            <div className="relative aspect-2/3 w-full overflow-hidden bg-zinc-900">
                              {credit.poster_path ? (
                                <img
                                  src={`https://image.tmdb.org/t/p/w342${credit.poster_path}`}
                                  alt={creditTitle || ""}
                                  className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                                />
                              ) : (
                                <div className="flex h-full items-center justify-center text-zinc-600">
                                  <Film size={24} />
                                </div>
                              )}
                              {typeof credit.vote_average === "number" &&
                                credit.vote_average > 0 && (
                                  <span className="absolute top-2 right-2 flex items-center gap-0.5 rounded-md bg-black/80 px-1.5 py-0.5 text-[10px] font-bold text-[#F5C518]">
                                    <Star size={9} className="fill-current" />
                                    {credit.vote_average.toFixed(1)}
                                  </span>
                                )}
                            </div>
                            <div className="p-2.5">
                              <p className="line-clamp-1 text-xs font-bold text-white group-hover:text-[#F5C518]">
                                {creditTitle}
                              </p>
                              <p className="mt-0.5 text-[10px] text-zinc-400">
                                {year} ·{" "}
                                {credit.media_type === "tv" ? "TV" : "Movie"}
                              </p>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-center text-sm text-zinc-400 py-12">
                Could not load details for this person.
              </p>
            )
          ) : (
            <>
              {/* Directors / Creators */}
              {directorsAndCreators.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                    Direction & Creation
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {directorsAndCreators.map((person) => (
                      <button
                        key={`${person.role}_${person.id}`}
                        type="button"
                        onClick={() => setSelectedPersonId(person.id)}
                        className="flex items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-900/60 p-2.5 text-left transition hover:border-[#F5C518]/50 hover:bg-zinc-900 cursor-pointer"
                      >
                        {person.profile_path ? (
                          <img
                            src={`https://image.tmdb.org/t/p/w185${person.profile_path}`}
                            alt={person.name}
                            className="h-11 w-11 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-zinc-800 text-zinc-400">
                            <User size={18} />
                          </div>
                        )}
                        <div>
                          <p className="text-xs font-bold text-white">
                            {person.name}
                          </p>
                          <p className="text-[10px] font-semibold text-[#F5C518]">
                            {person.role}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Top Cast */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                  Top Billed Cast ({cast.length})
                </h3>
                {cast.length === 0 ? (
                  <p className="text-sm text-zinc-500 py-8 text-center">
                    No cast information available.
                  </p>
                ) : (
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                    {cast.slice(0, 24).map((member) => (
                      <button
                        key={member.id}
                        type="button"
                        onClick={() => setSelectedPersonId(member.id)}
                        className="group flex items-center gap-3 rounded-xl border border-zinc-800/80 bg-zinc-900/50 p-2.5 text-left transition hover:border-[#F5C518]/50 hover:bg-zinc-900 cursor-pointer"
                      >
                        {member.profile_path ? (
                          <img
                            src={`https://image.tmdb.org/t/p/w185${member.profile_path}`}
                            alt={member.name}
                            className="h-14 w-12 shrink-0 rounded-lg object-cover ring-1 ring-white/10"
                          />
                        ) : (
                          <div className="flex h-14 w-12 shrink-0 items-center justify-center rounded-lg bg-zinc-800 text-zinc-500">
                            <User size={20} />
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="truncate text-xs font-bold text-white group-hover:text-[#F5C518]">
                            {member.name}
                          </p>
                          {member.character && (
                            <p className="mt-0.5 line-clamp-2 text-[11px] text-zinc-400">
                              as {member.character}
                            </p>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

