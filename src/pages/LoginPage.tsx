// src/pages/LoginPage.tsx
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useMemo, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { ApiError } from "../types";

type LocationState = { from?: string };

type FieldErrors = Partial<{
  email: string;
  password: string;
  form: string;
}>;

/**
 * ✅ ログイン画面のエラーを日本語に寄せる
 */
function normalizeLoginErrorMessage(e: unknown): string {
  if (e instanceof ApiError) {
    const msg = e.message ?? "";

    // 認証失敗（メール/パスワード違い）を日本語化（要望：”間違っています”）
    if (/invalid email or password/i.test(msg)) {
      return "メールアドレスまたはパスワードが間違っています。";
    }

    // バリデーションはフォーム側に出す（項目別は別処理）
    if (e.errorCode === "VALIDATION_ERROR") {
      return "入力内容を確認してください。";
    }

    if (e.errorCode === "AUTHENTICATION_REQUIRED") {
      return "ログインが必要です。";
    }

    if (/invalid/i.test(msg)) {
      return "メールアドレスまたはパスワードが間違っています。";
    }

    return msg || "ログインに失敗しました。";
  }

  if (e instanceof Error) {
    const msg = e.message ?? "";
    if (/invalid email or password/i.test(msg)) {
      return "メールアドレスまたはパスワードが間違っています。";
    }
    return msg || "ログインに失敗しました。";
  }

  return "ログインに失敗しました。";
}

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const auth = useAuth();

  const from = (location.state as LocationState | null)?.from ?? "/spots";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});

  const hasAnyError = useMemo(() => Object.values(errors).some(Boolean), [errors]);

  const validateClient = (): FieldErrors => {
    const e: FieldErrors = {};
    if (!email.trim()) e.email = "メールアドレスを入力してください";
    if (!password.trim()) e.password = "パスワードを入力してください";
    return e;
  };

  const onSubmit = async () => {
    const clientErrors = validateClient();
    setErrors(clientErrors);
    if (Object.values(clientErrors).some(Boolean)) return;

    setSubmitting(true);
    setErrors({});

    try {
      await auth.login({ email: email.trim(), password });
      await auth.refreshMe();
      navigate(from, { replace: true });
    } catch (e: unknown) {
      setErrors({ form: normalizeLoginErrorMessage(e) });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-10">
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-6">
        <div className="text-center">
          {/* ✅ タイトル：ログイン → ユーザーログイン */}
          <div className="text-2xl font-extrabold text-slate-900">ユーザーログイン</div>
          <div className="mt-2 text-sm text-slate-600">ログインしてご利用ください</div>

          <div className="mt-2">
            <Link to="/" className="text-sm font-semibold text-emerald-700 hover:underline">
              ← トップページに戻る
            </Link>
          </div>
        </div>

        {hasAnyError && errors.form && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {errors.form}
          </div>
        )}

        <div className="mt-6 space-y-4">
          <div>
            <div className="text-sm font-semibold text-slate-700 mb-1">メールアドレス</div>
            <input
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              placeholder="メールアドレスを入力"
            />
            {errors.email && <div className="mt-1 text-xs text-red-600">{errors.email}</div>}
          </div>

          <div>
            <div className="text-sm font-semibold text-slate-700 mb-1">パスワード</div>
            <input
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              placeholder="パスワードを入力"
            />
            {errors.password && <div className="mt-1 text-xs text-red-600">{errors.password}</div>}
          </div>

          <button
            type="button"
            onClick={onSubmit}
            disabled={submitting}
            className="w-full rounded-xl bg-blue-600 text-white font-extrabold py-3 text-sm hover:bg-blue-700 disabled:opacity-60"
          >
            ログイン
          </button>

          {/* ✅ 誘導文追加（添付③） */}
          <div className="text-center text-sm text-slate-600 mt-2">
            アカウントをお持ちでない場合{" "}
            <Link to="/register" className="font-bold text-blue-600 hover:underline">
              新規登録はこちら
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
