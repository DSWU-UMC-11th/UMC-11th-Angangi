import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { login } from "../api/auth/login";
import { memberQueries } from "../api/members/member-queries";
import { useAuthStore } from "../stores/auth-store";

export function useLoginMutation() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const setAccessToken = useAuthStore((state) => state.setAccessToken);

  return useMutation({
    mutationFn: login,
    onSuccess: (response) => {
      // 토큰을 먼저 저장해야 다시 조회하는 내 정보 요청에 새 토큰이 실려요
      setAccessToken(response.result.accessToken);
      // 이전에 로그인했던 회원의 정보가 캐시에 남아 있어도 staleTime을 기다리지 않고 다시 조회해요
      queryClient.invalidateQueries({ queryKey: memberQueries.me().queryKey });
      alert(`${response.result.nickname}님, 로그인에 성공했어요.`);
      navigate({ to: "/" });
    },
  });
}
