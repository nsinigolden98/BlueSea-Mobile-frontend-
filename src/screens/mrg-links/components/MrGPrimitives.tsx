import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { X, Sparkles } from 'lucide-react';

export function PageHeading({ eyebrow, title, description, action }: { eyebrow?: string; title: string; description?: string; action?: ReactNode }) {
  return <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div className="min-w-0"><p className="mb-2 text-[9px] font-extrabold uppercase tracking-[.22em] text-sky-600 dark:text-sky-300">{eyebrow || 'MrG Links workspace'}</p><h1 className="text-2xl font-black tracking-tight text-slate-950 dark:text-white sm:text-[28px]">{title}</h1>{description && <p className="mt-2 max-w-2xl text-xs leading-6 text-slate-500 dark:text-slate-400">{description}</p>}</div>{action && <div className="shrink-0">{action}</div>}</div>;
}

export function MetricTile({ label, value, detail, icon: Icon, accent = 'sky' }: { label: string; value: string; detail: string; icon: LucideIcon; accent?: 'sky' | 'violet' | 'emerald' | 'amber' }) {
  const tones = { sky: 'bg-sky-500/10 text-sky-600 dark:text-sky-300', violet: 'bg-violet-500/10 text-violet-600 dark:text-violet-300', emerald: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-300', amber: 'bg-amber-500/10 text-amber-600 dark:text-amber-300' };
  return <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_8px_28px_rgba(15,23,42,.035)] dark:border-white/10 dark:bg-[#111e30] sm:p-5"><div className="flex items-center justify-between"><span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">{label}</span><span className={`flex h-9 w-9 items-center justify-center rounded-xl ${tones[accent]}`}><Icon size={17} /></span></div><p className="mt-4 text-2xl font-black tracking-tight text-slate-950 dark:text-white">{value}</p><p className="mt-1 text-[10px] text-slate-400">{detail}</p></div>;
}

export function EmptyState({ icon: Icon, title, description, action }: { icon: LucideIcon; title: string; description: string; action?: ReactNode }) {
  return <div className="flex min-h-[230px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white/70 px-5 py-10 text-center dark:border-white/15 dark:bg-white/[.025]"><span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-500/10 text-sky-600 dark:text-sky-300"><Icon size={22} /></span><h3 className="mt-4 text-sm font-extrabold text-slate-900 dark:text-white">{title}</h3><p className="mt-2 max-w-sm text-[11px] leading-5 text-slate-500 dark:text-slate-400">{description}</p>{action && <div className="mt-4">{action}</div>}</div>;
}

export function MrGButton({ children, onClick, variant = 'primary', type = 'button', disabled = false, className = '' }: { children: ReactNode; onClick?: () => void; variant?: 'primary' | 'secondary' | 'ghost' | 'danger'; type?: 'button' | 'submit'; disabled?: boolean; className?: string }) {
  const styles = {
    primary: 'bg-slate-950 text-white shadow-lg shadow-slate-900/10 hover:bg-slate-800 dark:bg-sky-400 dark:text-slate-950 dark:hover:bg-sky-300',
    secondary: 'border border-slate-200 bg-white text-slate-700 hover:border-sky-300 hover:bg-sky-50 dark:border-white/10 dark:bg-white/[.04] dark:text-slate-200 dark:hover:bg-white/[.08]',
    ghost: 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/[.07]',
    danger: 'border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 dark:border-rose-400/20 dark:bg-rose-500/10 dark:text-rose-300',
  };
  return <button type={type} disabled={disabled} onClick={onClick} className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-[11px] font-bold transition-all active:scale-[.98] disabled:cursor-not-allowed disabled:opacity-45 ${styles[variant]} ${className}`}>{children}</button>;
}

export function MrGModal({ open, title, description, onClose, children, wide = false }: { open: boolean; title: string; description?: string; onClose: () => void; children: ReactNode; wide?: boolean }) {
  if (!open) return null;
  return <div className="fixed inset-0 z-[80] flex items-end justify-center bg-slate-950/55 p-0 backdrop-blur-sm sm:items-center sm:p-5" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><section role="dialog" aria-modal="true" aria-label={title} className={`max-h-[92vh] w-full overflow-y-auto rounded-t-[26px] border border-slate-200 bg-white p-5 shadow-2xl dark:border-white/10 dark:bg-[#101d30] sm:rounded-[26px] sm:p-6 ${wide ? 'max-w-2xl' : 'max-w-lg'}`}><div className="mb-5 flex items-start justify-between gap-4"><div><h2 className="text-base font-black text-slate-950 dark:text-white">{title}</h2>{description && <p className="mt-1 text-[11px] leading-5 text-slate-500 dark:text-slate-400">{description}</p>}</div><button type="button" onClick={onClose} className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-white/10 dark:hover:text-white" aria-label="Close dialog"><X size={17} /></button></div>{children}</section></div>;
}

export function ComingSoonPanel({ title, description, features }: { title: string; description: string; features: string[] }) {
  return <div className="relative overflow-hidden rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#111e30] sm:p-10"><div className="pointer-events-none absolute -right-12 -top-16 h-64 w-64 rounded-full bg-sky-400/10 blur-3xl"/><div className="relative mx-auto max-w-xl py-8 text-center"><span className="mx-auto flex h-16 w-16 items-center justify-center rounded-[22px] bg-gradient-to-br from-sky-400 to-blue-700 text-white shadow-xl shadow-sky-500/20"><Sparkles size={28}/></span><span className="mt-6 inline-flex rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1 text-[9px] font-extrabold uppercase tracking-[.18em] text-amber-700 dark:text-amber-300">Coming soon</span><h2 className="mt-4 text-2xl font-black tracking-tight text-slate-950 dark:text-white">{title}</h2><p className="mx-auto mt-3 max-w-lg text-xs leading-6 text-slate-500 dark:text-slate-400">{description}</p><div className="mx-auto mt-7 grid max-w-md gap-2 text-left sm:grid-cols-2">{features.map((feature) => <div key={feature} className="flex items-center gap-2 rounded-xl border border-slate-200/80 bg-slate-50 px-3 py-3 text-[10px] font-semibold text-slate-600 dark:border-white/10 dark:bg-white/[.03] dark:text-slate-300"><span className="h-1.5 w-1.5 rounded-full bg-sky-500"/>{feature}</div>)}</div><p className="mt-8 text-[10px] text-slate-400">This area is reserved in the MrG Links workspace and will be enabled in a future release.</p></div></div>;
}
