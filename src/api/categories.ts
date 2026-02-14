// src/api/categories.ts
import type { Category } from "../types";
import { apiFetch } from "./client";

export const fetchCategories = async (): Promise<Category[]> => {
  return await apiFetch<Category[]>("/api/categories");
};
