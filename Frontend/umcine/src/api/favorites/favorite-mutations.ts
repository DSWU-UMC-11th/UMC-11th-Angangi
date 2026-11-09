import { mutationOptions } from "@tanstack/react-query";
import { addFavorite } from "./add-favorite";
import { favoriteQueries } from "./favorite-queries";
import type { FavoriteStatus } from "./models";
import { removeFavorite } from "./remove-favorite";

interface ToggleFavoriteVariables {
  movieId: number;
  isFavorite: boolean;
}

export const favoriteMutations = {
  toggle: () =>
    mutationOptions({
      mutationKey: ["favorites", "toggle"],
      mutationFn: async ({ movieId, isFavorite }: ToggleFavoriteVariables) => {
        if (isFavorite) {
          await removeFavorite(movieId);
        } else {
          await addFavorite(movieId);
        }
      },
      onSuccess: (_data, { movieId, isFavorite }, _onMutateResult, { client }) => {
        client.setQueryData<FavoriteStatus>(
          favoriteQueries.status(movieId).queryKey,
          { isFavorite: !isFavorite },
        );
        client.invalidateQueries({ queryKey: favoriteQueries.list().queryKey });
      },
      onError: (_error, _variables, _onMutateResult, { client }) => {
        client.invalidateQueries({ queryKey: favoriteQueries.all() });
      },
    }),
};

export type { ToggleFavoriteVariables };
