import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "@tanstack/react-router";
import { useState, type SubmitEvent } from "react";
import { favoriteQueries } from "../../api/favorites/favorite-queries";
import { movieQueries } from "../../api/movies/movie-queries";
import type { TmdbMovieDetail } from "../../api/movies/models";
import { BookmarkButton } from "../../components/bookmark-button";
import { useAuthStore } from "../../stores/auth-store";
import { cn } from "../../utils/cn";
import { getMovieDetailErrorMessage } from "../../utils/movies/get-movie-detail-error-message";
import {
  getTmdbBackdropUrl,
  getTmdbPosterUrl,
} from "../../utils/movies/tmdb-image";

const RATINGS = [1, 2, 3, 4, 5];

function isValidMovieId(movieId: number) {
  return Number.isInteger(movieId) && movieId > 0;
}

function formatRuntime(runtime: number | null) {
  if (runtime === null) return "상영 시간 정보가 없어요.";

  const hours = Math.floor(runtime / 60);
  const minutes = runtime % 60;
  if (hours === 0) return `${minutes}분`;
  if (minutes === 0) return `${hours}시간`;
  return `${hours}시간 ${minutes}분`;
}

export function MovieDetailPage() {
  const { movieId: movieIdParam } = useParams({ from: "/movies/$movieId" });
  const movieId = Number(movieIdParam);
  const isValid = isValidMovieId(movieId);

  const movieDetailQuery = useQuery({
    ...movieQueries.detail(movieId),
    enabled: isValid,
  });

  if (!isValid) {
    return <DetailMessage message="올바르지 않은 영화 번호예요." />;
  }
  if (movieDetailQuery.isPending) {
    return <DetailMessage message="영화 정보를 불러오는 중이에요." />;
  }
  if (movieDetailQuery.isError) {
    return (
      <DetailMessage
        message={getMovieDetailErrorMessage(movieDetailQuery.error)}
        onRetry={() => movieDetailQuery.refetch()}
      />
    );
  }

  return <MovieDetailContent key={movieId} movie={movieDetailQuery.data} />;
}

function MovieDetailContent({ movie }: { movie: TmdbMovieDetail }) {
  const accessToken = useAuthStore((state) => state.accessToken);
  const favoriteStatusQuery = useQuery({
    ...favoriteQueries.status(movie.id),
    enabled: Boolean(accessToken),
  });
  const isFavorite = favoriteStatusQuery.data?.isFavorite ?? false;
  const backdropUrl = getTmdbBackdropUrl(movie.backdrop_path);
  const posterUrl = getTmdbPosterUrl(movie.poster_path);

  return (
    <main className="flex-1 pb-20">
      <section className="relative h-80 overflow-hidden bg-(--color-text-primary) text-(--color-bg-surface) min-[641px]:h-[408px]">
        {backdropUrl ? (
          <img
            className="absolute inset-0 size-full object-cover"
            src={backdropUrl}
            alt=""
            aria-hidden="true"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-(--color-border-default) text-sm text-(--color-text-tertiary)">
            이미지 없음
          </div>
        )}
        <div
          className="absolute inset-0 bg-[linear-gradient(to_top,rgba(0,0,0,0.6),transparent_60%),linear-gradient(to_right,rgba(0,0,0,0.45),transparent_60%)]"
          aria-hidden="true"
        />
        <div className="page-container relative z-1 flex h-full flex-col justify-between pt-8 pb-7">
          <Link
            className="inline-flex items-center gap-1 self-start text-sm font-bold hover:underline"
            to="/"
          >
            <img
              className="size-5 brightness-0 invert"
              src="/icons/movie-icons/chevron-left.svg"
              alt=""
            />
            영화 목록
          </Link>
          <div>
            <h1 className="text-[32px]/[1.2] font-extrabold tracking-[-0.03em] min-[641px]:text-5xl/[1.2]">
              {movie.title}
            </h1>
            <p className="mt-3 text-base">{movie.original_title}</p>
            <p className="mt-2 flex flex-wrap gap-x-2.5 gap-y-1 text-sm font-bold">
              <span>{movie.release_date}</span>
              <span>{movie.genres.map((genre) => genre.name).join(", ")}</span>
              <span>{formatRuntime(movie.runtime)}</span>
            </p>
          </div>
        </div>
      </section>

      <div className="page-container grid grid-cols-1 items-start gap-6 pt-7 min-[641px]:grid-cols-[200px_minmax(0,1fr)] min-[641px]:gap-9 min-[1025px]:grid-cols-[226px_minmax(0,1fr)_406px]">
        {posterUrl ? (
          <img
            className="aspect-226/323 w-40 rounded-lg object-cover shadow-[0_12px_24px_rgba(23,25,30,0.16)] min-[641px]:w-full"
            src={posterUrl}
            alt={`${movie.title} 포스터`}
          />
        ) : (
          <div className="flex aspect-226/323 w-40 items-center justify-center rounded-lg bg-(--color-border-default) text-sm text-(--color-text-tertiary) min-[641px]:w-full">
            이미지 없음
          </div>
        )}

        <section>
          {movie.tagline && (
            <h2 className="text-[22px] font-extrabold tracking-[-0.02em]">
              {movie.tagline}
            </h2>
          )}
          <p className="mt-4 text-[15px]/[1.8] text-(--color-text-secondary)">
            {movie.overview}
          </p>
          <BookmarkButton
            className="mt-4"
            movieId={movie.id}
            movieTitle={movie.title}
            isFavorite={isFavorite}
            variant="label"
          />
        </section>

        <RatingForm />
      </div>
    </main>
  );
}

