// src/api/categories.ts
import type { Category } from "../types";
import { apiFetch } from "./client";

// カテゴリ一覧API：GET /categories
export const fetchCategories = async (): Promise<Category[]> => {
  return await apiFetch<Category[]>("/categories");
};
