import React, { useState } from 'react';
import type { Spot } from '../types';
import { StarIcon, HeartIcon } from './Icons';

interface SpotCardProps {
  spot: Spot;
}

export const SpotCard: React.FC<SpotCardProps> = ({ spot }) => {
  const [isFavorite, setIsFavorite] = useState(false);

  // priceCategory 用のスタイル
  const getPriceTagStyle = (category: string) => {
    switch (category) {
      case 'free':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'cheap':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getPriceLabel = (category: string) => {
    switch (category) {
      case 'free':
        return '無料';
      case 'cheap':
        return '〜1000円';
      default:
        return '1000円〜';
    }
  };

  // tags が undefined の場合は空配列にしておく（.map で落ちないように）
  const tags = spot.tags ?? [];

  // facilities も念のため安全に読む（undefined のときは false 扱い）
  const hasToilet = spot.facilities?.toilet ?? false;
  const hasParking = spot.facilities?.parking ?? false;
  const hasDiaper = spot.facilities?.diaper ?? false;

  return (
    <div className="group bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-300 flex flex-col h-full">
      {/* Image Area */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={spot.image}
          alt={spot.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-0 right-0 p-2">
          <button
            onClick={(e) => {
              e.preventDefault();
              setIsFavorite(!isFavorite);
            }}
            className="bg-white/90 p-2 rounded-full shadow-sm hover:bg-white transition-colors"
            aria-label="お気に入りに追加"
          >
            <HeartIcon
              className={`w-5 h-5 ${isFavorite ? 'text-red-500' : 'text-gray-400'}`}
              filled={isFavorite}
            />
          </button>
        </div>
        <div className="absolute bottom-2 left-2">
          <span
            className={`px-2 py-1 rounded-md text-xs font-bold border ${getPriceTagStyle(
              spot.priceCategory,
            )}`}
          >
            {getPriceLabel(spot.priceCategory)}
          </span>
        </div>
      </div>

      {/* Content Area */}
      <div className="p-4 flex flex-col flex-grow">
        {/* Rating & Location */}
        <div className="flex items-center text-xs text-gray-500 mb-1">
          <span className="mr-2 text-gray-600 truncate">{spot.address}</span>
          <div className="flex items-center ml-auto">
            <StarIcon className="w-4 h-4 text-accent" filled />
            <span className="font-bold text-gray-800 ml-1">{spot.rating}</span>
            <span className="text-gray-400 ml-1">({spot.reviewCount})</span>
          </div>
        </div>

        {/* Title */}
        <h2 className="text-lg font-bold text-gray-900 mb-2 leading-tight group-hover:text-primary transition-colors cursor-pointer">
          {spot.name}
        </h2>

        {/* Tags */}
        <div className="flex flex-wrap gap-1 mb-4">
          {tags.map((tag) => (
            <span
              key={tag}
              className="text-xs px-2 py-1 bg-gray-50 text-gray-600 rounded border border-gray-100"
            >
              #{tag}
            </span>
          ))}
        </div>

        <div className="mt-auto pt-3 border-t border-gray-100">
          {/* Facilities Icons */}
          <div className="flex items-center justify-start gap-4 text-xs text-gray-600">
            <div
              className={`flex items-center gap-1 ${
                hasToilet ? 'text-teal-600' : 'text-gray-300 line-through'
              }`}
            >
              <span>🚻</span>
              <span className="hidden sm:inline">トイレ</span>
            </div>
            <div
              className={`flex items-center gap-1 ${
                hasParking ? 'text-blue-600' : 'text-gray-300 line-through'
              }`}
            >
              <span>🅿️</span>
              <span className="hidden sm:inline">駐車場</span>
            </div>
            <div
              className={`flex items-center gap-1 ${
                hasDiaper ? 'text-pink-600' : 'text-gray-300 line-through'
              }`}
            >
              <span>👶</span>
              <span className="hidden sm:inline">オムツ</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
