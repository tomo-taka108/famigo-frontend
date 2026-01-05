// src/pages/LoginPage.tsx
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useMemo, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { ApiError } from "../types";

type LocationState = { from?: string };

/**
 * ログイン画面のエラーは「日本語のみ」＆「2行（メール→パスワード）」に正規化する
 */
function normalizeLoginErrorMessage(e: unknown): string[] {
  if (e instanceof ApiError) {
    const msg = e.message ?? "";

    // 認証失敗（メール/パスワード違い）を日本語化
    if (/invalid email or password/i.test(msg)) {
      return ["メールアドレスまたはパスワードが正しくありません。"];
    }

    // バリデーション
    if (e.errorCode === "VALIDATION_ERROR") {
      return parseValidationFailedMessage(msg);
    }

    if (e.errorCode === "AUTHENTICATION_REQUIRED") {
      return ["ログインが必要です。"];
    }

    // 英語っぽいのは日本語に寄せる（最低限）
    if (/invalid/i.test(msg)) {
      return ["メールアドレスまたはパスワードが正しくありません。"];
    }

    return [msg || "ログインに失敗しました。"];
  }

  if (e instanceof Error) {
    const msg = e.message ?? "";

    if (/invalid email or password/i.test(msg)) {
      return ["メールアドレスまたはパスワードが正しくありません。"];
    }

    if (/validation failed/i.test(msg)) {
      return parseValidationFailedMessage(msg);
    }

    return [msg || "ログインに失敗しました。"];
  }

  return ["ログインに失敗しました。"];
}

/**
 * 例（バックエンド）:
 * "Validation failed: password: 空白は許可されていません; email: 空白は許可されていません"
 * "Validation failed: password: 空白は許可されていません; email: 電子メールアドレスとして正しい形式にしてください"
 *
 * ✅ 2行固定：
 *  1行目: メールアドレス：...
 *  2行目: パスワード：...
 */
function parseValidationFailedMessage(raw: string): string[] {
  // "Validation failed:" を除去
  const msg = raw.replace(/^Validation failed:\s*/i, "").trim();

  const emailMsgs: string[] = [];
  const passwordMsgs: string[] = [];

  // ✅ 「,」と「;」の両方で分解（今回の原因は ; ）
  const parts = msg.split(/\s*[;,]\s*/);

  for (const p of parts) {
    // "email: xxx" / "password: xxx"
    const m = p.match(/^(email|password)\s*:\s*(.+)$/i);
    if (!m) continue;

    const field = m[1].toLowerCase();
    const detail = (m[2] ?? "").trim();

    if (!detail) continue;

    if (field === "email") emailMsgs.push(detail);
    if (field === "password") passwordMsgs.push(detail);
  }

  const emailLine =
    emailMsgs.length > 0 ? `メールアドレス：${emailMsgs.join(" / ")}` : null;

  const passwordLine =
    passwordMsgs.length > 0 ? `パスワード：${passwordMsgs.join(" / ")}` : null;

  // ✅ 表示順は必ず「メールアドレス → パスワード」
  const lines = [emailLine, passwordLine].filter((x): x is string => x !== null);

  // 何も拾えない場合は汎用（生文言は出さない）
  if (lines.length === 0) return ["入力内容を確認してください。"];

  return lines;
}

export default function LoginPage() {
  const auth = useAuth();
  const nav = useNavigate();
  const loc = useLocation();

  const from = useMemo(() => {
    const state = loc.state as LocationState | null;
    return state?.from ?? "/";
  }, [loc.state]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // ✅ 2行表示用
  const [errorLines, setErrorLines] = useState<string[]>([]);

  const onSubmit = async () => {
    setLoading(true);
    setErrorLines([]);

    try {
      await auth.login(email, password);
      nav(from);
    } catch (e: unknown) {
      setErrorLines(normalizeLoginErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-10">
      <div className="mx-auto max-w-3xl px-4">
        <div className="mb-4">
          <Link
            to="/"
            className="text-sm font-semibold text-slate-700 hover:underline"
          >
            ← トップページへ戻る
          </Link>
        </div>

        <div className="rounded-2xl border border-emerald-100 bg-white shadow-sm">
          <div className="px-6 py-5 border-b border-emerald-50">
            <h1 className="text-xl font-extrabold text-slate-900">ログイン</h1>
            <p className="text-sm text-slate-600 mt-1">
              ログインすると、お気に入り・レビュー投稿/編集/削除が使えます。
            </p>
          </div>

          <div className="px-6 py-6">
            {errorLines.length > 0 && (
              <div className="mb-4 text-sm text-red-600">
                {errorLines.map((line, idx) => (
                  <div key={idx}>{line}</div>
                ))}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <div className="text-sm font-semibold text-slate-700 mb-1">
                  メールアドレス
                </div>
                <input
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                />
              </div>

              <div>
                <div className="text-sm font-semibold text-slate-700 mb-1">
                  パスワード
                </div>
                <input
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                />
              </div>

              <button
                type="button"
                onClick={onSubmit}
                disabled={loading}
                className="w-full rounded-xl bg-emerald-600 px-4 py-3 text-sm font-extrabold text-white hover:bg-emerald-700 disabled:opacity-60"
              >
                {loading ? "ログイン中..." : "ログイン"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
