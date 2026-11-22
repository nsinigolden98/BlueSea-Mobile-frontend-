import { useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  Activity, ArrowLeft, ArrowUpRight, BarChart3,
  ChevronDown, Code2, CreditCard, ExternalLink, Globe2, LayoutDashboard,
  Link2, Menu, MessageCircle, QrCode, Route, Settings2, ShieldCheck, Sparkles,
  Users, X, Zap, GitBranch,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useMrGLinks } from '../MrGLinksContext';
import { formatMrGPrice } from '../services/currency';
import type { MrGPageKey } from '../types';

const navigation: { label: string; path: string; icon: typeof Link2; group: string }[] = [
  { label: 'Overview', path: '/mrg-links', icon: LayoutDashboard, group: 'Workspace' },
  { label: 'My links', path: '/mrg-links/links', icon: Link2, group: 'Workspace' },
  { label: 'Analytics', path: '/mrg-links/analytics', icon: BarChart3, group: 'Workspace' },
  { label: 'QR intelligence', path: '/mrg-links/qr', icon: QrCode, group: 'Workspace' },
  { label: 'Campaign Studio', path: '/mrg-links/campaigns', icon: Activity, group: 'Growth' },
  { label: 'Landing pages', path: '/mrg-links/landing-pages', icon: Globe2, group: 'Growth' },
  { label: 'Smart routing', path: '/mrg-links/routing', icon: Route, group: 'Growth' },
  { label: 'Security centre', path: '/mrg-links/security', icon: ShieldCheck, group: 'Manage' },
  { label: 'Plans & credits', path: '/mrg-links/plans', icon: CreditCard, group: 'Manage' },
  { label: 'Settings', path: '/mrg-links/settings', icon: Settings2, group: 'Manage' },
];

const comingSoon: { label: string; path: string; icon: typeof Link2; key: MrGPageKey }[] = [
  { label: 'Domain marketplace', path: '/mrg-links/domains', icon: Globe2, key: 'domains' },
  { label: 'Developer API', path: '/mrg-links/api', icon: Code2, key: 'api' },
  { label: 'Team workspace', path: '/mrg-links/teams', icon: Users, key: 'teams' },
  { label: 'WhatsApp smart links', path: '/mrg-links/whatsapp', icon: MessageCircle, key: 'whatsapp' },
  { label: 'AI link assistant', path: '/mrg-links/ai', icon: Sparkles, key: 'ai' },
  { label: 'A/B testing', path: '/mrg-links/ab-testing', icon: GitBranch, key: 'ab-testing' },
];

function shortName(firstName?: string, surname?: string): string {
  return [firstName, surname].filter(Boolean).join(' ') || 'BlueSea user';
}

