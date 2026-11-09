import { getMemberRatings } from "./get-member-ratings";

const MAX_PAGE_SIZE = 50;

async function findMemberMovieRating(memberId: number, movieId: number) {
  let page = 0;
  let hasNext = true;

  while (hasNext) {
    const response = await getMemberRatings({
      memberId,
      page,
      size: MAX_PAGE_SIZE,
    });
    const rating = response.ratings.find((item) => item.movieId === movieId);
    if (rating) return rating;

    hasNext = response.hasNext;
    page += 1;
  }
  return null;
}

export { findMemberMovieRating };
