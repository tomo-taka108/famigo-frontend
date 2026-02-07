// src/api/users.ts
import { apiFetch } from "./client";
import type { MeResponse } from "./auth";

export type UpdateDisplayNameRequest = {
  displayName: string;
};

export type UpdateEmailRequest = {
  email: string;
};

export type UpdateProfileRequest = {
  displayName: string;
  email: string;
};

export type UpdatePasswordRequest = {
  currentPassword: string;
  newPassword: string;
  newPasswordConfirm: string;
};

export const updateDisplayNameApi = async (
  body: UpdateDisplayNameRequest
): Promise<MeResponse> => {
  return await apiFetch<MeResponse>("/users/me/display-name", {
    method: "PUT",
    requireAuth: true,
    body: JSON.stringify(body),
  });
};

export const updateEmailApi = async (body: UpdateEmailRequest): Promise<MeResponse> => {
  return await apiFetch<MeResponse>("/users/me/email", {
    method: "PUT",
    requireAuth: true,
    body: JSON.stringify(body),
  });
};

/**
 * アカウント設定の「更新」ボタン用。
 * 表示名 + メールを同時更新して、方針（原子性）を満たす。
 */
export const updateProfileApi = async (body: UpdateProfileRequest): Promise<MeResponse> => {
  return await apiFetch<MeResponse>("/users/me/profile", {
    method: "PUT",
    requireAuth: true,
    body: JSON.stringify(body),
  });
};

// password変更は「返却なし」に合わせる（204想定）
export const updatePasswordApi = async (body: UpdatePasswordRequest): Promise<void> => {
  await apiFetch<void>("/users/me/password", {
    method: "PUT",
    requireAuth: true,
    body: JSON.stringify(body),
  });
};

export const deleteMeApi = async (): Promise<void> => {
  await apiFetch<void>("/users/me", {
    method: "DELETE",
    requireAuth: true,
  });
};
