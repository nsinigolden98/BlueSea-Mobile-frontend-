import React from 'react';
import { Wallet, Smartphone, Zap, Tv, Ticket, Shield, HelpCircle } from 'lucide-react';

interface QuickHelpCategory {
  id: string;
  label: string;
  icon: React.ElementType;
}

const CATEGORIES: QuickHelpCategory[] = [
  { id: 'wallet', label: 'Wallet & Payments', icon: Wallet },
  { id: 'airtime', label: 'Airtime & Data', icon: Smartphone },
  { id: 'electricity', label: 'Electricity', icon: Zap },
  { id: 'cable', label: 'Cable TV', icon: Tv },
  { id: 'tickets', label: 'Tickets & Events', icon: Ticket },
  { id: 'account', label: 'Account & Security', icon: Shield },
  { id: 'other', label: 'Other Issues', icon: HelpCircle },
];

interface SupportQuickActionsProps {
  onSelectCategory: (categoryLabel: string) => void;
}

export const SupportQuickActions: React.FC<SupportQuickActionsProps> = ({ onSelectCategory }) => {
  return (
    <div className="mb-6">
      <h3 className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">
        Quick Help Guidance
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.label)}
              type="button"
              className="flex flex-col items-center justify-center p-3 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-100 dark:border-slate-800 hover:border-sky-300 dark:hover:border-sky-700 transition-all text-center group"
            >
              <Icon className="w-5 h-5 text-slate-500 group-hover:text-sky-500 dark:text-slate-400 dark:group-hover:text-sky-400 mb-1.5 transition-colors" />
              <span className="text-xs font-medium text-slate-700 dark:text-slate-300 group-hover:text-sky-600 dark:group-hover:text-sky-400 line-clamp-1">
                {cat.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
