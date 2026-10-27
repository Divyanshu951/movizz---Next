import { useQuery } from "@tanstack/react-query";
import { useParams, useSearchParams } from "react-router-dom";
import { fetchReviews } from "../api/api";
import type React from "react";

type Props = { toggleReviews: React.Dispatch<React.SetStateAction<boolean>> };

export default function Reviews({ toggleReviews }: Props) {
  const searchParams = useParams();
  const movieId = searchParams.movieId;
  const [params] = useSearchParams();
  const type = params.get("type");

  const { data } = useQuery({
    queryKey: ["review"],
    queryFn: () => fetchReviews(type!, movieId!),
  });

  return (
    <div className="absolute inset-0 z-1001 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="h-[70vh] w-[80vw] max-w-4xl rounded-2xl border-2 border-[#F5C518] bg-[#1A1A1A] px-6 py-4 shadow-2xl">
        <div className="flex items-center justify-between">
          <h2 className="mb-6 text-3xl font-bold">Reviews</h2>
          <button onClick={() => toggleReviews(false)}>❌</button>
        </div>
        <div></div>
      </div>
    </div>
  );
}
