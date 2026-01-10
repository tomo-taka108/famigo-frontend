// src/App.tsx
import { BrowserRouter, Navigate, Routes, Route } from "react-router-dom";
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

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            {/* ✅ Top = LP */}
            <Route path="/" element={<LandingPage />} />

            {/* ✅ Spots */}
            <Route path="/spots" element={<SpotListPage />} />
            <Route path="/spots/:id" element={<SpotDetailPage />} />

            {/* ✅ Auth */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* ✅ Account (protected) */}
            <Route
              path="/account"
              element={
                <RequireAuth>
                  <AccountPage />
                </RequireAuth>
              }
            />

            {/* ✅ Favorites (existing, protected) */}
            <Route
              path="/favorites"
              element={
                <RequireAuth>
                  <FavoritesPage />
                </RequireAuth>
              }
            />

            {/* ✅ Legacy route (old) */}
            <Route path="/mypage" element={<Navigate to="/account" replace />} />

            {/* ✅ Not found -> LP */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
