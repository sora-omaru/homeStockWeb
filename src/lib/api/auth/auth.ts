import { apiClient } from "@/lib/api/client";
import type {
    LoginRequest,
    UserAuthResponse,
} from "@/types/auth/auth"

export async function login(request:LoginRequest):Promise<UserAuthResponse>{
 
 
    return apiClient<UserAuthResponse>("/api/v1/auth/login",{method:"POST",body:request})
}