import TitleDetails from "@/components/ui/MovieDetailsCard";
import { getTitleDetails } from "@/lib/tmdb";

type props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ type: "movie" | "tv" }>;
};

const Page = async ({ params, searchParams }: props) => {
  const { id } = await params;
  const { type } = await searchParams;

  const data = await getTitleDetails(id, type);
  console.log(data);

  return (
    <>
      <TitleDetails data={data} type={type} />
    </>
  );
};

export default Page;
