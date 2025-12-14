// src/pages/SpotListPage.tsx

import React, { useState, useEffect, useMemo } from "react";
import type { FilterState, Spot } from "../types";
import { fetchSpots } from "../api/spots";

import { SpotCard } from "../components/SpotCard";
import { FilterModal } from "../components/FilterModal";
import { Footer } from "../components/Footer";
import { SearchIcon, FilterIcon, MapIcon } from "../components/Icons";

export default function SpotListPage() {
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // ---------------------------------------------
  // 検索条件（フロント側の状態）
  // ---------------------------------------------
  const [filter, setFilter] = useState<FilterState>({
    keyword: "",
    categoryIds: [],
    price: [],
    age: [],
    facilities: [],
  });

  // keyword は上部入力欄から直接編集しやすいように、同じ state を使う
  const keyword = filter.keyword;

  // ---------------------------------------------
  // 一覧データ
  // ---------------------------------------------
  const [spots, setSpots] = useState<Spot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ---------------------------------------------
  // カテゴリ選択肢（暫定）
  // 次ステップで「カテゴリAPI（GET /categories）」を作ったら、
  // ここを fetchCategories() で取得した内容に置き換える
  // ---------------------------------------------
  const categoryOptions = useMemo(
    () => [
      { id: 1, name: "公園" },
      { id: 2, name: "動物園" },
      { id: 3, name: "水族館" },
    ],
    []
  );

  // ---------------------------------------------
  // 初期表示：条件なしで全件
  // ---------------------------------------------
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchSpots();
        setSpots(data);
      } catch (e: any) {
        setError(e?.message ?? "データ取得中にエラーが発生しました");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // ---------------------------------------------
  // 検索実行：サーバ側検索（GET /spots?....）
  // ---------------------------------------------
  const runSearch = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchSpots(filter);
      setSpots(data);
      setIsFilterOpen(false);
    } catch (e: any) {
      setError(e?.message ?? "検索中にエラーが発生しました");
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------------------------
  // リセット：検索条件を初期化 → 全件に戻す
  // ---------------------------------------------
  const resetSearch = async () => {
    const reset: FilterState = {
      keyword: "",
      categoryIds: [],
      price: [],
      age: [],
      facilities: [],
    };
    setFilter(reset);

    try {
      setLoading(true);
      setError(null);
      const data = await fetchSpots();
      setSpots(data);
      setIsFilterOpen(false);
    } catch (e: any) {
      setError(e?.message ?? "リセット中にエラーが発生しました");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-6 text-center text-gray-500">読み込み中...</div>;
  }

  if (error) {
    return <div className="p-6 text-center text-red-600">エラー: {error}</div>;
  }

  return (
    <div className="min-h-screen pb-24 font-sans">
      {/* HEADER / SEARCH AREA */}
      <header className="sticky top-0 z-10 bg-white/90 backdrop-blur border-b">
        <div className="max-w-6xl mx-auto p-4">
          <div className="flex flex-col md:flex-row gap-3">
            {/* keyword input */}
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <SearchIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl leading-5 bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all sm:text-sm"
                placeholder="エリア・住所・スポット名で検索"
                value={keyword}
                onChange={(e) =>
                  setFilter((prev) => ({
                    ...prev,
                    keyword: e.target.value,
                  }))
                }
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setIsFilterOpen(true)}
                className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-3 border border-gray-200 rounded-xl bg-white hover:bg-gray-50 active:bg-gray-100 transition-colors"
              >
                <FilterIcon className="w-5 h-5 text-gray-500" />
                絞り込み
              </button>

              {/* 検索（keywordだけでもOK） */}
              <button
                onClick={runSearch}
                className="flex-1 md:flex-none px-4 py-3 rounded-xl font-semibold text-white bg-orange-500 hover:bg-orange-600"
              >
                検索
              </button>

              {/* 将来：地図表示などに使う想定。現状はUIのみ */}
              <button
                className="hidden md:flex items-center justify-center gap-2 px-4 py-3 border border-gray-200 rounded-xl bg-white hover:bg-gray-50 active:bg-gray-100 transition-colors"
                disabled
                title="地図表示は今後実装予定"
              >
                <MapIcon className="w-5 h-5 text-gray-500" />
                地図
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* BODY */}
      <main className="max-w-6xl mx-auto p-4">
        {spots.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {spots.map((spot) => (
              <SpotCard key={spot.id} spot={spot} />
            ))}
          </div>
        ) : (
          <div className="py-20 text-center">
            <p className="text-gray-500">条件に一致するスポットが見つかりませんでした。</p>
          </div>
        )}
      </main>

      {/* Modals & Overlays */}
      <FilterModal
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        categoryOptions={categoryOptions}
        selectedCategoryIds={filter.categoryIds}
        setSelectedCategoryIds={(v) =>
          setFilter((prev) => ({
            ...prev,
            categoryIds: v,
          }))
        }
        selectedPrice={filter.price}
        setSelectedPrice={(v) =>
          setFilter((prev) => ({
            ...prev,
            price: v,
          }))
        }
        selectedAge={filter.age}
        setSelectedAge={(v) =>
          setFilter((prev) => ({
            ...prev,
            age: v,
          }))
        }
        selectedFacilities={filter.facilities}
        setSelectedFacilities={(v) =>
          setFilter((prev) => ({
            ...prev,
            facilities: v,
          }))
        }
        onClear={resetSearch}
        onApply={runSearch}
      />

      <Footer />
    </div>
  );
}