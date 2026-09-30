import { Link } from "@tanstack/react-router";
import type { Movie } from "../types/movie";
import "./movie-card.css";

interface MovieCardProps {
  movie: Movie;
  onToggleBookmark: (movieId: number) => void;
}

export default function MovieCard({ movie, onToggleBookmark }: MovieCardProps) {
  const bookmarkIcon = movie.isBookmarked
    ? "/icons/movie-icons/bookmark.svg"
    : "/icons/movie-icons/bookmark-outline.svg";

  return (
    <li className="movie-card">
      <div className="movie-card__poster">
        {/* 제목 링크와 목적지가 같아서 키보드 탭 순서와 스크린 리더에서는 제외해요 */}
        <Link
          className="movie-card__poster-link"
          to="/movies/$movieId"
          params={{ movieId: String(movie.id) }}
          tabIndex={-1}
          aria-hidden="true"
        >
          <img src={movie.posterPath} alt="" />
        </Link>
        <button
          type="button"
          className="movie-card__bookmark"
          aria-pressed={movie.isBookmarked}
          aria-label={`${movie.title} 북마크`}
          onClick={() => onToggleBookmark(movie.id)}
        >
          <img src={bookmarkIcon} alt="" />
        </button>
      </div>
      <h2 className="movie-card__title">
        <Link to="/movies/$movieId" params={{ movieId: String(movie.id) }}>
          {movie.title}
        </Link>
      </h2>
      <p className="movie-card__date">{movie.releaseDate}</p>
    </li>
  );
}
