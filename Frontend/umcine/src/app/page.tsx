import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { Suspense } from "react";
import { getQueryClient } from "../api/query-client";
import { movieQueries } from "../api/movies/movie-queries";
import { MOVIE_LIST_TOTAL_PAGES } from "../utils/movies/movie-list-pages";
import { MovieListPage } from "../views/movies/movie-list-page";

function toCurrentPage(page: string | string[] | undefined) {
  const pageNumber = Number(page);
  if (!Number.isInteger(pageNumber) || pageNumber < 1) return 1;
  return Math.min(pageNumber, MOVIE_LIST_TOTAL_PAGES);
}

export default function HomePage({ searchParams }: PageProps<"/">) {
  return (
    <Suspense fallback={<LoadingMessage />}>
      <MovieListScreen searchParams={searchParams} />
    </Suspense>
  );
}

async function MovieListScreen({ searchParams }: Pick<PageProps<"/">, "searchParams">) {
  const { page } = await searchParams;
  const currentPage = toCurrentPage(page);
  const queryClient = getQueryClient();
  await queryClient.prefetchQuery(movieQueries.list(currentPage));

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <MovieListPage currentPage={currentPage} />
    </HydrationBoundary>
  );
}

function LoadingMessage() {
  return (
    <main className="page-container flex-1 pt-8 pb-20">
      <p className="py-20 text-center text-(--color-text-secondary)">
        영화 목록을 불러오는 중이에요.
      </p>
    </main>
  );
}
