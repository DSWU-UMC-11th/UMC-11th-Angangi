import { useAuthStore } from "../stores/auth-store";
import { clearSession } from "../utils/auth/clear-session";
import { serverClient } from "./server-client";

// serverClient의 baseUrl을 이어받고, 토큰이 필요한 요청에만 인증 처리를 더해요
export const authClient = serverClient.extend({
  hooks: {
    beforeRequest: [
      ({ request }) => {
        // 컴포넌트 밖이라 hook 대신 getState()로 요청 시점의 최신 토큰을 읽어요
        const { accessToken } = useAuthStore.getState();
        if (accessToken) {
          request.headers.set("Authorization", `Bearer ${accessToken}`);
        }
      },
    ],
    afterResponse: [
      ({ response }) => {
        // 토큰이 없거나 만료·변조되면(AUTH401_2~4) 서버가 401을 줘요.
        // 토큰과 함께 회원별 캐시도 지워요
        if (response.status === 401) {
          clearSession();
        }
      },
    ],
  },
});
