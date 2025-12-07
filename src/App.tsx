import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import SpotListPage from "./pages/SpotListPage";
import SpotDetailPage from "./pages/SpotDetailPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* トップ：スポット一覧ページ */}
        <Route path="/" element={<SpotListPage />} />

        {/* スポット詳細ページ */}
        <Route path="/spots/:id" element={<SpotDetailPage />} />
      </Routes>
    </BrowserRouter>
  );
}
