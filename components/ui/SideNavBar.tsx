import { Link, MessageCircle, Play } from "lucide-react";
import type React from "react";

type Props = {
  id: string;
  title: string;
  toggleReviews: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function SideNavBar({ id, title, toggleReviews }: Props) {
  return (
    <div className="fixed top-[50%] right-4 z-1001 flex translate-y-[-50%] flex-col items-center gap-1 rounded-md bg-black p-1">
      <button
        onClick={() => toggleReviews(true)}
        className="flex h-10 w-10 cursor-pointer flex-col items-center justify-between rounded-[3px] bg-gray-700 px-2 py-1 text-gray-300 transition-colors duration-300 hover:text-gray-100"
      >
        <MessageCircle size={18} />
        <span className="text-[8px]">Reviews</span>
      </button>
      <a
        href={`https://www.youtube.com/results?search_query=${encodeURIComponent(title)}+trailer`}
        target="_blank"
        className="flex h-10 w-10 cursor-pointer flex-col items-center justify-between rounded-[3px] bg-gray-700 px-2 py-1 text-gray-300 transition-colors duration-300 hover:text-gray-100"
      >
        <Play size={18} />
        <span className="text-[8px]">Trailer</span>
      </a>
      <a
        href={`https://www.imdb.com/title/${id}`}
        target="_blank"
        className="flex h-10 w-10 cursor-pointer flex-col items-center justify-between rounded-[3px] bg-gray-700 px-2 py-1 text-gray-300 transition-colors duration-300 hover:text-gray-100"
      >
        <Link size={18} />
        <span className="text-[8px]">IMBD</span>
      </a>
    </div>
  );
}
