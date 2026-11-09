import type { ApiResponse } from "../api-response";
import { authClient } from "../auth-client";

function deleteRating(ratingId: number) {
  return authClient
    .delete(`ratings/${ratingId}`)
    .json<ApiResponse<null>>();
}

export { deleteRating };
