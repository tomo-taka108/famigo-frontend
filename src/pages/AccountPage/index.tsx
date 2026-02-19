// src/pages/AccountPage/index.tsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ApiError } from "../../types";
import { useAuth } from "../../auth/AuthContext";
import { deleteMeApi, updateProfileApi, updatePasswordApi } from "../../api/users";

type FieldErrors = Partial<{
  displayName: string;
  email: string;
  currentPassword: string;
  newPassword: string;
  newPasswordConfirm: string;
  form: string;
}>;

function toJaMessage(msg: string): string {
  if (/email is already registered/i.test(msg)) return "そのメールアドレスは既に登録されています。";
  if (/invalid current password/i.test(msg)) return "現在のパスワードが間違っています。";
  if (/デモアカウントはアカウント情報を変更できません/.test(msg))
    return "デモアカウントはアカウント情報を変更できません。";
  return msg;
}

// backend の fieldErrors をフォーム項目へ割り当て
function mapFieldErrorsFromApiError(e: ApiError): FieldErrors {
  const result: FieldErrors = {};

  if (Array.isArray(e.fieldErrors) && e.fieldErrors.length > 0) {
    for (const fe of e.fieldErrors) {
      if (!fe) continue;

      if (fe.field === "displayName") result.displayName = fe.message;
      if (fe.field === "email") result.email = fe.message;
      if (fe.field === "currentPassword") result.currentPassword = fe.message;
      if (fe.field === "newPassword") result.newPassword = fe.message;
      if (fe.field === "newPasswordConfirm") result.newPasswordConfirm = fe.message;
    }
  }

  // 何も割り当てられない場合は form に落とす
  if (!Object.values(result).some(Boolean)) {
    result.form = "入力内容を確認してください。";
  }

  return result;
}

