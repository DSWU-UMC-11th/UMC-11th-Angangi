import type { ApiResponse } from "../api-response";
import { serverClient } from "../server-client";
import type { MemberResponse, SignupRequest } from "./models";

// passwordConfirm은 화면에서만 검사하므로 요청에 포함하지 않아요
function signup(body: SignupRequest) {
  return serverClient
    .post("members", { json: body })
    .json<ApiResponse<MemberResponse>>();
}

export { signup };
