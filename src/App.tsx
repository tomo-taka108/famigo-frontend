// src/App.tsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import SpotListPage from "./pages/SpotListPage";
import SpotDetailPage from "./pages/SpotDetailPage";
import FavoritesPage from "./pages/FavoritesPage";
import Layout from "./components/Layout";
import LoginPage from "./pages/LoginPage";
import MyPage from "./pages/MyPage";
import RequireAuth from "./components/RequireAuth";
import { AuthProvider } from "./auth/AuthContext";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* 共通レイアウト配下にページを入れる */}
          <Route element={<Layout />}>
            <Route path="/" element={<SpotListPage />} />
            <Route path="/spots/:id" element={<SpotDetailPage />} />

            <Route path="/login" element={<LoginPage />} />

            <Route
              path="/favorites"
              element={
                <RequireAuth>
                  <FavoritesPage />
                </RequireAuth>
              }
            />

            <Route
              path="/mypage"
              element={
                <RequireAuth>
                  <MyPage />
                </RequireAuth>
              }
            />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
