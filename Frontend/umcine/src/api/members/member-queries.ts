import { queryOptions } from "@tanstack/react-query";
import { getMe } from "./get-me";

const ME_STALE_TIME = 5 * 60 * 1000;

// 헤더, 내 정보, 내 정보 수정이 같은 key를 써야 캐시 하나를 함께 봐요
export const memberQueries = {
  me: () =>
    queryOptions({
      queryKey: ["members", "me"],
      queryFn: getMe,
      // 내 정보는 자주 바뀌지 않아서 5분 동안 최신으로 취급해요
      staleTime: ME_STALE_TIME,
      // 401이면 토큰을 지우므로 같은 요청을 다시 보내지 않아요
      retry: false,
    }),
};
