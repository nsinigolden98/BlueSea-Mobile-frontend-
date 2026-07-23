import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { Company } from '../types';

interface CompanyCardProps {
  company: Company;
  onClick: (company: Company) => void;
  className?: string;
}

export const CompanyCard: React.FC<CompanyCardProps> = ({ company, onClick, className = '' }) => {
  return (
    <div
      onClick={() => onClick(company)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick(company)}
      className={`p-3.5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-white/5 rounded-xl hover:border-sky-500/30 dark:hover:border-sky-400/30 transition-all cursor-pointer group active:scale-[0.98] shadow-xs flex items-center gap-3.5 select-none ${className}`}
    >
      <div className={`w-10 h-10 shrink-0 rounded-xl flex items-center justify-center font-black text-xs border border-slate-100 dark:border-white/5 ${company.logoBg}`}>
        {company.logoText}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate leading-tight">
            {company.name}
          </p>
          {company.isVerified && (
            <CheckCircle2 className="w-3.5 h-3.5 text-sky-500 shrink-0 fill-sky-500/10" />
          )}
        </div>
        <p className="text-[10px] font-medium text-slate-400 dark:text-slate-500 truncate mt-0.5">
          {company.category}
        </p>
      </div>
    </div>
  );
};