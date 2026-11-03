import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowDownToLine, ArrowLeftRight, Repeat2, Smartphone, Wifi, Zap,
  Store, Ticket, PlusCircle, Users, ScanLine, BriefcaseBusiness, Building2,
  FileText, Shield, Coins, History, LayoutGrid, ChevronRight, Home,
} from 'lucide-react';
import { Sidebar } from '@/components/ui-custom';
import { DashboardHeader } from '@/components/ui-custom/DashboardHeader';
import { BalanceCard } from '@/components/ui-custom';
import { MobileBottomNavigation } from '@/components/navigation/MobileBottomNavigation';
import {
  getPreferredWorkspace, savePreferredWorkspace, WORKSPACE_HOME,
  type WorkspaceId,
} from './workspacePreference';

type Shortcut = { label: string; path: string; icon: typeof Store; note?: string };
type WorkspaceMeta = {
  id: WorkspaceId; title: string; subtitle: string; theme: string;
  actions: Shortcut[]; spotlight: string; description: string;
};

const WORKSPACES: Record<Exclude<WorkspaceId, 'personal'>, WorkspaceMeta> = {
  affiliate: {
    id: 'affiliate', title: 'Affiliate Workspace', subtitle: 'Grow your referrals and track your activity.',
    theme: 'from-sky-500 to-blue-700', spotlight: 'Referral & Affiliate',
    description: 'Your referral tools, activity, and affiliate resources in one focused space.',
    actions: [
      { label: 'Affiliate Dashboard', path: '/affiliate/dashboard', icon: Users },
      { label: 'Discover & Earn', path: '/campaigns', icon: Coins },
      { label: 'Rewards', path: '/rewards', icon: Ticket },
      { label: 'Explore Services', path: '/services', icon: LayoutGrid },
    ],
  },
  marketplace: {
    id: 'marketplace', title: 'Marketplace & Tickets', subtitle: 'Your event and ticketing tools at a glance.',
    theme: 'from-sky-500 to-cyan-700', spotlight: 'Marketplace & Tickets',
    description: 'Browse events, manage tickets, and access your event tools.',
    actions: [
      { label: 'Marketplace', path: '/marketplace', icon: Store },
      { label: 'Affiliate', path: '/affiliate/dashboard', icon: Users },
      { label: 'My Tickets', path: '/my-tickets', icon: Ticket },
      { label: 'Create Ticket', path: '/event-manager', icon: PlusCircle },
      { label: 'Scanning', path: '/scanner-assignments', icon: ScanLine },
      { label: 'Explore Services', path: '/services', icon: LayoutGrid },
    ],
  },
  payroll: {
    id: 'payroll', title: 'Payroll Workspace', subtitle: 'Manage your payroll workflow from one place.',
    theme: 'from-blue-600 to-indigo-700', spotlight: 'Payroll Pro',
    description: 'Quick access to payroll and company management.',
    actions: [
      { label: 'Payroll Pro', path: '/payroll-pro', icon: BriefcaseBusiness },
      { label: 'Work Account', path: '/payroll-pro', icon: Building2, note: 'Open payroll workspace' },
      { label: 'Explore Services', path: '/services', icon: LayoutGrid },
    ],
  },
  vault: {
    id: 'vault', title: 'Vault Workspace', subtitle: 'A focused home for your Vault tools.',
    theme: 'from-indigo-600 to-slate-800', spotlight: 'Vault',
    description: 'Open your available Vault and rewards tools.',
    actions: [
      { label: 'Open Vault', path: '/vault', icon: Shield },
      { label: 'Rewards', path: '/rewards', icon: Coins },
      { label: 'Explore Services', path: '/services', icon: LayoutGrid },
    ],
  },
};

