import { isHTTPError } from "ky";

interface ApiResponse<T> {
  isSuccess: boolean;
  code: string;
  message: string;
  result: T;
}

type ApiFailure = ApiResponse<null>;

function isApiFailure(data: unknown): data is ApiFailure {
  return (
    typeof data === "object" &&
    data !== null &&
    "isSuccess" in data &&
    data.isSuccess === false &&
    "code" in data &&
    typeof data.code === "string" &&
    "message" in data &&
    typeof data.message === "string"
  );
}

function getApiFailure(error: unknown): ApiFailure | null {
  if (isHTTPError(error) && isApiFailure(error.data)) return error.data;
  return null;
}

export { getApiFailure };
export type { ApiFailure, ApiResponse };
