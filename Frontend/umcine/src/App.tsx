import { useState } from "react";
import Footer from "./components/footer";
import Header from "./components/header";
import MovieGrid from "./components/movie-grid";
import Pagination from "./components/pagination";
import { movies } from "./data/movies";
// import "./App.css";

const TOTAL_PAGES = 5;

export default function App() {
  const [currentPage, setCurrentPage] = useState(1);

  return (
    <>
      <Header />
      <main className="main container">
        <h1 className="main__title">영화 목록</h1>
        <MovieGrid movies={movies} />
        <Pagination
          currentPage={currentPage}
          totalPages={TOTAL_PAGES}
          onPageChange={setCurrentPage}
        />
      </main>
      <Footer />
    </>
  );
}
