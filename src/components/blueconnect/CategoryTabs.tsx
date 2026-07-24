import React from 'react';
import { BLUECONNECT_CATEGORIES } from '@/constants/blueconnect';

interface CategoryTabsProps {
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
}

export const CategoryTabs: React.FC<CategoryTabsProps> = ({
  selectedCategory,
  onSelectCategory
}) => {
  return (
    <div className="overflow-x-auto scrollbar-none -mx-2 px-2 py-1">
      <div className="flex gap-2 w-max">
        {BLUECONNECT_CATEGORIES.map((cat) => {
          const isActive = selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => onSelectCategory(cat)}
              className={`px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all duration-200 cursor-pointer active:scale-95 ${
                isActive
                  ? 'bg-sky-500 text-white shadow-md shadow-sky-500/20'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200/80 dark:border-white/5 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>
    </div>
  );
};