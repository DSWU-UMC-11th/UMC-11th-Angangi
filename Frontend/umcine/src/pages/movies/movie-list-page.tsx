import { useState } from "react";
import MovieGrid from "../../components/movie-grid";
import Pagination from "../../components/pagination";
import { movies as initialMovies } from "../../data/movies";

const TOTAL_PAGES = 5;

export function MovieListPage() {
  const [movies, setMovies] = useState(initialMovies);
  const [currentPage, setCurrentPage] = useState(1);

  function handleToggleBookmark(movieId: number) {
    setMovies((currentMovies) =>
      currentMovies.map((movie) =>
        movie.id === movieId
          ? { ...movie, isBookmarked: !movie.isBookmarked }
          : movie,
      ),
    );
  }

  return (
    <main className="page-container flex-1 pt-8 pb-20">
      <h1 className="mb-6 text-[28px] font-extrabold tracking-[-0.02em] min-[481px]:text-4xl">영화 목록</h1>
      <MovieGrid movies={movies} onToggleBookmark={handleToggleBookmark} />
      <Pagination
        currentPage={currentPage}
        totalPages={TOTAL_PAGES}
        onPageChange={setCurrentPage}
      />
    </main>
  );
}
