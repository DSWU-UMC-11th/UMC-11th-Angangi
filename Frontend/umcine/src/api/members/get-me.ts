import type { ApiResponse } from "../api-response";
import { authClient } from "../auth-client";
import type { MemberInfo } from "./models";

// 토큰으로 누구인지 알아내는 API라 authClient로 보내요
async function getMe() {
  const response = await authClient
    .get("members/me")
    .json<ApiResponse<MemberInfo>>();
  return response.result;
}

export { getMe };
