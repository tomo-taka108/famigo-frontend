// src/api/client.ts
import { ApiError, type ApiErrorResponse } from "../types";
import { getToken } from "../auth/storage";

// ✅ 他ファイルが `../api/client` から import している前提があるので再export
export { ApiError } from "../types";
export type { ApiErrorResponse } from "../types";

/**
 * APIのベースURL
 *
 * - 本番（S3/CloudFront）はビルド時に .env.production の値が埋め込まれる前提
 * - ローカル開発（Vite dev）では未設定でも localhost:8080 を使えるようにする
 *
 * ※本番なのに未設定でビルドすると「公開後に通信先が localhost になって詰む」ので、
 *   import時点で落として気づけるようにする（Fail Fast）
 */
const resolveBaseUrl = (): string => {
  const raw = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? "";
  const trimmed = raw.trim();

  if (trimmed !== "") return trimmed.replace(/\/+$/, "");

  if (import.meta.env.DEV) return "http://localhost:8080";

  // PROD で未設定は事故なので即エラーにする
  throw new Error("VITE_API_BASE_URL is not set. Set it in .env.production before building.");
};

const BASE_URL = resolveBaseUrl();

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
  const normalizedPath = path.startsWith("http")
      ? path
      : path.startsWith("/")
          ? `${BASE_URL}${path}`
          : `${BASE_URL}/${path}`;

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

  const res = await fetch(normalizedPath, { ...init, headers });

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
