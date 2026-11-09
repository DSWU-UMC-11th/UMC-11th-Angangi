import { useQuery } from "@tanstack/react-query";
import { favoriteQueries } from "../api/favorites/favorite-queries";
import { useAuthStore } from "../stores/auth-store";

const EMPTY_IDS = new Set<number>();

export function useFavoriteMovieIds() {
  const accessToken = useAuthStore((state) => state.accessToken);
  const favoritesQuery = useQuery({
    ...favoriteQueries.list(),
    enabled: Boolean(accessToken),
    select: (favorites) => new Set(favorites.map((favorite) => favorite.movieId)),
  });

  return favoritesQuery.data ?? EMPTY_IDS;
}
