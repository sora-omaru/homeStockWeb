import { LocationResponseDto } from "@/types/location/location";
import { apiClient } from "../client";

export async function getLocations(): Promise<LocationResponseDto[]> {
  return apiClient<LocationResponseDto[]>("/api/v1/locations");
}
