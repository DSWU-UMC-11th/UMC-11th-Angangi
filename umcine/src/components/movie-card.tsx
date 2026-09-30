import { Link } from "@tanstack/react-router";
import type { Movie } from "../types/movie";
import { cn } from "../utils/cn";

interface MovieCardProps {
  movie: Movie;
  onToggleBookmark: (movieId: number) => void;
}

export default function MovieCard({ movie, onToggleBookmark }: MovieCardProps) {
  const bookmarkIcon = movie.isBookmarked
    ? "/icons/movie-icons/bookmark.svg"
    : "/icons/movie-icons/bookmark-outline.svg";

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
        <button
          type="button"
          className={cn(
            "absolute top-2 right-2 flex size-7 items-center justify-center rounded-md border-[1.5px] p-0 sm:top-3 sm:right-3 sm:size-8",
            movie.isBookmarked
              ? "border-(--color-action-primary) bg-(--color-action-primary) hover:border-(--color-action-hover) hover:bg-(--color-action-hover)"
              : "border-(--color-bg-surface) bg-[rgba(23,25,30,0.72)] hover:bg-(--color-text-primary)",
          )}
          aria-pressed={movie.isBookmarked}
          aria-label={`${movie.title} 북마크`}
          onClick={() => onToggleBookmark(movie.id)}
        >
          <img
            className="size-5 brightness-0 invert sm:size-[22px]"
            src={bookmarkIcon}
            alt=""
          />
        </button>
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
