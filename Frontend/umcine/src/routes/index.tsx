import { createFileRoute } from "@tanstack/react-router";
import { MovieListPage } from "../pages/movies/movie-list-page";

export const Route = createFileRoute("/")({
  // 양의 정수가 아닌 page는 버리고 1페이지로 보여줘요
  validateSearch: (search): { page?: number } => {
    const page = Number(search.page);
    return {
      page: Number.isInteger(page) && page > 1 ? page : undefined,
    };
  },
  component: MovieListPage,
});
