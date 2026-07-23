import React from 'react';
import { CompanyCard } from './CompanyCard';
import { Company } from '../types';

interface CompanyGridProps {
  companies: Company[];
  onSelectCompany: (company: Company) => void;
  isLoading?: boolean;
}

export const CompanyGrid: React.FC<CompanyGridProps> = ({ companies, onSelectCompany, isLoading }) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-16 bg-slate-200/60 dark:bg-slate-800/60 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (companies.length === 0) {
    return (
      <div className="text-center py-12 px-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-white/5">
        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
          No organizations found matching your request.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {companies.map((company) => (
        <CompanyCard key={company.id} company={company} onClick={onSelectCompany} />
      ))}
    </div>
  );
};