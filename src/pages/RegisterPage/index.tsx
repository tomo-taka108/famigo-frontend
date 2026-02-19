// src/pages/RegisterPage/index.tsx
import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ApiError } from "../../types";
import { useAuth } from "../../auth/AuthContext";

type FieldErrors = Partial<{
  displayName: string;
  email: string;
  password: string;
  passwordConfirm: string;
  form: string;
}>;

function mapRegisterErrorToFieldErrors(e: unknown): FieldErrors {
  // 既知英語メッセージ → 日本語化
  const mapEnglish = (msg: string) => {
    if (/email is already registered/i.test(msg)) {
      return "そのメールアドレスは既に登録されています。";
    }
    return msg;
  };

  if (e instanceof ApiError) {
    const msg = e.message ?? "";

    // CONFLICT（メール重複など）
    if (e.errorCode === "CONFLICT") {
      return { email: mapEnglish(msg) };
    }

    // VALIDATION_ERROR の場合：backend の fieldErrors が来る想定（最優先）
    if (e.errorCode === "VALIDATION_ERROR") {
      const result: FieldErrors = {};
      if (Array.isArray(e.fieldErrors) && e.fieldErrors.length > 0) {
        for (const fe of e.fieldErrors) {
          if (!fe) continue;
          if (fe.field === "displayName") result.displayName = fe.message;
          if (fe.field === "email") result.email = fe.message;
          if (fe.field === "password") result.password = fe.message;
          if (fe.field === "passwordConfirm") result.passwordConfirm = fe.message;
        }
      } else {
        // 旧形式：message 文字列に field 情報が含まれる場合（保険）
        // 例）"Validation failed: email: ...; password: ..."
        const raw = msg.replace(/^Validation failed:\s*/i, "");
        const parts = raw
          .split(";")
          .map((s) => s.trim())
          .filter(Boolean);
        for (const p of parts) {
          const [k, ...rest] = p.split(":");
          const key = (k ?? "").trim();
          const val = rest.join(":").trim();
          if (!val) continue;
          if (key === "email") result.email = val;
          if (key === "password") result.password = val;
          if (key === "passwordConfirm") result.passwordConfirm = val;
          if (key === "displayName") result.displayName = val;
        }
      }

      // 分解できなければフォーム全体へ
      if (!result.email && !result.password && !result.passwordConfirm && !result.displayName) {
        result.form = mapEnglish(msg) || "入力内容を確認してください。";
      }
      return result;
    }

    return { form: mapEnglish(msg) || "登録に失敗しました。" };
  }

  if (e instanceof Error) {
    return { form: mapEnglish(e.message) || "登録に失敗しました。" };
  }

  return { form: "登録に失敗しました。" };
}

export default function RegisterPage() {
  const navigate = useNavigate();
  const auth = useAuth();

  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});

  const hasAnyError = useMemo(() => Object.values(errors).some(Boolean), [errors]);

  const validateClient = (): FieldErrors => {
    const e: FieldErrors = {};
    const dn = displayName.trim();
    const em = email.trim();

    // 表示名
    if (!dn) e.displayName = "表示名（ユーザー名）を入力してください";
    else if (dn.length < 3) e.displayName = "表示名（ユーザー名）は3文字以上で入力してください";

    // メール
    if (!em) {
      e.email = "メールアドレスを入力してください";
    } else {
      // backend の @Email と同等レベルのチェック（厳密に同じである必要はないが、ユーザー体験を揃える）
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(em)) e.email = "有効なメールアドレスを入力してください";
      else if (em.length > 255) e.email = "メールアドレスは255文字以内で入力してください";
    }

    // パスワード
    if (!password.trim()) e.password = "パスワードを入力してください";
    else if (password.length < 6) e.password = "パスワードは6文字以上で入力してください";

    // パスワード確認
    if (!passwordConfirm.trim()) e.passwordConfirm = "パスワード確認を入力してください";
    else if (password && passwordConfirm && password !== passwordConfirm) {
      e.passwordConfirm = "パスワードが一致しません";
    }

    return e;
  };

  const onSubmit = async () => {
    const clientErrors = validateClient();
    setErrors(clientErrors);
    if (Object.values(clientErrors).some(Boolean)) return;

    setSubmitting(true);
    setErrors({});

    try {
      // ✅ backend は displayName/email/password/passwordConfirm
      await auth.register({
        displayName: displayName.trim(),
        email: email.trim(),
        password,
        passwordConfirm,
      });

      navigate("/", { replace: true });
    } catch (e: unknown) {
      setErrors(mapRegisterErrorToFieldErrors(e));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-120px)] flex items-start justify-center px-4 py-10">
      <div className="w-full max-w-130 rounded-2xl bg-white shadow-md border border-slate-100 p-8">
        <h1 className="text-2xl font-bold text-center text-slate-900">ユーザー登録</h1>
        <p className="mt-3 text-center text-sm text-slate-600">
          新しいアカウントを作成します
          <br />
          登録すると、お気に入り・レビュー投稿／編集／削除が使えます
        </p>

        <div className="mt-6 text-center space-y-2">
          <Link to="/" className="block text-sm font-semibold text-emerald-700 hover:underline">
            ← トップページに戻る
          </Link>
          <Link to="/login" className="block text-sm font-semibold text-blue-700 hover:underline">
            ← ログイン画面に戻る
          </Link>
        </div>

        {errors.form && (
          <div className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {errors.form}
          </div>
        )}

        <div className="mt-8 space-y-5">
          <div>
            <div className="text-sm font-semibold text-slate-700 mb-1">
              表示名（ユーザー名） *
            </div>
            <input
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              autoComplete="nickname"
              placeholder="表示名を入力"
            />
            {errors.displayName && (
              <div className="mt-1 text-xs text-red-600">{errors.displayName}</div>
            )}
          </div>

          <div>
            <div className="text-sm font-semibold text-slate-700 mb-1">メールアドレス *</div>
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
            <div className="text-sm font-semibold text-slate-700 mb-1">パスワード *</div>
            <input
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              placeholder="パスワードを入力（6文字以上）"
            />
            {errors.password && <div className="mt-1 text-xs text-red-600">{errors.password}</div>}
          </div>

          <div>
            <div className="text-sm font-semibold text-slate-700 mb-1">パスワード確認 *</div>
            <input
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              type="password"
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              autoComplete="new-password"
              placeholder="もう一度入力"
            />
            {errors.passwordConfirm && (
              <div className="mt-1 text-xs text-red-600">{errors.passwordConfirm}</div>
            )}
          </div>

          <button
            className={[
              "w-full rounded-xl px-4 py-3 text-white font-bold",
              submitting ? "bg-blue-300 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700",
            ].join(" ")}
            onClick={onSubmit}
            disabled={submitting}
          >
            {submitting ? "送信中..." : "アカウント作成"}
          </button>

          {hasAnyError && (
            <div className="text-xs text-slate-500 text-center">
              入力エラーを修正してください。
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
