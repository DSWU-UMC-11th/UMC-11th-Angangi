import type { TmdbMovieListItem } from "../../api/movies/models";
import type { MovieCardItem } from "../../types/movie-card";
import { getTmdbPosterUrl } from "./tmdb-image";

// "2026-07-29" → "2026.07.29"
function formatReleaseDate(releaseDate: string) {
  return releaseDate ? releaseDate.replaceAll("-", ".") : "개봉일 미정";
}

export function toMovieCardItem(movie: TmdbMovieListItem): MovieCardItem {
  return {
    id: movie.id,
    title: movie.title,
    originalTitle: movie.original_title,
    releaseDate: formatReleaseDate(movie.release_date),
    posterUrl: getTmdbPosterUrl(movie.poster_path),
    overview: movie.overview || "줄거리 정보가 없어요.",
  };
}
