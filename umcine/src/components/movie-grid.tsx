import type { Movie } from "../types/movie";
import MovieCard from "./movie-card";

interface MovieGridProps {
  movies: Movie[];
  onToggleBookmark: (movieId: number) => void;
}

export default function MovieGrid({ movies, onToggleBookmark }: MovieGridProps) {
  if (movies.length === 0) {
    return (
      <p className="py-20 text-center text-(--color-text-secondary)">
        표시할 영화가 없어요.
      </p>
    );
  }

  return (
    // 기존 CSS와 같은 너비에서 열 수가 바뀌도록 481px / 769px / 1201px 기준을 사용해요
    <ul className="grid grid-cols-1 gap-x-4 gap-y-6 min-[481px]:grid-cols-2 min-[769px]:grid-cols-3 min-[769px]:gap-x-5 min-[1201px]:grid-cols-5">
      {movies.map((movie) => (
        <MovieCard
          key={movie.id}
          movie={movie}
          onToggleBookmark={onToggleBookmark}
        />
      ))}
    </ul>
  );
}
