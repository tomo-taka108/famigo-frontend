// src/pages/LoginPage.tsx
import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { ApiError } from "../api/client";

function toUiMessage(e: unknown): string {
  if (e instanceof ApiError) {
    // ここは「errorCode見て日本語化」方針に合わせて拡張していける
    if (e.errorCode === "VALIDATION_ERROR") return "入力内容を確認してください。";
    if (e.errorCode === "AUTH_REQUIRED") return "ログインが必要です。";
    return e.message;
  }
  if (e instanceof Error) return e.message;
  return "ログインに失敗しました。";
}

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = useMemo(() => {
    const s = location.state as { from?: string } | null;
    return s?.from ?? "/";
  }, [location.state]);

  const [email, setEmail] = useState("demo@example.com");
  const [password, setPassword] = useState("demo1234");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (e2) {
      setErr(toUiMessage(e2));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md">
      <div className="bg-white rounded-2xl border border-emerald-100 shadow-sm p-6">
        <h1 className="text-xl font-extrabold tracking-tight text-slate-900">
          ログイン
        </h1>
        <p className="text-sm text-slate-500 mt-2">
          ログインすると、お気に入り・レビュー投稿/編集/削除が使えます。
        </p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-600">
              メールアドレス
            </label>
            <input
              className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-200"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600">
              パスワード
            </label>
            <input
              className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-200"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              autoComplete="current-password"
            />
          </div>

          {err && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {err}
            </div>
          )}

          <button
            disabled={loading}
            className="
              w-full inline-flex items-center justify-center
              rounded-xl bg-emerald-600 px-4 py-2.5
              text-sm font-semibold text-white
              shadow-sm transition hover:bg-emerald-700
              disabled:opacity-60
              focus:outline-none focus:ring-2 focus:ring-emerald-200
            "
          >
            {loading ? "ログイン中..." : "ログイン"}
          </button>
        </form>
      </div>
    </div>
  );
}
