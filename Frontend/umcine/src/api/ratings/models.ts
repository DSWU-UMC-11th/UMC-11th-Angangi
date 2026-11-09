interface MemberRating {
  ratingId: number;
  movieId: number;
  score: number;
  comment: string | null;
  createdAt: string;
  updatedAt: string;
}

interface MemberRatingPage {
  ratings: MemberRating[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
}

interface RatingContent {
  score: number;
  comment: string | null;
}

interface CreateRatingRequest extends RatingContent {
  movieId: number;
}

export type {
  CreateRatingRequest,
  MemberRating,
  MemberRatingPage,
  RatingContent,
};
