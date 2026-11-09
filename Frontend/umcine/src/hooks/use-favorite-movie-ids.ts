import { useQuery } from "@tanstack/react-query";
import { favoriteQueries } from "../api/favorites/favorite-queries";
import { useAuthStore } from "../stores/auth-store";

const EMPTY_IDS = new Set<number>();

// 카드마다 여부를 조회하지 않고 GET /favorites 한 번의 결과를 함께 써요
export function useFavoriteMovieIds() {
  const accessToken = useAuthStore((state) => state.accessToken);
  const favoritesQuery = useQuery({
    ...favoriteQueries.list(),
    enabled: Boolean(accessToken),
    select: (favorites) => new Set(favorites.map((favorite) => favorite.movieId)),
  });

  return favoritesQuery.data ?? EMPTY_IDS;
}
