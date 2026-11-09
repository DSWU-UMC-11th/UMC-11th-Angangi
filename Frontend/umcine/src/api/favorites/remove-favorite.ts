import type { ApiResponse } from "../api-response";
import { authClient } from "../auth-client";

function removeFavorite(movieId: number) {
  return authClient
    .delete(`favorites/${movieId}`)
    .json<ApiResponse<null>>();
}

export { removeFavorite };
