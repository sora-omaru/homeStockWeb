import type { ItemCategory } from "@/types/item-category";
import type { ItemResponse } from "@/types/item";

export type ItemFormValues = {
  name: string;
  quantity: number;
  minQuantity: number;
  category: ItemCategory | "";
  locationId: number | null;
  expirationDate: string;
  memo: string;
};

export const initialItemFormValues: ItemFormValues = {
  name: "",
  quantity: 0,
  minQuantity: 0,
  category: "",
  locationId: null,
  expirationDate: "",
  memo: "",
};

export function toItemFormValues(item: ItemResponse): ItemFormValues {
  return {
    name: item.name,
    quantity: item.quantity,
    minQuantity: item.minQuantity,
    category: item.category,
    locationId: item.locationId,
    expirationDate: item.expirationDate?.split("T")[0] ?? "",
    memo: item.memo ?? "",
  };
}

export function getStockStatus(quantity: number, minQuantity: number) {
  if (quantity === 0) return "none";
  if (quantity <= minQuantity) return "low";
  return "good";
}
