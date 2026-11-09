import type { ApiResponse } from "../api-response";
import { authClient } from "../auth-client";
import type { MemberInfo } from "./models";

// 서버 MemberUpdateRequest는 닉네임만 받아요
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
