import { ApiError, ApiErrorResponse } from "./error/api-error";

type ApiClientOptions = {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: unknown;
  signal?: AbortSignal;
};

export async function apiClient<TResponse>(
  path: string,
  options: ApiClientOptions = {},
): Promise<TResponse> {
  const response = await fetch(path, {
    method: options.method ?? "GET",
    //同一オリジンのNext.jsプロキシへCookieを含めてリクエストする
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
    signal: options.signal,
  });

  if (!response.ok) {
    //バックエンドが想定しないエラーもキャッチできるよう変更
    let errorResponse: ApiErrorResponse;
    try {
      errorResponse = (await response.json()) as ApiErrorResponse;
    } catch {
      errorResponse = {
        code: "UNKNOWN_ERROR",
        message: "通信処理中にエラーが発生しました",
      };
    }

    // const errorResponse = (await response.json()) as ApiErrorResponse;

    throw new ApiError(
      response.status,
      errorResponse.code,
      errorResponse.message,
    );
  }
  if (response.status === 204) {
    return undefined as TResponse;
  }
  return response.json() as Promise<TResponse>;
}
