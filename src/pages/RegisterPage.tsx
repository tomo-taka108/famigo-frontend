// src/pages/RegisterPage.tsx
import { Link, useNavigate } from "react-router-dom";
import { useMemo, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { ApiError, type FieldErrorItem } from "../types";

type FieldErrors = Partial<Record<"name" | "email" | "password" | "passwordConfirm", string[]>>;

const groupFieldErrors = (items: FieldErrorItem[] | undefined | null): FieldErrors => {
  const out: FieldErrors = {};
  if (!items) return out;

  for (const it of items) {
    const f = (it.field ?? "").trim() as keyof FieldErrors;
    if (!f) continue;
    out[f] = [...(out[f] ?? []), it.message];
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

export default function RegisterPage() {
  const auth = useAuth();
  const nav = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");

  const [loading, setLoading] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const canSubmit = useMemo(() => {
    return !loading;
  }, [loading]);

  const onSubmit = async () => {
    setGlobalError(null);
    setFieldErrors({});
    setLoading(true);

    try {
      await auth.register({ name, email, password, passwordConfirm });
      nav("/spots", { replace: true });
    } catch (e: unknown) {
      if (e instanceof ApiError) {
        if (e.errorCode === "VALIDATION_ERROR") {
          setFieldErrors(groupFieldErrors(e.fieldErrors));
          setGlobalError("入力内容を確認してください。");
        } else if (e.errorCode === "CONFLICT") {
          setGlobalError("そのメールアドレスは既に登録されています。");
        } else {
          setGlobalError(e.message || "登録に失敗しました。");
        }
      } else {
        setGlobalError("登録に失敗しました。");
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
              新規登録
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              登録後は自動ログインして、そのままスポット一覧へ移動します。
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
                  表示名
                </label>
                <input
                  type="text"
                  className="mt-2 block w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-emerald-300"
                  placeholder="例）ゆうパパ"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                <ErrorList messages={fieldErrors.name} />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700">
                  メールアドレス
                </label>
                <input
                  type="email"
                  className="mt-2 block w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-emerald-300"
                  placeholder="例）test@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
                  placeholder="6文字以上"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <ErrorList messages={fieldErrors.password} />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700">
                  パスワード確認
                </label>
                <input
                  type="password"
                  className="mt-2 block w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-emerald-300"
                  placeholder="もう一度入力"
                  value={passwordConfirm}
                  onChange={(e) => setPasswordConfirm(e.target.value)}
                />
                <ErrorList messages={fieldErrors.passwordConfirm} />
              </div>

              <button
                type="button"
                onClick={onSubmit}
                disabled={!canSubmit}
                className="w-full rounded-2xl bg-emerald-600 px-6 py-3 text-sm font-extrabold text-white hover:bg-emerald-700 disabled:opacity-60"
              >
                {loading ? "登録中..." : "登録する"}
              </button>

              <div className="text-center text-sm text-slate-600">
                既にアカウントをお持ちですか？{" "}
                <Link to="/login" className="font-bold text-emerald-700 hover:underline">
                  ログインへ
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
