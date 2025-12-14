import React, { useState } from "react";
import { Link } from "react-router-dom";
import type { Spot } from "../types";
import { HeartIcon } from "./Icons";

interface SpotCardProps {
  spot: Spot;
}

export const SpotCard: React.FC<SpotCardProps> = ({ spot }) => {
  const [isFavorite, setIsFavorite] = useState(false);

  // ▼ 表示用：設備フラグ → ラベル配列に変換
  const facilityLabels: string[] = [];
  if (spot.diaperChanging) facilityLabels.push("オムツ替え");
  if (spot.strollerOk) facilityLabels.push("ベビーカーOK");
  if (spot.playground) facilityLabels.push("遊具");
  if (spot.athletics) facilityLabels.push("アスレチック");
  if (spot.waterPlay) facilityLabels.push("水遊び");
  if (spot.indoor) facilityLabels.push("屋内");

  return (
    <Link to={`/spots/${spot.id}`} className="block">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
        {/* 画像は現状 backend から返していないため、カード上部はテキスト中心にする */}
        <div className="p-4">
          {/* Header */}
          <div className="flex justify-between items-start gap-3">
            <div className="min-w-0">
              <div className="text-xs text-gray-500 truncate">{spot.address}</div>
              <h3 className="text-lg font-bold text-gray-900 truncate">{spot.name}</h3>

              <div className="flex flex-wrap gap-2 mt-2">
                <span className="text-xs px-2 py-1 bg-gray-50 text-gray-700 rounded border border-gray-200">
                  {spot.categoryName}
                </span>
                <span className="text-xs px-2 py-1 bg-gray-50 text-gray-700 rounded border border-gray-200">
                  {spot.priceType}
                </span>
                <span className="text-xs px-2 py-1 bg-gray-50 text-gray-700 rounded border border-gray-200">
                  {spot.targetAge}
                </span>
              </div>
            </div>

            {/* お気に入り（※現状はローカル状態のみ。将来的に favorites API と連携予定） */}
            <button
              onClick={(e) => {
                e.preventDefault();
                setIsFavorite(!isFavorite);
              }}
              className="p-2 rounded-full bg-white/80 hover:bg-white border border-gray-200 shadow-sm"
              aria-label="お気に入り"
            >
              <HeartIcon
                className={`w-5 h-5 ${isFavorite ? "text-red-500" : "text-gray-400"}`}
              />
            </button>
          </div>

          {/* Facilities */}
          {facilityLabels.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {facilityLabels.map((label) => (
                <span
                  key={label}
                  className="text-xs px-2 py-1 bg-gray-50 text-gray-600 rounded border border-gray-100"
                >
                  {label}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};
