// src/api/client.ts
import { ApiError, type ApiErrorResponse } from "../types";
import { getToken } from "../auth/storage";

// ✅ 他ファイルが `../api/client` から import している前提があるので再export
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

export async function apiFetch<T>(
  path: string,
  init?: RequestInit & {
    /** ✅ 新：こちらを使う（favorites / reviews / auth(me) がこれ） */
    requireAuth?: boolean;
    /** ✅ 旧互換：残しておく（既存が auth を使ってても動く） */
    auth?: boolean;
  }
): Promise<T> {
  const url = path.startsWith("http") ? path : `${BASE_URL}${path}`;

  const headers = new Headers(init?.headers);

  if (init?.body && !headers.has("content-type")) {
    headers.set("content-type", "application/json");
  }

  // ✅ requireAuth / auth が true なら Authorization を付与
  const needAuth = init?.requireAuth ?? init?.auth ?? false;
  if (needAuth) {
    const token = getToken();
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
  }

  const res = await fetch(url, { ...init, headers });

  if (!res.ok) {
    const err = await safeReadJson<ApiErrorResponse>(res);

    if (err?.errorCode) {
      throw new ApiError({
        status: res.status,
        errorCode: err.errorCode,
        message: err.message,
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
