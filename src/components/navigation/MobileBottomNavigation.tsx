import { NavLink, useLocation } from 'react-router-dom';
import { Capacitor } from '@capacitor/core';
import {
  Home,
  Smartphone,
  Wifi,
  Link2,
  Radio,
  Briefcase,
  Ticket,
  Settings,
  UserRound,
  ChevronUp,
  ChevronDown,
  X,
  Check,
} from 'lucide-react';
import type { ComponentType, MouseEvent } from 'react';
import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { navMotionStyles, navStyles } from './MobileBottomNavigation.styles';
import {
  getPreferredWorkspace,
  WORKSPACE_HOME,
  type WorkspaceId,
} from '@/features/workspace/workspacePreference';

type NavIcon = ComponentType<{ className?: string; 'aria-hidden'?: boolean }>;

interface NavigationItem {
  id: string;
  label: string;
  path: string;
  icon: NavIcon;
}

const HOME_ITEM: NavigationItem = {
  id: 'home',
  label: 'Home',
  path: '/dashboard',
  icon: Home,
};

/**
 * These are the selectable destinations. The four visible destinations are
 * persisted by ID, so labels/icons can be changed without breaking saved
 * preferences. Confirm the four feature route paths against the app router
 * before merging if their route names differ in your project.
 */
const CUSTOMIZABLE_ITEMS: NavigationItem[] = [
  { id: 'airtime', label: 'Airtime', path: '/airtime', icon: Smartphone },
  { id: 'data', label: 'Data', path: '/data', icon: Wifi },
  { id: 'paylink', label: 'Paylink', path: '/paylink', icon: Link2 },
  { id: 'blue-connect', label: 'Blue Connect', path: '/blue-connect', icon: Radio },
  { id: 'payroll', label: 'Payroll', path: '/payroll-pro', icon: Briefcase },
  { id: 'tickets', label: 'BlueTickets', path: '/marketplace', icon: Ticket },
  { id: 'mrg-links', label: 'MrG Links', path: '/mrg-links', icon: Link2 },
  { id: 'settings', label: 'Settings', path: '/settings', icon: Settings },
  { id: 'profile', label: 'Profile', path: '/profile', icon: UserRound },
];

const STORAGE_KEY = 'bluesea.mobile-bottom-navigation.v1';
const VISIBLE_CUSTOM_ITEMS = 4;
const TRIPLE_TAP_WINDOW_MS = 650;

const DEFAULT_SELECTION = ['payroll', 'tickets', 'settings', 'profile'];

function readSavedSelection(): string[] {
  if (typeof window === 'undefined') return DEFAULT_SELECTION;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SELECTION;

    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return DEFAULT_SELECTION;

    const validIds = new Set(CUSTOMIZABLE_ITEMS.map((item) => item.id));
    const clean = parsed.filter(
      (id): id is string => typeof id === 'string' && validIds.has(id),
    );

    // Keep the dock predictable and always render exactly four user slots.
    const unique = [...new Set(clean)].slice(0, VISIBLE_CUSTOM_ITEMS);
    for (const fallbackId of DEFAULT_SELECTION) {
      if (unique.length >= VISIBLE_CUSTOM_ITEMS) break;
      if (!unique.includes(fallbackId)) unique.push(fallbackId);
    }
    return unique;
  } catch {
    // Storage can be unavailable in private/restricted WebView contexts.
    return DEFAULT_SELECTION;
  }
}

function isItemActive(pathname: string, path: string): boolean {
  if (path === '/dashboard') {
    return pathname === '/' || pathname === '/dashboard' ||
      pathname.startsWith('/dashboard/') ||
      pathname.startsWith('/workspace/');
  }

  return pathname === path || pathname.startsWith(`${path}/`);
}

