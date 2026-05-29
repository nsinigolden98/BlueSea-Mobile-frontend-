import { useState } from 'react';
import { Header, Toast } from '@/components/ui-custom';
import { useAuth } from '@/context/AuthContext';
import { Share2, Copy, Link2, TrendingUp, DollarSign, Users, MousePointer, ShoppingBag, Ticket, Home, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';

const AFFILIATE_ITEMS = [
  { id: 'a1', type: 'product' as const, title: 'Premium Sneakers', commission: 15, price: 45000, seller: 'StyleHub Store', clicks: 234, conversions: 18 },
  { id: 'a2', type: 'event' as const, title: 'Tech Summit 2026', commission: 10, price: 25000, seller: 'BlueSea Events', clicks: 567, conversions: 42 },
  { id: 'a3', type: 'service' as const, title: 'Logo Design Package', commission: 20, price: 35000, seller: 'Creative Studio', clicks: 189, conversions: 12 },
  { id: 'a4', type: 'property' as const, title: 'Luxury Apartment Lekki', commission: 5, price: 5000000, seller: 'Prime Realty', clicks: 89, conversions: 3 },
  { id: 'a5', type: 'product' as const, title: 'Wireless Earbuds Pro', commission: 12, price: 25000, seller: 'TechWorld', clicks: 445, conversions: 31 },
  { id: 'a6', type: 'event' as const, title: 'Afrobeats Festival', commission: 8, price: 15000, seller: 'Lagos Events', clicks: 892, conversions: 67 },
];

export function Affiliate() {
  const { user } = useAuth();
  const { ToastComponent, showToast } = Toast();
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const referralCode = user?.referral_code || 'BLUESEA2026';

  const totalClicks = AFFILIATE_ITEMS.reduce((s, i) => s + i.clicks, 0);
  const totalConversions = AFFILIATE_ITEMS.reduce((s, i) => s + i.conversions, 0);
  const estimatedEarnings = AFFILIATE_ITEMS.reduce((s, i) => s + (i.price * i.commission / 100) * i.conversions, 0);

  const handleCopy = (itemId: string) => {
    const link = `https://blueseamobile.com.ng/ref/${referralCode}/${itemId}`;
    navigator.clipboard.writeText(link).then(() => {
      setCopiedId(itemId);
      showToast('Referral link copied!');
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  const typeIcons: Record<string, any> = { product: ShoppingBag, event: Ticket, service: Star, property: Home };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 flex flex-col">
      <Header title="Discover & Earn" subtitle="Affiliate ecosystem" showBackButton />
      <main className="flex-1 p-4 md:p-6 overflow-y-auto scrollbar-hide">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Affiliate Stats */}
          <div className="bg-slate-900 dark:bg-slate-800 rounded-3xl p-6 text-white shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Estimated Earnings</p>
                <p className="text-3xl font-black mt-1">₦{Math.floor(estimatedEarnings).toLocaleString()}</p>
              </div>
              <div className="w-14 h-14 bg-emerald-500/20 rounded-2xl flex items-center justify-center">
                <DollarSign className="w-7 h-7 text-emerald-400" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 bg-white/5 rounded-2xl text-center">
                <p className="text-lg font-black">{totalClicks.toLocaleString()}</p>
                <p className="text-[9px] text-slate-400">Clicks</p>
              </div>
              <div className="p-3 bg-white/5 rounded-2xl text-center">
                <p className="text-lg font-black">{totalConversions}</p>
                <p className="text-[9px] text-slate-400">Conversions</p>
              </div>
              <div className="p-3 bg-white/5 rounded-2xl text-center">
                <p className="text-lg font-black">{((totalConversions / totalClicks) * 100).toFixed(1)}%</p>
                <p className="text-[9px] text-slate-400">Conv. Rate</p>
              </div>
            </div>
            <div className="mt-4 p-3 bg-white/5 rounded-xl flex items-center gap-3">
              <Link2 className="w-4 h-4 text-slate-400" />
              <span className="text-xs font-mono text-slate-300 flex-1">blueseamobile.com.ng/ref/{referralCode}</span>
              <button onClick={() => handleCopy('general')} className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-[10px] font-bold transition-all">
                {copiedId === 'general' ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>

          {/* Affiliate Items */}
          <div className="space-y-3">
            <h3 className="text-[11px] font-bold uppercase tracking-[0.15em] text-slate-400 dark:text-slate-500">Promote & Earn</h3>
            {AFFILIATE_ITEMS.map(item => {
              const Icon = typeIcons[item.type] || ShoppingBag;
              const earnPerSale = Math.floor(item.price * item.commission / 100);
              return (
                <div key={item.id} className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-2xl p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center">
                        <Icon className="w-5 h-5 text-emerald-500" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800 dark:text-white">{item.title}</p>
                        <p className="text-[10px] text-slate-400">{item.seller} • {item.type}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-emerald-500">{item.commission}%</p>
                      <p className="text-[9px] text-slate-400">commission</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex gap-4 text-[10px] text-slate-400">
                      <span>₦{item.price.toLocaleString()}</span>
                      <span>•</span>
                      <span>Earn ₦{earnPerSale.toLocaleString()}/sale</span>
                      <span>•</span>
                      <span>{item.clicks} clicks</span>
                    </div>
                    <button onClick={() => handleCopy(item.id)} className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-emerald-500 hover:text-white text-slate-600 dark:text-slate-300 rounded-xl text-[10px] font-bold transition-all active:scale-95 flex items-center gap-1.5">
                      {copiedId === item.id ? <CheckCircle2 className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      {copiedId === item.id ? 'Copied' : 'Copy Link'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>
      {ToastComponent}
    </div>
  );
}

function CheckCircle2(props: any) { return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/></svg>; }
