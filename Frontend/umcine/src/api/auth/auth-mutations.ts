import { mutationOptions } from "@tanstack/react-query";
import { useAuthStore } from "../../stores/auth-store";
import { memberQueries } from "../members/member-queries";
import { login } from "./login";

export const authMutations = {
  login: () =>
    mutationOptions({
      mutationKey: ["auth", "login"],
      mutationFn: login,
      onSuccess: (response, _variables, _onMutateResult, { client }) => {
        useAuthStore.getState().setAccessToken(response.result.accessToken);
        client.invalidateQueries({ queryKey: memberQueries.me().queryKey });
      },
    }),
};
