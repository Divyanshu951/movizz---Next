const token =
  "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI0OTI2OWJiYjEyZDcxNWFhZGIxMDMwYjdjYTM2YjY0MyIsIm5iZiI6MTc3NTA4NzA1Mi4xMDA5OTk4LCJzdWIiOiI2OWNkYWRjYzY2MzYwZTA1YWI0ZDE5YWEiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0._T3ASCaKVi64A2dblOimjAluHRuwG5Wv7YxJD-zC3x8";

const BASE_URL = "https://api.themoviedb.org/3";

const options = {
  method: "GET",
  headers: {
    accept: "application/json",
    Authorization: `Bearer ${token}`,
  },
};

export async function fetchTrending(type: string) {
  const res = await fetch(
    `${BASE_URL}/trending/${type}/day?language=en-US`,
    options,
  );

  if (!res.ok) {
    throw new Error("Failed to fetch search results");
  }

  const data = await res.json();
  return data;
}

export async function fetchTitleDetailsClient(
  id: string | number,
  type: "movie" | "tv" = "movie",
) {
  const mediaType: "movie" | "tv" = type === "tv" ? "tv" : "movie";
  const append =
    "videos,credits,recommendations,similar,watch/providers,external_ids";

  let res = await fetch(
    `${BASE_URL}/${mediaType}/${id}?language=en-US&append_to_response=${append}`,
    options,
  );

  if (res.status === 404) {
    const fallbackType = mediaType === "movie" ? "tv" : "movie";
    const fallbackRes = await fetch(
      `${BASE_URL}/${fallbackType}/${id}?language=en-US&append_to_response=${append}`,
      options,
    );
    if (fallbackRes.ok) {
      res = fallbackRes;
    }
  }

  if (!res.ok) {
    throw new Error(`Failed to fetch title details (${res.status})`);
  }

  return await res.json();
}
