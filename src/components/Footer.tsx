import React from 'react';
import { SearchIcon, HeartIcon, UserIcon } from './Icons';

export const Footer = () => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-2 px-6 pb-safe z-40">
      <div className="max-w-md mx-auto flex justify-around items-center">
        <button className="flex flex-col items-center gap-1 text-primary group">
          <SearchIcon className="w-6 h-6 group-hover:scale-110 transition-transform" />
          <span className="text-[10px] font-bold">検索</span>
        </button>

        <button className="flex flex-col items-center gap-1 text-gray-400 hover:text-gray-600 group transition-colors">
          <HeartIcon className="w-6 h-6 group-hover:scale-110 transition-transform" />
          <span className="text-[10px] font-medium">お気に入り</span>
        </button>

        <button className="flex flex-col items-center gap-1 text-gray-400 hover:text-gray-600 group transition-colors">
          <UserIcon className="w-6 h-6 group-hover:scale-110 transition-transform" />
          <span className="text-[10px] font-medium">マイページ</span>
        </button>
      </div>
    </nav>
  );
};