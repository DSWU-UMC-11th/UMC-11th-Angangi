import { useMutation, useQueryClient } from "@tanstack/react-query";
import { memberQueries } from "../api/members/member-queries";
import type { MemberInfo } from "../api/members/models";
import { updateMe } from "../api/members/update-me";

export function useUpdateMeMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateMe,
    onSuccess: (response) => {
      queryClient.setQueryData<MemberInfo>(
        memberQueries.me().queryKey,
        response.result,
      );
    },
  });
}