const CORE_ACTIONS: Shortcut[] = [
  { label: 'Deposit', path: '/deposit', icon: ArrowDownToLine },
  { label: 'Transfer', path: '/withdraw', icon: ArrowLeftRight },
  { label: 'Internal Transfer', path: '/wallet', icon: Repeat2 },
  { label: 'Airtime', path: '/airtime', icon: Smartphone },
  { label: 'Data', path: '/data', icon: Wifi },
  { label: 'Bills', path: '/light-bills', icon: Zap },
];

export function WorkspaceDashboard({ workspace }: { workspace: Exclude<WorkspaceId, 'personal'> }) {
  const navigate = useNavigate();
  const meta = WORKSPACES[workspace];
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showBalance, setShowBalance] = useState(() => localStorage.getItem('dashboard_showBalance') === 'true');

  useEffect(() => {
    localStorage.setItem('dashboard_showBalance', String(showBalance));
  }, [showBalance]);

  const changeWorkspace = async () => {
    await savePreferredWorkspace(workspace);
    navigate('/workspace/select');
  };

  return (
    <div className="h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 flex overflow-hidden">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col h-full min-w-0 relative overflow-x-hidden">
        <DashboardHeader sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <main className="flex-1 overflow-y-auto p-3 md:p-6">
          <div className="max-w-4xl mx-auto space-y-3.5 md:space-y-5">
            <section className="rounded-2xl border border-sky-100 dark:border-slate-700 bg-white dark:bg-slate-900 p-3.5 md:p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[10px] uppercase tracking-[.16em] font-bold text-sky-600 dark:text-sky-400">Primary workspace</p>
                  <h1 className="text-lg font-bold mt-1">{meta.title}</h1>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{meta.subtitle}</p>
                </div>
                <button onClick={() => navigate('/workspace/select')} className="text-xs font-semibold text-sky-600 dark:text-sky-400 rounded-lg border border-sky-100 dark:border-slate-700 px-3 py-2">
                  Change
                </button>
              </div>
            </section>

            <div className="relative rounded-2xl overflow-hidden">
              <BalanceCard
                showBalance={showBalance}
                onToggleBalance={setShowBalance}
                className="!p-4 md:!p-5 !rounded-2xl"
              />
              <button onClick={() => navigate('/transaction-history')} className="absolute bottom-3 right-3 z-20 flex items-center gap-1.5 rounded-lg bg-white/20 hover:bg-white/30 border border-white/20 px-2.5 py-1.5 text-[11px] font-semibold text-white">
                <History className="w-3.5 h-3.5" /> Transactions
              </button>
            </div>

            <section className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
              <div className={`bg-gradient-to-r ${meta.theme} p-3.5 text-white`}>
                <div className="text-[10px] uppercase tracking-[.16em] font-bold text-white/75">{meta.spotlight}</div>
                <h2 className="text-base font-bold mt-1">{meta.title}</h2>
                <p className="text-xs text-white/80 mt-1">{meta.description}</p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-3">
                {meta.actions.map((action) => {
                  const Icon = action.icon;
                  return (
                    <button key={action.label} onClick={() => navigate(action.path)}
                      className="min-h-[76px] rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/70 hover:border-sky-400 dark:hover:border-sky-500 p-2.5 flex flex-col items-start justify-between text-left transition-colors">
                      <span className="w-8 h-8 rounded-lg bg-sky-100 dark:bg-sky-900/50 flex items-center justify-center">
                        <Icon className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                      </span>
                      <span className="flex items-center justify-between gap-1 w-full text-[11px] font-semibold">
                        <span>{action.label}</span><ChevronRight className="w-3 h-3 text-slate-400 shrink-0" />
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>

            <section className="space-y-2">
              <div className="px-1 flex items-center justify-between">
                <h2 className="text-[10px] font-bold uppercase tracking-[.15em] text-slate-400 dark:text-slate-500">Everyday services</h2>
                <button onClick={() => navigate('/services')} className="text-[11px] font-semibold text-sky-600 dark:text-sky-400">Explore all</button>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {CORE_ACTIONS.map((action) => {
                  const Icon = action.icon;
                  return (
                    <button key={action.label} onClick={() => navigate(action.path)}
                      className="min-h-[68px] rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-2 flex flex-col items-center justify-center gap-1.5 hover:border-sky-400 transition-colors">
                      <Icon className="w-5 h-5 text-sky-500" />
                      <span className="text-[10px] sm:text-xs font-semibold text-center">{action.label}</span>
                    </button>
                  );
                })}
              </div>
            </section>

            <button onClick={() => navigate('/services')} className="w-full flex items-center justify-between rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-2.5">
              <span className="flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-lg bg-sky-50 dark:bg-sky-900/40 flex items-center justify-center"><LayoutGrid className="w-4 h-4 text-sky-600" /></span>
                <span className="text-left"><span className="block text-xs font-bold">Explore All Services</span><span className="block text-[10px] text-slate-500">Discover more BlueSea services</span></span>
              </span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>
          </div>
        </main>
        <div className="sticky bottom-0 z-30 shrink-0 md:hidden bg-white dark:bg-slate-900 border-t border-slate-200/80 dark:border-slate-800">
          <MobileBottomNavigation />
        </div>
      </div>
    </div>
  );
}

export function WorkspaceSelectionPage() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<WorkspaceId>('personal');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let alive = true;
    void getPreferredWorkspace().then((value) => { if (alive) setSelected(value); });
    return () => { alive = false; };
  }, []);

  const options: { id: WorkspaceId; name: string; summary: string }[] = [
    { id: 'personal', name: 'Personal', summary: 'Everyday payments and personal services.' },
    { id: 'affiliate', name: 'Referral & Affiliate', summary: 'Referral tools and affiliate activity.' },
    { id: 'marketplace', name: 'Marketplace & Tickets', summary: 'Ticketing, events, and marketplace tools.' },
    { id: 'payroll', name: 'Payroll', summary: 'Payroll and work account tools.' },
    { id: 'vault', name: 'Vault', summary: 'A focused entry point to Vault services.' },
  ];

  const confirm = async () => {
    setSaving(true);
    try {
      await savePreferredWorkspace(selected);
      navigate(WORKSPACE_HOME[selected], { replace: true });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-4 md:p-8">
      <div className="max-w-xl mx-auto space-y-4">
        <div className="flex items-center gap-2 text-sky-600"><Home className="w-5 h-5" /><span className="text-sm font-bold">BlueSea Mobile</span></div>
        <div><h1 className="text-2xl font-bold">Choose your Home workspace</h1><p className="text-sm text-slate-500 mt-2">This changes your Home dashboard. Your other services remain available.</p></div>
        <div className="space-y-2">
          {options.map((option) => (
            <button key={option.id} onClick={() => setSelected(option.id)}
              className={`w-full text-left rounded-xl border p-3.5 flex items-center gap-3 ${selected === option.id ? 'border-sky-500 bg-sky-50 dark:bg-sky-950/30' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800'}`}>
              <span className={`w-4 h-4 rounded-full border-2 ${selected === option.id ? 'border-sky-500 bg-sky-500 ring-2 ring-sky-200' : 'border-slate-400'}`} />
              <span><span className="block text-sm font-semibold">{option.name}</span><span className="block text-xs text-slate-500 mt-1">{option.summary}</span></span>
            </button>
          ))}
        </div>
        <div className="flex gap-2"><button onClick={() => navigate('/dashboard', { replace: true })} className="flex-1 rounded-xl border border-slate-200 dark:border-slate-700 py-3 text-sm font-semibold">Skip for now</button><button disabled={saving} onClick={() => void confirm()} className="flex-1 rounded-xl bg-sky-500 hover:bg-sky-600 disabled:opacity-60 text-white rounded-xl py-3 text-sm font-semibold">{saving ? 'Saving…' : 'Use this workspace'}</button></div>
      </div>
    </div>
  );
}
