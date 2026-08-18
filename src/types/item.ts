import { ItemCategory } from "./item-category";

export type StockType = "QUANTITY" | "PERCENTAGE";

export type ItemResponse = {
  id: number;
  name: string;
  quantity: number | null;
  minQuantity: number | null;
  stockType: StockType;
  stockPercentage: number | null;
  minPercentage: number | null;
  category: ItemCategory;
  locationId: number | null;
  locationName: string | null;
  expirationDate: string | null;
  memo: string | null;
};

export type UpdateItemRequest = {
  name: string;
  quantity: number | null;
  stockType: StockType;
  stockPercentage: number | null;
  minPercentage: number | null;
  minQuantity: number | null;
  category: ItemCategory;
  locationId: number | null;
  expirationDate: string | null;
  memo: string | null;
};

export type ItemCreateRequest = {
  name: string;
  quantity: number | null;
  minQuantity: number | null;
  stockType: StockType;
  stockPercentage: number | null;
  minPercentage: number | null;
  category: ItemCategory;
  locationId: number | null;
  expirationDate: string | null;
  memo: string | null;
};

export type UpdateItemQuantity = {
  quantity: number;
};
