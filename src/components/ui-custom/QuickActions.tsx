import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { Smartphone, Wifi, ShieldCheckIcon, Plane, Gift, Lightbulb } from 'lucide-react';

interface QuickAction {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  path: string;
} 

const actions: QuickAction[] = [
  {
    id: 'airtime',
    label: 'Buy Airtime',
    icon: Smartphone,
    path: '/airtime'
  },
  {
    id: 'data',
    label: 'Buy Data',
    icon: Wifi,
    path: '/data'
  },
  {
    id: 'pay-roll',
    label: 'Pay Roll',
    icon: ShieldCheckIcon,
    path: '/payroll-pro'
  },
  {
    id: 'bills',
    label: 'Light Bills',
    icon: Lightbulb,
    path: '/light-bills'
  },
  {
    id: 'flight',
    label: 'Flight',
    icon: Plane,
    path: '/flights'
  },
  {
    id: 'gift',
    label: 'Gift Card',
    icon: Gift,
    path: '/gift-cards'
  },
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
              "group flex flex-col items-center gap-2 min-w-[76px]", 
              className
            )}
          >
            <div className="w-14 h-14 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 flex items-center justify-center transition-all duration-200 group-hover:border-sky-500/40 dark:group-hover:border-sky-400/40 group-hover:bg-sky-50/30 dark:group-hover:bg-sky-950/20 group-hover:-translate-y-0.5 shadow-sm">
              <Icon className="w-5 h-5 text-slate-600 dark:text-slate-400 group-hover:text-sky-500 dark:group-hover:text-sky-400 transition-colors" />
            </div>
            <span className="text-[11px] font-medium text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-200 transition-colors text-center truncate w-full px-1">
              {action.label}
            </span>
          </button>
        );
      })}
    </>
  );
}
