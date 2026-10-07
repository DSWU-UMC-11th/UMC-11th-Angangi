import { useState } from "react";
import MovieGrid from "../../components/movie-grid";
import Pagination from "../../components/pagination";
import { movies } from "../../data/movies";

const TOTAL_PAGES = 5;

export function MovieListPage() {
  const [currentPage, setCurrentPage] = useState(1);

  return (
    <main className="page-container flex-1 pt-8 pb-20">
      <h1 className="mb-6 text-[28px] font-extrabold tracking-[-0.02em] min-[481px]:text-4xl">영화 목록</h1>
      <MovieGrid movies={movies} />
      <Pagination
        currentPage={currentPage}
        totalPages={TOTAL_PAGES}
        onPageChange={setCurrentPage}
      />
    </main>
  );
}
