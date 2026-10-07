import { useState } from "react";
import MovieGrid from "../../components/movie-grid";
import Pagination from "../../components/pagination";
import { movies } from "../../data/movies";
import {
  useViewSettingsStore,
  type MovieSortOrder,
} from "../../stores/view-settings-store";
import type { Movie } from "../../types/movie";

const TOTAL_PAGES = 5;

const SORT_OPTIONS: { value: MovieSortOrder; label: string }[] = [
  { value: "default", label: "기본순" },
  { value: "latest", label: "최신순" },
  { value: "title", label: "제목순" },
];

function sortMovies(list: Movie[], sortOrder: MovieSortOrder) {
  if (sortOrder === "latest") {
    // "2026.07.29" 형식이라 문자열 비교로 날짜 순서를 정할 수 있어요
    return list.toSorted((a, b) => b.releaseDate.localeCompare(a.releaseDate));
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
      <MovieGrid movies={sortMovies(movies, sortOrder)} />
      <Pagination
        currentPage={currentPage}
        totalPages={TOTAL_PAGES}
        onPageChange={setCurrentPage}
      />
    </main>
  );
}
