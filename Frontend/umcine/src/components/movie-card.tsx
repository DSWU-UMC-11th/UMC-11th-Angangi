import { Link } from "@tanstack/react-router";
import type { Movie } from "../types/movie";
import { BookmarkButton } from "./bookmark-button";

interface MovieCardProps {
  movie: Movie;
}

export default function MovieCard({ movie }: MovieCardProps) {
  return (
    <li>
      <div className="relative aspect-[8/9] overflow-hidden rounded-lg bg-(--color-border-default)">
        <Link
          className="block h-full"
          to="/movies/$movieId"
          params={{ movieId: String(movie.id) }}
          tabIndex={-1}
          aria-hidden="true"
        >
          <img
            className="size-full object-cover"
            src={movie.posterPath}
            alt=""
          />
        </Link>
        <div className="absolute top-2 right-2 sm:top-3 sm:right-3">
          <BookmarkButton movieId={movie.id} />
        </div>
      </div>
      <h2 className="mt-2 truncate text-[13px]/[1.4] font-bold text-(--color-text-primary) sm:mt-3 sm:text-sm/[1.4]">
        <Link
          className="hover:underline"
          to="/movies/$movieId"
          params={{ movieId: String(movie.id) }}
        >
          {movie.title}
        </Link>
      </h2>
      <p className="mt-1 text-xs/normal text-(--color-text-tertiary)">
        {movie.releaseDate}
      </p>
    </li>
  );
}
