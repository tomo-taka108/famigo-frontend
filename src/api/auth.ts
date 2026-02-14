// src/api/auth.ts
import { apiFetch } from "./client";

export type LoginRequest = {
  email: string;
  password: string;
};

export type RegisterRequest = {
  displayName: string;
  email: string;
  password: string;
  passwordConfirm: string;
};

export type MeResponse = {
  id: number;
  name: string;
  email: string;
  role: "GUEST" | "USER" | "ADMIN" | string;
};

export type LoginResponse = {
  accessToken: string;
  user: MeResponse;
};

export const loginApi = async (body: LoginRequest): Promise<LoginResponse> => {
  return await apiFetch<LoginResponse>("/api/auth/token", {
    method: "POST",
    body: JSON.stringify(body),
  });
};

// ✅ 登録：POST /api/users（LoginResponse を返す＝自動ログイン）
export const registerApi = async (body: RegisterRequest): Promise<LoginResponse> => {
  return await apiFetch<LoginResponse>("/api/users", {
    method: "POST",
    body: JSON.stringify(body),
  });
};

export const fetchMeApi = async (): Promise<MeResponse> => {
  return await apiFetch<MeResponse>("/api/users/me", {
    method: "GET",
    requireAuth: true,
  });
};
