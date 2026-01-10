// src/api/auth.ts
import { apiFetch } from "./client";

export type LoginRequest = {
  email: string;
  password: string;
};

export type RegisterRequest = {
  name: string;
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
  tokenType: string; // "Bearer"
  expiresIn: number;
  user: MeResponse;
};

export const registerApi = async (body: RegisterRequest): Promise<LoginResponse> => {
  return await apiFetch<LoginResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify(body),
  });
};

export const loginApi = async (body: LoginRequest): Promise<LoginResponse> => {
  return await apiFetch<LoginResponse>("/auth/login", {
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
