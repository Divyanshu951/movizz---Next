import TitleDetails from "@/components/ui/MovieDetailsCard";
import { getTitleDetails } from "@/lib/tmdb";

type props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ type?: "movie" | "tv" }>;
};

const Page = async ({ params, searchParams }: props) => {
  const { id } = await params;
  const resolvedSearchParams = await searchParams;
  const type: "movie" | "tv" =
    resolvedSearchParams?.type === "tv" ? "tv" : "movie";

  let data = null;
  try {
    data = await getTitleDetails(id, type);
  } catch (error) {
    console.error("SSR getTitleDetails failed, falling back to client fetch:", error);
  }

  return <TitleDetails data={data} titleId={id} type={type} />;
};

export default Page;
