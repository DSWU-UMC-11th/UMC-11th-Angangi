import { useFavoriteMovieIds } from "../hooks/use-favorite-movie-ids";
import type { MovieCardItem } from "../types/movie-card";
import MovieCard from "./movie-card";

interface MovieGridProps {
  movies: MovieCardItem[];
  emptyMessage?: string;
}

export default function MovieGrid({
  movies,
  emptyMessage = "조건에 맞는 영화가 없어요.",
}: MovieGridProps) {
  const favoriteMovieIds = useFavoriteMovieIds();

  if (movies.length === 0) {
    return (
      <p className="py-20 text-center text-(--color-text-secondary)">
        {emptyMessage}
      </p>
    );
  }

  return (
    <ul className="grid grid-cols-2 gap-x-3 gap-y-5 sm:grid-cols-3 sm:gap-x-4 sm:gap-y-6 lg:grid-cols-4 lg:gap-x-5 xl:grid-cols-5">
      {movies.map((movie) => (
        <MovieCard
          key={movie.id}
          movie={movie}
          isFavorite={favoriteMovieIds.has(movie.id)}
        />
      ))}
    </ul>
  );
}
