import type { Category } from "../types";

// ---------------------------------------------
// 共通の API ベースURL
// ※ spots.ts と揃える
// ---------------------------------------------
const BASE_URL = "http://localhost:8080";

// ---------------------------------------------
// カテゴリ一覧API：GET /categories
// ---------------------------------------------
export const fetchCategories = async (): Promise<Category[]> => {
  const res = await fetch(`${BASE_URL}/categories`);

  if (!res.ok) {
    throw new Error(`Failed to fetch categories: ${res.status}`);
  }

  const data: Category[] = await res.json();
  return data;
};
