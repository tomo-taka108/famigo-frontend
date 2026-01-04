// src/api/favorites.ts
import type { Spot } from "../types";
import { apiFetch } from "./client";
import { mapBackendSpotToSpot, type BackendSpotDto } from "./spots";

// お気に入り一覧：GET /favorites（要ログイン）
export const fetchFavorites = async (): Promise<Spot[]> => {
  const data = await apiFetch<BackendSpotDto[]>("/favorites", {
    method: "GET",
    requireAuth: true,
  });
  return data.map(mapBackendSpotToSpot);
};

// お気に入り登録：POST /spots/{spotId}/favorites（要ログイン）
export const addFavorite = async (spotId: number): Promise<void> => {
  await apiFetch<void>(`/spots/${spotId}/favorites`, {
    method: "POST",
    requireAuth: true,
  });
};

// お気に入り解除：DELETE /spots/{spotId}/favorites（要ログイン）
export const removeFavorite = async (spotId: number): Promise<void> => {
  await apiFetch<void>(`/spots/${spotId}/favorites`, {
    method: "DELETE",
    requireAuth: true,
  });
};