export default function AccountPage() {
  const navigate = useNavigate();
  const auth = useAuth();

  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPasswordConfirm, setNewPasswordConfirm] = useState("");

  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [success, setSuccess] = useState<string | null>(null);

  const hasAnyError = useMemo(() => Object.values(errors).some(Boolean), [errors]);

  useEffect(() => {
    if (!auth.user) return;
    setDisplayName(auth.user.name ?? "");
    setEmail(auth.user.email ?? "");
  }, [auth.user]);

  // demo_user をUI上でも変更不可にする
  const isDemoUser = useMemo(() => {
    const mail = (auth.user?.email ?? "").toLowerCase();
    return mail === "demo_user@example.com";
  }, [auth.user]);

  const resetMessages = () => {
    setErrors({});
    setSuccess(null);
  };

  const handleSave = async () => {
    if (!auth.user) return;

    // デモユーザーは更新不可（UIでもブロック）
    if (isDemoUser) {
      setErrors({ form: "デモアカウントはアカウント情報を変更できません。" });
      return;
    }

    resetMessages();
    setSaving(true);

    // ================================
    // 1) まずは「全部まとめて」UIバリデーション
    //   - 途中 return で打ち切らない
    //   - プロフィールとパスワードのエラーを同時表示できるようにする
    // ================================
    const nextDisplayName = displayName.trim();
    const nextEmail = email.trim();

    const displayNameChanged = nextDisplayName !== (auth.user.name ?? "");
    const emailChanged = nextEmail !== (auth.user.email ?? "");
    const profileChanged = displayNameChanged || emailChanged;

    const wantsPasswordChange =
      currentPassword.trim() !== "" || newPassword.trim() !== "" || newPasswordConfirm.trim() !== "";

    const profileErrors: FieldErrors = {};
    if (profileChanged) {
      // 表示名
      if (!nextDisplayName) profileErrors.displayName = "表示名（ユーザー名）を入力してください";
      else if (nextDisplayName.length < 3)
        profileErrors.displayName = "表示名（ユーザー名）は3文字以上で入力してください";

      // メール
      if (!nextEmail) {
        profileErrors.email = "メールアドレスを入力してください";
      } else {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(nextEmail)) profileErrors.email = "有効なメールアドレスを入力してください";
        else if (nextEmail.length > 255) profileErrors.email = "メールアドレスは255文字以内で入力してください";
      }
    }

    const passwordErrors: FieldErrors = {};
    if (wantsPasswordChange) {
      // ここは「最低限のUIチェック」だけ（backend DTO が主役）
      if (!currentPassword.trim()) passwordErrors.currentPassword = "現在のパスワードを入力してください";
      if (!newPassword.trim()) passwordErrors.newPassword = "新しいパスワードを入力してください";
      if (!newPasswordConfirm.trim())
        passwordErrors.newPasswordConfirm = "新しいパスワード確認を入力してください";

      if (newPassword && newPassword.length > 0 && newPassword.length < 6) {
        passwordErrors.newPassword = "新しいパスワードは6文字以上で入力してください";
      }
      if (newPassword && newPasswordConfirm && newPassword !== newPasswordConfirm) {
        passwordErrors.newPasswordConfirm = "新しいパスワードが一致しません";
      }
    }

    const clientErrors: FieldErrors = { ...profileErrors, ...passwordErrors };

    // ここで一旦エラーを反映（「同時表示」させるため）
    if (Object.values(clientErrors).some(Boolean)) {
      setErrors(clientErrors);
    }

    // ================================
    // 2) API呼び出しの可否を「セクション単位」で判断
    //   - プロフィールにエラーがあればプロフィール更新は送らない
    //   - パスワードにエラーがあればパスワード変更は送らない
    //   - 片方がエラーでも、もう片方がOKなら実行できる
    // ================================
    const canUpdateProfile = profileChanged && !Object.values(profileErrors).some(Boolean);
    const canUpdatePassword = wantsPasswordChange && !Object.values(passwordErrors).some(Boolean);

    // 何も送れない（=エラーがある/変更がない）
    if (!canUpdateProfile && !canUpdatePassword) {
      if (!profileChanged && !wantsPasswordChange) {
        setSuccess("変更はありません。");
      }
      setSaving(false);
      return;
    }

    // ================================
    // 3) サーバーエラーは「上書きではなくマージ」
    // ================================
    const serverErrors: FieldErrors = {};

    const mergeApiError = (e: ApiError) => {
      const msg = toJaMessage(e.message ?? "");

      // 既知エラーは項目に出す（優先）
      if (/既に登録されています/.test(msg)) {
        serverErrors.email = msg;
        return;
      }
      if (/現在のパスワードが間違っています/.test(msg)) {
        serverErrors.currentPassword = msg;
        return;
      }

      // DTO の fieldErrors と連携して項目別表示
      if (e.errorCode === "VALIDATION_ERROR") {
        const fe = mapFieldErrorsFromApiError(e);
        Object.assign(serverErrors, fe);
        return;
      }

      serverErrors.form = msg || "更新に失敗しました。";
    };

    let profileUpdated = false;
    let passwordUpdated = false;

    try {
      // プロフィール更新
      if (canUpdateProfile) {
        try {
          await updateProfileApi({
            displayName: nextDisplayName,
            email: nextEmail,
          });
          profileUpdated = true;
        } catch (e: unknown) {
          if (e instanceof ApiError) mergeApiError(e);
          else if (e instanceof Error) serverErrors.form = toJaMessage(e.message) || "更新に失敗しました。";
          else serverErrors.form = "更新に失敗しました。";
        }
      }

      // パスワード変更
      if (canUpdatePassword) {
        try {
          await updatePasswordApi({
            currentPassword: currentPassword.trim(),
            newPassword,
            newPasswordConfirm,
          });
          passwordUpdated = true;
        } catch (e: unknown) {
          if (e instanceof ApiError) mergeApiError(e);
          else if (e instanceof Error) serverErrors.form = toJaMessage(e.message) || "更新に失敗しました。";
          else serverErrors.form = "更新に失敗しました。";
        }
      }

      // サーバー側エラーがあれば表示して終了（クライアント側エラーは残したまま）
      if (Object.values(serverErrors).some(Boolean)) {
        setErrors({ ...clientErrors, ...serverErrors });
        return;
      }

      // ヘッダー反映のため refreshMe（プロフィール更新が成功したときだけ）
      if (profileUpdated) {
        await auth.refreshMe();
      }

      // パスワード欄は成功後にクリア
      if (passwordUpdated) {
        setCurrentPassword("");
        setNewPassword("");
        setNewPasswordConfirm("");
      }

      setSuccess("更新しました。");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    // デモユーザーは退会不可（UIでもブロック）
    if (isDemoUser) {
      setErrors({ form: "デモアカウントは退会できません。" });
      return;
    }

    resetMessages();
    setSaving(true);

    try {
      await deleteMeApi();
      auth.logout();
      navigate("/", { replace: true });
    } catch (e: unknown) {
      const msg =
        e instanceof ApiError
          ? toJaMessage(e.message ?? "") || "退会に失敗しました。"
          : e instanceof Error
            ? toJaMessage(e.message) || "退会に失敗しました。"
            : "退会に失敗しました。";
      setErrors({ form: msg });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-120px)] px-4 py-8">
      <div className="mx-auto w-full max-w-215 rounded-2xl bg-white border border-emerald-100 shadow-sm overflow-hidden">
        <div className="px-6 py-5 bg-emerald-50 border-b border-emerald-100">
          <h1 className="text-lg font-bold text-slate-900">アカウント設定</h1>
          <p className="mt-1 text-sm text-slate-600">表示名・メール・パスワードの変更、退会ができます。</p>
        </div>

        <div className="p-6 space-y-6">
          {success && (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {success}
            </div>
          )}

          {errors.form && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {errors.form}
            </div>
          )}

          {/* プロフィール */}
          <div className="space-y-4">
            <div>
              <div className="text-sm font-semibold text-slate-700 mb-1">表示名</div>
              <input
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="表示名を入力"
                disabled={saving}
              />
              {errors.displayName && (
                <div className="mt-1 text-xs text-red-600">{errors.displayName}</div>
              )}
            </div>

            <div>
              <div className="text-sm font-semibold text-slate-700 mb-1">メールアドレス</div>
              <input
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="メールアドレスを入力"
                disabled={saving}
              />
              {errors.email && <div className="mt-1 text-xs text-red-600">{errors.email}</div>}
            </div>
          </div>

          {/* パスワード変更 */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <div className="text-sm font-bold text-slate-900">パスワード変更</div>
            <div className="mt-1 text-xs text-slate-600">変更する場合のみ入力してください。</div>

            <div className="mt-4 space-y-4">
              <div>
                <div className="text-sm font-semibold text-slate-700 mb-1">現在のパスワード</div>
                <input
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="現在のパスワードを入力"
                  disabled={saving}
                />
                {errors.currentPassword && (
                  <div className="mt-1 text-xs text-red-600">{errors.currentPassword}</div>
                )}
              </div>

              <div>
                <div className="text-sm font-semibold text-slate-700 mb-1">新しいパスワード</div>
                <input
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="新しいパスワードを入力（6文字以上）"
                  disabled={saving}
                />
                {errors.newPassword && (
                  <div className="mt-1 text-xs text-red-600">{errors.newPassword}</div>
                )}
              </div>

              <div>
                <div className="text-sm font-semibold text-slate-700 mb-1">新しいパスワード確認</div>
                <input
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  type="password"
                  value={newPasswordConfirm}
                  onChange={(e) => setNewPasswordConfirm(e.target.value)}
                  placeholder="もう一度入力"
                  disabled={saving}
                />
                {errors.newPasswordConfirm && (
                  <div className="mt-1 text-xs text-red-600">{errors.newPasswordConfirm}</div>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              className={[
                "rounded-xl px-6 py-2 font-bold text-white",
                saving ? "bg-emerald-300 cursor-not-allowed" : "bg-emerald-600 hover:bg-emerald-700",
              ].join(" ")}
              onClick={handleSave}
              disabled={saving}
            >
              更新
            </button>
          </div>

          {/* 退会 */}
          <div className="rounded-2xl border border-red-200 bg-red-50 p-5">
            <div className="text-sm font-bold text-red-800">※操作注意</div>
            <p className="mt-1 text-xs text-red-700">
              退会するとログインできなくなります。レビューは残り、表示名は「退会ユーザー」に変更されます。
            </p>

            <div className="mt-4">
              <button
                className={[
                  "rounded-xl px-6 py-2 font-bold text-white",
                  saving ? "bg-red-300 cursor-not-allowed" : "bg-red-600 hover:bg-red-700",
                ].join(" ")}
                onClick={handleDelete}
                disabled={saving}
              >
                退会する
              </button>
            </div>
          </div>

          {hasAnyError && (
            <div className="text-xs text-slate-500 text-center">入力エラーを修正してください。</div>
          )}
        </div>
      </div>
    </div>
  );
}
