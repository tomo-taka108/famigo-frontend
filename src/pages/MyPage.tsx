// src/pages/MyPage.tsx
import { NavLink } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function MyPage() {
  const { user, logout } = useAuth();

  if (!user) return null;

  return (
    <div className="pb-10">
      <div className="bg-white rounded-2xl border border-emerald-100 shadow-sm">
        <div className="px-6 py-5 border-b border-emerald-50">
          <h1 className="text-xl md:text-2xl font-extrabold tracking-tight">
            マイページ
          </h1>
          <div className="text-sm text-slate-500 mt-2">
            ログイン情報と、マイ機能への入口です。
          </div>
        </div>

        <div className="px-6 py-5 space-y-4">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-xs text-slate-500">ログイン中</div>
            <div className="mt-1 text-base font-semibold text-slate-900">
              {user.name}（{user.role}）
            </div>
            <div className="mt-1 text-sm text-slate-600">{user.email}</div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <NavLink
              to="/favorites"
              className="
                inline-flex items-center justify-center
                rounded-xl border px-4 py-2 text-sm font-semibold
                shadow-sm transition
                focus:outline-none focus:ring-2 focus:ring-emerald-200
                border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100
              "
            >
              お気に入り一覧へ
            </NavLink>

            <button
              onClick={logout}
              className="
                inline-flex items-center justify-center
                rounded-xl border px-4 py-2 text-sm font-semibold
                shadow-sm transition
                focus:outline-none focus:ring-2 focus:ring-emerald-200
                border-slate-200 bg-white text-slate-700 hover:bg-slate-50
              "
            >
              ログアウト
            </button>
          </div>

          <div className="text-sm text-slate-500">
            ※「自分のレビュー一覧」はバックエンドに専用APIが追加されたタイミングでここに表示します。<br />
            現時点でも、スポット詳細ページのレビューから「自分のレビュー編集/削除」は可能です。
          </div>
        </div>
      </div>
    </div>
  );
}
