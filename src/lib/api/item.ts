import {
  ItemCreateRequest,
  ItemResponse,
  UpdateItemQuantity,
  UpdateItemRequest,
} from "@/types/item";
import { apiClient } from "./client";

export async function getItems(): Promise<ItemResponse[]> {
  return apiClient<ItemResponse[]>("/api/v1/items");
}

export async function getItem(
  id: number,
  signal?: AbortSignal,
): Promise<ItemResponse> {
  return apiClient<ItemResponse>(`/api/v1/items/${id}`, { signal });
}

export async function updateItem(
  itemId: number,
  request: UpdateItemRequest,
): Promise<ItemResponse> {
  return apiClient<ItemResponse>(`/api/v1/items/${itemId}`, {
    method: "PUT",
    body: request,
  });
}

export async function createItem(
  request: ItemCreateRequest,
): Promise<ItemResponse> {
  return apiClient<ItemResponse>(`/api/v1/items`, {
    method: "POST",
    body: request,
  });
}

export async function deleteItem(itemId: number): Promise<void> {
  await apiClient(`/api/v1/items/${itemId}`, { method: "DELETE" });
}

export async function updateItemQuantity(
  itemId: number,
  request: UpdateItemQuantity,
): Promise<void> {
  return apiClient<void>(`/items/${itemId}/quantity`, {
    method: "PATCH",
    body: request,
  });
}
