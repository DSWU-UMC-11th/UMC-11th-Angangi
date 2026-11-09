import { QueryClient } from "@tanstack/react-query";
import { isHTTPError } from "ky";

const ONE_MINUTE = 60 * 1000;
const MAX_RETRY_COUNT = 3;
const RETRYABLE_CLIENT_ERROR_STATUSES = [408, 429];

// 404처럼 다시 보내도 결과가 같은 4xx는 재시도하지 않아요
function shouldRetry(failureCount: number, error: unknown) {
  if (isHTTPError(error)) {
    const { status } = error.response;
    const isClientError = status >= 400 && status < 500;
    if (isClientError && !RETRYABLE_CLIENT_ERROR_STATUSES.includes(status)) {
      return false;
    }
  }
  return failureCount < MAX_RETRY_COUNT;
}

// 401 응답이나 로그아웃처럼 컴포넌트 밖에서도 캐시를 지워야 해서 모듈로 분리했어요
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: ONE_MINUTE, retry: shouldRetry },
  },
});
