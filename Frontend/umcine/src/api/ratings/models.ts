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

export type { MemberRating, MemberRatingPage };
