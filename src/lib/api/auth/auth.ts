import { apiClient } from "@/lib/api/client";
import type {
    LoginRequest,
    UserAuthResponse,
} from "@/types/auth/auth"

export async function Login(request:LoginRequest):Promise<UserAuthResponse>{
    return apiClient<UserAuthResponse>("/api/v1/login")
}