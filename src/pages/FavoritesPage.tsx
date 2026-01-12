import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Spot } from "../types";
import SpotCard from "../components/SpotCard";
import { fetchFavorites, addFavorite, removeFavorite } from "../api/favorites";

function getErrorMessage(e: unknown, fallback: string) {
  if (e instanceof Error) return e.message;
  if (typeof e === "string") return e;
  return fallback;
}

export default function FavoritesPage() {
  const navigate = useNavigate();

  const [favorites, setFavorites] = useState<Spot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);

    try {
      const list = await fetchFavorites();
      setFavorites(list);
    } catch (e: unknown) {
      setError(getErrorMessage(e, "お気に入り一覧の取得に失敗しました"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const goDetail = (id: number) => {
    navigate(`/spots/${id}`);
  };

  const toggleFavorite = async (spotId: number, next: boolean) => {
    setError(null);

    const prev = favorites;

    // お気に入り一覧なので、解除したら消すのが自然
    const nextState = next
      ? prev.map((s) => (s.id === spotId ? { ...s, isFavorite: true } : s))
      : prev.filter((s) => s.id !== spotId);

    setFavorites(nextState);

    try {
      if (next) {
        await addFavorite(spotId);
      } else {
        await removeFavorite(spotId);
      }
    } catch (e: unknown) {
      // ロールバック
      setFavorites(prev);
      setError(getErrorMessage(e, "お気に入り更新に失敗しました"));
    }
  };

  if (loading) {
    return <div className="py-10 text-center text-gray-500">読み込み中...</div>;
  }

  if (error) {
    return <div className="py-10 text-center text-red-600">エラー: {error}</div>;
  }

  return (
    <div className="pb-10">
      <div className="flex items-end justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl md:text-2xl font-extrabold tracking-tight">
            お気に入り
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            登録したスポットを一覧で確認できます
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate("/spots")}
          className="
            inline-flex items-center justify-center
            rounded-xl border border-slate-200 bg-white
            px-4 py-2 text-sm font-semibold text-slate-700
            shadow-sm transition hover:bg-slate-50
            focus:outline-none focus:ring-2 focus:ring-slate-200
          "
        >
          ← 一覧に戻る
        </button>
      </div>

      {favorites.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {favorites.map((spot) => (
            <SpotCard
              key={spot.id}
              spot={spot}
              onClickDetail={goDetail}
              onToggleFavorite={toggleFavorite}
            />
          ))}
        </div>
      ) : (
        <div className="py-20 text-center">
          <p className="text-gray-500">お気に入りはまだありません。</p>
          <button
            type="button"
            onClick={() => navigate("/spots")}
            className="
              mt-5 inline-flex items-center justify-center
              rounded-xl bg-emerald-600 px-5 py-2.5
              text-sm font-semibold text-white
              shadow-sm transition hover:bg-emerald-700
              focus:outline-none focus:ring-2 focus:ring-emerald-200
            "
          >
            スポットを探す
          </button>
        </div>
      )}
    </div>
  );
}
