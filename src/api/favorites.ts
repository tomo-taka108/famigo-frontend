const BASE_URL = "http://localhost:8080";

import type { Spot } from "../types";
import { mapBackendSpotToSpot, type BackendSpotDto } from "./spots";

// お気に入り一覧：GET /favorites
export const fetchFavorites = async (): Promise<Spot[]> => {
  const res = await fetch(`${BASE_URL}/favorites`);

  if (!res.ok) {
    throw new Error(`Failed to fetch favorites: ${res.status}`);
  }

  const data = (await res.json()) as BackendSpotDto[];
  return data.map(mapBackendSpotToSpot);
};

// お気に入り登録：POST /spots/{spotId}/favorites
export const addFavorite = async (spotId: number): Promise<void> => {
  const res = await fetch(`${BASE_URL}/spots/${spotId}/favorites`, {
    method: "POST",
  });

  if (!res.ok) {
    throw new Error(`Failed to add favorite: ${res.status}`);
  }
};

// お気に入り解除：DELETE /spots/{spotId}/favorites
export const removeFavorite = async (spotId: number): Promise<void> => {
  const res = await fetch(`${BASE_URL}/spots/${spotId}/favorites`, {
    method: "DELETE",
  });

  if (!res.ok) {
    throw new Error(`Failed to remove favorite: ${res.status}`);
  }
};
