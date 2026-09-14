// src/pages/vault/views/VaultHistory.tsx
import { useState, useEffect } from 'react';
import { getRequest, ENDPOINTS } from '@/types';
import { Gift, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

export function VaultHistory({ showToast }: { showToast: (msg: string) => void }) {
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    getRequest(ENDPOINTS.bonus_history)
      .then(res => res?.data && setHistory(res.data))
      .catch(() => showToast('Failed to load transaction history'));
  }, []);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
      <div>
        <h3 className="text-lg font-black text-slate-800 dark:text-white">Transaction History</h3>
        <p className="text-xs text-slate-500">Record of digital reward earnings and asset operations.</p>
      </div>

      <div className="divide-y divide-slate-100 dark:divide-slate-800">
        {history.map((item) => (
          <div key={item.id} className="py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={cn('w-10 h-10 rounded-full flex items-center justify-center', item.transaction_type === 'earned' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600')}>
                {item.transaction_type === 'earned' ? <TrendingUp className="w-5 h-5" /> : <Gift className="w-5 h-5" />}
              </div>
              <div>
                <p className="font-bold text-slate-800 dark:text-white text-xs">{item.description}</p>
                <p className="text-[10px] text-slate-400">{new Date(item.created_at).toLocaleDateString()}</p>
              </div>
            </div>
            <span className={cn('font-bold text-sm', item.transaction_type === 'earned' ? 'text-emerald-500' : 'text-red-500')}>
              {item.transaction_type === 'earned' ? '+' : '-'}{item.points} BSP
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}