// src/api/favorites.ts
import type { Spot } from "../types";
import { apiFetch } from "./client";

export const fetchFavorites = async (): Promise<Spot[]> => {
  return await apiFetch<Spot[]>("/api/favorites", {
    method: "GET",
    requireAuth: true,
  });
};

export const addFavorite = async (spotId: number): Promise<void> => {
  await apiFetch<void>(`/api/favorites/${spotId}`, {
    method: "POST",
    requireAuth: true,
  });
};

export const removeFavorite = async (spotId: number): Promise<void> => {
  await apiFetch<void>(`/api/favorites/${spotId}`, {
    method: "DELETE",
    requireAuth: true,
  });
};
