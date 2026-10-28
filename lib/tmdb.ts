import {
  TMDBTitleDetails,
  TMDBReview,
  SearchItem,
  TMDBSeasonDetails,
  TMDBPersonDetails,
} from "@/types/tmdb";

const token = process.env.TMDB_TOKEN;
const BASE_URL =
  process.env.BASE_URL?.replace(/;$/, "").trim() ||
  "https://api.themoviedb.org/3";

const options: RequestInit = {
  method: "GET",
  headers: {
    accept: "application/json",
    Authorization: `Bearer ${token}`,
  },
  next: { revalidate: 3600 }, // Cache for 1 hour in Next.js
};

export const getTitleDetails = async (
  id: string | number,
  type: "movie" | "tv" = "movie",
): Promise<TMDBTitleDetails> => {
  const append =
    "videos,credits,recommendations,similar,watch/providers,external_ids";
  const res = await fetch(
    `${BASE_URL}/${type}/${id}?language=en-US&append_to_response=${append}`,
    options,
  );

  if (!res.ok) {
    throw new Error(
      `Failed to fetch ${type} details for ID ${id} (${res.status})`,
    );
  }

  const data = await res.json();
  return data;
};

export const getTvSeasonDetails = async (
  tvId: string | number,
  seasonNumber: number,
): Promise<TMDBSeasonDetails | null> => {
  try {
    const res = await fetch(
      `${BASE_URL}/tv/${tvId}/season/${seasonNumber}?language=en-US`,
      options,
    );
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.error("Failed to fetch TV season details:", err);
    return null;
  }
};

export const getPersonDetails = async (
  personId: string | number,
): Promise<TMDBPersonDetails | null> => {
  try {
    const res = await fetch(
      `${BASE_URL}/person/${personId}?language=en-US&append_to_response=combined_credits`,
      options,
    );
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.error("Failed to fetch person details:", err);
    return null;
  }
};

export const getTitleReviews = async (
  id: string | number,
  type: "movie" | "tv" = "movie",
): Promise<TMDBReview[]> => {
  try {
    const res = await fetch(
      `${BASE_URL}/${type}/${id}/reviews?language=en-US&page=1`,
      options,
    );

    if (!res.ok) return [];

    const data = await res.json();
    return data.results || [];
  } catch (err) {
    console.error("Failed to fetch reviews:", err);
    return [];
  }
};

export const getTrending = async (
  type: "movie" | "tv" = "movie",
  timeWindow: "day" | "week" = "day",
): Promise<SearchItem[]> => {
  try {
    const res = await fetch(
      `${BASE_URL}/trending/${type}/${timeWindow}?language=en-US`,
      options,
    );
    if (!res.ok) return [];
    const data = await res.json();
    return data.results || [];
  } catch (err) {
    console.error("Failed to fetch trending:", err);
    return [];
  }
};

export const getPopular = async (
  type: "movie" | "tv" = "movie",
): Promise<SearchItem[]> => {
  try {
    const res = await fetch(
      `${BASE_URL}/${type}/popular?language=en-US&page=1`,
      options,
    );
    if (!res.ok) return [];
    const data = await res.json();
    return data.results || [];
  } catch (err) {
    console.error("Failed to fetch popular:", err);
    return [];
  }
};

export const getTopRated = async (
  type: "movie" | "tv" = "movie",
): Promise<SearchItem[]> => {
  try {
    const res = await fetch(
      `${BASE_URL}/${type}/top_rated?language=en-US&page=1`,
      options,
    );
    if (!res.ok) return [];
    const data = await res.json();
    return data.results || [];
  } catch (err) {
    console.error("Failed to fetch top rated:", err);
    return [];
  }
};

export const searchTitles = async (
  query: string,
  type: "movie" | "tv" = "movie",
): Promise<SearchItem[]> => {
  if (!query || !query.trim()) return [];
  try {
    const res = await fetch(
      `${BASE_URL}/search/${type}?query=${encodeURIComponent(
        query.trim(),
      )}&include_adult=false&language=en-US&page=1`,
      options,
    );
    if (!res.ok) return [];
    const data = await res.json();
    return data.results || [];
  } catch (err) {
    console.error("Failed to search titles:", err);
    return [];
  }
};