export function MobileBottomNavigation() {
  const location = useLocation();
  const [workspace, setWorkspace] = useState<WorkspaceId>('personal');
  const [selectedIds, setSelectedIds] = useState<string[]>(readSavedSelection);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const homeTapCount = useRef(0);
  const homeTapTimer = useRef<number | null>(null);

  useEffect(() => {
    let active = true;
    void getPreferredWorkspace().then((value) => {
      if (active) setWorkspace(value);
    });
    return () => { active = false; };
  }, [location.pathname]);

  useEffect(() => () => {
    if (homeTapTimer.current) window.clearTimeout(homeTapTimer.current);
  }, []);

  const homePath = WORKSPACE_HOME[workspace] || HOME_ITEM.path;
  const homeItem = { ...HOME_ITEM, path: homePath };
  const selectedItems = selectedIds
    .map((id) => CUSTOMIZABLE_ITEMS.find((item) => item.id === id))
    .filter((item): item is NavigationItem => Boolean(item));

  // Keep the dock's existing native-only behavior.
  if (!Capacitor.isNativePlatform()) return null;

  const handleHomeTap = (event: MouseEvent<HTMLAnchorElement>) => {
    if (Capacitor.getPlatform() !== 'android') return;

    homeTapCount.current += 1;
    if (homeTapTimer.current) window.clearTimeout(homeTapTimer.current);

    if (homeTapCount.current >= 3) {
      event.preventDefault();
      homeTapCount.current = 0;
      setSaveMessage('');
      setIsEditorOpen(true);
      return;
    }

    homeTapTimer.current = window.setTimeout(() => {
      homeTapCount.current = 0;
    }, TRIPLE_TAP_WINDOW_MS);
  };

  const toggleItem = (id: string) => {
    setSaveMessage('');
    setSelectedIds((current) => {
      if (current.includes(id)) return current.filter((itemId) => itemId !== id);
      if (current.length >= VISIBLE_CUSTOM_ITEMS) return current;
      return [...current, id];
    });
  };

  const moveItem = (index: number, direction: -1 | 1) => {
    setSelectedIds((current) => {
      const nextIndex = index + direction;
      if (nextIndex < 0 || nextIndex >= current.length) return current;
      const next = [...current];
      [next[index], next[nextIndex]] = [next[nextIndex], next[index]];
      return next;
    });
  };

  const saveSelection = () => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(selectedIds));
      setIsEditorOpen(false);
    } catch {
      setSaveMessage('Could not save on this device. Please check app storage permissions.');
    }
  };

  return (
    <>
      <style>{navMotionStyles}</style>
      <nav
        className={navStyles.wrapper}
        aria-label="BlueSea Mobile primary navigation"
      >
        {/* The dock itself is the glass surface; the surrounding page stays clear. */}
        <svg
          aria-hidden="true"
          focusable="false"
          viewBox="0 0 460 84"
          preserveAspectRatio="none"
          className="pointer-events-none absolute inset-0 z-0 h-full w-full overflow-visible"
        >
          <defs>
            <linearGradient id="bluesea-nav-orbit-gradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#1DA1F2" stopOpacity="0" />
              <stop offset="42%" stopColor="#1DA1F2" stopOpacity="0.45" />
              <stop offset="72%" stopColor="#8BD8FF" stopOpacity="1" />
              <stop offset="100%" stopColor="#1DA1F2" stopOpacity="0" />
            </linearGradient>
          </defs>
          <rect
            x="0.8" y="0.8" width="458.4" height="82.4" rx="40"
            pathLength="1000" fill="none" stroke="#69C5FF"
            strokeOpacity="0.16" strokeWidth="1"
          />
          <rect
            x="0.8" y="0.8" width="458.4" height="82.4" rx="40"
            pathLength="1000" fill="none"
            stroke="url(#bluesea-nav-orbit-gradient)"
            strokeWidth="1.25" strokeLinecap="round" strokeDasharray="58 942"
          >
            <animate
              attributeName="stroke-dashoffset"
              from="0" to="-1000" dur="7s" repeatCount="indefinite"
            />
          </rect>
        </svg>

        {[homeItem, ...selectedItems].map((item) => {
          const Icon = item.icon;
          const active = isItemActive(location.pathname, item.path);
          const isHome = item.id === 'home';

          return (
            <NavLink
              key={item.id}
              to={item.path}
              aria-label={item.label}
              aria-current={active ? 'page' : undefined}
              title={item.label}
              onClick={isHome ? handleHomeTap : undefined}
              className={({ isActive }) =>
                cn(
                  navStyles.link,
                  (active || isActive) && navStyles.activeLink,
                  (active || isActive) && 'bluesea-nav-selected',
                  isHome && 'bluesea-nav-home',
                )
              }
            >
              <span
                className={cn(
                  navStyles.iconCircle,
                  active ? navStyles.activeIconCircle : navStyles.inactiveIconCircle,
                )}
              >
                <Icon
                  className={cn(
                    navStyles.navIcon,
                    active ? navStyles.activeIcon : navStyles.inactiveIcon,
                  )}
                  aria-hidden
                />
              </span>
              <span
                className={cn(
                  navStyles.label,
                  active ? navStyles.activeLabel : navStyles.inactiveLabel,
                )}
              >
                {item.label}
              </span>
            </NavLink>
          );
        })}
      </nav>

      {/* Android-only editor; no visible customization affordance is added to the dock. */}
      {isEditorOpen && Capacitor.getPlatform() === 'android' && (
        <div
          className="fixed inset-0 z-[120] flex items-center justify-center bg-black/45 px-5 backdrop-blur-[3px]"
          onClick={() => setIsEditorOpen(false)}
          role="presentation"
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="bluesea-nav-editor-title"
            className="w-full max-w-[340px] rounded-[24px] border border-white/15 bg-slate-950/95 p-4 text-white shadow-[0_20px_70px_rgba(0,0,0,0.55)]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-3 flex items-center justify-between">
              <div>
                <h2 id="bluesea-nav-editor-title" className="text-sm font-semibold">
                  Customize navigation
                </h2>
                <p className="mt-1 text-[11px] text-slate-400">
                  Choose four shortcuts and arrange their order.
                </p>
              </div>
              <button
                type="button"
                aria-label="Close navigation customization"
                onClick={() => setIsEditorOpen(false)}
                className="rounded-full p-2 text-slate-400 transition hover:bg-white/10 hover:text-white"
              >
                <X className="h-4 w-4" aria-hidden />
              </button>
            </div>

            <div className="mb-3 flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2">
              <span className="text-xs text-slate-300">Home</span>
              <span className="text-[10px] text-sky-300">Fixed position</span>
            </div>

            <div className="mb-3 grid grid-cols-3 gap-2">
              {CUSTOMIZABLE_ITEMS.map((item) => {
                const Icon = item.icon;
                const checked = selectedIds.includes(item.id);
                const disabled = !checked && selectedIds.length >= VISIBLE_CUSTOM_ITEMS;

                return (
                  <button
                    key={item.id}
                    type="button"
                    aria-pressed={checked}
                    disabled={disabled}
                    onClick={() => toggleItem(item.id)}
                    className={cn(
                      'relative flex min-h-[76px] flex-col items-center justify-center gap-1.5 rounded-2xl border px-1 py-2 transition-all duration-200',
                      checked
                        ? 'border-sky-400/70 bg-sky-500/15 text-sky-200 shadow-[inset_0_0_18px_rgba(56,189,248,0.08)]'
                        : 'border-white/10 bg-white/[0.035] text-slate-300',
                      disabled && 'cursor-not-allowed opacity-35',
                    )}
                  >
                    {checked && (
                      <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-sky-400 text-slate-950">
                        <Check className="h-2.5 w-2.5" aria-hidden />
                      </span>
                    )}
                    <Icon className="h-[21px] w-[21px]" aria-hidden />
                    <span className="max-w-full truncate text-[10px] font-medium">
                      {item.label}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="mb-3 space-y-1.5">
              <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-slate-500">
                Display order
              </p>
              {selectedIds.map((id, index) => {
                const item = CUSTOMIZABLE_ITEMS.find((candidate) => candidate.id === id);
                if (!item) return null;
                const Icon = item.icon;
                return (
                  <div
                    key={id}
                    className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.035] px-2.5 py-1.5"
                  >
                    <Icon className="h-4 w-4 text-sky-300" aria-hidden />
                    <span className="flex-1 text-xs">{item.label}</span>
                    <button
                      type="button"
                      aria-label={`Move ${item.label} up`}
                      disabled={index === 0}
                      onClick={() => moveItem(index, -1)}
                      className="rounded-md p-1 text-slate-300 hover:bg-white/10 disabled:opacity-25"
                    >
                      <ChevronUp className="h-4 w-4" aria-hidden />
                    </button>
                    <button
                      type="button"
                      aria-label={`Move ${item.label} down`}
                      disabled={index === selectedIds.length - 1}
                      onClick={() => moveItem(index, 1)}
                      className="rounded-md p-1 text-slate-300 hover:bg-white/10 disabled:opacity-25"
                    >
                      <ChevronDown className="h-4 w-4" aria-hidden />
                    </button>
                  </div>
                );
              })}
            </div>

            {saveMessage && (
              <p role="alert" className="mb-2 text-[11px] text-rose-300">
                {saveMessage}
              </p>
            )}

            <button
              type="button"
              onClick={saveSelection}
              disabled={selectedIds.length !== VISIBLE_CUSTOM_ITEMS}
              className="w-full rounded-xl bg-sky-500 px-4 py-2.5 text-xs font-semibold text-white shadow-lg shadow-sky-500/20 transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Save navigation
            </button>
          </section>
        </div>
      )}

      {/* Preserve the existing scroll clearance below the fixed dock. */}
      <div
        aria-hidden="true"
        className="h-[calc(92px+env(safe-area-inset-bottom,0px))] md:hidden shrink-0"
      />
    </>
  );
}

export default MobileBottomNavigation;
