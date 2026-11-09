import { queryClient } from "../../api/query-client";
import { useAuthStore } from "../../stores/auth-store";

const MEMBER_SCOPED_QUERY_KEYS = [["members", "me"], ["favorites"]];

export function clearSession() {
  useAuthStore.getState().setAccessToken(null);
  MEMBER_SCOPED_QUERY_KEYS.forEach((queryKey) => {
    queryClient.removeQueries({ queryKey });
  });
}
