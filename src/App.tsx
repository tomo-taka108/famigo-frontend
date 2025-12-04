import React, { useState } from 'react';
import { MOCK_SPOTS } from './constants';
import { SpotCard } from './components/SpotCard';
import { FilterModal } from './components/FilterModal';
import { Footer } from './components/Footer';
import { SearchIcon, FilterIcon, MapIcon } from './components/Icons';

export default function App() {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [keyword, setKeyword] = useState('');

  // Simple client-side search simulation
  const filteredSpots = MOCK_SPOTS.filter(spot => 
    spot.name.includes(keyword) || spot.address.includes(keyword)
  );

  return (
    <div className="min-h-screen pb-24 font-sans">
      {/* 
        HEADER / SEARCH AREA 
        Sticky header for easy access to search tools
      */}
      <header className="sticky top-0 bg-white z-30 shadow-sm border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 py-3">
          {/* Top Row: Title (Mobile only mostly) */}
          <div className="flex items-center justify-between mb-3 md:hidden">
            <h1 className="text-xl font-bold text-primary tracking-tight">Famigo</h1>
          </div>

          <div className="flex flex-col md:flex-row gap-3">
            {/* Search Input */}
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <SearchIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl leading-5 bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all sm:text-sm"
                placeholder="エリア・スポット名で検索"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
              />
            </div>

            {/* Action Buttons Row */}
            <div className="flex gap-2">
              <button 
                onClick={() => setIsFilterOpen(true)}
                className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-3 border border-gray-200 rounded-xl text-sm font-bold text-gray-700 bg-white hover:bg-gray-50 active:bg-gray-100 transition-colors"
              >
                <FilterIcon className="w-5 h-5 text-gray-500" />
                絞り込み
              </button>
              
              <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-3 border border-gray-200 rounded-xl text-sm font-bold text-gray-700 bg-white hover:bg-gray-50 active:bg-gray-100 transition-colors">
                <MapIcon className="w-5 h-5 text-secondary" />
                マップ表示
              </button>

              <button className="flex-none px-6 py-3 bg-primary text-white rounded-xl font-bold shadow-md shadow-orange-200 hover:bg-orange-600 transition-all">
                検索
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* 
        MAIN CONTENT AREA 
      */}
      <main className="max-w-4xl mx-auto px-4 py-6">
        
        {/* Results Header */}
        <div className="flex items-baseline justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-800">
              おすすめのスポット 
              <span className="ml-2 text-sm font-normal text-gray-500">{filteredSpots.length}件</span>
            </h2>
            <select className="text-sm border-none bg-transparent text-gray-600 font-medium focus:ring-0 cursor-pointer">
                <option>おすすめ順</option>
                <option>近い順</option>
                <option>料金が安い順</option>
            </select>
        </div>

        {/* Spot Grid */}
        {filteredSpots.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredSpots.map((spot) => (
              <SpotCard key={spot.id} spot={spot} />
            ))}
          </div>
        ) : (
          <div className="py-20 text-center">
            <p className="text-gray-500">条件に一致するスポットが見つかりませんでした。</p>
            <button 
                onClick={() => setKeyword('')}
                className="mt-4 text-primary font-bold underline"
            >
                条件をクリアする
            </button>
          </div>
        )}

        {/* Pagination (Simple Visual) */}
        {filteredSpots.length > 0 && (
            <div className="mt-10 flex justify-center gap-2">
                <button className="w-10 h-10 flex items-center justify-center rounded-lg bg-primary text-white font-bold shadow-sm">1</button>
                <button className="w-10 h-10 flex items-center justify-center rounded-lg bg-white border border-gray-200 text-gray-600 hover:bg-gray-50">2</button>
                <button className="w-10 h-10 flex items-center justify-center rounded-lg bg-white border border-gray-200 text-gray-600 hover:bg-gray-50">3</button>
                <span className="flex items-end px-2 text-gray-400">...</span>
            </div>
        )}

      </main>

      {/* Modals & Overlays */}
      <FilterModal 
        isOpen={isFilterOpen} 
        onClose={() => setIsFilterOpen(false)}
        onApply={() => setIsFilterOpen(false)}
      />

      <Footer />
    </div>
  );
}