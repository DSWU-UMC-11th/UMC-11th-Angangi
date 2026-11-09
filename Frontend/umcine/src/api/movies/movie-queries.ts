import { queryOptions } from "@tanstack/react-query";
import { getMovieDetail } from "./get-movie-detail";
import { getMovies } from "./get-movies";
import { searchMovies } from "./search-movies";

const DETAIL_STALE_TIME = 30 * 1000;

export const movieQueries = {
  list:(page: number) =>
    queryOptions({
      queryKey: ["movies", "list", { page }],
      queryFn: () => getMovies({ page }),
    }),

  search: (query: string) =>
    queryOptions({
      queryKey: ["movies", "search", { query }],
      queryFn: () => searchMovies({ query }),
      enabled: query.length > 0,
    }),

  detail: (movieId: number) =>
    queryOptions({
      queryKey: ["movies", "detail", movieId],
      queryFn: () => getMovieDetail(movieId),
      staleTime: DETAIL_STALE_TIME,
    }),
};
