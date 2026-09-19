// src/components/feed/FeedFilterBar.tsx
'use client';

import React, { useState } from 'react';

export type FeedCategory = 'ALL' | 'ARTICLE' | 'QA' | 'EVENT' | 'FOLLOWING';
export type FeedSort = 'LATEST' | 'POPULAR';

interface FeedFilterBarProps {
  onFilterChange?: (category: FeedCategory, sort: FeedSort) => void;
}

export default function FeedFilterBar({ onFilterChange }: FeedFilterBarProps) {
  const [activeCategory, setActiveCategory] = useState<FeedCategory>('ALL');
  const [activeSort, setActiveSort] = useState<FeedSort>('LATEST');

  const categories = [
    { id: 'ALL', label: 'সব', icon: '📚' },
    { id: 'ARTICLE', label: 'লেখা', icon: '✍️' },
    { id: 'QA', label: 'প্রশ্নোত্তর', icon: '❓' },
    { id: 'EVENT', label: 'কার্যক্রম', icon: '📅' },
    { id: 'FOLLOWING', label: 'অনুসরণ', icon: '👥' },
  ];

  const handleCategorySelect = (catId: FeedCategory) => {
    setActiveCategory(catId);
    onFilterChange?.(catId, activeSort);
  };

  const handleSortSelect = (sortId: FeedSort) => {
    setActiveSort(sortId);
    onFilterChange?.(activeCategory, sortId);
  };

  return (
    <div className="w-full flex items-center justify-between gap-1 sm:gap-1.5 overflow-x-auto no-scrollbar py-1 mb-2.5 select-none font-kalpurush">

      {/* বাম পাশ: ক্যাটাগরি বাটনসমূহ (হুবহু একই ৮px বক্স স্টাইল) */}
      <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
        {categories.map((cat) => {
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => handleCategorySelect(cat.id as FeedCategory)}
              className={`px-2.5 sm:px-3 py-1.5 rounded-[8px] text-xs font-bold transition-all flex items-center gap-1.5 border whitespace-nowrap shadow-2xs ${
                isActive
                  ? 'bg-[#006A4E] text-white border-[#006A4E]'
                  : 'bg-white text-[#4B4C4F] border-[#CED0D4] hover:bg-[#F0F2F5] hover:text-[#050505]'
              }`}
            >
              <span className="text-sm leading-none">{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* মাঝের সূক্ষ্ম ডিভাইডার */}
      <div className="h-5 w-[1px] bg-[#CED0D4] shrink-0 mx-0.5 sm:mx-1" />

      {/* ডান পাশ: সর্বশেষ ও জনপ্রিয় (একই লাইনে, হুবহু একই ডিজাইনে) */}
      <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
        <button
          type="button"
          onClick={() => handleSortSelect('LATEST')}
          className={`px-2.5 sm:px-3 py-1.5 rounded-[8px] text-xs font-bold transition-all flex items-center gap-1.5 border whitespace-nowrap shadow-2xs ${
            activeSort === 'LATEST'
              ? 'bg-[#006A4E] text-white border-[#006A4E]'
              : 'bg-white text-[#4B4C4F] border-[#CED0D4] hover:bg-[#F0F2F5] hover:text-[#050505]'
          }`}
        >
          <span className="text-sm leading-none">🕒</span>
          <span>সর্বশেষ</span>
        </button>

        <button
          type="button"
          onClick={() => handleSortSelect('POPULAR')}
          className={`px-2.5 sm:px-3 py-1.5 rounded-[8px] text-xs font-bold transition-all flex items-center gap-1.5 border whitespace-nowrap shadow-2xs ${
            activeSort === 'POPULAR'
              ? 'bg-[#006A4E] text-white border-[#006A4E]'
              : 'bg-white text-[#4B4C4F] border-[#CED0D4] hover:bg-[#F0F2F5] hover:text-[#050505]'
          }`}
        >
          <span className="text-sm leading-none">🔥</span>
          <span>জনপ্রিয়</span>
        </button>
      </div>

    </div>
  );
}
