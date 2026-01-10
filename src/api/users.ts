// src/api/users.ts
import { apiFetch } from "./client";
import type { MeResponse } from "./auth";

export type UpdateDisplayNameRequest = {
  displayName: string;
};

export type UpdateEmailRequest = {
  email: string;
};

export type ChangePasswordRequest = {
  currentPassword: string;
  newPassword: string;
  newPasswordConfirm: string;
};

export const updateMyDisplayNameApi = async (
  body: UpdateDisplayNameRequest
): Promise<MeResponse> => {
  return await apiFetch<MeResponse>("/users/me/display-name", {
    method: "PUT",
    body: JSON.stringify(body),
    requireAuth: true,
  });
};

export const updateMyEmailApi = async (body: UpdateEmailRequest): Promise<MeResponse> => {
  return await apiFetch<MeResponse>("/users/me/email", {
    method: "PUT",
    body: JSON.stringify(body),
    requireAuth: true,
  });
};

export const changeMyPasswordApi = async (body: ChangePasswordRequest): Promise<void> => {
  await apiFetch<void>("/users/me/password", {
    method: "PUT",
    body: JSON.stringify(body),
    requireAuth: true,
  });
};

export const withdrawMeApi = async (): Promise<void> => {
  await apiFetch<void>("/users/me", {
    method: "DELETE",
    requireAuth: true,
  });
};
