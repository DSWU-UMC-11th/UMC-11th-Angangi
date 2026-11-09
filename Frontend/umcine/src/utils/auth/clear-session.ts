import { queryClient } from "../../api/query-client";
import { useAuthStore } from "../../stores/auth-store";

// member-queries를 import하면 auth-client와 순환 참조가 생겨 key를 직접 적어요
const MEMBER_SCOPED_QUERY_KEYS = [["members", "me"], ["favorites"]];

export function clearSession() {
  useAuthStore.getState().setAccessToken(null);
  MEMBER_SCOPED_QUERY_KEYS.forEach((queryKey) => {
    queryClient.removeQueries({ queryKey });
  });
}
