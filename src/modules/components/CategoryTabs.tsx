import React from 'react';
import { BLUECONNECT_CATEGORIES } from '@/modules/blueconnect/constants';

interface CategoryTabsProps {
  activeCategory: string;
  onSelectCategory: (category: string) => void;
}

export const CategoryTabs: React.FC<CategoryTabsProps> = ({ activeCategory, onSelectCategory }) => {
  return (
    <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1 -mx-4 px-4 sm:mx-0 sm:px-0">
      {BLUECONNECT_CATEGORIES.map((category: string) => {
        const isActive = activeCategory === category;
        return (
          <button
            key={category}
            onClick={() => onSelectCategory(category)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              isActive
                ? 'bg-sky-500 text-white shadow-xs'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200/80 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/10'
            }`}
          >
            {category}
          </button>
        );
      })}
    </div>
  );
};