// src/pages/vault/views/VaultReferral.tsx
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getRequest, ENDPOINTS } from '@/types';
import { Button } from '@/components/ui/button';
import { Users, Gift, Copy, Award, Link as LinkIcon, Hash } from 'lucide-react';

export function VaultReferral({ showToast }: { showToast: (msg: string) => void }) {
  const { user } = useAuth();
  const [referralCount, setReferralCount] = useState<number>(0);
  const [completedReferrals, setCompletedReferrals] = useState<number>(0);
  const [totalEarned, setTotalEarned] = useState<number>(0);

  const code = user?.referral_code || 'BLUESEA';
  const link = `https://blueseamobile.com.ng/login?ref=${code}`;

  useEffect(() => {
    getRequest(ENDPOINTS.bonus_summary)
      .then((res) => {
        if (res?.data) {
          setReferralCount(res.data.referral_count || res.data.total_referrals || 0);
          setCompletedReferrals(res.data.completed_referrals || 0);
          setTotalEarned(res.data.lifetime_earned || 0);
        }
      })
      .catch(() => {
        setReferralCount(0);
        setCompletedReferrals(0);
        setTotalEarned(0);
      });
  }, []);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(code);
    showToast('Referral Code copied!');
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(link);
    showToast('Referral Link copied!');
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-6">
      <div className="text-center space-y-2">
        <div className="w-16 h-16 bg-sky-500/10 text-sky-500 rounded-full flex items-center justify-center mx-auto">
          <Users className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-black text-slate-800 dark:text-white">Referral Hub</h3>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          Earn 50 BSP Points per invited friend after their first vault transaction.
        </p>
      </div>

      {/* STATS ANALYTICS CARD */}
      <div className="grid grid-cols-3 gap-3">
        <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-800 text-center">
          <Award className="w-5 h-5 text-amber-500 mx-auto mb-1" />
          <p className="text-lg font-black text-slate-800 dark:text-white">{referralCount}</p>
          <p className="text-[9px] font-bold text-slate-400 uppercase">Total Invited</p>
        </div>
        <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-800 text-center">
          <Users className="w-5 h-5 text-emerald-500 mx-auto mb-1" />
          <p className="text-lg font-black text-slate-800 dark:text-white">{completedReferrals}</p>
          <p className="text-[9px] font-bold text-slate-400 uppercase">Completed</p>
        </div>
        <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-800 text-center">
          <Gift className="w-5 h-5 text-sky-500 mx-auto mb-1" />
          <p className="text-lg font-black text-slate-800 dark:text-white">{totalEarned} BSP</p>
          <p className="text-[9px] font-bold text-slate-400 uppercase">Bonus Earned</p>
        </div>
      </div>

      {/* COPY REFERRAL CODE */}
      <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-2">
        <div className="flex items-center gap-1 text-xs font-bold text-slate-400 uppercase">
          <Hash className="w-3.5 h-3.5 text-sky-500" /> Referral Code
        </div>
        <div className="flex gap-2">
          <input 
            type="text" 
            readOnly 
            value={code} 
            className="flex-1 bg-white dark:bg-slate-900 px-3 py-2 rounded-xl text-xs font-mono font-bold text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800"
          />
          <Button onClick={handleCopyCode} className="bg-sky-500 hover:bg-sky-600 text-white rounded-xl text-xs font-bold cursor-pointer">
            <Copy className="w-4 h-4 mr-1" /> Copy Code
          </Button>
        </div>
      </div>

      {/* COPY REFERRAL LINK */}
      <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-2">
        <div className="flex items-center gap-1 text-xs font-bold text-slate-400 uppercase">
          <LinkIcon className="w-3.5 h-3.5 text-sky-500" /> Referral Link
        </div>
        <div className="flex gap-2">
          <input 
            type="text" 
            readOnly 
            value={link} 
            className="flex-1 bg-white dark:bg-slate-900 px-3 py-2 rounded-xl text-xs font-mono font-bold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 truncate"
          />
          <Button onClick={handleCopyLink} className="bg-sky-500 hover:bg-sky-600 text-white rounded-xl text-xs font-bold cursor-pointer">
            <Copy className="w-4 h-4 mr-1" /> Copy Link
          </Button>
        </div>
      </div>
    </div>
  );
}
