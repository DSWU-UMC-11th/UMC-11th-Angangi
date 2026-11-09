import { queryClient } from "../../api/query-client";
import { useAuthStore } from "../../stores/auth-store";

// 로그인한 회원에 따라 결과가 달라지는 query key예요.
// 토큰만 지우고 캐시를 남기면 다음에 로그인한 회원에게 이전 회원의 정보가 잠깐 보일 수 있어요.
// (member-queries를 import하면 auth-client와 순환 참조가 생겨서 key를 직접 적어요)
const MEMBER_SCOPED_QUERY_KEYS = [["members", "me"]];

export function clearSession() {
  useAuthStore.getState().setAccessToken(null);
  MEMBER_SCOPED_QUERY_KEYS.forEach((queryKey) => {
    queryClient.removeQueries({ queryKey });
  });
}
