import { ItemCategory } from "./item-category";

export type ItemResponse = {
    id :number;
    name: string;
    quantity:number;
    minQuantity:number;
    category:ItemCategory;
    locationId:number | null;
    locationName:string | null;
    expirationDate:string|null;
    memo:string|null;
};