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
        <img src={movie.posterPath} alt={`${movie.title} 포스터`} />
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
      <h2 className="movie-card__title">{movie.title}</h2>
      <p className="movie-card__date">{movie.releaseDate}</p>
    </li>
  );
}
