import { ItemCategory } from "./item-category";

export type ItemResponse = {
  id: number;
  name: string;
  quantity: number;
  minQuantity: number;
  category: ItemCategory;
  locationId: number | null;
  locationName: string | null;
  expirationDate: string | null;
  memo: string | null;
};

export type UpdateItemRequest = {
  name: string;
  quantity: number;
  minQuantity: number;
  category: ItemCategory;
  locationId: number | null;
  expirationDate: string | null;
  memo: string | null;
};

export type ItemCreateRequest = {
  name: string;
  quantity: number;
  minQuantity: number;
  category: ItemCategory;
  locationId: number | null;
  expirationDate: string | null;
  memo: string | null;
};
