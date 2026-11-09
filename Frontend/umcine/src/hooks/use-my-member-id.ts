import { useAuthStore } from "../stores/auth-store";
import { getMemberId } from "../utils/auth/get-member-id";

export function useMyMemberId() {
  return useAuthStore((state) => getMemberId(state.accessToken));
}
