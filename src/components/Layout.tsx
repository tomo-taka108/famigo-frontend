// src/components/Layout.tsx
import { Link, Outlet, useNavigate } from "react-router-dom";
import { Footer } from "./Footer";
import { useAuth } from "../auth/AuthContext";

export default function Layout() {
  const auth = useAuth();
  const navigate = useNavigate();

  const isLoggedIn = !!auth.token && !!auth.user;

  const goFavorites = () => {
    if (!isLoggedIn) {
      navigate("/login", { state: { from: "/favorites" } });
      return;
    }
    navigate("/favorites");
  };

  return (
    <div className="min-h-dvh flex flex-col bg-white">
      <header className="border-b">
        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-extrabold">
              F
            </div>
            <div>
              <div className="text-xl font-extrabold text-slate-900">Famigo</div>
              <div className="text-xs text-slate-500">
                家族のおでかけ検索 / 低コストで、家族の思い出を
              </div>
            </div>
          </Link>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={goFavorites}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              お気に入り
            </button>

            {!isLoggedIn ? (
              <Link
                to="/login"
                className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-800 hover:bg-emerald-100"
              >
                ログイン
              </Link>
            ) : (
              <>
                <div className="hidden sm:flex items-center gap-2 rounded-full bg-slate-50 border border-slate-200 px-3 py-2">
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-emerald-600 text-white text-xs font-bold">
                    {auth.user?.name?.slice(0, 1) ?? "U"}
                  </span>
                  <span className="text-sm font-semibold text-slate-800">
                    {auth.user?.name}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={auth.logout}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  ログアウト
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ✅ 全ページ共通：左右余白＋最大幅＋固定フッター分の下余白 */}
      <main className="flex-1 pb-24">
        <div className="mx-auto w-full max-w-6xl px-4">
          <Outlet />
        </div>
      </main>

      <Footer />
    </div>
  );
}
