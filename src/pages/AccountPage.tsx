// src/pages/AccountPage.tsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { ApiError, type FieldErrorItem } from "../types";
import {
  changeMyPasswordApi,
  updateMyDisplayNameApi,
  updateMyEmailApi,
  withdrawMeApi,
} from "../api/users";

type FieldErrors = Partial<
  Record<
    | "displayName"
    | "email"
    | "currentPassword"
    | "newPassword"
    | "newPasswordConfirm",
    string[]
  >
>;

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

export default function AccountPage() {
  const auth = useAuth();
  const nav = useNavigate();

  const baselineName = auth.user?.name ?? "";
  const baselineEmail = auth.user?.email ?? "";

  const [displayName, setDisplayName] = useState(baselineName);
  const [email, setEmail] = useState(baselineEmail);

  const [touched, setTouched] = useState({ displayName: false, email: false });

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPasswordConfirm, setNewPasswordConfirm] = useState("");

  const [loading, setLoading] = useState(false);
  const [globalMsg, setGlobalMsg] = useState<string | null>(null);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  // /auth/me の復元が遅れて来た時に、フォームへ反映（ただし入力中は上書きしない）
  useEffect(() => {
    if (auth.user) {
      if (!touched.displayName) setDisplayName(auth.user.name ?? "");
      if (!touched.email) setEmail(auth.user.email ?? "");
    }
  }, [auth.user, touched.displayName, touched.email]);

  const hasDisplayNameChange = useMemo(
    () => displayName.trim() !== baselineName,
    [displayName, baselineName]
  );
  const hasEmailChange = useMemo(
    () => email.trim() !== baselineEmail,
    [email, baselineEmail]
  );

  const hasPasswordInput = useMemo(() => {
    return (
      currentPassword.trim() !== "" ||
      newPassword.trim() !== "" ||
      newPasswordConfirm.trim() !== ""
    );
  }, [currentPassword, newPassword, newPasswordConfirm]);

  const canSubmit = useMemo(() => {
    return !loading && (hasDisplayNameChange || hasEmailChange || hasPasswordInput);
  }, [loading, hasDisplayNameChange, hasEmailChange, hasPasswordInput]);

  const onUpdate = async () => {
    setGlobalMsg(null);
    setGlobalError(null);
    setFieldErrors({});
    setLoading(true);

    try {
      // 変更があったものだけ叩く
      if (hasDisplayNameChange) {
        await updateMyDisplayNameApi({ displayName: displayName.trim() });
      }

      if (hasEmailChange) {
        await updateMyEmailApi({ email: email.trim() });
      }

      if (hasPasswordInput) {
        await changeMyPasswordApi({
          currentPassword,
          newPassword,
          newPasswordConfirm,
        });
        // パスワード系は成功したら入力を消す
        setCurrentPassword("");
        setNewPassword("");
        setNewPasswordConfirm("");
      }

      // 画面の表示・ヘッダー表示名などを同期
      setTouched({ displayName: false, email: false });
      await auth.refreshMe();

      setGlobalMsg("更新しました。");
    } catch (e: unknown) {
      if (e instanceof ApiError) {
        if (e.errorCode === "VALIDATION_ERROR") {
          setFieldErrors(groupFieldErrors(e.fieldErrors));
          setGlobalError("入力内容を確認してください。");
        } else if (e.errorCode === "CONFLICT") {
          setGlobalError("そのメールアドレスは既に使用されています。");
        } else if (e.status === 401) {
          setGlobalError("ログイン状態が切れました。もう一度ログインしてください。");
        } else {
          setGlobalError(e.message || "更新に失敗しました。");
        }
      } else {
        setGlobalError("更新に失敗しました。");
      }
    } finally {
      setLoading(false);
    }
  };

  const onWithdraw = async () => {
    const ok = window.confirm(
      "退会すると元に戻せません。\nレビューは残りますが、表示名は「退会ユーザー」になります。\n本当に退会しますか？"
    );
    if (!ok) return;

    setLoading(true);
    setGlobalMsg(null);
    setGlobalError(null);

    try {
      await withdrawMeApi();
      auth.logout(); // トークン削除
      nav("/", { replace: true });
    } catch (e: unknown) {
      if (e instanceof ApiError) {
        setGlobalError(e.message || "退会に失敗しました。");
      } else {
        setGlobalError("退会に失敗しました。");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-8 md:py-12">
      <div className="mx-auto max-w-3xl">
        <div className="rounded-3xl border border-emerald-100 bg-white shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-emerald-50 bg-emerald-50/50">
            <h1 className="text-xl md:text-2xl font-extrabold tracking-tight text-slate-900">
              アカウント設定
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              表示名・メール・パスワードの変更、退会ができます。
            </p>
          </div>

          <div className="px-6 py-6 space-y-8">
            {globalMsg ? (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
                {globalMsg}
              </div>
            ) : null}

            {globalError ? (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
                {globalError}
              </div>
            ) : null}

            {/* 基本情報 */}
            <section>
              <h2 className="text-base font-extrabold text-slate-900">基本情報</h2>

              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-bold text-slate-700">
                    表示名
                  </label>
                  <input
                    type="text"
                    className="mt-2 block w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-emerald-300"
                    value={displayName}
                    onChange={(e) => {
                      setTouched((p) => ({ ...p, displayName: true }));
                      setDisplayName(e.target.value);
                    }}
                  />
                  <ErrorList messages={fieldErrors.displayName} />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700">
                    メールアドレス
                  </label>
                  <input
                    type="email"
                    className="mt-2 block w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-emerald-300"
                    value={email}
                    onChange={(e) => {
                      setTouched((p) => ({ ...p, email: true }));
                      setEmail(e.target.value);
                    }}
                  />
                  <ErrorList messages={fieldErrors.email} />
                </div>
              </div>
            </section>

            {/* パスワード */}
            <section>
              <h2 className="text-base font-extrabold text-slate-900">パスワード変更</h2>
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-bold text-slate-700">
                    現在のパスワード
                  </label>
                  <input
                    type="password"
                    className="mt-2 block w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-emerald-300"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                  />
                  <ErrorList messages={fieldErrors.currentPassword} />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700">
                    新しいパスワード
                  </label>
                  <input
                    type="password"
                    className="mt-2 block w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-emerald-300"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="6文字以上"
                  />
                  <ErrorList messages={fieldErrors.newPassword} />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700">
                    新しいパスワード確認
                  </label>
                  <input
                    type="password"
                    className="mt-2 block w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-emerald-300"
                    value={newPasswordConfirm}
                    onChange={(e) => setNewPasswordConfirm(e.target.value)}
                  />
                  <ErrorList messages={fieldErrors.newPasswordConfirm} />
                </div>
              </div>
            </section>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={onUpdate}
                disabled={!canSubmit}
                className="inline-flex items-center justify-center rounded-2xl bg-emerald-600 px-6 py-3 text-sm font-extrabold text-white hover:bg-emerald-700 disabled:opacity-60"
              >
                {loading ? "更新中..." : "更新する"}
              </button>

              <button
                type="button"
                onClick={() => nav("/spots")}
                className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50"
              >
                スポット一覧へ
              </button>
            </div>

            {/* 危険操作 */}
            <section>
              <div className="rounded-3xl border border-rose-200 bg-rose-50 p-5">
                <div className="text-base font-extrabold text-rose-900">危険操作エリア</div>
                <div className="mt-1 text-sm text-rose-800">
                  退会すると元に戻せません。レビューは残りますが、表示名は「退会ユーザー」になります。
                </div>

                <button
                  type="button"
                  onClick={onWithdraw}
                  disabled={loading}
                  className="mt-4 inline-flex items-center justify-center rounded-2xl bg-rose-600 px-6 py-3 text-sm font-extrabold text-white hover:bg-rose-700 disabled:opacity-60"
                >
                  退会する
                </button>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
