import TitleDetails from "@/components/ui/MovieDetailsCard";
import { getTitleDetails } from "@/lib/tmdb";
import Link from "next/link";

type props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ type?: "movie" | "tv" }>;
};

const Page = async ({ params, searchParams }: props) => {
  const { id } = await params;
  const resolvedSearchParams = await searchParams;
  const type: "movie" | "tv" =
    resolvedSearchParams?.type === "tv" ? "tv" : "movie";

  try {
    const data = await getTitleDetails(id, type);

    return (
      <>
        <TitleDetails data={data} type={type} />
      </>
    );
  } catch (error) {
    console.error("Failed to load title details:", error);
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-black px-4 text-center text-white">
        <h1 className="text-3xl font-bold text-[#F5C518]">
          Title Unavailable
        </h1>
        <p className="mt-2 max-w-md text-sm text-zinc-400">
          We couldn&apos;t load the details for this title right now. Please try
          again or return to the home page.
        </p>
        <Link
          href="/home"
          className="mt-6 rounded-xl bg-[#F5C518] px-5 py-2.5 text-sm font-bold text-black transition hover:bg-[#e0b414]"
        >
          Back to Home
        </Link>
      </div>
    );
  }
};

export default Page;
