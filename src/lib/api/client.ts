import { env } from "process";

type ApiClientOptions = {
    method?: "GET" | "POST"|"PUT"|"DELETE";
    body?:unknown;
};

export async function apiClient(
  path: string,
  options: ApiClientOptions = {},
) {
  const response = await fetch(`${env.apiBaseUrl}${path}`, {
    method: options.method ?? "GET",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
return response.json();
}