import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createRouter, RouterProvider } from "@tanstack/react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { isHTTPError } from "ky";
import { routeTree } from "./routeTree.gen";
import "./index.css";

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

const router = createRouter({ routeTree });
const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: ONE_MINUTE, retry: shouldRetry },
  },
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  </StrictMode>,
);
