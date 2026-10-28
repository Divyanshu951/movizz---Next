"use client";

// import { useParams, useSearchParams } from "react-router-dom";
import SideNavBar from "./SideNavBar";
// import { useSuspenseQuery } from "@tanstack/react-query";
// import { fetchMovieDetails } from "../../api/api";
// import { Suspense, useState } from "react";
// import MovieDetailsFallback from "../MovieDetailsFallback";
import Reviews from "../Reviews";
import { useState } from "react";

// export default function MovieDetailsCard() {
//   return (
//     <Suspense fallback={<MovieDetailsFallback />}>
//       <MovieDetailsContent />
//     </Suspense>
//   );
// }

function TitleDetails({ data, type }: { data: any; type: "movie" | "tv" }) {
  const [showReviews, setShowReviews] = useState(false);

  const {
    id,
    original_title,
    backdrop_path,
    genres,
    imdb_id,
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
  } = data;

  return (
    <div className="bg-red-100">
      <SideNavBar id={imdb_id!} title={title} toggleReviews={setShowReviews} />
      {showReviews && (
        <Reviews
          movieId={id}
          title={original_title}
          toggleReviews={setShowReviews}
          type={type}
        />
      )}
      {/* {showReviews && <Reviews toggleReviews={setShowReviews} />} */}
      <img
        src={
          !backdrop_path
            ? "https://images.unsplash.com/photo-1610513320995-1ad4bbf25e55?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            : `https://image.tmdb.org/t/p/original${backdrop_path}`
        }
        alt={title}
        className="relative h-screen w-screen"
      />

      <div className="pointer-events-none absolute inset-0 bg-linear-to-r from-black/90 via-black/20 to-transparent"></div>
      <div className="pointer-events-none absolute inset-0 bg-linear-to-l from-black/80 via-transparent to-transparent"></div>
      <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/90 via-transparent to-black/30"></div>

      <div className="absolute inset-0 grid h-screen w-full grid-cols-1 p-10 md:grid-cols-2">
        <h1 className="max-w-[80%] text-7xl font-semibold text-shadow-2xs">
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
        <div className="text-md max-w-[60%] md:justify-self-end">
          {overview}
          <div className="text-md mt-10 flex max-w-27 justify-center gap-2 rounded-full bg-[#F5C518]/80 py-1 text-black">
            <span className="font-semibold">IMDB</span>
            <span>{vote_average.toFixed(1)}</span>
          </div>
        </div>
        <div className="flex flex-col gap-4 self-end text-white">
          <div className="flex items-center gap-3">
            <p className="min-w-17.5 text-lg">Country:</p>
            {origin_country.map((country) => (
              <span
                key={country}
                className="rounded-full border border-white/80 px-5 py-2 text-sm backdrop-blur-sm"
              >
                {country}
              </span>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <p className="min-w-17.5 text-lg">Genres:</p>
            {genres.map((genre, index) => {
              if (index > 1) return;
              return (
                <span
                  key={genre.id}
                  className="rounded-full border border-white/80 px-5 py-2 text-sm backdrop-blur-sm"
                >
                  {genre.name}
                </span>
              );
            })}
            {genres.length > 1 && (
              <span className="rounded-full border border-white/80 px-5 py-2 text-sm backdrop-blur-sm">
                +{genres.length - 2}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <p className="min-w-17.5 text-lg">Studio:</p>

            <span className="rounded-full border border-white/80 px-5 py-2 text-sm backdrop-blur-sm">
              {production_companies.length !== 0
                ? production_companies[0].name
                : "NA"}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <p className="min-w-17.5 text-lg">
              {type === "tv" ? "Total seasons" : "Time"}:
            </p>

            <span className="rounded-full border border-white/80 px-5 py-2 text-sm backdrop-blur-sm">
              {type === "tv" ? (
                `${seasons.length - 1}`
              ) : (
                <>
                  {runtime ? Math.floor(runtime / 60) : "--"} hr{" "}
                  {runtime ? runtime % 60 : "--"} Min
                </>
              )}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <p className="min-w-17.5 text-lg">
              {type === "tv" ? "First Air Date" : "Date"}:
            </p>
            <span className="rounded-full border border-white/80 px-5 py-2 text-sm backdrop-blur-sm">
              {type === "tv" ? first_air_date : release_date}
            </span>
          </div>
        </div>
        <div className="justify-self-end rounded-md bg-black p-1 transition-all duration-300 hover:mr-10 md:self-end">
          <img
            src={`https://image.tmdb.org/t/p/original${poster_path}`}
            alt=""
            className="h-85 rounded-sm transition-all duration-300 hover:h-100"
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
