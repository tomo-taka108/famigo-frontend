// src/components/Layout.tsx
import { Link, Outlet, useNavigate } from "react-router-dom";
import { Footer } from "./Footer";
import { useAuth } from "../auth/AuthContext";

export default function Layout() {
  const auth = useAuth();
  const navigate = useNavigate();

  const isLoggedIn = !!auth.token && !!auth.user;

  const onLogout = () => {
    auth.logout();
    navigate("/");
  };

  return (
    <div className="min-h-dvh flex flex-col text-slate-900">
      <header className="sticky top-0 z-50 border-b border-white/50 bg-white/70 backdrop-blur">
        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
          <Link to="/" className="group flex items-center gap-3">
            <div className="relative h-10 w-10 rounded-2xl bg-linear-to-br from-emerald-600 to-emerald-500 text-white flex items-center justify-center font-extrabold shadow-sm">
              F
              <span
                aria-hidden
                className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-amber-300 shadow-sm"
              />
            </div>

            <div className="leading-tight">
              <div className="text-xl font-extrabold tracking-tight text-slate-900 group-hover:text-slate-950">
                Famigo
              </div>
              {/* ✅ 既存文言は勝手に変更しない */}
              <div className="text-xs text-slate-600">
                家族のおでかけ検索 / 低コストで、家族の思い出を
              </div>
            </div>
          </Link>

          <nav className="flex items-center gap-2">
            {!isLoggedIn ? (
              <>
                <Link
                  to="/spots"
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-800 shadow-sm transition hover:bg-slate-50"
                >
                  スポット一覧
                </Link>

                <Link
                  to="/register"
                  className="rounded-2xl bg-linear-to-r from-emerald-600 to-emerald-500 px-4 py-2 text-sm font-extrabold text-white shadow-sm transition hover:opacity-95"
                >
                  新規登録
                </Link>

                <Link
                  to="/login"
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-800 shadow-sm transition hover:bg-slate-50"
                >
                  ログイン
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/spots"
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-800 shadow-sm transition hover:bg-slate-50"
                >
                  スポット一覧
                </Link>

                <Link
                  to="/account"
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-800 shadow-sm transition hover:bg-slate-50"
                >
                  アカウント設定
                </Link>

                <div className="hidden sm:flex items-center gap-2 rounded-full bg-white/70 border border-white/60 px-3 py-2 shadow-sm backdrop-blur">
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-emerald-600 text-white text-xs font-extrabold">
                    {auth.user?.name?.slice(0, 1) ?? "U"}
                  </span>
                  <span className="text-sm font-bold text-slate-800">
                    {auth.user?.name}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={onLogout}
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-800 shadow-sm transition hover:bg-slate-50"
                >
                  ログアウト
                </button>
              </>
            )}
          </nav>
        </div>
      </header>

      <main className="flex-1 pb-24">
        <div className="mx-auto w-full max-w-6xl px-4">
          <Outlet />
        </div>
      </main>

      <Footer />
    </div>
  );
}
