import React from 'react';
import { cn } from '@/lib/utils';

export const EVENT_CATEGORIES = [
  'Music', 'Comedy', 'Conference', 'Technology', 'Business', 
  'Church', 'Seminar', 'Workshop', 'Festival', 'Sports', 
  'Education', 'Fashion', 'Networking', 'Health', 'Charity', 
  'Government', 'Entertainment'
] as const;

interface MarketplaceCategoriesProps {
  activeCategory: string;
  setActiveCategory: (category: string) => void;
}

export const MarketplaceCategories: React.FC<MarketplaceCategoriesProps> = ({
  activeCategory,
  setActiveCategory,
}) => {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <button
        onClick={() => setActiveCategory('All')}
        className={cn(
          "px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all shrink-0",
          activeCategory === 'All' 
            ? "bg-slate-800 text-white dark:bg-white dark:text-slate-900 shadow-md" 
            : "bg-white dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 border border-slate-100 dark:border-slate-800 hover:bg-slate-50"
        )}
      >
        All Categories
      </button>
      {EVENT_CATEGORIES.map((cat) => (
        <button
          key={cat}
          onClick={() => setActiveCategory(cat)}
          className={cn(
            "px-4 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all shrink-0",
            activeCategory === cat 
              ? "bg-sky-500 text-white font-bold shadow-md shadow-sky-500/20" 
              : "bg-white dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 border border-slate-100 dark:border-slate-800 hover:bg-slate-50"
          )}
        >
          {cat}
        </button>
      ))}
    </div>
  );
};