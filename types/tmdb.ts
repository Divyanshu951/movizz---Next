export interface TMDBGenre {
  id: number;
  name: string;
}

export interface TMDBProductionCompany {
  id: number;
  name: string;
  logo_path?: string | null;
  origin_country?: string;
}

export interface TMDBVideo {
  id: string;
  key: string;
  name: string;
  site: string;
  type: string;
  official?: boolean;
  published_at?: string;
}

export interface TMDBCastMember {
  id: number;
  name: string;
  character?: string;
  profile_path?: string | null;
  order?: number;
  known_for_department?: string;
}

export interface TMDBCrewMember {
  id: number;
  name: string;
  job?: string;
  department?: string;
  profile_path?: string | null;
}

export interface TMDBWatchProvider {
  provider_id: number;
  provider_name: string;
  logo_path: string;
  display_priority?: number;
}

export interface TMDBWatchProviderCountry {
  link?: string;
  flatrate?: TMDBWatchProvider[];
  rent?: TMDBWatchProvider[];
  buy?: TMDBWatchProvider[];
  free?: TMDBWatchProvider[];
  ads?: TMDBWatchProvider[];
}

export interface TMDBEpisode {
  id: number;
  name: string;
  overview: string;
  episode_number: number;
  season_number: number;
  air_date?: string | null;
  still_path?: string | null;
  vote_average?: number;
  runtime?: number | null;
}

export interface TMDBSeasonDetails {
  id: number;
  name: string;
  overview?: string;
  poster_path?: string | null;
  season_number: number;
  air_date?: string | null;
  episodes: TMDBEpisode[];
}

export interface TMDBPersonCredit {
  id: number;
  title?: string;
  name?: string;
  character?: string;
  job?: string;
  poster_path?: string | null;
  release_date?: string;
  first_air_date?: string;
  vote_average?: number;
  vote_count?: number;
  media_type: "movie" | "tv";
}

export interface TMDBPersonDetails {
  id: number;
  name: string;
  biography?: string;
  birthday?: string | null;
  place_of_birth?: string | null;
  profile_path?: string | null;
  known_for_department?: string;
  combined_credits?: {
    cast?: TMDBPersonCredit[];
    crew?: TMDBPersonCredit[];
  };
}

export interface TMDBTitleDetails {
  id: number | string;
  title?: string;
  name?: string;
  original_title?: string;
  original_name?: string;
  overview?: string;
  backdrop_path?: string | null;
  poster_path?: string | null;
  release_date?: string;
  first_air_date?: string;
  vote_average: number;
  vote_count?: number;
  genres?: TMDBGenre[];
  origin_country?: string[];
  production_companies?: TMDBProductionCompany[];
  runtime?: number | null;
  tagline?: string;
  imdb_id?: string;
  external_ids?: {
    imdb_id?: string | null;
    tvdb_id?: number | null;
  };
  seasons?: Array<{
    id: number;
    name: string;
    season_number: number;
    episode_count: number;
    poster_path?: string | null;
    air_date?: string | null;
    overview?: string;
  }>;
  created_by?: Array<{
    id: number;
    name: string;
    profile_path?: string | null;
  }>;
  videos?: {
    results?: TMDBVideo[];
  };
  credits?: {
    cast?: TMDBCastMember[];
    crew?: TMDBCrewMember[];
  };
  recommendations?: {
    results?: SearchItem[];
  };
  similar?: {
    results?: SearchItem[];
  };
  "watch/providers"?: {
    results?: Record<string, TMDBWatchProviderCountry>;
  };
  status?: string;
}

export interface TMDBReview {
  id: string;
  author: string;
  author_details?: {
    name?: string;
    username?: string;
    avatar_path?: string | null;
    rating?: number | null;
  };
  content: string;
  created_at: string;
  url?: string;
}

export interface SearchItem {
  id: number;
  title?: string;
  name?: string;
  poster_path?: string | null;
  backdrop_path?: string | null;
  release_date?: string;
  first_air_date?: string;
  vote_average: number;
  overview?: string;
  media_type?: string;
}
