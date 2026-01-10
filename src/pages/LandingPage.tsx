// src/pages/LoginPage.tsx
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useMemo, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { ApiError, type FieldErrorItem } from "../types";

type LocationState = { from?: string };

type FieldErrors = Partial<Record<"email" | "password", string[]>>;

const groupFieldErrors = (items: FieldErrorItem[] | undefined | null): FieldErrors => {
  const out: FieldErrors = {};
  if (!items) return out;

  for (const it of items) {
    const field = (it.field ?? "").trim();
    if (field !== "email" && field !== "password") continue;
    out[field] = [...(out[field] ?? []), it.message];
  }
  return out;
};

const ErrorList = ({ messages }: { messages?: string[] }) => {
  if (!messages || messages.length === 0) return null;
  return (
    <ul className="mt-2 space-y-1 text-sm text-rose-700">
      {messages.map((m, idx) => (
        <li key={idx} className="leading-relaxed">
          {m}
        </li>
      ))}
    </ul>
  );
};

export default function LoginPage() {
  const auth = useAuth();
  const nav = useNavigate();
  const loc = useLocation();

  const from = useMemo(() => {
    const state = loc.state as LocationState | null;
    return state?.from ?? "/spots";
  }, [loc.state]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const [globalError, setGlobalError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const onSubmit = async () => {
    setGlobalError(null);
    setFieldErrors({});
    setLoading(true);

    try {
      await auth.login(email, password);
      nav(from, { replace: true });
    } catch (e: unknown) {
      if (e instanceof ApiError) {
        // バリデーション（項目別に）
        if (e.errorCode === "VALIDATION_ERROR") {
          setFieldErrors(groupFieldErrors(e.fieldErrors));
          setGlobalError("入力内容を確認してください。");
        } else if (e.status === 401) {
          setGlobalError("メールアドレスまたはパスワードが正しくありません。");
        } else {
          setGlobalError(e.message || "ログインに失敗しました。");
        }
      } else {
        setGlobalError("ログインに失敗しました。");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-8 md:py-12">
      <div className="mx-auto max-w-xl">
        <div className="rounded-3xl border border-emerald-100 bg-white shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-emerald-50 bg-emerald-50/50">
            <h1 className="text-xl md:text-2xl font-extrabold tracking-tight text-slate-900">
              ログイン
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              ログインすると、お気に入りやレビュー投稿が使えます。
            </p>
          </div>

          <div className="px-6 py-6">
            {globalError ? (
              <div className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
                {globalError}
              </div>
            ) : null}

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-slate-700">
                  メールアドレス
                </label>
                <input
                  type="email"
                  className="mt-2 block w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-emerald-300"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="例）test@example.com"
                />
                <ErrorList messages={fieldErrors.email} />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700">
                  パスワード
                </label>
                <input
                  type="password"
                  className="mt-2 block w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-emerald-300"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="パスワードを入力"
                />
                <ErrorList messages={fieldErrors.password} />
              </div>

              <button
                type="button"
                onClick={onSubmit}
                disabled={loading}
                className="w-full rounded-2xl bg-emerald-600 px-6 py-3 text-sm font-extrabold text-white hover:bg-emerald-700 disabled:opacity-60"
              >
                {loading ? "ログイン中..." : "ログイン"}
              </button>

              <div className="text-center text-sm text-slate-600">
                アカウントをお持ちでないですか？{" "}
                <Link to="/register" className="font-bold text-emerald-700 hover:underline">
                  新規登録へ
                </Link>
              </div>

              <div className="text-center text-xs text-slate-500">
                <Link to="/" className="hover:underline">
                  トップへ戻る
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
