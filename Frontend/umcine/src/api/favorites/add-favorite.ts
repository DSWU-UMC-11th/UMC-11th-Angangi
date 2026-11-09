import type { ApiResponse } from "../api-response";
import { authClient } from "../auth-client";
import type { Favorite } from "./models";

function addFavorite(movieId: number) {
  return authClient
    .post("favorites", { json: { movieId } })
    .json<ApiResponse<Favorite>>();
}

export { addFavorite };
