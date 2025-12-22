import { Outlet } from "react-router-dom";
import { Footer } from "./Footer";

export default function Layout() {
  return (
    <div className="min-h-screen text-gray-900 bg-gradient-to-b from-emerald-50/70 via-white to-white">
      <div className="mx-auto w-full max-w-7xl px-4 md:px-6">
        <div className="flex min-h-screen flex-col">
          {/* 共通ヘッダー */}
          <header className="py-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-extrabold shadow-sm">
                  F
                </div>

                <div>
                  {/* Famigo を “ロゴ” として大きく */}
                  <div className="text-xl md:text-2xl font-extrabold leading-tight tracking-tight">
                    Famigo
                  </div>
                  <div className="text-xs md:text-sm text-gray-500">
                    家族のおでかけ検索
                  </div>
                </div>
              </div>

              <div className="hidden sm:block text-sm text-gray-500">
                低コストで、家族の思い出を
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
