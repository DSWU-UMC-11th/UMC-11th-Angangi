import { mutationOptions } from "@tanstack/react-query";
import { memberQueries } from "./member-queries";
import type { MemberInfo } from "./models";
import { signup } from "./signup";
import { updateMe } from "./update-me";

export const memberMutations = {
  signup: () =>
    mutationOptions({
      mutationKey: ["members", "signup"],
      mutationFn: signup,
    }),

  updateMe: () =>
    mutationOptions({
      mutationKey: ["members", "me", "update"],
      mutationFn: updateMe,
      onSuccess: (response, _variables, _onMutateResult, { client }) => {
        client.setQueryData<MemberInfo>(
          memberQueries.me().queryKey,
          response.result,
        );
      },
    }),
};
