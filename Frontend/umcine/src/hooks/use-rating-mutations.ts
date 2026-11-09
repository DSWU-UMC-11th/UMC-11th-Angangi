import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getApiFailure } from "../api/api-response";
import { createRating } from "../api/ratings/create-rating";
import { deleteRating } from "../api/ratings/delete-rating";
import type { MemberRating, RatingContent } from "../api/ratings/models";
import { ratingQueries } from "../api/ratings/rating-queries";
import { updateRating } from "../api/ratings/update-rating";

interface SaveRatingVariables extends RatingContent {
  ratingId: number | null;
}

function useRatingCache(memberId: number, movieId: number) {
  const queryClient = useQueryClient();
  const movieKey = ratingQueries.memberMovie(memberId, movieId).queryKey;

  return {
    update: (rating: MemberRating | null) => {
      queryClient.setQueryData(movieKey, rating);
      queryClient.invalidateQueries({
        queryKey: ratingQueries.memberPages(memberId),
      });
    },
    resync: () => {
      queryClient.invalidateQueries({
        queryKey: ratingQueries.member(memberId),
      });
    },
  };
}

function alertFailure(error: unknown, fallback: string) {
  alert(getApiFailure(error)?.message ?? fallback);
}

export function useSaveRatingMutation(memberId: number, movieId: number) {
  const cache = useRatingCache(memberId, movieId);

  return useMutation({
    mutationFn: ({ ratingId, score, comment }: SaveRatingVariables) =>
      ratingId === null
        ? createRating({ movieId, score, comment })
        : updateRating(ratingId, { score, comment }),
    onSuccess: (response) => {
      cache.update(response.result);
      alert(response.message);
    },
    onError: (error) => {
      cache.resync();
      alertFailure(error, "평점을 저장하지 못했어요. 다시 시도해 주세요.");
    },
  });
}

export function useDeleteRatingMutation(memberId: number, movieId: number) {
  const cache = useRatingCache(memberId, movieId);

  return useMutation({
    mutationFn: deleteRating,
    onSuccess: (response) => {
      cache.update(null);
      alert(response.message);
    },
    onError: (error) => {
      cache.resync();
      alertFailure(error, "평점을 삭제하지 못했어요. 다시 시도해 주세요.");
    },
  });
}
