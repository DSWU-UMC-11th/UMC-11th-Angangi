import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useRef, useState, type SubmitEvent } from "react";
import { BookmarkButton } from "../../components/bookmark-button";
import { movies } from "../../data/movies";
import type { Movie } from "../../types/movie";
import { cn } from "../../utils/cn";

export function SearchPage() {
  const { query } = useSearch({ from: "/search" });
  const normalizedQuery = query?.trim().toLowerCase() ?? "";

  // 검색어가 없으면 가운데 정렬된 검색 시작 화면을 보여줘요
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

  const searchResults = movies.filter(
    (movie) =>
      movie.title.toLowerCase().includes(normalizedQuery) ||
      movie.originalTitle.toLowerCase().includes(normalizedQuery),
  );

  return (
    <main className="page-container flex-1 pt-8 pb-20">
      <h1 className="mb-5 text-[28px] font-extrabold tracking-[-0.02em] min-[481px]:text-4xl">
        영화 검색
      </h1>
      <SearchForm key={query} initialQuery={query ?? ""} variant="compact" />

      <section className="mt-6">
        <div className="flex items-center justify-between gap-4 border-b border-(--color-border-default) pb-4">
          <h2 className="text-lg font-bold">‘{query}’ 검색 결과</h2>
          <p className="shrink-0 text-xs text-(--color-text-tertiary)">
            영화 {searchResults.length}편
          </p>
        </div>
        {searchResults.length === 0 ? (
          <p className="py-20 text-center text-(--color-text-secondary)">
            검색 결과가 없어요.
          </p>
        ) : (
          <ul className="grid grid-cols-1 gap-x-10 min-[1025px]:grid-cols-2">
            {searchResults.map((movie) => (
              <SearchResultItem key={movie.id} movie={movie} />
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}

function SearchResultItem({ movie }: { movie: Movie }) {
  const detailLinkProps = {
    to: "/movies/$movieId",
    params: { movieId: String(movie.id) },
  } as const;

  return (
    <li className="flex gap-5 border-b border-(--color-border-default) py-5">
      <div className="relative w-24 shrink-0 min-[481px]:w-32.75">
        <Link {...detailLinkProps} tabIndex={-1} aria-hidden="true">
          <img
            className="aspect-131/197 w-full rounded-lg bg-(--color-border-default) object-cover"
            src={movie.posterPath}
            alt=""
          />
        </Link>
        <BookmarkButton
          className="absolute top-2 right-2"
          movieId={movie.id}
          movieTitle={movie.title}
        />
      </div>
      <div className="flex min-w-0 flex-col pt-1">
        <h3 className="text-lg/[1.4] font-bold">
          <Link className="hover:underline" {...detailLinkProps}>
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
          {...detailLinkProps}
        >
          상세 보기
          {/* 검은색 SVG를 mask로 사용해 글자색(파란색)으로 칠해요 */}
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
  const navigate = useNavigate({ from: "/search" });
  const [searchText, setSearchText] = useState(initialQuery);
  const inputRef = useRef<HTMLInputElement>(null);
  const isHero = variant === "hero";

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextQuery = searchText.trim();
    navigate({
      search: nextQuery ? { query: nextQuery } : {},
    });
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
