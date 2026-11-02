import { useEffect, useState } from "react";
import { getMovies } from "../../api/movies/get-movies";
import type { TmdbMovieListItem } from "../../api/movies/models";
import MovieGrid from "../../components/movie-grid";
import Pagination from "../../components/pagination";
import {
  useViewSettingsStore,
  type MovieSortOrder,
} from "../../stores/view-settings-store";

const TOTAL_PAGES = 5;

const SORT_OPTIONS: { value: MovieSortOrder; label: string }[] = [
  { value: "default", label: "기본순" },
  { value: "latest", label: "최신순" },
  { value: "title", label: "제목순" },
];

function sortMovies(list: TmdbMovieListItem[], sortOrder: MovieSortOrder) {
  if (sortOrder === "latest") {
    // "2026-07-29" 형식이라 문자열 비교로 날짜 순서를 정할 수 있어요
    return list.toSorted((a, b) =>
      b.release_date.localeCompare(a.release_date),
    );
  }
  if (sortOrder === "title") {
    return list.toSorted((a, b) => a.title.localeCompare(b.title, "ko"));
  }
  return list;
}

export function MovieListPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const sortOrder = useViewSettingsStore((state) => state.sortOrder);
  const setSortOrder = useViewSettingsStore((state) => state.setSortOrder);

  const [movies, setMovies] = useState<TmdbMovieListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;
    async function loadMovies() {
      setIsLoading(true);
      setErrorMessage(null);

      try {
        const response = await getMovies({ page: currentPage });
        if (!ignore) setMovies(response.results);
      } catch {
        if (!ignore) setErrorMessage("영화 목록을 불러오지 못했어요.");
      } finally {
        if (!ignore) setIsLoading(false);
      }
    }

    loadMovies();

    return () => {
      ignore = true;
    };
  }, [currentPage]);

  function renderContent() {
    if (isLoading) {
      return (
        <p className="py-20 text-center text-(--color-text-secondary)">
          영화 목록을 불러오는 중이에요.
        </p>
      );
    }
    if (errorMessage) {
      return (
        <p className="py-20 text-center text-(--color-text-secondary)">
          {errorMessage}
        </p>
      );
    }
    // 빈 결과와 성공 상태는 MovieGrid에서 구분해요
    return <MovieGrid movies={sortMovies(movies, sortOrder)} />;
  }

  return (
    <main className="page-container flex-1 pt-8 pb-20">
      <div className="mb-6 flex items-center justify-between gap-4">
        <h1 className="text-[28px] font-extrabold tracking-[-0.02em] min-[481px]:text-4xl">영화 목록</h1>
        <select
          className="h-10 rounded-md border border-(--color-border-default) bg-(--color-bg-surface) px-3 text-sm font-medium text-(--color-text-primary)"
          aria-label="정렬 기준"
          value={sortOrder}
          onChange={(event) =>
            setSortOrder(event.target.value as MovieSortOrder)
          }
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      {renderContent()}
      <Pagination
        currentPage={currentPage}
        totalPages={TOTAL_PAGES}
        onPageChange={setCurrentPage}
      />
    </main>
  );
}
