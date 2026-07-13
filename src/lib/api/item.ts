import { ItemResponse } from "@/types/item";
import { apiClient } from "./client";

export async function getItems(): Promise<ItemResponse[]> {
  return apiClient<ItemResponse[]>("/api/v1/items");
}

export async function getItem(id: number): Promise<ItemResponse> {
  return apiClient<ItemResponse>(`/api/v1/items/${id}`);
}
