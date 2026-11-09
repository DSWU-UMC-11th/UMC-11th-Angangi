import { keepPreviousData, queryOptions } from "@tanstack/react-query";
import { findMemberMovieRating } from "./find-member-movie-rating";
import { getMemberRatings } from "./get-member-ratings";

export const ratingQueries = {
  member: (memberId: number) => ["ratings", "member", memberId] as const,

  memberPages: (memberId: number) =>
    [...ratingQueries.member(memberId), "page"] as const,

  memberPage: (memberId: number, page: number, size: number) =>
    queryOptions({
      queryKey: [...ratingQueries.memberPages(memberId), { page, size }],
      queryFn: () => getMemberRatings({ memberId, page, size }),
      placeholderData: keepPreviousData,
    }),

  memberMovie: (memberId: number, movieId: number) =>
    queryOptions({
      queryKey: [...ratingQueries.member(memberId), "movie", movieId],
      queryFn: () => findMemberMovieRating(memberId, movieId),
    }),
};
