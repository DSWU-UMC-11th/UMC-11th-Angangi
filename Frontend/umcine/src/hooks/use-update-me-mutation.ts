import { useMutation, useQueryClient } from "@tanstack/react-query";
import { memberQueries } from "../api/members/member-queries";
import type { MemberInfo } from "../api/members/models";
import { updateMe } from "../api/members/update-me";

export function useUpdateMeMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateMe,
    onSuccess: (response) => {
      // 응답 result가 GET /members/me와 같은 모양이라 다시 조회하지 않고 캐시에 바로 넣어요.
      // 헤더, 내 정보 화면처럼 이 key를 보는 곳이 모두 새 닉네임으로 바뀌어요.
      queryClient.setQueryData<MemberInfo>(
        memberQueries.me().queryKey,
        response.result,
      );
    },
  });
}
