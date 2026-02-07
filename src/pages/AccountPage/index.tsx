// src/pages/AccountPage/index.tsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ApiError } from "../../types";
import { useAuth } from "../../auth/AuthContext";
import {
  deleteMeApi,
  updateProfileApi,
  updatePasswordApi,
} from "../../api/users";

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
  if (/デモアカウントはアカウント情報を変更できません/.test(msg)) return "デモアカウントはアカウント情報を変更できません。";
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
  }, [auth.user?.email]);

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

    try {
      const tasks: Promise<unknown>[] = [];

      // 方針A（原子性）：表示名/メールは「まとめて1リクエスト」で更新する
      // - どちらかが不正なら、どちらも更新されない
      const nextDisplayName = displayName.trim();
      const nextEmail = email.trim();

      const displayNameChanged = nextDisplayName !== (auth.user.name ?? "");
      const emailChanged = nextEmail !== (auth.user.email ?? "");
      const profileChanged = displayNameChanged || emailChanged;

      if (profileChanged) {
        tasks.push(
          updateProfileApi({
            displayName: nextDisplayName,
            email: nextEmail,
          })
        );
      }

      const wantsPasswordChange =
        currentPassword.trim() !== "" ||
        newPassword.trim() !== "" ||
        newPasswordConfirm.trim() !== "";

      if (wantsPasswordChange) {
        // ここは「最低限のUIチェック」だけ残す（backend のDTOが主役）
        const e: FieldErrors = {};
        if (!currentPassword.trim()) e.currentPassword = "現在のパスワードを入力してください";
        if (!newPassword.trim()) e.newPassword = "新しいパスワードを入力してください";
        if (!newPasswordConfirm.trim()) e.newPasswordConfirm = "新しいパスワード確認を入力してください";
        if (newPassword && newPassword.length > 0 && newPassword.length < 6) {
          e.newPassword = "新しいパスワードは6文字以上で入力してください";
        }
        if (newPassword && newPasswordConfirm && newPassword !== newPasswordConfirm) {
          e.newPasswordConfirm = "新しいパスワードが一致しません";
        }
        if (Object.values(e).some(Boolean)) {
          setErrors(e);
          setSaving(false);
          return;
        }

        tasks.push(
          updatePasswordApi({
            currentPassword: currentPassword.trim(),
            newPassword,
            newPasswordConfirm,
          })
        );
      }

      if (tasks.length === 0) {
        setSuccess("変更はありません。");
        return;
      }

      await Promise.all(tasks);

      // ヘッダー反映のため refreshMe
      await auth.refreshMe();

      // パスワード欄は成功後にクリア
      setCurrentPassword("");
      setNewPassword("");
      setNewPasswordConfirm("");

      setSuccess("更新しました。");
    } catch (e: unknown) {
      if (e instanceof ApiError) {
        const msg = toJaMessage(e.message ?? "");

        // 既知エラーは項目に出す（優先）
        if (/既に登録されています/.test(msg)) {
          setErrors({ email: msg });
          return;
        }
        if (/現在のパスワードが間違っています/.test(msg)) {
          setErrors({ currentPassword: msg });
          return;
        }

        // 指摘対応：DTOの fieldErrors と連携して項目別表示
        if (e.errorCode === "VALIDATION_ERROR") {
          setErrors(mapFieldErrorsFromApiError(e));
          return;
        }

        setErrors({ form: msg || "更新に失敗しました。" });
        return;
      }

      if (e instanceof Error) {
        setErrors({ form: toJaMessage(e.message) || "更新に失敗しました。" });
        return;
      }

      setErrors({ form: "更新に失敗しました。" });
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

  if (!auth.user) return null;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="rounded-2xl border border-emerald-100 bg-white shadow-sm">
        <div className="px-6 py-5 border-b border-emerald-50">
          <h1 className="text-xl md:text-2xl font-extrabold tracking-tight">アカウント設定</h1>
          <div className="text-sm text-slate-500 mt-2">
            表示名・メール・パスワードの変更、退会ができます。
          </div>
        </div>

        <div className="px-6 py-6 space-y-8">
          {isDemoUser && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              デモアカウントはポートフォリオ閲覧者向けのため、アカウント情報の変更・退会はできません。
            </div>
          )}

          {hasAnyError && errors.form && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {errors.form}
            </div>
          )}

          {success && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
              {success}
            </div>
          )}

          {/* 縦並び */}
          <div className="space-y-5">
            <div>
              <div className="text-sm font-semibold text-slate-700 mb-1">表示名</div>
              <input
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm disabled:bg-slate-100"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="表示名を入力"
                disabled={saving || isDemoUser}
              />
              {errors.displayName && (
                <div className="mt-1 text-xs text-red-600">{errors.displayName}</div>
              )}
            </div>

            <div>
              <div className="text-sm font-semibold text-slate-700 mb-1">メールアドレス</div>
              <input
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm disabled:bg-slate-100"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="メールアドレスを入力"
                disabled={saving || isDemoUser}
              />
              {errors.email && <div className="mt-1 text-xs text-red-600">{errors.email}</div>}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <div className="font-extrabold text-slate-900">パスワード変更</div>
            <div className="mt-1 text-sm text-slate-600">
              変更する場合のみ入力してください。
            </div>

            {/* 縦並び */}
            <div className="mt-4 space-y-4">
              <div>
                <div className="text-sm font-semibold text-slate-700 mb-1">現在のパスワード</div>
                <input
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm disabled:bg-slate-100"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="現在のパスワードを入力"
                  disabled={saving || isDemoUser}
                />
                {errors.currentPassword && (
                  <div className="mt-1 text-xs text-red-600">{errors.currentPassword}</div>
                )}
              </div>

              <div>
                <div className="text-sm font-semibold text-slate-700 mb-1">新しいパスワード</div>
                <input
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm disabled:bg-slate-100"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="新しいパスワード（6文字以上）"
                  disabled={saving || isDemoUser}
                />
                {errors.newPassword && (
                  <div className="mt-1 text-xs text-red-600">{errors.newPassword}</div>
                )}
              </div>

              <div>
                <div className="text-sm font-semibold text-slate-700 mb-1">新しいパスワード確認</div>
                <input
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm disabled:bg-slate-100"
                  type="password"
                  value={newPasswordConfirm}
                  onChange={(e) => setNewPasswordConfirm(e.target.value)}
                  placeholder="新しいパスワードを再入力"
                  disabled={saving || isDemoUser}
                />
                {errors.newPasswordConfirm && (
                  <div className="mt-1 text-xs text-red-600">{errors.newPasswordConfirm}</div>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving || isDemoUser}
              className="rounded-xl bg-emerald-600 text-white font-extrabold px-6 py-3 text-sm hover:bg-emerald-700 disabled:opacity-60"
            >
              更新
            </button>
          </div>

          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5">
            <div className="font-extrabold text-rose-800">※操作注意</div>
            <div className="mt-2 text-sm text-rose-700">
              退会するとログインできなくなります。レビューは残り、表示名は「退会ユーザー」に変更されます。
            </div>

            <div className="mt-4">
              <button
                type="button"
                onClick={handleDelete}
                disabled={saving || isDemoUser}
                className="rounded-xl bg-rose-600 text-white font-extrabold px-6 py-3 text-sm hover:bg-rose-700 disabled:opacity-60"
              >
                退会する
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
