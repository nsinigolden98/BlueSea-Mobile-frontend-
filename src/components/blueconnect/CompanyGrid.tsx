import React from 'react';
import type { Company } from '@/types/blueconnect';
import { CompanyCard } from './CompanyCard';
import { Building2 } from 'lucide-react';

interface CompanyGridProps {
  companies: Company[];
  onSelectCompany: (company: Company) => void;
  loading?: boolean;
}

export const CompanyGrid: React.FC<CompanyGridProps> = ({
  companies,
  onSelectCompany,
  loading = false
}) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((idx) => (
          <div
            key={idx}
            className="h-48 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/60 dark:border-white/5 p-5 animate-pulse flex flex-col justify-between"
          >
            <div className="flex justify-between items-start">
              <div className="w-14 h-14 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
              <div className="w-16 h-4 bg-slate-200 dark:bg-slate-800 rounded-lg" />
            </div>
            <div className="space-y-2">
              <div className="w-1/2 h-4 bg-slate-200 dark:bg-slate-800 rounded" />
              <div className="w-full h-3 bg-slate-200 dark:bg-slate-800 rounded" />
            </div>
            <div className="w-full h-8 bg-slate-100 dark:bg-slate-800/50 rounded-xl" />
          </div>
        ))}
      </div>
    );
  }

  if (companies.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-white/5 rounded-3xl p-12 text-center space-y-4">
        <div className="w-16 h-16 bg-sky-500/10 rounded-2xl flex items-center justify-center mx-auto text-sky-500">
          <Building2 className="w-8 h-8" />
        </div>
        <div>
          <h4 className="text-base font-black text-slate-800 dark:text-slate-200">No Partners Found</h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Try adjusting your search criteria or explore other categories.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {companies.map((company) => (
        <CompanyCard key={company.id} company={company} onClick={onSelectCompany} />
      ))}
    </div>
  );
};