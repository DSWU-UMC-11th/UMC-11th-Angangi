import { useQuery } from "@tanstack/react-query";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { movieQueries } from "../../api/movies/movie-queries";
import type { TmdbMovieListItem } from "../../api/movies/models";
import MovieGrid from "../../components/movie-grid";
import Pagination from "../../components/pagination";
import RetryMessage from "../../components/retry-message";
import {
  useViewSettingsStore,
  type MovieSortOrder,
} from "../../stores/view-settings-store";
import { toMovieCardItem } from "../../utils/movies/to-movie-card-item";

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
  const { page = 1 } = useSearch({ from: "/" });
  const navigate = useNavigate({ from: "/" });
  // 페이지네이션 범위를 넘는 번호는 마지막 페이지로 보여줘요
  const currentPage = Math.min(page, TOTAL_PAGES);
  const sortOrder = useViewSettingsStore((state) => state.sortOrder);
  const setSortOrder = useViewSettingsStore((state) => state.setSortOrder);

  const moviesQuery = useQuery(movieQueries.list(currentPage));

  const movies = moviesQuery.data?.results ?? [];

  function handlePageChange(nextPage: number) {
    navigate({ search: nextPage === 1 ? {} : { page: nextPage } });
  }

  function renderContent() {
    if (moviesQuery.isPending) {
      return (
        <p className="py-20 text-center text-(--color-text-secondary)">
          영화 목록을 불러오는 중이에요.
        </p>
      );
    }
    if (moviesQuery.isError) {
      return (
        <RetryMessage
          message="영화 목록을 불러오지 못했어요."
          onRetry={() => moviesQuery.refetch()}
        />
      );
    }
    // 빈 결과와 성공 상태는 MovieGrid에서 구분해요
    // 정렬은 원본 날짜("2026-07-29")로 한 뒤 카드 UI 타입으로 바꿔요
    return (
      <MovieGrid movies={sortMovies(movies, sortOrder).map(toMovieCardItem)} />
    );
  }

  return (
    <main className="page-container flex-1 pt-8 pb-20">
      <div className="mb-6 flex items-center justify-between gap-4">
        <h1 className="text-[28px] font-extrabold tracking-[-0.02em] min-[481px]:text-4xl">
          영화 목록
        </h1>
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
        onPageChange={handlePageChange}
      />
    </main>
  );
}
