import {
  TMDBTitleDetails,
  TMDBReview,
  SearchItem,
  TMDBSeasonDetails,
  TMDBPersonDetails,
} from "@/types/tmdb";

export const DEFAULT_TMDB_TOKEN =
  "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI0OTI2OWJiYjEyZDcxNWFhZGIxMDMwYjdjYTM2YjY0MyIsIm5iZiI6MTc3NTA4NzA1Mi4xMDA5OTk4LCJzdWIiOiI2OWNkYWRjYzY2MzYwZTA1YWI0ZDE5YWEiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0._T3ASCaKVi64A2dblOimjAluHRuwG5Wv7YxJD-zC3x8";

export const TMDB_BASE_URL = "https://api.themoviedb.org/3";

function getCleanToken(): string {
  const raw = process.env.TMDB_TOKEN?.replace(/^["']|["';]+$/g, "").trim();
  if (raw && raw.startsWith("eyJ")) {
    return raw;
  }
  return DEFAULT_TMDB_TOKEN;
}

async function tmdbFetch(endpoint: string): Promise<Response> {
  const primaryToken = getCleanToken();
  const url = `${TMDB_BASE_URL}${endpoint}`;

  try {
    const res = await fetch(url, {
      method: "GET",
      headers: {
        accept: "application/json",
        Authorization: `Bearer ${primaryToken}`,
      },
      next: { revalidate: 3600 },
    });

    if (res.ok || primaryToken === DEFAULT_TMDB_TOKEN) {
      return res;
    }
  } catch {
    // Fall through to retry with DEFAULT_TMDB_TOKEN
  }

  return fetch(url, {
    method: "GET",
    headers: {
      accept: "application/json",
      Authorization: `Bearer ${DEFAULT_TMDB_TOKEN}`,
    },
    next: { revalidate: 3600 },
  });
}

export const getTitleDetails = async (
  id: string | number,
  type: "movie" | "tv" = "movie",
): Promise<TMDBTitleDetails> => {
  const mediaType: "movie" | "tv" = type === "tv" ? "tv" : "movie";
  const append =
    "videos,credits,recommendations,similar,watch/providers,external_ids";
  let res = await tmdbFetch(
    `/${mediaType}/${id}?language=en-US&append_to_response=${append}`,
  );

  // If 404, try fallback media type in case type query param was omitted or mismatched
  if (res.status === 404) {
    const fallbackType = mediaType === "movie" ? "tv" : "movie";
    const fallbackRes = await tmdbFetch(
      `/${fallbackType}/${id}?language=en-US&append_to_response=${append}`,
    );
    if (fallbackRes.ok) {
      res = fallbackRes;
    }
  }

  if (!res.ok) {
    throw new Error(
      `Failed to fetch ${mediaType} details for ID ${id} (${res.status})`,
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
    const res = await tmdbFetch(
      `/tv/${tvId}/season/${seasonNumber}?language=en-US`,
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
    const res = await tmdbFetch(
      `/person/${personId}?language=en-US&append_to_response=combined_credits`,
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
    const res = await tmdbFetch(`/${type}/${id}/reviews?language=en-US&page=1`);

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
    const res = await tmdbFetch(
      `/trending/${type}/${timeWindow}?language=en-US`,
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
    const res = await tmdbFetch(`/${type}/popular?language=en-US&page=1`);
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
    const res = await tmdbFetch(`/${type}/top_rated?language=en-US&page=1`);
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
    const res = await tmdbFetch(
      `/search/${type}?query=${encodeURIComponent(
        query.trim(),
      )}&include_adult=false&language=en-US&page=1`,
    );
    if (!res.ok) return [];
    const data = await res.json();
    return data.results || [];
  } catch (err) {
    console.error("Failed to search titles:", err);
    return [];
  }
};
