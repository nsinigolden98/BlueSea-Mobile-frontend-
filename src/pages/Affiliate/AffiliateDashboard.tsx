import { useMemo } from 'react';
import { 
  getAffiliateStats, 
  getOrGenerateAffiliateId, 
  getAffiliateProfile, 
  getMockCommissions 
} from '@/utils/affiliateStorage';
import { MousePointer, Ticket, TrendingUp, Sparkles, DollarSign } from 'lucide-react';

export function AffiliateDashboard() {
  const profile = useMemo(() => getAffiliateProfile(), []);
  const stats = useMemo(() => getAffiliateStats(), []);
  const commissions = useMemo(() => getMockCommissions(), []);
  const affiliateId = useMemo(() => getOrGenerateAffiliateId(), []);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Profile Bar */}
      <div className="p-6 rounded-3xl bg-slate-900 text-white flex flex-wrap items-center justify-between gap-4 border border-slate-800 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-black">{profile?.displayName || 'Partner Affiliate'}</h2>
            <span className="px-2.5 py-0.5 rounded-full bg-sky-500/20 text-sky-400 text-[10px] font-bold uppercase">
              {profile?.level || 'Standard'}
            </span>
          </div>
          <p className="text-xs text-slate-400">Affiliate ID: <span className="font-mono text-sky-400 font-bold">{affiliateId}</span> • Member since Aug 2026</p>
        </div>
      </div>

      {/* Financial Performance Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-md flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pending Earnings</p>
            <p className="text-2xl font-black text-amber-500">₦{stats.pendingEarnings.toLocaleString()}</p>
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-md flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Lifetime Earnings</p>
            <p className="text-2xl font-black text-emerald-500">₦{stats.lifetimeEarnings.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Marketing Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
          <MousePointer className="w-5 h-5 text-sky-500 mb-2" />
          <p className="text-[10px] font-bold text-slate-400 uppercase">Link Clicks</p>
          <p className="text-xl font-black text-slate-800 dark:text-white mt-1">{stats.totalClicks}</p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
          <Ticket className="w-5 h-5 text-sky-500 mb-2" />
          <p className="text-[10px] font-bold text-slate-400 uppercase">Ticket Sales</p>
          <p className="text-xl font-black text-slate-800 dark:text-white mt-1">{stats.totalSales}</p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
          <TrendingUp className="w-5 h-5 text-sky-500 mb-2" />
          <p className="text-[10px] font-bold text-slate-400 uppercase">Conversion</p>
          <p className="text-xl font-black text-slate-800 dark:text-white mt-1">{stats.conversionRate}%</p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
          <Sparkles className="w-5 h-5 text-sky-500 mb-2" />
          <p className="text-[10px] font-bold text-slate-400 uppercase">Events Promoted</p>
          <p className="text-xl font-black text-slate-800 dark:text-white mt-1">{stats.eventsPromoted}</p>
        </div>
      </div>

      {/* Recent Commissions Table */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 space-y-4">
        <h3 className="font-black text-slate-800 dark:text-white text-base">Recent Referral Commissions</h3>
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {commissions.map((comm) => (
            <div key={comm.id} className="py-3.5 flex items-center justify-between text-xs">
              <div>
                <p className="font-bold text-slate-800 dark:text-white">{comm.eventTitle}</p>
                <p className="text-[10px] text-slate-400">{comm.date}</p>
              </div>
              <div className="text-right">
                <p className="font-black text-sky-500">+₦{comm.commissionAmount.toLocaleString()}</p>
                <span className={`text-[9px] font-bold uppercase ${comm.status === 'paid' ? 'text-emerald-500' : 'text-amber-500'}`}>
                  {comm.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}