export default function MrGLinksLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { store, rates } = useMrGLinks();
  const balanceNgn = Number(String(user?.availableBalance ?? user?.balance ?? '0').replace(/[^\d.-]/g, '')) || 0;
  const pageTitle = [...navigation, ...comingSoon].find((item) => item.path === location.pathname)?.label ?? 'MrG Links';
  const groups = ['Workspace', 'Growth', 'Manage'];

  const sidebarContent = (
    <>
      <div className="flex h-[76px] items-center justify-between border-b border-white/10 px-5">
        <button type="button" onClick={() => navigate('/mrg-links')} className="flex items-center gap-3 text-left">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-400 to-blue-700 text-white shadow-lg shadow-sky-900/30"><Link2 size={21} /></span>
          <span className="leading-tight"><span className="block text-[17px] font-black tracking-tight text-white">MrG <span className="text-sky-300">Links</span></span><span className="mt-1 block text-[9px] font-semibold uppercase tracking-[.22em] text-slate-400">by BlueSea</span></span>
        </button>
        <button type="button" onClick={() => setMobileOpen(false)} className="rounded-lg p-2 text-slate-400 hover:bg-white/10 lg:hidden" aria-label="Close navigation"><X size={18} /></button>
      </div>
      <div className="px-4 pt-5">
        <div className="rounded-2xl border border-sky-400/15 bg-gradient-to-br from-sky-500/15 to-blue-500/5 p-3">
          <div className="flex items-center justify-between"><span className="text-[10px] font-bold uppercase tracking-[.18em] text-sky-200">Link credits</span><Zap size={14} className="text-sky-300" /></div>
          <div className="mt-2 flex items-end justify-between"><span className="text-3xl font-black tracking-tight text-white">{store.credits}</span><span className="pb-1 text-[10px] text-slate-400">available</span></div>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-gradient-to-r from-sky-400 to-cyan-300" style={{ width: `${Math.min(100, (store.credits / 50) * 100)}%` }} /></div>
          <button type="button" onClick={() => { navigate('/mrg-links/plans'); setMobileOpen(false); }} className="mt-3 flex w-full items-center justify-between rounded-xl bg-sky-400/15 px-3 py-2 text-xs font-bold text-sky-100 transition hover:bg-sky-400/25">Get more credits <ArrowUpRight size={14} /></button>
        </div>
      </div>
      <nav className="min-h-0 flex-1 overflow-y-auto px-3 py-5">
        {groups.map((group) => (
          <div key={group} className="mb-5">
            <p className="mb-2 px-3 text-[9px] font-extrabold uppercase tracking-[.2em] text-slate-500">{group}</p>
            <div className="space-y-1">
              {navigation.filter((item) => item.group === group).map((item) => {
                const Icon = item.icon;
                const active = location.pathname === item.path || (item.path !== '/mrg-links' && location.pathname.startsWith(`${item.path}/`));
                return <NavLink key={item.path} to={item.path} onClick={() => setMobileOpen(false)} className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-[12px] font-semibold transition-all ${active ? 'bg-sky-400 text-slate-950 shadow-lg shadow-sky-950/20' : 'text-slate-300 hover:bg-white/[.07] hover:text-white'}`}><Icon size={16} className={active ? 'text-slate-950' : 'text-slate-400 group-hover:text-sky-300'} /><span className="flex-1">{item.label}</span>{active && <span className="h-1.5 w-1.5 rounded-full bg-slate-950" />}</NavLink>;
              })}
            </div>
          </div>
        ))}
        <div className="mb-2 px-3 text-[9px] font-extrabold uppercase tracking-[.2em] text-slate-500">Coming soon</div>
        <div className="space-y-1">
          {comingSoon.map((item) => { const Icon = item.icon; return <NavLink key={item.path} to={item.path} onClick={() => setMobileOpen(false)} className={({ isActive }) => `flex items-center gap-3 rounded-xl px-3 py-2.5 text-[11px] font-medium transition ${isActive ? 'bg-white/10 text-white' : 'text-slate-400 hover:bg-white/[.06] hover:text-white'}`}><Icon size={15} /><span className="flex-1">{item.label}</span><span className="rounded-md border border-white/10 px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider text-slate-500">Soon</span></NavLink>; })}
        </div>
      </nav>
      <div className="border-t border-white/10 p-4">
        <button type="button" onClick={() => navigate('/dashboard')} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-xs font-semibold text-slate-300 transition hover:bg-white/[.07] hover:text-white"><ArrowLeft size={15} /><span>Back to BlueSea</span><ExternalLink size={12} className="ml-auto text-slate-500" /></button>
        <div className="mt-3 flex items-center gap-2 px-3 text-[9px] text-slate-500"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />BlueSea Mobile workspace</div>
      </div>
    </>
  );

  return (
    <div className="mrg-shell min-h-screen bg-[#f4f7fb] text-slate-900 dark:bg-[#0a1220] dark:text-slate-100">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[258px] flex-col bg-[#101d31] text-white lg:flex">{sidebarContent}</aside>
      {mobileOpen && <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm lg:hidden" onClick={() => setMobileOpen(false)}><aside className="flex h-full w-[285px] flex-col bg-[#101d31]" onClick={(event) => event.stopPropagation()}>{sidebarContent}</aside></div>}
      <div className="min-h-screen lg:pl-[258px]">
        <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl dark:border-white/10 dark:bg-[#0c1728]/90">
          <div className="flex h-[68px] items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
            <div className="flex min-w-0 items-center gap-3">
              <button type="button" onClick={() => setMobileOpen(true)} className="rounded-xl border border-slate-200 p-2 text-slate-600 hover:bg-slate-50 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/5 lg:hidden" aria-label="Open navigation"><Menu size={18} /></button>
              <div className="min-w-0"><div className="flex items-center gap-2"><span className="hidden rounded-lg bg-sky-500/10 p-1.5 text-sky-600 dark:text-sky-300 sm:inline-flex"><Link2 size={14} /></span><p className="truncate text-sm font-extrabold tracking-tight">{pageTitle}</p><span className="hidden rounded-full border border-sky-500/20 bg-sky-500/10 px-2 py-0.5 text-[8px] font-bold uppercase tracking-widest text-sky-700 dark:text-sky-300 sm:inline-flex">MrG workspace</span><span className="hidden rounded-full border border-amber-400/30 bg-amber-400/10 px-2 py-0.5 text-[8px] font-bold uppercase tracking-widest text-amber-700 dark:text-amber-300 md:inline-flex">Frontend preview</span></div><p className="mt-0.5 hidden text-[10px] text-slate-500 dark:text-slate-400 sm:block">Link intelligence for people and businesses</p></div>
            </div>
            <div className="flex shrink-0 items-center gap-2 sm:gap-3">
              <div className="hidden rounded-xl border border-slate-200 bg-white px-3 py-2 text-right dark:border-white/10 dark:bg-white/[.04] sm:block"><p className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">BlueSea wallet</p><p className="text-xs font-extrabold">{formatMrGPrice(balanceNgn, store.currency, rates)}</p></div>
              <div className="relative">
                <button type="button" onClick={() => setProfileOpen((value) => !value)} className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white p-1.5 pr-2.5 text-left transition hover:border-sky-300 dark:border-white/10 dark:bg-white/[.04]"><span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-sky-500 to-blue-700 text-[11px] font-black text-white">{(user?.firstName?.[0] || 'B').toUpperCase()}</span><span className="hidden max-w-[120px] truncate text-[10px] font-bold sm:block">{shortName(user?.firstName, user?.surname)}</span><ChevronDown size={13} className="text-slate-400" /></button>
                {profileOpen && <div className="absolute right-0 top-12 z-50 w-52 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl dark:border-white/10 dark:bg-[#142238]"><div className="border-b border-slate-100 px-3 py-2 dark:border-white/10"><p className="truncate text-xs font-bold">{shortName(user?.firstName, user?.surname)}</p><p className="truncate text-[10px] text-slate-500">{user?.email}</p></div><button type="button" onClick={() => { setProfileOpen(false); navigate('/mrg-links/settings'); }} className="mt-1 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-white/5"><Settings2 size={14} />Workspace settings</button><button type="button" onClick={() => { setProfileOpen(false); navigate('/dashboard'); }} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-white/5"><ArrowLeft size={14} />Back to BlueSea</button></div>}
              </div>
            </div>
          </div>
        </header>
        <main className="mx-auto w-full max-w-[1500px] px-4 pb-12 pt-6 sm:px-6 lg:px-8"><Outlet /></main>
        <footer className="border-t border-slate-200/70 px-4 py-5 text-center text-[10px] text-slate-400 dark:border-white/10 sm:px-6 lg:px-8"><span className="font-bold text-slate-500 dark:text-slate-300">MrG Links</span> · A BlueSea Mobile product · <button type="button" onClick={() => navigate('/support')} className="font-semibold text-sky-600 hover:underline dark:text-sky-300">Get support</button></footer>
      </div>
    </div>
  );
}
