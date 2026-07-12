import { ItemResponse } from "@/types/item";
import { apiClient } from "./client";

export async function getItems():Promise<ItemResponse[]>{
    return apiClient<ItemResponse[]>("/api/v1/items")
}