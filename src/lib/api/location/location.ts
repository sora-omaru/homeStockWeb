import {
  LocationCreateRequestDto,
  LocationResponseDto,
} from "@/types/location/location";
import { apiClient } from "../client";

export async function getLocations(): Promise<LocationResponseDto[]> {
  return apiClient<LocationResponseDto[]>("/api/v1/locations");
}

export async function createLocation(
  request: LocationCreateRequestDto,
): Promise<LocationResponseDto> {
  return apiClient<LocationResponseDto>("/api/v1/locations", {
    method: "POST",
    body: request,
  });
}
