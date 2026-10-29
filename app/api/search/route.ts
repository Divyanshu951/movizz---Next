import { NextRequest, NextResponse } from "next/server";

const DEFAULT_TMDB_TOKEN =
  "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI0OTI2OWJiYjEyZDcxNWFhZGIxMDMwYjdjYTM2YjY0MyIsIm5iZiI6MTc3NTA4NzA1Mi4xMDA5OTk4LCJzdWIiOiI2OWNkYWRjYzY2MzYwZTA1YWI0ZDE5YWEiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0._T3ASCaKVi64A2dblOimjAluHRuwG5Wv7YxJD-zC3x8";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;

  const query = searchParams.get("query")?.trim();
  const type = searchParams.get("type"); // "movie" | "tv" | null
  const page = Math.min(
    Math.max(parseInt(searchParams.get("page") ?? "1", 10) || 1, 1),
    500, // TMDB maximum
  );

  if (!query) {
    return NextResponse.json({ error: "Query is required" }, { status: 400 });
  }

  const token = (process.env.TMDB_TOKEN || DEFAULT_TMDB_TOKEN)
    .replace(/^["']|["';]+$/g, "")
    .trim();

  try {
    const url = new URL("https://api.themoviedb.org/3/search/multi");
    url.searchParams.set("query", query);
    url.searchParams.set("page", String(page));
    url.searchParams.set("include_adult", "false");
    url.searchParams.set("language", "en-US");

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        accept: "application/json",
      },
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "TMDB request failed" },
        { status: response.status },
      );
    }

    const data = await response.json();

    // multi also returns "person"; keep only what the cards can render
    const allowed: string[] =
      type === "movie" || type === "tv" ? [type] : ["movie", "tv"];

    const results = ((data.results as { media_type: string }[]) || []).filter(
      (item) => allowed.includes(item.media_type),
    );

    // Return the body directly (no { data } wrapper)
    return NextResponse.json({ ...data, results });
  } catch (error) {
    console.error("Search route error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
