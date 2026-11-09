import type { Metadata } from "next";
import { Suspense } from "react";
import { SearchPage } from "../../views/movies/search-page";

export const metadata: Metadata = {
  title: "영화 검색",
  description: "보고 싶은 영화를 제목으로 찾아봐요.",
};

export default function SearchRoute({ searchParams }: PageProps<"/search">) {
  return (
    <Suspense>
      <SearchScreen searchParams={searchParams} />
    </Suspense>
  );
}

async function SearchScreen({
  searchParams,
}: Pick<PageProps<"/search">, "searchParams">) {
  const { query } = await searchParams;
  return <SearchPage query={typeof query === "string" ? query : ""} />;
}
