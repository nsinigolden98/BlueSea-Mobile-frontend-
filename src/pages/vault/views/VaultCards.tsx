// src/pages/vault/views/VaultCards.tsx
import { CreditCard } from 'lucide-react';

export function VaultCards() {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-xs text-center space-y-4">
      <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 text-slate-400 rounded-full flex items-center justify-center mx-auto">
        <CreditCard className="w-8 h-8" />
      </div>
      <div>
        <h3 className="text-lg font-black text-slate-800 dark:text-white">BlueSea Digital Cards</h3>
        <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
          Spend digital assets worldwide with virtual USD debit cards. Releasing soon.
        </p>
      </div>
      <span className="inline-block text-[10px] font-bold text-sky-500 bg-sky-500/10 px-3 py-1 rounded-full uppercase">
        Coming Soon
      </span>
    </div>
  );
}