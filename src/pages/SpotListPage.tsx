import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // ← 追加
import type { Category, FilterState, Spot } from "../types";
import { fetchSpots } from "../api/spots";
import { fetchCategories } from "../api/categories";

import SpotCard from "../components/SpotCard";
import { FilterModal } from "../components/FilterModal";
import { SearchIcon, FilterIcon, MapIcon } from "../components/Icons";

// ---------------------------------------------
// unknown を安全に string にするユーティリティ
// ---------------------------------------------
function getErrorMessage(e: unknown, fallback: string) {
  if (e instanceof Error) return e.message;
  if (typeof e === "string") return e;
  return fallback;
}

export default function SpotListPage() {
  const navigate = useNavigate(); // ← 追加（遷移用）

  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const [filter, setFilter] = useState<FilterState>({
    keyword: "",
    categoryIds: [],
    price: [],
    age: [],
    facilities: [],
  });

  const [spots, setSpots] = useState<Spot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryError, setCategoryError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);

        const [spotsResult, categoriesResult] = await Promise.allSettled([
          fetchSpots(),
          fetchCategories(),
        ]);

        if (spotsResult.status === "fulfilled") {
          setSpots(spotsResult.value);
        } else {
          setError(
            getErrorMessage(
              spotsResult.reason,
              "スポット取得中にエラーが発生しました"
            )
          );
        }

        if (categoriesResult.status === "fulfilled") {
          setCategories(categoriesResult.value);
          setCategoryError(null);
        } else {
          setCategoryError(
            getErrorMessage(categoriesResult.reason, "カテゴリ取得に失敗しました")
          );
          setCategories([]);
        }
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const runSearch = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchSpots(filter);
      setSpots(data);
      setIsFilterOpen(false);
    } catch (e: unknown) {
      setError(getErrorMessage(e, "検索中にエラーが発生しました"));
    } finally {
      setLoading(false);
    }
  };

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
    } catch (e: unknown) {
      setError(getErrorMessage(e, "リセット中にエラーが発生しました"));
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------------------------
  // 詳細へ遷移（SpotCard から呼ばれる）
  // ---------------------------------------------
  const goDetail = (id: number) => {
    navigate(`/spots/${id}`);
  };

  if (loading) {
    return <div className="py-10 text-center text-gray-500">読み込み中...</div>;
  }

  if (error) {
    return <div className="py-10 text-center text-red-600">エラー: {error}</div>;
  }

  return (
    <div className="font-sans">
      <header className="sticky top-0 z-10">
        <div className="py-4">
          <div className="rounded-2xl bg-white/90 backdrop-blur border border-emerald-200 shadow-md ring-1 ring-emerald-100/60 px-4 md:px-6 py-4">
            <div className="flex flex-col md:flex-row gap-3">
              <div className="relative flex-grow">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <SearchIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-3 py-3 border border-emerald-200 rounded-xl leading-5 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-300 transition-all sm:text-sm"
                  placeholder="エリア・住所・スポット名で検索"
                  value={filter.keyword}
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
                  className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-3 border border-emerald-200 rounded-xl bg-white hover:bg-emerald-50 active:bg-emerald-100 transition-colors shadow-sm"
                >
                  <FilterIcon className="w-5 h-5 text-emerald-700" />
                  絞り込み
                </button>

                <button
                  onClick={runSearch}
                  className="flex-1 md:flex-none px-4 py-3 rounded-xl font-semibold text-white bg-orange-500 hover:bg-orange-600 transition-colors shadow-sm"
                >
                  検索
                </button>

                <button
                  className="hidden md:flex items-center justify-center gap-2 px-4 py-3 border border-emerald-200 rounded-xl bg-white hover:bg-emerald-50 active:bg-emerald-100 transition-colors shadow-sm"
                  disabled
                  title="地図表示は今後実装予定"
                >
                  <MapIcon className="w-5 h-5 text-emerald-700" />
                  地図
                </button>
              </div>
            </div>

            {categoryError && (
              <div className="mt-2 text-xs text-amber-700">
                ※カテゴリ一覧の取得に失敗しました（絞り込みのカテゴリが表示されません）
              </div>
            )}

            <div className="mt-4 pt-4 border-t border-emerald-200">
              <div className="flex items-end justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold text-gray-900">
                    スポット一覧
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    見つけよう、家族で行けるおでかけ先
                  </div>
                </div>
                <div className="text-xs text-gray-500">{spots.length}件</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="py-6">
        {spots.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {spots.map((spot) => (
              <SpotCard
                key={spot.id}
                spot={spot}
                onClickDetail={goDetail} // ← 追加：これで詳細へ行ける
              />
            ))}
          </div>
        ) : (
          <div className="py-20 text-center">
            <p className="text-gray-500">
              条件に一致するスポットが見つかりませんでした。
            </p>
          </div>
        )}
      </div>

      <FilterModal
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        categoryOptions={categories}
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
    </div>
  );
}
