// src/api/reviews.ts
import type { ReviewListItem, ReviewUpsertRequest } from "../types";
import { apiFetch } from "./client";

export const fetchReviewsBySpotId = async (
  spotId: number
): Promise<ReviewListItem[]> => {
  return await apiFetch<ReviewListItem[]>(`/api/spots/${spotId}/reviews`, {
    method: "GET",
  });
};

export const createReview = async (
  spotId: number,
  body: ReviewUpsertRequest
): Promise<void> => {
  await apiFetch<void>(`/api/spots/${spotId}/reviews`, {
    method: "POST",
    body: JSON.stringify(body),
    requireAuth: true,
  });
};

export const updateReview = async (
  spotId: number,
  reviewId: number,
  body: ReviewUpsertRequest
): Promise<void> => {
  await apiFetch<void>(`/api/spots/${spotId}/reviews/${reviewId}`, {
    method: "PUT",
    body: JSON.stringify(body),
    requireAuth: true,
  });
};

export const deleteReview = async (
  spotId: number,
  reviewId: number
): Promise<void> => {
  await apiFetch<void>(`/api/spots/${spotId}/reviews/${reviewId}`, {
    method: "DELETE",
    requireAuth: true,
  });
};