interface DetailMessageProps {
  message: string;
  onRetry?: () => void;
}

function DetailMessage({ message, onRetry }: DetailMessageProps) {
  return (
    <main className="page-container flex flex-1 flex-col items-start gap-3 pt-8 pb-20 text-(--color-text-secondary)">
      <p>{message}</p>
      {onRetry && (
        <button
          type="button"
          className="h-10 rounded-md bg-(--color-text-primary) px-4 text-sm font-bold text-(--color-bg-surface) hover:opacity-85"
          onClick={onRetry}
        >
          다시 시도
        </button>
      )}
      <Link className="text-(--color-action-primary) underline" to="/">
        영화 목록으로 돌아가기
      </Link>
    </main>
  );
}

function RatingForm() {
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState("");
  const [isSaved, setIsSaved] = useState(false);

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaved(true);
  }

  return (
    <form
      className="col-span-full border-t border-(--color-border-default) pt-7 min-[1025px]:col-auto min-[1025px]:border-t-0 min-[1025px]:border-l min-[1025px]:pt-0 min-[1025px]:pl-[34px]"
      onSubmit={handleSubmit}
    >
      <h2 className="text-[22px] font-extrabold">내 평점</h2>
      <p className="mt-2 text-[13px] text-(--color-text-tertiary)">
        별점은 필수, 후기는 선택이에요.
      </p>

      <div className="mt-3 flex gap-[5px]" role="group" aria-label="별점">
        {RATINGS.map((value) => {
          const isSelected = value <= rating;

          return (
            <button
              key={value}
              type="button"
              className={cn(
                "flex size-[43px] items-center justify-center rounded-md border bg-(--color-bg-surface) p-0",
                isSelected
                  ? "border-(--color-text-primary)"
                  : "border-(--color-border-default) hover:border-(--color-text-tertiary)",
              )}
              aria-label={`${value}점`}
              aria-pressed={isSelected}
              onClick={() => {
                setRating(value);
                setIsSaved(false);
              }}
            >
              <img
                className="size-6"
                src={
                  isSelected
                    ? "/icons/movie-icons/star.svg"
                    : "/icons/movie-icons/star-outline.svg"
                }
                alt=""
              />
            </button>
          );
        })}
      </div>

      <textarea
        className="mt-2 block h-[116px] w-full resize-y rounded-lg border border-(--color-border-default) bg-(--color-bg-surface) p-3.5 text-sm text-(--color-text-primary) placeholder:text-(--color-text-tertiary) focus:outline-2 focus:-outline-offset-1 focus:outline-(--color-action-primary)"
        aria-label="후기"
        placeholder="영화를 보고 느낀 점을 남겨보세요."
        value={review}
        onChange={(event) => {
          setReview(event.target.value);
          setIsSaved(false);
        }}
      />

      <button
        type="submit"
        className="mt-2.5 h-[46px] w-full rounded-md bg-(--color-text-primary) text-[15px] font-bold text-(--color-bg-surface) disabled:cursor-not-allowed disabled:opacity-40"
        disabled={!rating}
      >
        평점 저장
      </button>
      {isSaved && (
        <p className="mt-2 text-[13px] text-(--color-action-primary)" role="status">
          평점을 저장했어요.
        </p>
      )}
    </form>
  );
}
