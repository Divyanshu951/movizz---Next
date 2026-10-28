"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { fetchTrending } from "@/lib/trending";
import { Loader2Icon } from "lucide-react";

export default function Home() {
  const [trendingType, setTrendingType] = useState<string>("movie");
  const [isLoading, setIsLoading] = useState(true);

  const [data, setData] = useState(null);

  const router = useRouter();

  useEffect(() => {
    let cancelled = false;

    async function loadTrending() {
      try {
        setIsLoading(true);
        const res = await fetchTrending(trendingType);
        if (!cancelled) setData(res);
      } catch (error) {
        if (!cancelled) console.error(error);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    loadTrending();

    return () => {
      cancelled = true;
    };
  }, [trendingType]);

  const handleTileClick = (item) => {
    router.push(`/title/${item.id}?type=${trendingType}`);
  };

  // Framer Motion variants for the staggered load effect
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1, // Delays each tile's entrance slightly
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 80 },
    show: {
      opacity: 1,
      y: 0,
      transition: { type: "linear", stiffness: 200, damping: 20 },
    },
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col justify-center overflow-hidden bg-[#050505] font-sans text-white selection:bg-yellow-500 selection:text-black">
      {/* Background Text */}
      <div className="fixed top-15 left-15 size-32">{/* <MovizzLogo /> */}</div>
      <div className="pointer-events-none absolute bottom-[-8%] left-0 z-0 w-full text-center text-[20vw] leading-none font-bold tracking-tighter text-[#151515] uppercase select-none">
        TRENDING
      </div>

      {/* Navigation Buttons */}
      <div className="absolute top-8 left-1/2 z-30 flex -translate-x-1/2 items-center gap-6 whitespace-nowrap text-sm font-semibold tracking-widest uppercase md:top-12 md:gap-8 md:text-[16px]">
        <button
          onClick={() => setTrendingType("movie")}
          className={cn(
            "border-b-2 pb-1 transition-all duration-300",
            trendingType == "movie"
              ? "border-[#f5c518] text-white"
              : "border-transparent text-gray-600 hover:text-gray-300",
          )}
        >
          Movies
        </button>

        <button
          onClick={() => setTrendingType("tv")}
          className={cn(
            "border-b-2 pb-1 transition-all duration-300",
            trendingType == "tv"
              ? "border-[#f5c518] text-white"
              : "border-transparent text-gray-600 hover:text-gray-300",
          )}
        >
          TV Shows
        </button>
      </div>

      {/* Carousel Container */}
      {isLoading ? (
        <div className="h-screen w-screen flex justify-center items-center">
          <Loader2Icon className="size-18 animate-spin" />
        </div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          // key forces the load animation to replay when switching Movies <-> TV
          key={trendingType}
          className="z-10 flex h-screen w-full scrollbar-none items-center justify-start gap-3 overflow-x-auto px-5 py-10 [-ms-overflow-style:none] md:justify-center md:gap-4 md:px-10 [&::-webkit-scrollbar]:hidden"
        >
          {data.results.slice(0, 7).map((item: any) => (
            <motion.div
              variants={itemVariants}
              // layoutId maps this small tile to the giant overlay on click
              layoutId={`poster-${item.id}`}
              onClick={() => handleTileClick(item)}
              key={item.id}
              className={cn(
                "group relative h-[52vh] w-36 shrink-0 cursor-pointer overflow-hidden bg-gray-900 transition-all duration-500 sm:w-40 md:h-[65vh] md:w-40",
              )}
            >
              <img
                src={`https://image.tmdb.org/t/p/w500${item.poster_path}`}
                alt={item.title || item.name}
                className="h-full w-full object-cover opacity-90 grayscale-0 transition-all duration-700 md:opacity-70 md:grayscale md:group-hover:opacity-100 md:group-hover:grayscale-0"
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/80 from-25% via-black/60 via-30% to-transparent to-100% md:bg-none md:group-hover:bg-linear-to-t"></div>
              <div className="absolute bottom-0 left-[50%] flex w-full max-w-45 translate-x-[-50%] flex-col items-center gap-1.5 px-2 py-4 opacity-100 transition-opacity duration-500 md:px-0 md:py-5 md:opacity-0 md:group-hover:opacity-100">
                <p className="text-center text-base font-semibold md:text-2xl">
                  {trendingType === "movie" ? item.title : item.name}
                </p>
                <div className="text-xs md:text-md flex items-center justify-center gap-2 rounded-full bg-[#F5C518]/80 px-2 py-1 text-black">
                  <span className="text-xs md:text-md font-semibold">IMDB</span>
                  <span className="text-xs md:text-sm">
                    {item.vote_average.toFixed(1)}
                  </span>
                </div>
                <p className="text-xs md:text-base">
                  {trendingType === "movie"
                    ? item.release_date
                    : item.first_air_date}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
