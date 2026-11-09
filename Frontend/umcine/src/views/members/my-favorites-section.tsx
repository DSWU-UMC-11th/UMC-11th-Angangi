"use client";

import { useQueries, useQuery } from "@tanstack/react-query";
import { favoriteQueries } from "../../api/favorites/favorite-queries";
import { movieQueries } from "../../api/movies/movie-queries";
import MovieGrid from "../../components/movie-grid";
import RetryMessage from "../../components/retry-message";
import { toMovieCardItem } from "../../utils/movies/to-movie-card-item";

export function MyFavoritesSection() {
  const favoritesQuery = useQuery(favoriteQueries.list());
  const movieIds = favoritesQuery.data?.map((favorite) => favorite.movieId) ?? [];

  const favoriteMovies = useQueries({
    queries: movieIds.map((movieId) => movieQueries.detail(movieId)),
    combine: (results) => ({
      movies: results.flatMap((result) =>
        result.data ? [toMovieCardItem(result.data)] : [],
      ),
      isPending: results.some((result) => result.isPending),
      failedCount: results.filter((result) => result.isError).length,
    }),
  });

  function renderContent() {
    if (favoritesQuery.isPending || favoriteMovies.isPending) {
      return (
        <p className="py-12 text-center text-(--color-text-secondary)">
          즐겨찾기 목록을 불러오는 중이에요.
        </p>
      );
    }
    if (favoritesQuery.isError) {
      return (
        <RetryMessage
          message="즐겨찾기 목록을 불러오지 못했어요."
          onRetry={() => favoritesQuery.refetch()}
        />
      );
    }
    return (
      <>
        <MovieGrid
          movies={favoriteMovies.movies}
          emptyMessage="아직 즐겨찾기한 영화가 없어요."
        />
        {favoriteMovies.failedCount > 0 && (
          <p className="mt-3 text-[13px] text-(--color-text-tertiary)">
            영화 {favoriteMovies.failedCount}편의 정보를 불러오지 못했어요.
          </p>
        )}
      </>
    );
  }

  return (
    <section className="mt-10" aria-labelledby="my-favorites-title">
      <h2 id="my-favorites-title" className="mb-4 text-[22px] font-extrabold">
        즐겨찾기한 영화
        {favoritesQuery.isSuccess && (
          <span className="ml-2 text-base font-bold text-(--color-text-tertiary)">
            {favoritesQuery.data.length}
          </span>
        )}
      </h2>
      {renderContent()}
    </section>
  );
}
