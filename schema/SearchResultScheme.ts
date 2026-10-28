export type SearchItem = {
  id: number;
  poster_path?: string | null;
  backdrop_path?: string | null;
  vote_average?: number;
  overview?: string;
  media_type?: "movie" | "tv" | string;
  title?: string;
  name?: string;
  release_date?: string;
  first_air_date?: string;
  [key: string]: any;
};

export type SearchResponse = {
  page: number;
  results: SearchItem[];
  total_pages: number;
  total_results: number;
};
