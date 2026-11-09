import { isHTTPError } from "ky";

// 서버의 공통 응답 형식 (6주차 서버 워크북의 ApiResponse)
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

// ky v2는 실패 응답 본문을 error.data에 미리 읽어 둬요
function getApiFailure(error: unknown): ApiFailure | null {
  if (isHTTPError(error) && isApiFailure(error.data)) return error.data;
  return null;
}

export { getApiFailure };
export type { ApiFailure, ApiResponse };
