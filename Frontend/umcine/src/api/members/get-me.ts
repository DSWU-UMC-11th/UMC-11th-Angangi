import type { ApiResponse } from "../api-response";
import { authClient } from "../auth-client";
import type { MemberInfo } from "./models";

async function getMe() {
  const response = await authClient
    .get("members/me")
    .json<ApiResponse<MemberInfo>>();
  return response.result;
}

export { getMe };
