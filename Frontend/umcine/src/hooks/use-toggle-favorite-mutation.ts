import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addFavorite } from "../api/favorites/add-favorite";
import { favoriteQueries } from "../api/favorites/favorite-queries";
import type { FavoriteStatus } from "../api/favorites/models";
import { removeFavorite } from "../api/favorites/remove-favorite";
import { getApiFailure } from "../api/api-response";

interface ToggleFavoriteVariables {
  movieId: number;
  isFavorite: boolean;
}

export function useToggleFavoriteMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ movieId, isFavorite }: ToggleFavoriteVariables) => {
      if (isFavorite) {
        await removeFavorite(movieId);
      } else {
        await addFavorite(movieId);
      }
    },
    onSuccess: (_data, { movieId, isFavorite }) => {
      queryClient.setQueryData<FavoriteStatus>(
        favoriteQueries.status(movieId).queryKey,
        { isFavorite: !isFavorite },
      );
      queryClient.invalidateQueries({
        queryKey: favoriteQueries.list().queryKey,
      });
    },
    onError: (error) => {
      queryClient.invalidateQueries({ queryKey: favoriteQueries.all() });
      alert(
        getApiFailure(error)?.message ??
          "즐겨찾기를 바꾸지 못했어요. 다시 시도해 주세요.",
      );
    },
  });
}
