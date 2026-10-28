import { cn } from "@/lib/utils";
import {
  Bookmark,
  BookmarkCheck,
  Layers,
  Link,
  MessageCircle,
  Play,
  Sparkles,
  Tv,
  Users,
} from "lucide-react";
import type React from "react";

type Props = {
  id: string;
  title: string;
  toggleReviews: React.Dispatch<React.SetStateAction<boolean>>;
  toggleWatchlist: () => void;
  toggleTrailer?: React.Dispatch<React.SetStateAction<boolean>>;
  toggleProviders?: React.Dispatch<React.SetStateAction<boolean>>;
  toggleCast?: React.Dispatch<React.SetStateAction<boolean>>;
  toggleSimilar?: React.Dispatch<React.SetStateAction<boolean>>;
  toggleSeasons?: React.Dispatch<React.SetStateAction<boolean>>;
  isTv?: boolean;
  isOnWatchList: boolean;
};

export default function SideNavBar({
  id,
  title,
  toggleReviews,
  toggleWatchlist,
  toggleTrailer,
  toggleProviders,
  toggleCast,
  toggleSimilar,
  toggleSeasons,
  isTv,
  isOnWatchList,
}: Props) {
  const imdbHref = id
    ? `https://www.imdb.com/title/${id}`
    : `https://www.imdb.com/find/?q=${encodeURIComponent(title || "")}`;

  return (
    <div className="fixed top-[42%] right-1.5 z-1001 flex origin-right scale-90 translate-y-[-50%] flex-col items-center gap-1 rounded-md bg-black p-1 md:top-[35%] md:right-0 md:scale-100">
      <button
        onClick={toggleWatchlist}
        className={cn(
          isOnWatchList ? "bg-primary" : "bg-gray-700",
          "flex h-10 w-10 cursor-pointer flex-col items-center justify-between rounded-[3px]  px-2 py-1 text-gray-300 transition-colors duration-300 hover:text-gray-100",
        )}
      >
        {isOnWatchList ? (
          <BookmarkCheck className="text-black" />
        ) : (
          <Bookmark size={18} />
        )}
        {isOnWatchList ? (
          <span className="text-[10px] text-black ">Saved</span>
        ) : (
          <span className="text-[8px]">Watchlist</span>
        )}
      </button>
      <button
        onClick={() => toggleReviews(true)}
        className="flex h-10 w-10 cursor-pointer flex-col items-center justify-between rounded-[3px] bg-gray-700 px-2 py-1 text-gray-300 transition-colors duration-300 hover:text-gray-100"
      >
        <MessageCircle size={18} />
        <span className="text-[8px]">Reviews</span>
      </button>
      {toggleTrailer ? (
        <button
          onClick={() => toggleTrailer(true)}
          className="flex h-10 w-10 cursor-pointer flex-col items-center justify-between rounded-[3px] bg-gray-700 px-2 py-1 text-gray-300 transition-colors duration-300 hover:text-gray-100"
        >
          <Play size={18} />
          <span className="text-[8px]">Trailer</span>
        </button>
      ) : (
        <a
          href={`https://www.youtube.com/results?search_query=${encodeURIComponent(title)}+trailer`}
          target="_blank"
          className="flex h-10 w-10 cursor-pointer flex-col items-center justify-between rounded-[3px] bg-gray-700 px-2 py-1 text-gray-300 transition-colors duration-300 hover:text-gray-100"
        >
          <Play size={18} />
          <span className="text-[8px]">Trailer</span>
        </a>
      )}
      {toggleProviders && (
        <button
          onClick={() => toggleProviders(true)}
          className="flex h-10 w-10 cursor-pointer flex-col items-center justify-between rounded-[3px] bg-gray-700 px-2 py-1 text-gray-300 transition-colors duration-300 hover:text-gray-100"
        >
          <Tv size={18} />
          <span className="text-[8px]">Stream</span>
        </button>
      )}
      {toggleCast && (
        <button
          onClick={() => toggleCast(true)}
          className="flex h-10 w-10 cursor-pointer flex-col items-center justify-between rounded-[3px] bg-gray-700 px-2 py-1 text-gray-300 transition-colors duration-300 hover:text-gray-100"
        >
          <Users size={18} />
          <span className="text-[8px]">Cast</span>
        </button>
      )}
      {toggleSimilar && (
        <button
          onClick={() => toggleSimilar(true)}
          className="flex h-10 w-10 cursor-pointer flex-col items-center justify-between rounded-[3px] bg-gray-700 px-2 py-1 text-gray-300 transition-colors duration-300 hover:text-gray-100"
        >
          <Sparkles size={18} />
          <span className="text-[8px]">Similar</span>
        </button>
      )}
      {isTv && toggleSeasons && (
        <button
          onClick={() => toggleSeasons(true)}
          className="flex h-10 w-10 cursor-pointer flex-col items-center justify-between rounded-[3px] bg-gray-700 px-2 py-1 text-gray-300 transition-colors duration-300 hover:text-gray-100"
        >
          <Layers size={18} />
          <span className="text-[8px]">Episodes</span>
        </button>
      )}
      <a
        href={imdbHref}
        target="_blank"
        className="flex h-10 w-10 cursor-pointer flex-col items-center justify-between rounded-[3px] bg-gray-700 px-2 py-1 text-gray-300 transition-colors duration-300 hover:text-gray-100"
      >
        <Link size={18} />
        <span className="text-[8px]">IMBD</span>
      </a>
    </div>
  );
}
