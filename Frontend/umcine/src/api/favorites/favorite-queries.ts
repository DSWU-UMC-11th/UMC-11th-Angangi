import { queryOptions } from "@tanstack/react-query";
import { getFavoriteStatus } from "./get-favorite-status";
import { getFavorites } from "./get-favorites";

export const favoriteQueries = {
  all: () => ["favorites"] as const,

  list: () =>
    queryOptions({
      queryKey: [...favoriteQueries.all(), "list"],
      queryFn: getFavorites,
    }),

  status: (movieId: number) =>
    queryOptions({
      queryKey: [...favoriteQueries.all(), "status", movieId],
      queryFn: () => getFavoriteStatus(movieId),
    }),
};
