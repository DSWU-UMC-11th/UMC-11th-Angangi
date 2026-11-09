import { Link } from "@tanstack/react-router";
import { isHTTPError } from "ky";
import { useEffect, useState, type SubmitEvent } from "react";
import { getMovieDetail } from "../../api/movies/get-movie-detail";
import { getMemberRatings } from "../../api/ratings/get-member-ratings";
import type { MemberRating } from "../../api/ratings/models";
import Pagination from "../../components/pagination";
import RetryMessage from "../../components/retry-message";
import { getTmdbPosterUrl } from "../../utils/movies/tmdb-image";

const DEFAULT_MEMBER_ID = 1;
const PAGE_SIZE = 5;
const RATINGS = [1, 2, 3, 4, 5];

interface RatingWithMovie extends MemberRating {
  movieTitle: string | null;
  posterUrl: string | null;
}

async function attachMovieInfo(ratings: MemberRating[]) {
  const movies = await Promise.allSettled(
    ratings.map((rating) => getMovieDetail(rating.movieId)),
  );

  return ratings.map((rating, index): RatingWithMovie => {
    const result = movies[index];
    if (result.status === "rejected") {
      return { ...rating, movieTitle: null, posterUrl: null };
    }
    return {
      ...rating,
      movieTitle: result.value.title,
      posterUrl: getTmdbPosterUrl(result.value.poster_path),
    };
  });
}

function getRatingsErrorMessage(error: unknown) {
  if (isHTTPError(error) && error.response.status === 404) {
    return "존재하지 않는 회원이에요.";
  }
  return "평점 목록을 불러오지 못했어요.";
}

export function MyRatingsPage() {
  const [memberIdInput, setMemberIdInput] = useState(String(DEFAULT_MEMBER_ID));
  const [memberId, setMemberId] = useState(DEFAULT_MEMBER_ID);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [ratings, setRatings] = useState<RatingWithMovie[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let ignore = false;

    async function loadRatings() {
      setIsLoading(true);
      setErrorMessage(null);

      try {
        const response = await getMemberRatings({
          memberId,
          page: currentPage - 1,
          size: PAGE_SIZE,
        });
        const withMovies = await attachMovieInfo(response.ratings);
        if (!ignore) {
          setRatings(withMovies);
          setTotalPages(response.totalPages);
          setTotalElements(response.totalElements);
        }
      } catch (error) {
        if (!ignore) setErrorMessage(getRatingsErrorMessage(error));
      } finally {
        if (!ignore) setIsLoading(false);
      }
    }

    loadRatings();

    return () => {
      ignore = true;
    };
  }, [memberId, currentPage, retryCount]);

  const parsedInput = Number(memberIdInput);
  const isValidInput = Number.isInteger(parsedInput) && parsedInput > 0;

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!isValidInput) return;
    if (parsedInput === memberId && currentPage === 1) {
      setRetryCount((count) => count + 1);
      return;
    }
    setMemberId(parsedInput);
    setCurrentPage(1);
  }

  function renderContent() {
    if (isLoading) {
      return (
        <p className="py-20 text-center text-(--color-text-secondary)">
          평점 목록을 불러오는 중이에요.
        </p>
      );
    }
    if (errorMessage) {
      return (
        <RetryMessage
          message={errorMessage}
          onRetry={() => setRetryCount((count) => count + 1)}
        />
      );
    }
    if (ratings.length === 0) {
      return (
        <p className="py-20 text-center text-(--color-text-secondary)">
          아직 남긴 평점이 없어요.
        </p>
      );
    }
    return (
      <>
        <p className="mb-3 text-sm text-(--color-text-secondary)">
          총 {totalElements}개의 평점
        </p>
        <ul className="flex flex-col gap-3">
          {ratings.map((rating) => (
            <RatingItem key={rating.ratingId} rating={rating} />
          ))}
        </ul>
        {totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        )}
      </>
    );
  }

  return (
    <main className="page-container flex-1 pt-8 pb-20">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-extrabold tracking-[-0.02em] min-[481px]:text-4xl">
            내 평점
          </h1>
          <p className="mt-2 text-sm text-(--color-text-secondary)">
            로그인 기능이 생기기 전까지는 회원 번호로 평점을 조회해요.
          </p>
        </div>
        <form className="flex gap-2" onSubmit={handleSubmit}>
          <input
            className="h-10 w-28 rounded-md border border-(--color-border-default) bg-(--color-bg-surface) px-3 text-sm text-(--color-text-primary) focus:outline-2 focus:-outline-offset-1 focus:outline-(--color-action-primary)"
            type="number"
            min={1}
            aria-label="회원 번호"
            value={memberIdInput}
            onChange={(event) => setMemberIdInput(event.target.value)}
          />
          <button
            type="submit"
            className="h-10 rounded-md bg-(--color-text-primary) px-4 text-sm font-bold text-(--color-bg-surface) hover:opacity-85 disabled:cursor-not-allowed disabled:opacity-40"
            disabled={!isValidInput}
          >
            조회
          </button>
        </form>
      </div>
      {renderContent()}
    </main>
  );
}

function RatingItem({ rating }: { rating: RatingWithMovie }) {
  return (
    <li className="flex gap-4 rounded-lg border border-(--color-border-default) bg-(--color-bg-surface) p-4">
      {rating.posterUrl ? (
        <img
          className="aspect-2/3 w-16 shrink-0 rounded-md object-cover"
          src={rating.posterUrl}
          alt=""
        />
      ) : (
        <div className="flex aspect-2/3 w-16 shrink-0 items-center justify-center rounded-md bg-(--color-border-default) text-[11px] text-(--color-text-tertiary)">
          이미지 없음
        </div>
      )}
      <div className="min-w-0 flex-1">
        <Link
          className="font-bold text-(--color-text-primary) hover:underline"
          to="/movies/$movieId"
          params={{ movieId: String(rating.movieId) }}
        >
          {rating.movieTitle ?? `영화 #${rating.movieId}`}
        </Link>
        <div className="mt-1.5 flex gap-0.5" aria-label={`${rating.score}점`}>
          {RATINGS.map((value) => (
            <img
              key={value}
              className="size-4"
              src={
                value <= rating.score
                  ? "/icons/movie-icons/star.svg"
                  : "/icons/movie-icons/star-outline.svg"
              }
              alt=""
            />
          ))}
        </div>
        {rating.comment && (
          <p className="mt-2 text-sm text-(--color-text-secondary)">
            {rating.comment}
          </p>
        )}
        <p className="mt-2 text-xs text-(--color-text-tertiary)">
          {rating.createdAt.slice(0, 10)}
        </p>
      </div>
    </li>
  );
}
