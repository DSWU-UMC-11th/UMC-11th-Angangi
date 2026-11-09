"use client";

import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState, type SubmitEvent } from "react";
import type { MovieCardItem } from "../../types/movie-card";
import { movieQueries } from "../../api/movies/movie-queries";
import { BookmarkButton } from "../../components/bookmark-button";
import RetryMessage from "../../components/retry-message";
import { useFavoriteMovieIds } from "../../hooks/use-favorite-movie-ids";
import { cn } from "../../utils/cn";
import { toMovieCardItem } from "../../utils/movies/to-movie-card-item";

interface SearchPageProps {
  query: string;
}

export function SearchPage({ query }: SearchPageProps) {
  const normalizedQuery = query.trim();

  if (!normalizedQuery) {
    return (
      <main className="page-container flex flex-1 flex-col items-center pt-50 pb-20 max-[768px]:pt-30">
        <h1 className="text-center text-[28px] font-extrabold tracking-[-0.03em] min-[481px]:text-[40px]">
          어떤 영화를 찾고 있나요?
        </h1>
        <SearchForm key="" initialQuery="" variant="hero" />
      </main>
    );
  }

  return (
    <main className="page-container flex-1 pt-8 pb-20">
      <h1 className="mb-5 text-[28px] font-extrabold tracking-[-0.02em] min-[481px]:text-4xl">
        영화 검색
      </h1>
      <SearchForm key={query} initialQuery={query} variant="compact" />
      <SearchResults query={normalizedQuery} />
    </main>
  );
}

function SearchResults({ query }: { query: string }) {
  const searchQuery = useQuery(movieQueries.search(query));
  const favoriteMovieIds = useFavoriteMovieIds();

  const movies = searchQuery.data?.results ?? [];

  function renderResults() {
    if (searchQuery.isLoading) {
      return (
        <p className="py-20 text-center text-(--color-text-secondary)">
          검색 결과를 불러오는 중이에요.
        </p>
      );
    }
    if (searchQuery.isError) {
      return (
        <RetryMessage
          message="검색 결과를 불러오지 못했어요."
          onRetry={() => searchQuery.refetch()}
        />
      );
    }
    if (movies.length === 0) {
      return (
        <p className="py-20 text-center text-(--color-text-secondary)">
          조건에 맞는 영화가 없어요.
        </p>
      );
    }
    return (
      <ul className="grid grid-cols-1 gap-x-10 min-[1025px]:grid-cols-2">
        {movies.map(toMovieCardItem).map((movie) => (
          <SearchResultItem
            key={movie.id}
            movie={movie}
            isFavorite={favoriteMovieIds.has(movie.id)}
          />
        ))}
      </ul>
    );
  }

  return (
    <section className="mt-6">
      <div className="flex items-center justify-between gap-4 border-b border-(--color-border-default) pb-4">
        <h2 className="text-lg font-bold">‘{query}’ 검색 결과</h2>
        {searchQuery.isSuccess && (
          <p className="shrink-0 text-xs text-(--color-text-tertiary)">
            영화 {movies.length}편
          </p>
        )}
      </div>
      {renderResults()}
    </section>
  );
}

interface SearchResultItemProps {
  movie: MovieCardItem;
  isFavorite: boolean;
}

