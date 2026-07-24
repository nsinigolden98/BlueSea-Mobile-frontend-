import React from 'react';
import { ShieldCheck, ArrowUpRight } from 'lucide-react';
import type { Company } from '@/types/blueconnect';

interface CompanyCardProps {
  company: Company;
  onClick: (company: Company) => void;
}

export const CompanyCard: React.FC<CompanyCardProps> = ({ company, onClick }) => {
  return (
    <div
      onClick={() => onClick(company)}
      className="group relative bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-white/5 hover:border-sky-500/40 dark:hover:border-sky-500/40 rounded-3xl p-5 shadow-xs hover:shadow-xl hover:shadow-sky-500/5 transition-all duration-300 cursor-pointer flex flex-col justify-between active:scale-[0.98]"
    >
      <div>
        <div className="flex items-start justify-between mb-4">
          <div className="relative">
            <div className="w-14 h-14 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-white/10 p-2 overflow-hidden flex items-center justify-center shadow-inner">
              <img
                src={company.logo}
                alt={company.name}
                className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-110"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                    company.name
                  )}&background=0284c7&color=fff`;
                }}
              />
            </div>
            {company.verified && (
              <div className="absolute -bottom-1 -right-1 bg-sky-500 text-white rounded-full p-0.5 border-2 border-white dark:border-slate-900 shadow-sm">
                <ShieldCheck className="w-3 h-3 fill-white text-sky-500" />
              </div>
            )}
          </div>

          <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg">
            {company.category}
          </span>
        </div>

        <div>
          <div className="flex items-center gap-1.5">
            <h4 className="text-sm font-black text-slate-900 dark:text-white tracking-tight group-hover:text-sky-500 transition-colors">
              {company.name}
            </h4>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-1.5 line-clamp-2 leading-relaxed">
            {company.description}
          </p>
        </div>
      </div>

      <div className="mt-5 pt-3 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-sky-500">
        <span className="text-[10px] font-black uppercase tracking-widest">Connect Gateway</span>
        <div className="p-1.5 bg-sky-500/10 rounded-xl group-hover:bg-sky-500 group-hover:text-white transition-all">
          <ArrowUpRight className="w-3.5 h-3.5" />
        </div>
      </div>
    </div>
  );
};