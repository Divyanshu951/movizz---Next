"use client";

// import { useParams, useSearchParams } from "react-router-dom";
import SideNavBar from "./SideNavBar";
// import { useSuspenseQuery } from "@tanstack/react-query";
// import { fetchMovieDetails } from "../../api/api";
// import { Suspense, useState } from "react";
// import MovieDetailsFallback from "../MovieDetailsFallback";
import Reviews from "../Reviews";
import TrailerModal from "../TrailerModal";
import WatchProvidersModal from "../WatchProvidersModal";
import CastModal from "../CastModal";
import SimilarModal from "../SimilarModal";
import SeasonsModal from "../SeasonsModal";
import { useEffect, useState } from "react";
import { BookmarkCheck } from "lucide-react";
import {
  addGuestItem,
  getGuestWatchlist,
  removeGuestItem,
} from "@/lib/watchlist-client";

// export default function MovieDetailsCard() {
//   return (
//     <Suspense fallback={<MovieDetailsFallback />}>
//       <MovieDetailsContent />
//     </Suspense>
//   );
// }

function TitleDetails({ data, type }: { data: any; type: "movie" | "tv" }) {
  const [showReviews, setShowReviews] = useState(false);
  const [showTrailer, setShowTrailer] = useState(false);
  const [showProviders, setShowProviders] = useState(false);
  const [showCast, setShowCast] = useState(false);
  const [showSimilar, setShowSimilar] = useState(false);
  const [showSeasons, setShowSeasons] = useState(false);
  const [isOnWatchList, setIsOnWatchList] = useState(false);

  const {
    id,
    original_title,
    backdrop_path,
    genres,
    imdb_id,
    external_ids,
    origin_country,
    overview,
    poster_path,
    production_companies,
    release_date,
    runtime,
    tagline,
    title,
    name,
    vote_average,
    seasons,
    first_air_date,
    videos,
    credits,
    created_by,
    recommendations,
    similar,
  } = data;

  const resolvedImdbId = imdb_id || external_ids?.imdb_id || "";
  const displayName = title || name || original_title || "Untitled";
  const watchProviders = data?.["watch/providers"]?.results;
  const directorOrCreator =
    type === "tv"
      ? created_by?.[0]?.name
      : credits?.crew?.find((c: any) => c.job === "Director")?.name;

  useEffect(() => {
    async function loadWatchlist() {
      try {
        const res = await fetch("/api/watchlist", { method: "GET" });
        const result = await res.json();
        if (res.ok && result.authenticated) {
          const exists = Array.isArray(result.items) && result.items.some(
            (item: any) =>
              item.id === Number(id) &&
              (!type || !item.type || item.type === type),
          );
          setIsOnWatchList(exists);
        } else {
          const guestItems = getGuestWatchlist();
          const exists = guestItems.some(
            (item) =>
              item.id === Number(id) &&
              (!type || !item.type || item.type === type),
          );
          setIsOnWatchList(exists);
        }
      } catch (err) {
        console.error("Failed to load watchlist:", err);
        const guestItems = getGuestWatchlist();
        const exists = guestItems.some(
          (item) =>
            item.id === Number(id) &&
            (!type || !item.type || item.type === type),
        );
        setIsOnWatchList(exists);
      }
    }
    loadWatchlist();
  }, [id, type]);

  const handleToggleWatchlist = async () => {
    const mediaType: "movie" | "tv" = type || (name && !title ? "tv" : "movie");
    const numericId = Number(id);

    if (isOnWatchList) {
      setIsOnWatchList(false);
      try {
        const res = await fetch(
          `/api/watchlist?id=${numericId}&type=${mediaType}`,
          { method: "DELETE" },
        );
        if (res.status === 401) {
          removeGuestItem(numericId, mediaType);
        } else if (!res.ok) {
          setIsOnWatchList(true);
        }
      } catch (err) {
        console.error("Failed to remove from watchlist:", err);
        removeGuestItem(numericId, mediaType);
      }
    } else {
      setIsOnWatchList(true);
      const displayTitle =
        (mediaType === "tv" ? name || title : title || name) ||
        original_title ||
        "Untitled";
      const rawDate =
        mediaType === "tv"
          ? first_air_date || release_date
          : release_date || first_air_date;
      const year = rawDate ? String(rawDate).split("-")[0] : "N/A";
      const itemPayload = {
        id: numericId,
        title: displayTitle,
        type: mediaType,
        year,
        rating:
          typeof vote_average === "number"
            ? Number(vote_average.toFixed(1))
            : 0,
        genre:
          Array.isArray(genres) && genres.length > 0
            ? genres.map((g: any) => g.name).join(" / ")
            : "Cinema",
        poster: poster_path
          ? `https://image.tmdb.org/t/p/w500${poster_path}`
          : "",
        overview: overview || "",
      };

      try {
        const res = await fetch("/api/watchlist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(itemPayload),
        });
        if (res.status === 401) {
          addGuestItem(itemPayload);
        } else if (!res.ok) {
          setIsOnWatchList(false);
        }
      } catch (err) {
        console.error("Failed to add to watchlist:", err);
        addGuestItem(itemPayload);
      }
    }
  };

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-black md:bg-red-100">
      <SideNavBar
        id={resolvedImdbId}
        title={displayName}
        toggleReviews={setShowReviews}
        toggleWatchlist={handleToggleWatchlist}
        toggleTrailer={setShowTrailer}
        toggleProviders={setShowProviders}
        toggleCast={setShowCast}
        toggleSimilar={setShowSimilar}
        toggleSeasons={setShowSeasons}
        isTv={type === "tv"}
        isOnWatchList={isOnWatchList}
      />
      {showReviews && (
        <Reviews
          movieId={id}
          title={original_title || title || name}
          toggleReviews={setShowReviews}
          type={type}
        />
      )}
      {showTrailer && (
        <TrailerModal
          title={displayName}
          videos={videos?.results || []}
          onClose={() => setShowTrailer(false)}
        />
      )}
      {showProviders && (
        <WatchProvidersModal
          title={displayName}
          providersByCountry={watchProviders}
          onClose={() => setShowProviders(false)}
        />
      )}
      {showCast && (
        <CastModal
          title={displayName}
          cast={credits?.cast || []}
          crew={credits?.crew || []}
          createdBy={created_by || []}
          onClose={() => setShowCast(false)}
        />
      )}
      {showSimilar && (
        <SimilarModal
          title={displayName}
          defaultType={type || "movie"}
          recommendations={recommendations?.results || []}
          similar={similar?.results || []}
          onClose={() => setShowSimilar(false)}
        />
      )}
      {showSeasons && type === "tv" && (
        <SeasonsModal
          tvId={id}
          title={displayName}
          seasons={seasons || []}
          onClose={() => setShowSeasons(false)}
        />
      )}
      {/* {showReviews && <Reviews toggleReviews={setShowReviews} />} */}
      <img
        src={
          !backdrop_path
            ? "https://images.unsplash.com/photo-1610513320995-1ad4bbf25e55?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            : `https://image.tmdb.org/t/p/original${backdrop_path}`
        }
        alt={title || name}
        className="fixed inset-0 h-full w-full object-cover md:relative md:h-screen md:w-screen md:object-fill"
      />

      <div className="pointer-events-none fixed inset-0 bg-linear-to-r from-black/90 via-black/20 to-transparent md:absolute"></div>
      <div className="pointer-events-none fixed inset-0 bg-linear-to-l from-black/80 via-transparent to-transparent md:absolute"></div>
      <div className="pointer-events-none fixed inset-0 bg-linear-to-t from-black/90 via-transparent to-black/30 md:absolute"></div>

      <div className="relative z-10 grid min-h-screen w-full grid-cols-1 gap-6 px-5 pt-8 pb-28 pr-14 md:absolute md:inset-0 md:h-screen md:grid-cols-2 md:gap-0 md:p-10">
        <h1 className="max-w-full text-3xl font-semibold text-shadow-2xs sm:text-5xl md:max-w-[80%] md:text-7xl">
          {type === "tv"
            ? name
            : title.split(":").map((ttl, i, arr) => (
                <span key={i}>
                  {ttl.trim()}
                  {i < arr.length - 1 && ":"}
                  <br />
                </span>
              ))}
        </h1>
        <div className="text-sm leading-relaxed sm:text-base max-w-full md:text-md md:max-w-[60%] md:justify-self-end">
          {overview}
          <div className="mt-4 flex flex-wrap items-center gap-3 md:mt-10 md:gap-5">
            <div className="text-md  flex max-w-27 justify-center gap-2 rounded-full bg-[#F5C518]/80 py-1 px-3 text-black">
              <span className="font-sans">IMDB</span>
              <span className="font-semibold">{vote_average.toFixed(1)}</span>
            </div>

            {isOnWatchList && (
              <div className="text-md flex justify-center gap-1 rounded-full bg-[#F5C518]/80 px-3 py-1 text-black">
                <span>
                  <BookmarkCheck
                    size={20}
                    className="fill-black stroke-black "
                  />
                </span>
                <span className="font-semibold font-sans">On Watchlist</span>
              </div>
            )}
          </div>
        </div>
        <div className="flex flex-col gap-3 self-end text-white md:gap-4">
          <div className="flex flex-wrap items-center gap-2 md:flex-nowrap md:gap-3">
            <p className="min-w-16 text-sm md:min-w-17.5 md:text-lg">Country:</p>
            {origin_country.map((country) => (
              <span
                key={country}
                className="rounded-full border border-white/80 px-3 py-1 text-xs backdrop-blur-sm md:px-5 md:py-2 md:text-sm"
              >
                {country}
              </span>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-2 md:flex-nowrap md:gap-3">
            <p className="min-w-16 text-sm md:min-w-17.5 md:text-lg">Genres:</p>
            {genres.map((genre, index) => {
              if (index > 1) return;
              return (
                <span
                  key={genre.id}
                  className="rounded-full border border-white/80 px-3 py-1 text-xs backdrop-blur-sm md:px-5 md:py-2 md:text-sm"
                >
                  {genre.name}
                </span>
              );
            })}
            {genres.length > 1 && (
              <span className="rounded-full border border-white/80 px-3 py-1 text-xs backdrop-blur-sm md:px-5 md:py-2 md:text-sm">
                +{genres.length - 2}
              </span>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2 md:flex-nowrap md:gap-3">
            <p className="min-w-16 text-sm md:min-w-17.5 md:text-lg">Studio:</p>

            <span className="rounded-full border border-white/80 px-3 py-1 text-xs backdrop-blur-sm md:px-5 md:py-2 md:text-sm">
              {production_companies.length !== 0
                ? production_companies[0].name
                : "NA"}
            </span>
          </div>
          {directorOrCreator && (
            <div className="flex flex-wrap items-center gap-2 md:flex-nowrap md:gap-3">
              <p className="min-w-16 text-sm md:min-w-17.5 md:text-lg">
                {type === "tv" ? "Creator" : "Director"}:
              </p>
              <button
                type="button"
                onClick={() => setShowCast(true)}
                className="rounded-full border border-white/80 px-3 py-1 text-xs backdrop-blur-sm transition hover:border-[#F5C518] hover:text-[#F5C518] cursor-pointer md:px-5 md:py-2 md:text-sm"
              >
                {directorOrCreator}
              </button>
            </div>
          )}
          <div className="flex flex-wrap items-center gap-2 md:flex-nowrap md:gap-3">
            <p className="min-w-16 text-sm md:min-w-17.5 md:text-lg">
              {type === "tv" ? "Total seasons" : "Time"}:
            </p>

            <span
              onClick={() => type === "tv" && setShowSeasons(true)}
              className={`rounded-full border border-white/80 px-3 py-1 text-xs backdrop-blur-sm md:px-5 md:py-2 md:text-sm ${
                type === "tv"
                  ? "cursor-pointer transition hover:border-[#F5C518] hover:text-[#F5C518]"
                  : ""
              }`}
            >
              {type === "tv" ? (
                `${Math.max((seasons?.length || 1) - 1, 1)} · View Episodes`
              ) : (
                <>
                  {runtime ? Math.floor(runtime / 60) : "--"} hr{" "}
                  {runtime ? runtime % 60 : "--"} Min
                </>
              )}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2 md:flex-nowrap md:gap-3">
            <p className="min-w-16 text-sm md:min-w-17.5 md:text-lg">
              {type === "tv" ? "First Air Date" : "Date"}:
            </p>
            <span className="rounded-full border border-white/80 px-3 py-1 text-xs backdrop-blur-sm md:px-5 md:py-2 md:text-sm">
              {type === "tv" ? first_air_date : release_date}
            </span>
          </div>
        </div>
        <div className="justify-self-start rounded-md bg-black p-1 transition-all duration-300 md:justify-self-end md:hover:mr-10 md:self-end">
          <img
            src={`https://image.tmdb.org/t/p/original${poster_path}`}
            alt=""
            className="h-56 sm:h-72 md:h-85 rounded-sm transition-all duration-300 md:hover:h-100"
          />
        </div>
      </div>
      <p className="font-calistoga absolute bottom-40 left-[50%] translate-x-[-50%] text-center text-5xl opacity-0 md:opacity-100">
        {tagline && `"${tagline}"`}
      </p>
    </div>
  );
}

export default TitleDetails;
