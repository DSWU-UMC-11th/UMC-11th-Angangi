import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { login } from "../api/auth/login";
import { memberQueries } from "../api/members/member-queries";
import { useAuthStore } from "../stores/auth-store";

function getSafeRedirect(redirect: string | undefined) {
  if (redirect && redirect.startsWith("/") && !redirect.startsWith("//")) {
    return redirect;
  }
  return "/";
}

export function useLoginMutation(redirect?: string) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const setAccessToken = useAuthStore((state) => state.setAccessToken);

  return useMutation({
    mutationFn: login,
    onSuccess: (response) => {
      setAccessToken(response.result.accessToken);
      queryClient.invalidateQueries({ queryKey: memberQueries.me().queryKey });
      alert(`${response.result.nickname}님, 로그인에 성공했어요.`);
      navigate({ href: getSafeRedirect(redirect), replace: true });
    },
  });
}
