import type { ReviewCreateRequest, ReviewListItem } from "../types";

// ---------------------------------------------
// 共通の API ベースURL（spots.ts と合わせる）
// ---------------------------------------------
const BASE_URL = "http://localhost:8080";


// ---------------------------------------------
// レビュー一覧API：GET /spots/{spotId}/reviews
// ---------------------------------------------
export const fetchReviewsBySpotId = async (
  spotId: number
): Promise<ReviewListItem[]> => {
  const res = await fetch(`${BASE_URL}/spots/${spotId}/reviews`);

  if (!res.ok) {
    throw new Error(`Failed to fetch reviews: ${res.status}`);
  }

  const data: ReviewListItem[] = await res.json();
  return data;
};


// ---------------------------------------------
// レビュー投稿API：POST /spots/{spotId}/reviews
// ---------------------------------------------
export const createReview = async (
  spotId: number,
  body: ReviewCreateRequest
): Promise<void> => {
  const res = await fetch(`${BASE_URL}/spots/${spotId}/reviews`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    throw new Error(`Failed to create review: ${res.status}`);
  }
};
