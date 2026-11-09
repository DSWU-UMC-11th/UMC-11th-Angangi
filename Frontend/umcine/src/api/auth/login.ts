import type { ApiResponse } from "../api-response";
import { serverClient } from "../server-client";
import type { LoginRequest, LoginResponse } from "./models";

function login(body: LoginRequest) {
  return serverClient
    .post("auth/login", { json: body })
    .json<ApiResponse<LoginResponse>>();
}

export { login };
