import { useNavigate, useSearchParams } from "react-router-dom";
import type { SearchItem } from "../../schema/SearchResultScheme";

export default function SearchResultCard({ item }: { item: SearchItem }) {
  const { poster_path, title, release_date, id, vote_average } = item;

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const type = searchParams.get("type");

  function handleSelection() {
    navigate(`/movie/${id}?type=${type}`);
  }

  const year = release_date ? release_date.split("-")[0] : "N/A";

  return (
    <div onClick={handleSelection} className="group cursor-pointer">
      <div className="relative aspect-2/3 overflow-hidden rounded-xl bg-zinc-950 shadow-xl ring-1 ring-white/5 transition-all duration-500 group-hover:-translate-y-2 group-hover:shadow-[0_0_30px_rgba(245,197,24,0.15)] group-hover:ring-yellow-500/20">
        {poster_path ? (
          <img
            src={`https://image.tmdb.org/t/p/w500${poster_path}`}
            alt={title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm font-medium text-zinc-600">
            No Poster
          </div>
        )}

        <div className="absolute inset-0 bg-linear-to-t from-black via-black/30 to-transparent opacity-80 transition-opacity duration-500 group-hover:opacity-100" />

        <div className="absolute top-3 right-3 rounded-full bg-black/70 px-2.5 py-1 text-xs font-bold text-[#F5C518] backdrop-blur-md">
          ★ {vote_average.toFixed(1)}
        </div>

        <div className="absolute inset-x-0 bottom-0 p-4">
          <div className="translate-y-3 transition-all duration-500 group-hover:translate-y-0">
            <h3 className="line-clamp-2 text-lg leading-tight font-bold text-white">
              {title}
            </h3>

            <div className="mt-2 flex items-center gap-2">
              <span className="rounded-full bg-white/10 px-2 py-1 text-xs font-medium tracking-wide text-gray-300 backdrop-blur-sm">
                {year}
              </span>
            </div>
          </div>
        </div>

        <div className="absolute inset-0 opacity-0 transition-opacity duration-700 group-hover:opacity-100">
          <div className="absolute -top-10 left-[-120%] h-[200%] w-[60%] rotate-12 bg-white/10 blur-3xl transition-all duration-1000 group-hover:left-[140%]" />
        </div>
      </div>
    </div>
  );
}
