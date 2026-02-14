// src/api/users.ts
import { apiFetch } from "./client";
import type { MeResponse } from "./auth";

export type UpdateProfileRequest = {
  displayName: string;
  email: string;
};

export type UpdatePasswordRequest = {
  currentPassword: string;
  newPassword: string;
  newPasswordConfirm: string;
};

/**
 * アカウント設定の「更新」ボタン用。
 * 表示名 + メールを同時更新して、方針（原子性）を満たす。
 */
export const updateProfileApi = async (body: UpdateProfileRequest): Promise<MeResponse> => {
  return await apiFetch<MeResponse>("/api/users/me", {
    method: "PUT",
    requireAuth: true,
    body: JSON.stringify(body),
  });
};

// password変更は「返却なし」に合わせる（204想定）
export const updatePasswordApi = async (body: UpdatePasswordRequest): Promise<void> => {
  await apiFetch<void>("/api/users/me/password", {
    method: "PUT",
    requireAuth: true,
    body: JSON.stringify(body),
  });
};

export const deleteMeApi = async (): Promise<void> => {
  await apiFetch<void>("/api/users/me", {
    method: "DELETE",
    requireAuth: true,
  });
};
