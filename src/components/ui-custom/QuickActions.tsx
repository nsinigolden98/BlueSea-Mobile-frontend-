import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { Smartphone, Wifi, Lightbulb, Tv } from 'lucide-react';

interface QuickAction {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  path: string;
  color: string;
}

const actions: QuickAction[] = [
  {
    id: 'airtime',
    label: 'Airtime',
    icon: Smartphone,
    path: '/airtime',
    color: 'text-sky-500 dark:text-sky-400',
  },
  {
    id: 'data',
    label: 'Data',
    icon: Wifi,
    path: '/data',
    color: 'text-emerald-500 dark:text-emerald-400',
  },
  {
    id: 'electricity',
    label: 'Electricity',
    icon: Lightbulb,
    path: '/light-bills',
    color: 'text-amber-500 dark:text-amber-400',
  },
  {
    id: 'tv',
    label: 'TV Subscription',
    icon: Tv,
    path: '/tv-subscription',
    color: 'text-indigo-500 dark:text-indigo-400',
  },
];

interface QuickActionsProps {
  className?: string;
}

export function QuickActions({ className }: QuickActionsProps) {
  const navigate = useNavigate();

  return (
    <div className={cn("flex items-center gap-3 md:gap-4", className)}>
      {actions.map((action) => {
        const Icon = action.icon;
        return (
          <button
            key={action.id}
            type="button"
            onClick={() => navigate(action.path)}
            className="group flex flex-col items-center gap-1.5 min-w-[64px] cursor-pointer focus:outline-none"
          >
            <div className="w-11 h-11 md:w-12 md:h-12 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs flex items-center justify-center transition-all duration-200 group-hover:border-sky-500/40 dark:group-hover:border-sky-400/40 group-hover:shadow-xs group-hover:-translate-y-0.5">
              <Icon className={cn("w-5 h-5 transition-transform group-hover:scale-105", action.color)} />
            </div>
            <span className="text-[10px] md:text-[11px] font-semibold text-slate-700 dark:text-slate-300 text-center leading-tight truncate max-w-[68px]">
              {action.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}