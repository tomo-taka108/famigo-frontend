// src/api/client.ts
import { ApiError, type ApiErrorResponse } from "../types";
import { getToken } from "../auth/storage";

// 他ファイルが `../api/client` から import している前提があるので再export
export { ApiError } from "../types";
export type { ApiErrorResponse } from "../types";

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080";

const isJsonResponse = (res: Response) => {
  const ct = res.headers.get("content-type") ?? "";
  return ct.includes("application/json");
};

const safeReadJson = async <T>(res: Response): Promise<T | null> => {
  if (res.status === 204 || res.status === 205) return null;

  const len = res.headers.get("content-length");
  if (len === "0") return null;

  if (!isJsonResponse(res)) return null;

  const txt = await res.text();
  if (txt.trim() === "") return null;

  return JSON.parse(txt) as T;
};

type ApiFetchOptions = {
  method?: string;
  headers?: Record<string, string>;
  body?: string;
  requireAuth?: boolean;

  // 既存互換（spots.ts で auth: true を使っているため）
  auth?: boolean;
};

export async function apiFetch<T>(
  path: string,
  options: ApiFetchOptions = {}
): Promise<T> {
  const url = `${BASE_URL}${path}`;

  const needsAuth = options.requireAuth ?? options.auth ?? false;
  const token = getToken();

  if (needsAuth && !token) {
    throw new ApiError({
      status: 401,
      errorCode: "AUTHENTICATION_REQUIRED",
      message: "Authentication required.",
    });
  }

  const headers: Record<string, string> = {
    "content-type": "application/json",
    ...(options.headers ?? {}),
  };

  if (token) {
    headers.authorization = `Bearer ${token}`;
  }

  const res = await fetch(url, {
    method: options.method ?? "GET",
    headers,
    body: options.body,
  });

  if (!res.ok) {
    const err = await safeReadJson<ApiErrorResponse>(res);

    if (err?.errorCode) {
      throw new ApiError({
        status: res.status,
        errorCode: err.errorCode,
        message: err.message,
        fieldErrors: err.fieldErrors,
      });
    }

    throw new ApiError({
      status: res.status,
      errorCode: "INTERNAL_ERROR",
      message: `Request failed: ${res.status}`,
    });
  }

  const data = await safeReadJson<T>(res);
  return data as T;
}
