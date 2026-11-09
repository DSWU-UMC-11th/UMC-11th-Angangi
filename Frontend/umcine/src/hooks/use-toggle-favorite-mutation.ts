import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addFavorite } from "../api/favorites/add-favorite";
import { favoriteQueries } from "../api/favorites/favorite-queries";
import type { FavoriteStatus } from "../api/favorites/models";
import { removeFavorite } from "../api/favorites/remove-favorite";
import { getApiFailure } from "../api/api-response";

interface ToggleFavoriteVariables {
  movieId: number;
  // 누르기 전 상태
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
      // 여부는 성공 시점에 알 수 있어 바로 바꾸고, 목록은 서버가 정한 순서로 다시 조회해요
      queryClient.setQueryData<FavoriteStatus>(
        favoriteQueries.status(movieId).queryKey,
        { isFavorite: !isFavorite },
      );
      queryClient.invalidateQueries({
        queryKey: favoriteQueries.list().queryKey,
      });
    },
    onError: (error) => {
      // 다른 탭에서 이미 바꿨다면 409/404가 와요. 서버 상태로 다시 맞춰요
      queryClient.invalidateQueries({ queryKey: favoriteQueries.all() });
      alert(
        getApiFailure(error)?.message ??
          "즐겨찾기를 바꾸지 못했어요. 다시 시도해 주세요.",
      );
    },
  });
}
