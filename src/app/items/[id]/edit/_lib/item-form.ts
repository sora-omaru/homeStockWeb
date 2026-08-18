import type { ItemCategory } from "@/types/item-category";
import type { ItemResponse, StockType } from "@/types/item";

export type ItemFormValues = {
  name: string;
  quantity: number;
  minQuantity: number;
  stockType: StockType;
  stockPercentage: number;
  minPercentage: number;
  category: ItemCategory | "";
  locationId: number | null;
  expirationDate: string;
  memo: string;
};

export const initialItemFormValues: ItemFormValues = {
  name: "",
  quantity: 0,
  minQuantity: 0,
  stockType: "QUANTITY",
  stockPercentage: 100,
  minPercentage: 20,
  category: "",
  locationId: null,
  expirationDate: "",
  memo: "",
};

export function toItemFormValues(item: ItemResponse): ItemFormValues {
  return {
    name: item.name,
    quantity: item.quantity ?? 0,
    minQuantity: item.minQuantity ?? 0,
    stockType: item.stockType,
    stockPercentage: item.stockPercentage ?? 100,
    minPercentage: item.minPercentage ?? 20,
    category: item.category,
    locationId: item.locationId,
    expirationDate: item.expirationDate?.split("T")[0] ?? "",
    memo: item.memo ?? "",
  };
}

export function getStockStatus(current: number, minimum: number) {
  if (current === 0) return "none";
  if (current <= minimum) return "low";
  return "good";
}