function SearchResultItem({ movie, isFavorite }: SearchResultItemProps) {
  const detailHref = `/movies/${movie.id}`;

  return (
    <li className="flex gap-5 border-b border-(--color-border-default) py-5">
      <div className="relative w-24 shrink-0 min-[481px]:w-32.75">
        <Link href={detailHref} tabIndex={-1} aria-hidden="true">
          {movie.posterUrl ? (
            <span className="relative block aspect-131/197 w-full overflow-hidden rounded-lg bg-(--color-border-default)">
              <Image
                className="object-cover"
                src={movie.posterUrl}
                alt=""
                fill
                sizes="(min-width: 481px) 131px, 96px"
              />
            </span>
          ) : (
            <span className="flex aspect-131/197 w-full items-center justify-center rounded-lg bg-(--color-border-default) text-xs text-(--color-text-tertiary)">
              이미지 없음
            </span>
          )}
        </Link>
        <BookmarkButton
          className="absolute top-2 right-2"
          movieId={movie.id}
          movieTitle={movie.title}
          isFavorite={isFavorite}
        />
      </div>
      <div className="flex min-w-0 flex-col pt-1">
        <h3 className="text-lg/[1.4] font-bold">
          <Link className="hover:underline" href={detailHref}>
            {movie.title}
          </Link>
        </h3>
        <p className="mt-2 flex flex-wrap gap-x-2 text-xs text-(--color-text-tertiary)">
          <span>{movie.originalTitle}</span>
          <span>{movie.releaseDate}</span>
        </p>
        <p className="mt-3 line-clamp-3 text-[13px]/[1.6] text-(--color-text-secondary)">
          {movie.overview}
        </p>
        <Link
          className="mt-4 inline-flex items-center gap-1 self-start text-xs font-bold text-(--color-action-primary) hover:underline"
          href={detailHref}
        >
          상세 보기
          <span
            className="size-4 bg-current mask-[url(/icons/movie-icons/arrow-right.svg)] mask-contain mask-center mask-no-repeat"
            aria-hidden="true"
          />
        </Link>
      </div>
    </li>
  );
}

interface SearchFormProps {
  initialQuery: string;
  variant: "hero" | "compact";
}

function SearchForm({ initialQuery, variant }: SearchFormProps) {
  const router = useRouter();
  const [searchText, setSearchText] = useState(initialQuery);
  const inputRef = useRef<HTMLInputElement>(null);
  const isHero = variant === "hero";

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextQuery = searchText.trim();
    router.push(
      nextQuery ? `/search?query=${encodeURIComponent(nextQuery)}` : "/search",
    );
  }

  function handleClear() {
    setSearchText("");
    inputRef.current?.focus();
  }

  return (
    <form
      role="search"
      className={cn(
        "flex w-full items-center bg-(--color-bg-surface)",
        isHero
          ? "mt-10 h-19 max-w-205 gap-3 rounded-xl border-2 border-(--color-text-primary) pr-4.25 pl-6 shadow-[0_12px_24px_rgba(23,25,30,0.08)]"
          : "h-14 gap-2 rounded-lg border border-(--color-border-default) pr-3 pl-4",
      )}
      onSubmit={handleSubmit}
    >
      <img
        className="size-6 shrink-0 opacity-70"
        src="/icons/movie-icons/search.svg"
        alt=""
      />
      <input
        ref={inputRef}
        className={cn(
          "h-full min-w-0 flex-1 bg-transparent text-(--color-text-primary) outline-none placeholder:text-(--color-text-tertiary)",
          isHero ? "text-base" : "px-2 text-sm font-medium",
        )}
        aria-label="검색어"
        placeholder="예: 스파이더맨"
        value={searchText}
        onChange={(event) => setSearchText(event.target.value)}
      />
      {!isHero && searchText && (
        <button
          type="button"
          className="flex size-8 shrink-0 items-center justify-center rounded-md opacity-60 hover:bg-(--color-bg-page) hover:opacity-100"
          aria-label="검색어 지우기"
          onClick={handleClear}
        >
          <img className="size-6" src="/icons/movie-icons/close.svg" alt="" />
        </button>
      )}
      <button
        type="submit"
        className={cn(
          "shrink-0 rounded-md bg-(--color-text-primary) font-bold text-(--color-bg-surface) hover:opacity-85",
          isHero ? "h-11 px-4.5 text-sm" : "h-10 px-4 text-sm",
        )}
      >
        {isHero ? "검색" : "다시 검색"}
      </button>
    </form>
  );
}
