import React from "react";
import type { AgeGroup, FacilityKey, PriceType } from "../types";

interface CategoryOption {
  id: number;
  name: string;
}

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;

  // 現在の選択状態（親コンポーネントで保持）
  categoryOptions: CategoryOption[];
  selectedCategoryIds: number[];
  setSelectedCategoryIds: (v: number[]) => void;

  selectedPrice: PriceType[];
  setSelectedPrice: (v: PriceType[]) => void;

  selectedAge: AgeGroup[];
  setSelectedAge: (v: AgeGroup[]) => void;

  selectedFacilities: FacilityKey[];
  setSelectedFacilities: (v: FacilityKey[]) => void;

  // ボタン動作
  onClear: () => void; // クリア（＝リセット）
  onApply: () => void; // この条件で検索
}

const PRICE_OPTIONS: { value: PriceType; label: string }[] = [
  { value: "FREE", label: "無料" },
  { value: "UNDER_1000", label: "1000円以内" },
  { value: "UNDER_2000", label: "2000円以内" },
  { value: "OVER_2000", label: "2000円超" },
];

const AGE_OPTIONS: { value: AgeGroup; label: string }[] = [
  { value: "ALL", label: "全年齢" },
  { value: "PRESCHOOL", label: "未就学児" },
  { value: "ELE_LOW", label: "小学校低学年" },
  { value: "ELE_HIGH", label: "小学校高学年" },
  { value: "JUNIOR_HIGH", label: "中学生" },
];

const FACILITY_OPTIONS: { value: FacilityKey; label: string }[] = [
  { value: "diaper", label: "オムツ替え" },
  { value: "stroller", label: "ベビーカーOK" },
  { value: "playground", label: "遊具" },
  { value: "athletics", label: "アスレチック" },
  { value: "water", label: "水遊び" },
  { value: "indoor", label: "屋内" },
];

export const FilterModal: React.FC<FilterModalProps> = ({
  isOpen,
  onClose,
  categoryOptions,
  selectedCategoryIds,
  setSelectedCategoryIds,
  selectedPrice,
  setSelectedPrice,
  selectedAge,
  setSelectedAge,
  selectedFacilities,
  setSelectedFacilities,
  onClear,
  onApply,
}) => {
  if (!isOpen) return null;

  // checkbox toggle（number）
  const toggleNumber = (arr: number[], v: number) =>
    arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v];

  // checkbox toggle（string union）
  const toggleString = <T extends string>(arr: T[], v: T) =>
    arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v];

  return (
    // pointer-events-none は「モーダル内をクリックできない」状態になるので外す
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 transition-opacity"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="relative w-full sm:max-w-lg bg-white rounded-t-2xl sm:rounded-2xl p-5 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">絞り込み</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800"
            aria-label="閉じる"
          >
            ✕
          </button>
        </div>

        {/* カテゴリ */}
        <div className="mb-5">
          <div className="font-semibold mb-2">カテゴリ</div>
          <div className="grid grid-cols-2 gap-2">
            {categoryOptions.map((c) => (
              <label key={c.id} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={selectedCategoryIds.includes(c.id)}
                  onChange={() =>
                    setSelectedCategoryIds(toggleNumber(selectedCategoryIds, c.id))
                  }
                />
                {c.name}
              </label>
            ))}
          </div>
        </div>

        {/* 予算 */}
        <div className="mb-5">
          <div className="font-semibold mb-2">予算</div>
          <div className="grid grid-cols-2 gap-2">
            {PRICE_OPTIONS.map((p) => (
              <label key={p.value} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={selectedPrice.includes(p.value)}
                  onChange={() => setSelectedPrice(toggleString(selectedPrice, p.value))}
                />
                {p.label}
              </label>
            ))}
          </div>
        </div>

        {/* 対象年齢 */}
        <div className="mb-5">
          <div className="font-semibold mb-2">対象年齢</div>
          <div className="grid grid-cols-2 gap-2">
            {AGE_OPTIONS.map((a) => (
              <label key={a.value} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={selectedAge.includes(a.value)}
                  onChange={() => setSelectedAge(toggleString(selectedAge, a.value))}
                />
                {a.label}
              </label>
            ))}
          </div>
        </div>

        {/* 設備 */}
        <div className="mb-6">
          <div className="font-semibold mb-2">設備</div>
          <div className="grid grid-cols-2 gap-2">
            {FACILITY_OPTIONS.map((f) => (
              <label key={f.value} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={selectedFacilities.includes(f.value)}
                  onChange={() =>
                    setSelectedFacilities(toggleString(selectedFacilities, f.value))
                  }
                />
                {f.label}
              </label>
            ))}
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-2">
          <button
            onClick={onClear}
            className="flex-1 py-3 px-4 rounded-lg font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            クリア
          </button>
          <button
            onClick={onApply}
            className="flex-[2] py-3 px-4 rounded-lg font-semibold text-white bg-orange-500 hover:bg-orange-600 shadow-lg shadow-orange-200 transition-all"
          >
            この条件で検索
          </button>
        </div>
      </div>
    </div>
  );
};
