import type { LegalMetadata } from '@/types/legal';
import { BookOpen, Clock, Globe, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LegalOverviewCardsProps {
  metadata: LegalMetadata;
  totalSectionsCount: number;
}

export function LegalOverviewCards({ metadata, totalSectionsCount }: LegalOverviewCardsProps) {
  const stats = [
    {
      icon: <BookOpen className="w-5 h-5 text-sky-500" />,
      label: 'Total Chapters',
      value: `${totalSectionsCount} Sections`,
      colorBg: 'bg-sky-100 dark:bg-sky-900/30',
    },
    {
      icon: <Clock className="w-5 h-5 text-emerald-500" />,
      label: 'Estimated Reading',
      value: metadata.estimatedReadingTime,
      colorBg: 'bg-emerald-100 dark:bg-emerald-900/30',
    },
    {
      icon: <Globe className="w-5 h-5 text-purple-500" />,
      label: 'Applicable Region',
      value: metadata.applicableRegion,
      colorBg: 'bg-purple-100 dark:bg-purple-900/30',
    },
    {
      icon: <Shield className="w-5 h-5 text-amber-500" />,
      label: 'Governance Framework',
      value: 'CBN & PCI-DSS',
      colorBg: 'bg-amber-100 dark:bg-amber-900/30',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, idx) => (
        <div
          key={idx}
          className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-4 transition-all duration-200 hover:border-slate-200 dark:hover:border-slate-700 hover:shadow-sm"
        >
          <div className="flex items-center gap-3">
            <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center shrink-0', stat.colorBg)}>
              {stat.icon}
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{stat.label}</p>
              <p className="text-base font-bold text-slate-800 dark:text-white mt-0.5">{stat.value}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}