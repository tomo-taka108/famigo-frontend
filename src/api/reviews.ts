import type { ReviewListItem } from "../types";

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
