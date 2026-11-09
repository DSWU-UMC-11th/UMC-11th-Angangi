import { queryOptions } from "@tanstack/react-query";
import { getMe } from "./get-me";

const ME_STALE_TIME = 5 * 60 * 1000;

export const memberQueries = {
  me: () =>
    queryOptions({
      queryKey: ["members", "me"],
      queryFn: getMe,
      staleTime: ME_STALE_TIME,
      retry: false,
    }),
};
