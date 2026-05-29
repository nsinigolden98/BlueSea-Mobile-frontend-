import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header, Toast } from '@/components/ui-custom';
import { useBlueSeaEngine } from '@/context/BlueSeaEngine';
import { Building2, Users, Receipt, Home, Calendar, BarChart3, Plus, ChevronRight, TrendingUp, ArrowUpRight, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { BusinessType } from '@/types';
import { X } from 'lucide-react';

const BUSINESS_TYPES: { type: BusinessType; label: string; icon: string }[] = [
  { type: 'retail', label: 'Retail Business', icon: '🏪' },
  { type: 'service', label: 'Service Business', icon: '🔧' },
  { type: 'digital_creator', label: 'Digital Creator', icon: '🎨' },
  { type: 'landlord', label: 'Landlord/Property', icon: '🏠' },
  { type: 'freelancer_agency', label: 'Freelancer Agency', icon: '💼' },
  { type: 'event_org', label: 'Event Organization', icon: '🎉' },
  { type: 'education', label: 'Educational', icon: '📚' },
  { type: 'consulting', label: 'Consulting', icon: '📊' },
];

const MODULES = [
  { label: 'Payroll', icon: Users, path: '/business/payroll', desc: 'Manage staff salaries', color: 'text-violet-500', bg: 'bg-violet-500/10' },
  { label: 'Invoices', icon: Receipt, path: '/business/invoices', desc: 'Create & track invoices', color: 'text-sky-500', bg: 'bg-sky-500/10' },
  { label: 'Properties', icon: Home, path: '/business/properties', desc: 'Manage rent & tenants', color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  { label: 'Appointments', icon: Calendar, path: '/business/appointments', desc: 'Booking management', color: 'text-amber-500', bg: 'bg-amber-500/10' },
  { label: 'Analytics', icon: BarChart3, path: '/business/analytics', desc: 'Business insights', color: 'text-rose-500', bg: 'bg-rose-500/10' },
];

export function BusinessHub() {
  const navigate = useNavigate();
  const { businesses, addBusiness, invoices, properties, appointments } = useBlueSeaEngine();
  const { ToastComponent, showToast } = Toast();
  const [showCreate, setShowCreate] = useState(false);
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({ name: '', type: 'retail' as BusinessType, description: '', address: '', contactEmail: '', contactPhone: '' });

  const handleCreate = () => {
    if (!form.name) { showToast('Business name is required', true); return; }
    addBusiness({ name: form.name, type: form.type, description: form.description, address: form.address, contactEmail: form.contactEmail, contactPhone: form.contactPhone, walletBalance: 0, staff: [], role: 'owner' });
    showToast(`"${form.name}" business created!`);
    setShowCreate(false);
    setStep(0);
    setForm({ name: '', type: 'retail', description: '', address: '', contactEmail: '', contactPhone: '' });
  };

  const totalRevenue = invoices.filter(i => i.status === 'paid').reduce((s, i) => s + i.total, 0);
  const activeStaff = businesses.reduce((s, b) => s + b.staff.filter(st => st.status === 'active').length, 0);
  const occupiedUnits = properties.reduce((s, p) => s + p.units.filter(u => u.status === 'occupied').length, 0);

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 flex flex-col">
      <Header title="Business Hub" subtitle="Your business operating system" showBackButton />
      <main className="flex-1 p-4 md:p-6 overflow-y-auto scrollbar-hide">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Overview Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: 'Businesses', value: businesses.length.toString(), icon: Building2, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
              { label: 'Revenue', value: `₦${totalRevenue.toLocaleString()}`, icon: TrendingUp, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
              { label: 'Staff', value: activeStaff.toString(), icon: Users, color: 'text-violet-500', bg: 'bg-violet-500/10' },
              { label: 'Occupied', value: occupiedUnits.toString(), icon: Home, color: 'text-sky-500', bg: 'bg-sky-500/10' },
            ].map(stat => (
              <div key={stat.label} className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/5 rounded-2xl p-4">
                <div className={`w-8 h-8 ${stat.bg} rounded-xl flex items-center justify-center mb-3`}>
                  <stat.icon className={`w-4 h-4 ${stat.color}`} />
                </div>
                <p className="text-lg font-black text-slate-800 dark:text-white">{stat.value}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Business Modules */}
          <div className="space-y-3">
            <h3 className="text-[11px] font-bold uppercase tracking-[0.15em] text-slate-400 dark:text-slate-500">Business Modules</h3>
            {MODULES.map(mod => (
              <button key={mod.label} onClick={() => navigate(mod.path)} className="w-full flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-2xl hover:border-sky-500/30 transition-all text-left group active:scale-[0.99]">
                <div className={`w-12 h-12 ${mod.bg} rounded-2xl flex items-center justify-center flex-shrink-0`}>
                  <mod.icon className={`w-5 h-5 ${mod.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-800 dark:text-white">{mod.label}</p>
                  <p className="text-[10px] text-slate-400">{mod.desc}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-sky-500 transition-colors" />
              </button>
            ))}
          </div>

          {/* My Businesses */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-[11px] font-bold uppercase tracking-[0.15em] text-slate-400 dark:text-slate-500">My Businesses</h3>
              <button onClick={() => setShowCreate(true)} className="flex items-center gap-1 px-3 py-1.5 bg-sky-500/10 text-sky-500 rounded-lg text-[10px] font-bold hover:bg-sky-500 hover:text-white transition-all">
                <Plus className="w-3 h-3" /> Create
              </button>
            </div>
            {businesses.length === 0 ? (
              <div className="text-center py-12 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-dashed border-slate-200 dark:border-white/5">
                <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p className="text-sm text-slate-400 font-bold">No businesses yet</p>
                <p className="text-xs text-slate-400 mt-1">Create your first business</p>
              </div>
            ) : (
              businesses.map(biz => (
                <div key={biz.id} className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-2xl p-5">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-xl">
                      {BUSINESS_TYPES.find(t => t.type === biz.type)?.icon || '🏢'}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-slate-800 dark:text-white">{biz.name}</p>
                      <p className="text-[10px] text-slate-400">{BUSINESS_TYPES.find(t => t.type === biz.type)?.label} • {biz.staff.length} staff</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-slate-800 dark:text-white">₦{biz.walletBalance.toLocaleString()}</p>
                      <span className="text-[9px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded">{biz.role}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>

      {/* Create Business Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 backdrop-blur-xl bg-slate-950/40">
          <div className="absolute inset-0" onClick={() => { setShowCreate(false); setStep(0); }} />
          <div className="relative bg-white dark:bg-slate-900 sm:rounded-[2rem] rounded-t-[2rem] p-6 w-full max-w-lg shadow-2xl border-t sm:border border-slate-200 dark:border-white/10 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-black text-slate-900 dark:text-white">Create Business</h3>
              <button onClick={() => { setShowCreate(false); setStep(0); }} className="p-2 hover:bg-slate-100 rounded-xl"><X className="w-4 h-4" /></button>
            </div>

            {step === 0 ? (
              <div className="space-y-3">
                <p className="text-xs text-slate-400 font-bold mb-2">SELECT BUSINESS TYPE</p>
                <div className="grid grid-cols-2 gap-3">
                  {BUSINESS_TYPES.map(t => (
                    <button key={t.type} onClick={() => { setForm({ ...form, type: t.type }); setStep(1); }} className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl hover:border-indigo-500/30 border border-transparent transition-all text-left">
                      <span className="text-2xl mb-2 block">{t.icon}</span>
                      <p className="text-xs font-bold text-slate-800 dark:text-white">{t.label}</p>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <button onClick={() => setStep(0)} className="text-xs font-bold text-indigo-500">← Back</button>
                <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Business Name" className="bg-slate-50 dark:bg-slate-800 rounded-2xl h-12" />
                <Input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Description" className="bg-slate-50 dark:bg-slate-800 rounded-2xl h-12" />
                <Input value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} placeholder="Business Address" className="bg-slate-50 dark:bg-slate-800 rounded-2xl h-12" />
                <Input value={form.contactEmail} onChange={e => setForm({ ...form, contactEmail: e.target.value })} placeholder="Contact Email" className="bg-slate-50 dark:bg-slate-800 rounded-2xl h-12" />
                <Input value={form.contactPhone} onChange={e => setForm({ ...form, contactPhone: e.target.value })} placeholder="Contact Phone" className="bg-slate-50 dark:bg-slate-800 rounded-2xl h-12" />
                <Button onClick={handleCreate} disabled={!form.name} className="w-full bg-indigo-500 hover:bg-indigo-600 text-white h-14 rounded-2xl text-sm font-black shadow-xl disabled:opacity-50 active:scale-95">Create Business</Button>
              </div>
            )}
          </div>
        </div>
      )}
      {ToastComponent}
    </div>
  );
}
