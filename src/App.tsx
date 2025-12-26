import { BrowserRouter, Routes, Route } from "react-router-dom";
import SpotListPage from "./pages/SpotListPage";
import SpotDetailPage from "./pages/SpotDetailPage";
import FavoritesPage from "./pages/FavoritesPage";
import Layout from "./components/Layout";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 共通レイアウト配下にページを入れる */}
        <Route element={<Layout />}>
          <Route path="/" element={<SpotListPage />} />
          <Route path="/spots/:id" element={<SpotDetailPage />} />
          <Route path="/favorites" element={<FavoritesPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
