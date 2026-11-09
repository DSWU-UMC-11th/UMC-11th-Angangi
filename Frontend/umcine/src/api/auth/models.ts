interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  nickname: string;
  accessToken: string;
}

export type { LoginRequest, LoginResponse };
