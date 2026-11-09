import type { ApiResponse } from "../api-response";
import { authClient } from "../auth-client";
import type { FavoriteStatus } from "./models";

async function getFavoriteStatus(movieId: number) {
  const response = await authClient
    .get(`favorites/${movieId}`)
    .json<ApiResponse<FavoriteStatus>>();
  return response.result;
}

export { getFavoriteStatus };
