import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { Smartphone, Wifi, Lightbulb, Gift, Tv } from 'lucide-react';

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
    color: 'text-sky-500'
  },
  {
    id: 'data',
    label: 'Data',
    icon: Wifi,
    path: '/data',
    color: 'text-emerald-500'
  },
  {
    id: 'electricity',
    label: 'Electricity Bills',
    icon: Lightbulb,
    path: '/light-bills',
    color: 'text-amber-500'
  },
  {
    id: 'gift',
    label: 'Gift Cards',
    icon: Gift,
    path: '/gift-cards',
    color: 'text-pink-500'
  },
  {
    id: 'tv',
    label: 'TV Subscription',
    icon: Tv,
    path: '/tv-subscription',
    color: 'text-indigo-500'
  }
];

interface QuickActionsProps {
  className?: string;
}

export function QuickActions({ className }: QuickActionsProps) {
  const navigate = useNavigate();

  return (
    <>
      {actions.map((action) => {
        const Icon = action.icon;
        return (
          <button
            key={action.id}
            onClick={() => navigate(action.path)}
            className={cn(
              "group flex flex-col items-center gap-2 min-w-[72px]", 
              className
            )}
          >
            <div className="w-14 h-14 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/5 flex items-center justify-center transition-all duration-200 hover:border-sky-500/30 dark:hover:border-sky-400/30 hover:-translate-y-0.5">
              <Icon className={cn("w-6 h-6", action.color)} />
            </div>
            <span className="text-[10px] font-semibold text-slate-700 dark:text-slate-300">
              {action.label}
            </span>
          </button>
        );
      })}
    </>
  );
}
