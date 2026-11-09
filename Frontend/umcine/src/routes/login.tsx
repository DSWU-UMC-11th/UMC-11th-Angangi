import { createFileRoute, redirect } from "@tanstack/react-router";
import { LoginPage } from "../pages/auth/login-page";
import { useAuthStore } from "../stores/auth-store";

export const Route = createFileRoute("/login")({
  // 화면을 그리기 전에 실행돼요. 이미 토큰이 있으면 로그인 폼 대신 홈으로 보내요.
  // 토큰이 아직 유효한지는 여기서 알 수 없고, 내 정보 API가 401로 알려줘요.
  beforeLoad: () => {
    if (useAuthStore.getState().accessToken) {
      throw redirect({ to: "/" });
    }
  },
  component: LoginPage,
});
