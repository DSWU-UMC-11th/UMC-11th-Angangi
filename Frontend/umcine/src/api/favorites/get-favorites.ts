import type { ApiResponse } from "../api-response";
import { authClient } from "../auth-client";
import type { Favorite } from "./models";

async function getFavorites() {
  const response = await authClient
    .get("favorites")
    .json<ApiResponse<Favorite[]>>();
  return response.result;
}

export { getFavorites };
