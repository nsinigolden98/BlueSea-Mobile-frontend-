// src/pages/vault/views/VaultReferral.tsx
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Users } from 'lucide-react';

export function VaultReferral({ showToast }: { showToast: (msg: string) => void }) {
  const { user } = useAuth();
  const code = user?.referral_code || 'BLUESEA';

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs text-center space-y-6">
      <div className="w-16 h-16 bg-sky-500/10 text-sky-500 rounded-full flex items-center justify-center mx-auto">
        <Users className="w-8 h-8" />
      </div>
      <div>
        <h3 className="text-xl font-black text-slate-800 dark:text-white">Referral Program</h3>
        <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">Earn 50 BSP Points per invited user after their first transaction.</p>
      </div>

      <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3 max-w-sm mx-auto">
        <div className="text-left">
          <p className="text-[10px] font-bold text-slate-400 uppercase">Referral Code</p>
          <p className="text-sm font-black text-sky-500">{code}</p>
        </div>
        <Button 
          size="sm"
          onClick={() => {
            navigator.clipboard.writeText(code);
            showToast('Referral Code copied!');
          }}
          className="bg-sky-500 text-white rounded-xl text-xs"
        >
          Copy Code
        </Button>
      </div>
    </div>
  );
}