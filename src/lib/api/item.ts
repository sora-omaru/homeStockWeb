import { apiClient } from "./client";

export async function getItem(){
    return apiClient("/api/v1/items")
}