import { isServer, QueryClient } from "@tanstack/react-query";
import { isHTTPError } from "ky";

const ONE_MINUTE = 60 * 1000;
const MAX_RETRY_COUNT = 3;
const RETRYABLE_CLIENT_ERROR_STATUSES = [408, 429];

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

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: ONE_MINUTE,
        retry: isServer ? false : shouldRetry,
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined;

export function getQueryClient() {
  if (isServer) return makeQueryClient();
  browserQueryClient ??= makeQueryClient();
  return browserQueryClient;
}
