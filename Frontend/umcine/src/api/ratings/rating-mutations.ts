import { mutationOptions, type QueryClient } from "@tanstack/react-query";
import { createRating } from "./create-rating";
import { deleteRating } from "./delete-rating";
import type { MemberRating, RatingContent } from "./models";
import { ratingQueries } from "./rating-queries";
import { updateRating } from "./update-rating";

interface SaveRatingVariables extends RatingContent {
  ratingId: number | null;
}

function updateRatingCache(
  client: QueryClient,
  memberId: number,
  movieId: number,
  rating: MemberRating | null,
) {
  client.setQueryData(
    ratingQueries.memberMovie(memberId, movieId).queryKey,
    rating,
  );
  client.invalidateQueries({ queryKey: ratingQueries.memberPages(memberId) });
}

function resyncRatingCache(client: QueryClient, memberId: number) {
  client.invalidateQueries({ queryKey: ratingQueries.member(memberId) });
}

export const ratingMutations = {
  save: (memberId: number, movieId: number) =>
    mutationOptions({
      mutationKey: ["ratings", "save", movieId],
      mutationFn: ({ ratingId, score, comment }: SaveRatingVariables) =>
        ratingId === null
          ? createRating({ movieId, score, comment })
          : updateRating(ratingId, { score, comment }),
      onSuccess: (response, _variables, _onMutateResult, { client }) => {
        updateRatingCache(client, memberId, movieId, response.result);
      },
      onError: (_error, _variables, _onMutateResult, { client }) => {
        resyncRatingCache(client, memberId);
      },
    }),

  remove: (memberId: number, movieId: number) =>
    mutationOptions({
      mutationKey: ["ratings", "remove", movieId],
      mutationFn: deleteRating,
      onSuccess: (_response, _variables, _onMutateResult, { client }) => {
        updateRatingCache(client, memberId, movieId, null);
      },
      onError: (_error, _variables, _onMutateResult, { client }) => {
        resyncRatingCache(client, memberId);
      },
    }),
};
