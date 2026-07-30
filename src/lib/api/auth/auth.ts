import { apiClient } from "@/lib/api/client";
import type {
  LoginRequest,
  UserAuthResponse,
  MeResponse,
  RegisterUserResponseDto,
} from "@/types/auth/auth";

export async function login(request: LoginRequest): Promise<UserAuthResponse> {
  return apiClient<UserAuthResponse>("/api/v1/auth/login", {
    method: "POST",
    body: request,
  });
}

export async function getMe(): Promise<MeResponse> {
  return apiClient<MeResponse>("/api/v1/auth/me");
}

export async function register(
  request: RegisterUserResponseDto,
): Promise<UserAuthResponse> {
  return apiClient<UserAuthResponse>("/api/v1/auth/register", {
    method: "POST",
    body: request,
  });
}
