import { useState } from 'react';
import { Header, Toast } from '@/components/ui-custom';
import { useBlueSeaEngine } from '@/context/BlueSeaEngine';
import { ShieldCheck, Heart, Car, Smartphone, Plane, Building2, Plus, X, CheckCircle2, ChevronRight, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { InsuranceType } from '@/types';

const INSURANCE_TYPES: { type: InsuranceType; label: string; icon: any; desc: string; providers: string[]; basePrice: number }[] = [
  { type: 'health', label: 'Health Insurance', icon: Heart, desc: 'Medical coverage for you and family', providers: ['Hygeia HMO', 'Reliance HMO', 'Avon HMO'], basePrice: 15000 },
  { type: 'vehicle', label: 'Vehicle Insurance', icon: Car, desc: 'Auto coverage and third-party', providers: ['AXA Mansard', 'AIICO Insurance', 'Leadway Assurance'], basePrice: 25000 },
  { type: 'gadget', label: 'Gadget Insurance', icon: Smartphone, desc: 'Protection for phones, laptops & devices', providers: ['Cornerstone', 'Mutual Benefits', 'Consolidated Hallmark'], basePrice: 5000 },
  { type: 'travel', label: 'Travel Insurance', icon: Plane, desc: 'Coverage for trips abroad', providers: ['AXA Mansard', 'Allianz', 'Cornerstone'], basePrice: 10000 },
  { type: 'business', label: 'Business Insurance', icon: Building2, desc: 'Protect your business assets', providers: ['Leadway Assurance', 'AIICO Insurance', 'Mutual Benefits'], basePrice: 50000 },
];

export function Insurance() {
  const { insurancePlans, addInsurancePlan, addTransaction, addNotification } = useBlueSeaEngine();
  const { ToastComponent, showToast } = Toast();
  const [showEnroll, setShowEnroll] = useState(false);
  const [selectedType, setSelectedType] = useState<InsuranceType | null>(null);
  const [provider, setProvider] = useState('');
  const [coverage, setCoverage] = useState('');

  const handleEnroll = () => {
    if (!selectedType || !provider || !coverage) return;
    const typeInfo = INSURANCE_TYPES.find(t => t.type === selectedType)!;
    const premium = typeInfo.basePrice * (Number(coverage) / 1000000);
    const plan = addInsurancePlan({
      type: selectedType,
      name: `${typeInfo.label} - ${provider}`,
      provider,
      coverage: Number(coverage),
      premium,
      startDate: new Date().toISOString(),
      expiryDate: new Date(Date.now() + 365 * 86400000).toISOString(),
      status: 'active',
      claims: [],
      documents: [],
    });
    addTransaction({ transaction_type: 'DEBIT', amount: premium, description: `Insurance Premium - ${typeInfo.label}`, status: 'successful', category: 'insurance', payment_method: 'Wallet' });
    addNotification({ title: 'Insurance Activated', subtitle: `${typeInfo.label} is now active`, category: 'insurance', read: false });
    showToast(`${typeInfo.label} activated successfully!`);
    setShowEnroll(false);
    setSelectedType(null);
    setProvider('');
    setCoverage('');
  };

  const activePlans = insurancePlans.filter(p => p.status === 'active');

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 flex flex-col">
      <Header title="Insurance" subtitle="Protect what matters" showBackButton />
      <main className="flex-1 p-4 md:p-6 overflow-y-auto scrollbar-hide">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Overview */}
          <div className="bg-slate-900 dark:bg-slate-800 rounded-3xl p-6 text-white shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Active Coverage</p>
                <p className="text-3xl font-black mt-1">₦{activePlans.reduce((s, p) => s + p.coverage, 0).toLocaleString()}</p>
                <p className="text-[10px] text-slate-400 mt-1">{activePlans.length} active plans</p>
              </div>
              <div className="w-14 h-14 bg-emerald-500/20 rounded-2xl flex items-center justify-center">
                <ShieldCheck className="w-7 h-7 text-emerald-400" />
              </div>
            </div>
          </div>

          {/* Active Plans */}
          {activePlans.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-[11px] font-bold uppercase tracking-[0.15em] text-slate-400 dark:text-slate-500">Active Plans</h3>
              {activePlans.map(plan => {
                const typeInfo = INSURANCE_TYPES.find(t => t.type === plan.type);
                const daysLeft = Math.max(0, Math.floor((new Date(plan.expiryDate).getTime() - Date.now()) / 86400000));
                return (
                  <div key={plan.id} className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-2xl p-5">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center">
                          {typeInfo && <typeInfo.icon className="w-5 h-5 text-emerald-500" />}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-800 dark:text-white">{plan.name}</p>
                          <p className="text-[10px] text-slate-400">{plan.provider}</p>
                        </div>
                      </div>
                      <span className="px-3 py-1 bg-emerald-500/10 text-emerald-500 rounded-full text-[9px] font-black uppercase tracking-wider">Active</span>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="p-3 bg-white dark:bg-slate-800 rounded-xl">
                        <p className="text-[9px] text-slate-400 uppercase tracking-wider">Coverage</p>
                        <p className="text-sm font-black text-slate-800 dark:text-white">₦{plan.coverage.toLocaleString()}</p>
                      </div>
                      <div className="p-3 bg-white dark:bg-slate-800 rounded-xl">
                        <p className="text-[9px] text-slate-400 uppercase tracking-wider">Premium</p>
                        <p className="text-sm font-black text-slate-800 dark:text-white">₦{plan.premium.toLocaleString()}/yr</p>
                      </div>
                      <div className="p-3 bg-white dark:bg-slate-800 rounded-xl">
                        <p className="text-[9px] text-slate-400 uppercase tracking-wider">Renews In</p>
                        <p className="text-sm font-black text-amber-500">{daysLeft} days</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Enroll Button */}
          <button onClick={() => setShowEnroll(true)} className="w-full p-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-95 shadow-lg shadow-emerald-500/20">
            <Plus className="w-5 h-5" />
            <span className="text-sm font-bold">Enroll in Insurance Plan</span>
          </button>
        </div>
      </main>

      {/* Enroll Modal */}
      {showEnroll && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 backdrop-blur-xl bg-slate-950/40">
          <div className="absolute inset-0" onClick={() => { setShowEnroll(false); setSelectedType(null); }} />
          <div className="relative bg-white dark:bg-slate-900 sm:rounded-[2rem] rounded-t-[2rem] p-6 w-full max-w-lg shadow-2xl border-t sm:border border-slate-200 dark:border-white/10 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-black text-slate-900 dark:text-white">Enroll in Insurance</h3>
              <button onClick={() => { setShowEnroll(false); setSelectedType(null); }} className="p-2 hover:bg-slate-100 rounded-xl"><X className="w-4 h-4" /></button>
            </div>

            {!selectedType ? (
              <div className="space-y-3">
                <p className="text-xs text-slate-400 font-bold mb-2">SELECT INSURANCE TYPE</p>
                {INSURANCE_TYPES.map(t => (
                  <button key={t.type} onClick={() => setSelectedType(t.type)} className="w-full flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl hover:border-emerald-500/30 border border-transparent transition-all text-left">
                    <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center flex-shrink-0">
                      <t.icon className="w-5 h-5 text-emerald-500" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-slate-800 dark:text-white">{t.label}</p>
                      <p className="text-[10px] text-slate-400">{t.desc}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-slate-800 dark:text-white">From ₦{t.basePrice.toLocaleString()}</p>
                      <ChevronRight className="w-4 h-4 text-slate-300 ml-auto" />
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                <button onClick={() => setSelectedType(null)} className="text-xs font-bold text-emerald-500">← Change Type</button>
                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Select Provider</label>
                    <div className="mt-2 space-y-2">
                      {INSURANCE_TYPES.find(t => t.type === selectedType)?.providers.map(p => (
                        <button key={p} onClick={() => setProvider(p)} className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold transition-all ${provider === p ? 'bg-emerald-500 text-white' : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}>
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Coverage Amount (₦)</label>
                    <Input value={coverage} onChange={e => setCoverage(e.target.value.replace(/\D/g, ''))} placeholder="e.g. 5000000" className="mt-2 bg-slate-50 dark:bg-slate-800 rounded-2xl h-12 font-black" />
                  </div>
                  {coverage && provider && (
                    <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl">
                      <p className="text-sm font-bold text-emerald-600">Estimated Premium: ₦{Math.round((INSURANCE_TYPES.find(t => t.type === selectedType)?.basePrice || 0) * (Number(coverage) / 1000000)).toLocaleString()}/year</p>
                    </div>
                  )}
                  <Button onClick={handleEnroll} disabled={!provider || !coverage} className="w-full bg-emerald-500 hover:bg-emerald-600 text-white h-14 rounded-2xl text-sm font-black shadow-xl disabled:opacity-50 active:scale-95">
                    Enroll Now
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      {ToastComponent}
    </div>
  );
}
