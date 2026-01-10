import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getFavoritesApi } from "../api/favorites";
import type { Spot } from "../types";
import SpotCard from "../components/SpotCard";
import { ApiError } from "../api/client";

export default function FavoritesPage() {
  const nav = useNavigate();
  const [items, setItems] = useState<Spot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      try {
        const data = await getFavoritesApi();
        setItems(data);
      } catch (e: unknown) {
        if (e instanceof ApiError) {
          setError(e.message);
        } else {
          setError("お気に入りの取得に失敗しました。");
        }
      } finally {
        setLoading(false);
      }
    };
    void run();
  }, []);

  return (
    <div className="py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-slate-900">お気に入り</h1>
        <button
          onClick={() => nav("/spots")}
          className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          スポット一覧へ
        </button>
      </div>

      {loading ? <div className="text-slate-600">読み込み中...</div> : null}

      {error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
          {error}
        </div>
      ) : null}

      {!loading && !error && items.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 text-slate-700">
          お気に入りはまだありません。
        </div>
      ) : null}

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.map((s) => (
          <SpotCard key={s.id} spot={s} />
        ))}
      </div>
    </div>
  );
}
