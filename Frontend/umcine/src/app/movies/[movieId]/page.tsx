import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import type { Metadata } from "next";
import { Suspense } from "react";
import { getMovieDetail } from "../../../api/movies/get-movie-detail";
import { movieQueries } from "../../../api/movies/movie-queries";
import { getQueryClient } from "../../../api/query-client";
import { getTmdbPosterUrl } from "../../../utils/movies/tmdb-image";
import {
  DetailMessage,
  MovieDetailPage,
} from "../../../views/movies/movie-detail-page";

function toMovieId(movieIdParam: string) {
  const movieId = Number(movieIdParam);
  return Number.isInteger(movieId) && movieId > 0 ? movieId : null;
}

export async function generateMetadata({
  params,
}: PageProps<"/movies/[movieId]">): Promise<Metadata> {
  const movieId = toMovieId((await params).movieId);
  if (movieId === null) return { title: "영화 상세" };

  try {
    const movie = await getMovieDetail(movieId);
    const posterUrl = getTmdbPosterUrl(movie.poster_path);
    return {
      title: movie.title,
      description: movie.overview || `${movie.title}의 상세 정보예요.`,
      openGraph: {
        title: movie.title,
        description: movie.tagline || movie.overview,
        images: posterUrl ? [posterUrl] : undefined,
      },
    };
  } catch {
    return { title: "영화 상세" };
  }
}

export default function MovieDetailRoute({
  params,
}: PageProps<"/movies/[movieId]">) {
  return (
    <Suspense fallback={<DetailMessage message="영화 정보를 불러오는 중이에요." />}>
      <MovieDetailScreen params={params} />
    </Suspense>
  );
}

async function MovieDetailScreen({
  params,
}: Pick<PageProps<"/movies/[movieId]">, "params">) {
  const movieId = toMovieId((await params).movieId);
  if (movieId === null) {
    return <DetailMessage message="올바르지 않은 영화 번호예요." />;
  }

  const queryClient = getQueryClient();
  await queryClient.prefetchQuery(movieQueries.detail(movieId));

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <MovieDetailPage movieId={movieId} />
    </HydrationBoundary>
  );
}
