export type { SearchItem } from "@/types/tmdb";

type BaseItem = {
  id: number;
  poster_path: string | null;
  vote_average?: number;
};

export type MovieItem = BaseItem & {
  media_type: "movie";
  title: string;
  release_date?: string;
};

export type TvItem = BaseItem & {
  media_type: "tv";
  name: string;
  first_air_date?: string;
};

export type SearchItem = MovieItem | TvItem;

export type SearchResponse = {
  page: number;
  results: SearchItem[];
  total_pages: number;
  total_results: number;
};
