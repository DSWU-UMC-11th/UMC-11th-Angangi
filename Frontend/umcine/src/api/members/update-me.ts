import type { ApiResponse } from "../api-response";
import { authClient } from "../auth-client";
import type { MemberInfo } from "./models";

interface UpdateMeRequest {
  nickname: string;
}

function updateMe(body: UpdateMeRequest) {
  return authClient
    .patch("members/me", { json: body })
    .json<ApiResponse<MemberInfo>>();
}

export { updateMe };
export type { UpdateMeRequest };
