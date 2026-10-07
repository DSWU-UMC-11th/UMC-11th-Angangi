import type { Movie } from "../types/movie";
import MovieCard from "./movie-card";

interface MovieGridProps {
  movies: Movie[];
}

export default function MovieGrid({ movies }: MovieGridProps) {
  if (movies.length === 0) {
    return (
      <p className="py-20 text-center text-(--color-text-secondary)">
        표시할 영화가 없어요.
      </p>
    );
  }

  return (
    // 모바일 2열 → sm 3열 → lg 4열 → xl 5열(Figma 데스크톱)
    <ul className="grid grid-cols-2 gap-x-3 gap-y-5 sm:grid-cols-3 sm:gap-x-4 sm:gap-y-6 lg:grid-cols-4 lg:gap-x-5 xl:grid-cols-5">
      {movies.map((movie) => (
        <MovieCard key={movie.id} movie={movie} />
      ))}
    </ul>
  );
}
