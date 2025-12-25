import { Outlet, NavLink } from "react-router-dom";
import { Footer } from "./Footer";

export default function Layout() {
  return (
    <div className="min-h-screen text-gray-900 bg-linear-to-b from-emerald-50/70 via-white to-white">
      <div className="mx-auto w-full max-w-7xl px-4 md:px-6">
        <div className="flex min-h-screen flex-col">
          {/* 共通ヘッダー */}
          <header className="py-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-emerald-700 text-white flex items-center justify-center font-extrabold shadow-sm">
                  F
                </div>

                <div>
                  <div className="text-xl md:text-2xl font-extrabold leading-tight tracking-tight">
                    Famigo
                  </div>
                  <div className="text-xs md:text-sm text-gray-500">
                    家族のおでかけ検索
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="hidden sm:block text-sm text-gray-500">
                  低コストで、家族の思い出を
                </div>

                <NavLink
                  to="/favorites"
                  className={({ isActive }) =>
                    `
                      inline-flex items-center justify-center
                      rounded-xl border px-4 py-2 text-sm font-semibold
                      shadow-sm transition
                      focus:outline-none focus:ring-2 focus:ring-emerald-200
                      ${
                        isActive
                          ? "border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100"
                          : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                      }
                    `
                  }
                >
                  お気に入り
                </NavLink>
              </div>
            </div>
          </header>

          <main className="flex-1 pb-16">
            <Outlet />
          </main>

          <Footer />
        </div>
      </div>
    </div>
  );
}
