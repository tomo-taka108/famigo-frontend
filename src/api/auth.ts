// src/api/auth.ts
import { apiFetch } from "./client";

export type LoginRequest = {
  email: string;
  password: string;
};

export type RegisterRequest = {
  // バックエンド RegisterRequest に合わせる
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
  return await apiFetch<LoginResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(body),
  });
};

// ✅ 追加：登録（register は LoginResponse を返す＝自動ログイン可）
export const registerApi = async (body: RegisterRequest): Promise<LoginResponse> => {
  return await apiFetch<LoginResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify(body),
  });
};

export const fetchMeApi = async (): Promise<MeResponse> => {
  return await apiFetch<MeResponse>("/auth/me", {
    method: "GET",
    requireAuth: true,
  });
};
