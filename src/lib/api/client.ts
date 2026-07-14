import { env } from "@/lib/env";

type ApiClientOptions = {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: unknown;
  signal?: AbortSignal;
};

export async function apiClient<TResponse>(
  path: string,
  options: ApiClientOptions = {},
): Promise<TResponse> {
  const response = await fetch(`${env.apiBaseUrl}${path}`, {
    method: options.method ?? "GET",
    //これのおかげでaccess_token(CookieName)が自動で送られる
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
    signal: options.signal,
  });
  return response.json() as Promise<TResponse>;
}
