// src/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import RequireAuth from "./components/RequireAuth";
import { AuthProvider } from "./auth/AuthContext";

import LandingPage from "./pages/LandingPage";
import SpotListPage from "./pages/SpotListPage";
import SpotDetailPage from "./pages/SpotDetailPage";
import FavoritesPage from "./pages/FavoritesPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import AccountPage from "./pages/AccountPage";
import MyPage from "./pages/MyPage";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            {/* ✅ トップはLP */}
            <Route path="/" element={<LandingPage />} />

            {/* ✅ スポット一覧は /spots */}
            <Route path="/spots" element={<SpotListPage />} />
            <Route path="/spots/:id" element={<SpotDetailPage />} />

            {/* ✅ 認証 */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* ✅ ログイン必須 */}
            <Route
              path="/account"
              element={
                <RequireAuth>
                  <AccountPage />
                </RequireAuth>
              }
            />

            <Route
              path="/favorites"
              element={
                <RequireAuth>
                  <FavoritesPage />
                </RequireAuth>
              }
            />

            {/* 既存（残してOK） */}
            <Route
              path="/mypage"
              element={
                <RequireAuth>
                  <MyPage />
                </RequireAuth>
              }
            />

            {/* ✅ 旧トップ(/)で一覧を見たい場合の保険：必要なら使う
                今回はLPが / なので、/spots へ誘導 */}
            <Route
              path="/spots/:id/reviews"
              element={<Navigate to="/spots" replace />}
            />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
