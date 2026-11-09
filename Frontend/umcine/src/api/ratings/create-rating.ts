import type { ApiResponse } from "../api-response";
import { authClient } from "../auth-client";
import type { CreateRatingRequest, MemberRating } from "./models";

function createRating(body: CreateRatingRequest) {
  return authClient
    .post("ratings", { json: body })
    .json<ApiResponse<MemberRating>>();
}

export { createRating };
