import type { ApiResponse } from "../api-response";
import { serverClient } from "../server-client";
import type { LoginRequest, LoginResponse } from "./models";

// 로그인은 토큰을 받으러 가는 요청이라 인증이 없는 serverClient로 보내요
function login(body: LoginRequest) {
  return serverClient
    .post("auth/login", { json: body })
    .json<ApiResponse<LoginResponse>>();
}

export { login };
