"use client";

import {
  Bookmark,
  Film,
  Home,
  LogIn,
  SearchIcon,
  Tv,
  User,
  WatchIcon,
} from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { cn } from "../lib/utils";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";

export default function NavBar() {
  const [query, setQuery] = useState<string>("");
  const inputRef = useRef<HTMLInputElement>(null);
  const [searchType, setSearchType] = useState<string>("movie");
  const { data: session } = authClient.useSession();
  const user = session?.user;

  const router = useRouter();
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    router.push(`/search?q=${encodeURIComponent(query)}`);
    setQuery("");
  };

  // useEffect(() => {
  //   function handleKeyDown(e: KeyboardEvent) {
  //     if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "k") {
  //       e.preventDefault();
  //       inputRef.current?.focus();
  //     }
  //   }

  //   document.addEventListener("keydown", handleKeyDown);

  //   return () => {
  //     document.removeEventListener("keydown", handleKeyDown);
  //   };
  // }, []);

  return (
    <div className="fixed bottom-4 left-[50%] z-1001 flex w-[95%] translate-x-[-50%] items-center gap-1 rounded-md bg-black p-1 sm:w-[90%] md:bottom-6 md:w-150">
      <Link href={"/home"} className="shrink-0">
        <div className="flex h-10 items-center justify-center rounded-sm bg-[#F5C518] px-3 text-2xl font-bold text-black shadow-lg md:px-4">
          <span className="self-baseline">M</span>
          <div className="hidden md:flex ">
            <span className="text-base">ovie</span>{" "}
            <span className="text-base">zz</span>
          </div>
        </div>
      </Link>
      <form
        className="flex h-10 min-w-0 grow items-center gap-1"
        onSubmit={(e) => handleSubmit(e)}
      >
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="h-full min-w-0 w-full rounded-[3px] border-none bg-neutral-700 px-2 text-sm md:text-base outline-none focus:border-none focus:ring-0 focus:outline-none"
          placeholder="Search here..."
        />
        <button className="flex h-10 min-w-10 shrink-0 cursor-pointer flex-col items-center justify-between rounded-[3px] bg-gray-700 px-2 py-1 text-gray-300 transition-colors duration-300 hover:text-gray-100">
          <SearchIcon size={18} />
          <span className="text-[8px]">Search</span>
        </button>
      </form>

      <button
        onClick={() => router.push("/")}
        className="flex h-10 min-w-10 shrink-0 cursor-pointer flex-col items-center justify-between rounded-[3px] bg-gray-700 px-2 py-1 text-gray-300 transition-colors duration-300 hover:text-gray-100"
      >
        <Home size={18} />
        <span className="text-[8px]">Home</span>
      </button>
      {user ? (
        <button
          onClick={() => router.push("/account")}
          className="flex h-10 min-w-10 shrink-0 cursor-pointer flex-col items-center justify-between rounded-[3px] bg-gray-700 px-2 py-1 text-gray-300 transition-colors duration-300 hover:text-gray-100"
        >
          {user.image ? (
            <img
              src={user.image}
              alt={user.name || "Profile"}
              referrerPolicy="no-referrer"
              className="size-4.5 rounded-full object-cover"
            />
          ) : (
            <User size={18} />
          )}
          <span className="max-w-14 truncate text-[8px]">
            {user.name?.split(" ")[0] || "Account"}
          </span>
        </button>
      ) : (
        <button
          onClick={() => router.push("/login")}
          className="flex h-10 min-w-10 shrink-0 cursor-pointer flex-col items-center justify-between rounded-[3px] bg-gray-700 px-2 py-1 text-gray-300 transition-colors duration-300 hover:text-gray-100"
        >
          <LogIn size={18} />
          <span className="text-[8px]">Login</span>
        </button>
      )}
      <button
        onClick={() => router.push("/watchlist")}
        className="flex h-10 min-w-10 shrink-0 cursor-pointer flex-col items-center justify-between rounded-[3px] bg-gray-700 px-2 py-1 text-gray-300 transition-colors duration-300 hover:text-gray-100"
      >
        <Film size={18} />
        <span className="text-[8px]">Watchlist</span>
      </button>

      {/* <div className="absolute right-23.5 flex gap-px rounded-[3px] border-2 border-slate-800 bg-slate-800">
        <button
          onClick={() => setSearchType("movie")}
          className={cn(
            "flex h-8 min-w-10 cursor-pointer flex-col items-center justify-between rounded-l-[3px] bg-gray-700 px-2 py-1 text-gray-300 transition-colors duration-300 hover:text-gray-100",
            searchType !== "movie" && "text-black",
          )}
        >
          <Film size={18} />
          <span className="text-[8px] font-bold">Movies</span>
        </button>
        <button
          onClick={() => setSearchType("tv")}
          className={cn(
            "flex h-8 min-w-10 cursor-pointer flex-col items-center justify-between rounded-r-[3px] bg-gray-700 px-2 py-1 text-gray-300 transition-colors duration-300 hover:text-gray-100",
            searchType !== "tv" && "text-black",
          )}
        >
          <Tv size={18} />
          <span className="text-[8px] font-bold">Series</span>
        </button>
      </div> */}
    </div>
  );
}
