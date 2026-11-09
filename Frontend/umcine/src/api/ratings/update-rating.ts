import type { ApiResponse } from "../api-response";
import { authClient } from "../auth-client";
import type { MemberRating, RatingContent } from "./models";

function updateRating(ratingId: number, body: RatingContent) {
  return authClient
    .patch(`ratings/${ratingId}`, { json: body })
    .json<ApiResponse<MemberRating>>();
}

export { updateRating };
