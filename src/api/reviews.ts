// src/api/reviews.ts
import type { ReviewCreateRequest, ReviewListItem } from "../types";
import { apiFetch } from "./client";

// レビュー一覧API：GET /spots/{spotId}/reviews（公開）
export const fetchReviewsBySpotId = async (
  spotId: number
): Promise<ReviewListItem[]> => {
  return await apiFetch<ReviewListItem[]>(`/spots/${spotId}/reviews`);
};

// レビュー投稿：POST /spots/{spotId}/reviews（要ログイン）
export const createReview = async (
  spotId: number,
  body: ReviewCreateRequest
): Promise<void> => {
  await apiFetch<void>(`/spots/${spotId}/reviews`, {
    method: "POST",
    requireAuth: true,
    body: JSON.stringify(body),
  });
};

// レビュー更新：PUT /spots/{spotId}/reviews/{reviewId}（要ログイン）
export const updateReview = async (
  spotId: number,
  reviewId: number,
  body: ReviewCreateRequest
): Promise<void> => {
  await apiFetch<void>(`/spots/${spotId}/reviews/${reviewId}`, {
    method: "PUT",
    requireAuth: true,
    body: JSON.stringify(body),
  });
};

// レビュー削除：DELETE /spots/{spotId}/reviews/{reviewId}（要ログイン）
export const deleteReview = async (
  spotId: number,
  reviewId: number
): Promise<void> => {
  await apiFetch<void>(`/spots/${spotId}/reviews/${reviewId}`, {
    method: "DELETE",
    requireAuth: true,
  });
};
