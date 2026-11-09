"use client";

import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { movieQueries } from "../../api/movies/movie-queries";
import type { MemberRating } from "../../api/ratings/models";
import { ratingQueries } from "../../api/ratings/rating-queries";
import Pagination from "../../components/pagination";
import RetryMessage from "../../components/retry-message";
import { useMyMemberId } from "../../hooks/use-my-member-id";
import { formatDate } from "../../utils/members/format-date";
import { getTmdbPosterUrl } from "../../utils/movies/tmdb-image";

const PAGE_SIZE = 5;
const RATINGS = [1, 2, 3, 4, 5];

export function MyRatingsPage() {
  const memberId = useMyMemberId();

  return (
    <main className="page-container flex-1 pt-8 pb-20">
      <h1 className="mb-6 text-[28px] font-extrabold tracking-[-0.02em] min-[481px]:text-4xl">
        내 평점
      </h1>
      {memberId === null ? (
        <p className="py-20 text-center text-(--color-text-secondary)">
          로그인 정보를 확인할 수 없어요. 다시 로그인해 주세요.
        </p>
      ) : (
        <MyRatingList memberId={memberId} />
      )}
    </main>
  );
}

function MyRatingList({ memberId }: { memberId: number }) {
  const [currentPage, setCurrentPage] = useState(1);
  const ratingsQuery = useQuery(
    ratingQueries.memberPage(memberId, currentPage - 1, PAGE_SIZE),
  );

  if (ratingsQuery.isPending) {
    return (
      <p className="py-20 text-center text-(--color-text-secondary)">
        평점 목록을 불러오는 중이에요.
      </p>
    );
  }
  if (ratingsQuery.isError) {
    return (
      <RetryMessage
        message="평점 목록을 불러오지 못했어요."
        onRetry={() => ratingsQuery.refetch()}
      />
    );
  }

  const { ratings, totalElements, totalPages } = ratingsQuery.data;
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
      <ul
        className="flex flex-col gap-3 transition-opacity aria-busy:opacity-60"
        aria-busy={ratingsQuery.isPlaceholderData}
      >
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

function RatingItem({ rating }: { rating: MemberRating }) {
  const movieQuery = useQuery(movieQueries.detail(rating.movieId));
  const movie = movieQuery.data;
  const posterUrl = movie ? getTmdbPosterUrl(movie.poster_path) : null;

  return (
    <li className="flex gap-4 rounded-lg border border-(--color-border-default) bg-(--color-bg-surface) p-4">
      {posterUrl ? (
        <div className="relative aspect-2/3 w-16 shrink-0 overflow-hidden rounded-md">
          <Image className="object-cover" src={posterUrl} alt="" fill sizes="64px" />
        </div>
      ) : (
        <div className="flex aspect-2/3 w-16 shrink-0 items-center justify-center rounded-md bg-(--color-border-default) text-[11px] text-(--color-text-tertiary)">
          {movieQuery.isPending ? "" : "이미지 없음"}
        </div>
      )}
      <div className="min-w-0 flex-1">
        <Link
          className="font-bold text-(--color-text-primary) hover:underline"
          href={`/movies/${rating.movieId}`}
        >
          {movie?.title ?? `영화 #${rating.movieId}`}
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
          {formatDate(rating.createdAt)}
        </p>
      </div>
    </li>
  );
}
