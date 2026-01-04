import { authStorage } from "../auth/storage";

export const BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080";

export type ErrorResponse = {
  errorCode: string;
  message: string;
};

export class ApiError extends Error {
  status: number;
  errorCode?: string;

  constructor(args: { status: number; message: string; errorCode?: string }) {
    super(args.message);
    this.name = "ApiError";
    this.status = args.status;
    this.errorCode = args.errorCode;
  }
}

type ApiFetchOptions = RequestInit & {
  // true の場合のみ、tokenが無いなら即401扱い（ページガード用）
  requireAuth?: boolean;
};

const tryParseError = async (res: Response): Promise<ErrorResponse | null> => {
  const contentType = res.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return null;

  try {
    const data = (await res.json()) as unknown;
    if (
      data &&
      typeof data === "object" &&
      "errorCode" in data &&
      "message" in data
    ) {
      const d = data as { errorCode?: unknown; message?: unknown };
      if (typeof d.errorCode === "string" && typeof d.message === "string") {
        return { errorCode: d.errorCode, message: d.message };
      }
    }
    return null;
  } catch {
    return null;
  }
};

export const apiFetch = async <T>(
  path: string,
  options: ApiFetchOptions = {}
): Promise<T> => {
  const token = authStorage.getToken();

  if (options.requireAuth && !token) {
    throw new ApiError({
      status: 401,
      errorCode: "AUTH_REQUIRED",
      message: "Authentication required: missing Bearer token.",
    });
  }

  const headers = new Headers(options.headers);

  // JSON送信時のデフォルト
  if (!headers.has("Content-Type") && options.body) {
    headers.set("Content-Type", "application/json");
  }

  // token がある時だけ Authorization を付ける（公開APIでも isFavorite が返せる）
  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const errJson = await tryParseError(res);
    if (errJson) {
      throw new ApiError({
        status: res.status,
        errorCode: errJson.errorCode,
        message: errJson.message,
      });
    }

    // JSONじゃない/読めない場合のフォールバック
    const text = await res.text().catch(() => "");
    throw new ApiError({
      status: res.status,
      message: text || `Request failed: ${res.status}`,
    });
  }

  // No Content
  if (res.status === 204) {
    return undefined as T;
  }

  return (await res.json()) as T;
};
