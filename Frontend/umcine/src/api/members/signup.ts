import type { ApiResponse } from "../api-response";
import { serverClient } from "../server-client";
import type { MemberResponse, SignupRequest } from "./models";

function signup(body: SignupRequest) {
  return serverClient
    .post("members", { json: body })
    .json<ApiResponse<MemberResponse>>();
}

export { signup };
