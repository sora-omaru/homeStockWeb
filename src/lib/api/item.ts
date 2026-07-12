import { ItemResponse } from "@/types/item";
import { apiClient } from "./client";

export async function getItem():Promise<ItemResponse[]>{
    return apiClient<ItemResponse[]>("/api/v1/items")
}