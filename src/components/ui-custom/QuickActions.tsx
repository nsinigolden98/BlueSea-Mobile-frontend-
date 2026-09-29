import { useEffect, useMemo, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import {
  ArrowDownToLine,
  ArrowLeftRight,
  Bell,
  BriefcaseBusiness,
  Check,
  ChevronDown,
  CircleHelp,
  CreditCard,
  Edit3,
  Gift,
  Headphones,
  Landmark,
  Lightbulb,
  Link2,
  Minus,
  Network,
  Plus,
  QrCode,
  ReceiptText,
  Search,
  Settings,
  ShieldCheck,
  Smartphone,
  Ticket,
  Tv,
  UserRound,
  Wallet,
  Wifi,
  X,
  Zap,
} from 'lucide-react';

type QuickActionDefinition = {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  path: string;
  category: string;
  fixed?: boolean;
  enabled?: boolean;
};

type QuickActionsProps = {
  className?: string;
  /**
   * Optional initial fallback for a first-time user.
   * The user's selected four are persisted in localStorage.
   */
  initialCustomActionIds?: string[];
};

const QUICK_ACTIONS_STORAGE_KEY = 'bluesea_quick_actions';

const FIXED_ACTION_IDS = ['tickets', 'airtime', 'data', 'affiliate'] as const;
const MAX_CUSTOM_ACTIONS = 4;

/**
 * Central catalogue.
 *
 * IMPORTANT:
 * Routes below are kept as explicit metadata so adding a future service only
 * requires one catalogue entry. Verify any route that is not already present
 * in your application before enabling it in production.
 */
const quickActionCatalog: QuickActionDefinition[] = [
  {
    id: 'tickets',
    label: 'Tickets',
    icon: Ticket,
    path: '/marketplace',
    category: 'Commerce',
    fixed: true,
    enabled: true,
  },
  {
    id: 'airtime',
    label: 'Airtime',
    icon: Smartphone,
    path: '/airtime',
    category: 'Everyday Payments',
    fixed: true,
    enabled: true,
  },
  {
    id: 'data',
    label: 'Data',
    icon: Wifi,
    path: '/data',
    category: 'Everyday Payments',
    fixed: true,
    enabled: true,
  },
  {
    id: 'affiliate',
    label: 'Affiliate',
    icon: Link2,
    path: '/affiliate',
    category: 'Partnership',
    fixed: true,
    enabled: true,
  },

  {
    id: 'deposit',
    label: 'Deposit',
    icon: ArrowDownToLine,
    path: '/deposit',
    category: 'Everyday Payments',
    enabled: true,
  },
  {
    id: 'transfer',
    label: 'Transfer',
    icon: ArrowLeftRight,
    path: '/transfer',
    category: 'Everyday Payments',
    enabled: true,
  },
  {
    id: 'electricity',
    label: 'Electricity',
    icon: Lightbulb,
    path: '/light-bills',
    category: 'Everyday Payments',
    enabled: true,
  },
  {
    id: 'tv-subscription',
    label: 'TV Subscription',
    icon: Tv,
    path: '/tv-subscription',
    category: 'Everyday Payments',
    enabled: true,
  },
  {
    id: 'wallet',
    label: 'Wallet',
    icon: Wallet,
    path: '/wallet',
    category: 'Wallet & Rewards',
    enabled: true,
  },
  {
    id: 'smart-auto-top-up',
    label: 'Smart Auto Top-up',
    icon: Zap,
    path: '/auto-top-up',
    category: 'Wallet & Rewards',
    enabled: true,
  },
  {
    id: 'referral-rewards',
    label: 'Referral Rewards',
    icon: Gift,
    path: '/referral',
    category: 'Wallet & Rewards',
    enabled: true,
  },
  {
    id: 'group-payment',
    label: 'Group Payment',
    icon: CreditCard,
    path: '/group-payment',
    category: 'Wallet & Rewards',
    enabled: true,
  },
  {
    id: 'airtime-buyback',
    label: 'Airtime Buyback',
    icon: ReceiptText,
    path: '/airtime-buyback',
    category: 'Wallet & Rewards',
    enabled: true,
  },
  {
    id: 'payroll',
    label: 'Payroll Pro',
    icon: BriefcaseBusiness,
    path: '/payroll',
    category: 'Business',
    enabled: true,
  },
  {
    id: 'blueconnect',
    label: 'BlueConnect',
    icon: Network,
    path: '/blueconnect',
    category: 'Partnership',
    enabled: true,
  },
  {
    id: 'paylink',
    label: 'Paylink',
    icon: Link2,
    path: '/paylink',
    category: 'Business',
    enabled: true,
  },
  {
    id: 'scan-assignment',
    label: 'Scan Assignment',
    icon: QrCode,
    path: '/scan-assignment',
    category: 'Advanced Services',
    enabled: true,
  },
  {
    id: 'support',
    label: 'Support',
    icon: Headphones,
    path: '/support',
    category: 'Account & Support',
    enabled: true,
  },
  {
    id: 'notifications',
    label: 'Notifications',
    icon: Bell,
    path: '/notifications',
    category: 'Account & Support',
    enabled: true,
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: Settings,
    path: '/settings',
    category: 'Account & Support',
    enabled: true,
  },
  {
    id: 'profile',
    label: 'Profile',
    icon: UserRound,
    path: '/profile',
    category: 'Account & Support',
    enabled: true,
  },
  {
    id: 'insurance',
    label: 'Insurance',
    icon: ShieldCheck,
    path: '/insurance',
    category: 'Insurance',
    enabled: true,
  },
  {
    id: 'marketplace',
    label: 'Marketplace',
    icon: Landmark,
    path: '/marketplace',
    category: 'Commerce',
    enabled: true,
  },
];

const DEFAULT_CUSTOM_ACTION_IDS = [
  'deposit',
  'transfer',
  'electricity',
  'tv-subscription',
];

const categoryOrder = [
  'Everyday Payments',
  'Wallet & Rewards',
  'Finance',
  'Commerce',
  'Insurance',
  'Advanced Services',
  'Business',
  'Partnership',
  'Gateways',
  'Account & Support',
];

function getDefinition(id: string) {
  return quickActionCatalog.find((action) => action.id === id);
}

function sanitizeCustomIds(ids: string[]) {
  const valid = new Set(
    quickActionCatalog
      .filter((action) => action.enabled !== false && !action.fixed)
      .map((action) => action.id),
  );

  return Array.from(new Set(ids)).filter((id) => valid.has(id)).slice(0, MAX_CUSTOM_ACTIONS);
}

function QuickActionLabel({
  label,
  compact = false,
}: {
  label: string;
  compact?: boolean;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [overflowing, setOverflowing] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const measure = () => {
      setOverflowing(element.scrollWidth > element.clientWidth + 1);
    };

    measure();

    const observer = new ResizeObserver(measure);
    observer.observe(element);

    return () => observer.disconnect();
  }, [label]);

  return (
    <span
      className={cn(
        'block w-full overflow-hidden whitespace-nowrap text-center',
        compact ? 'text-[9px]' : 'text-[10px] md:text-[11px]',
      )}
      aria-label={label}
      title={label}
    >
      <span
        ref={ref}
        className={cn(
          'inline-block max-w-full whitespace-nowrap font-semibold leading-tight',
          overflowing && 'quick-action-marquee',
        )}
      >
        {label}
      </span>
    </span>
  );
}

function QuickActionTile({
  action,
  onClick,
  compact = false,
}: {
  action: QuickActionDefinition;
  onClick: () => void;
  compact?: boolean;
}) {
  const Icon = action.icon;

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'group flex min-w-0 w-full flex-col items-center justify-start rounded-2xl',
        'px-1 py-2.5 transition duration-200 focus:outline-none focus-visible:ring-2',
        'focus-visible:ring-sky-500/50 active:scale-[0.97]',
        compact ? 'gap-1.5' : 'gap-2',
      )}
      aria-label={action.label}
    >
      <span
        className={cn(
          'flex shrink-0 items-center justify-center rounded-xl',
          'border border-slate-200/80 bg-white/55 shadow-sm backdrop-blur-md',
          'dark:border-slate-700/70 dark:bg-slate-900/45',
          'transition duration-200 group-hover:-translate-y-0.5 group-hover:border-sky-400/40',
          compact ? 'h-9 w-9' : 'h-10 w-10 md:h-11 md:w-11',
        )}
      >
        <Icon
          className={cn(
            'text-slate-700 dark:text-slate-200',
            compact ? 'h-[17px] w-[17px]' : 'h-[19px] w-[19px] md:h-5 md:w-5',
          )}
          strokeWidth={1.9}
        />
      </span>

      <span className="flex min-h-[22px] w-full max-w-[76px] items-center justify-center px-0.5 text-slate-700 dark:text-slate-200">
        <QuickActionLabel label={action.label} compact={compact} />
      </span>
    </button>
  );
}

function ServiceRow({
  action,
  selected,
  canAdd,
  onAdd,
  onRemove,
}: {
  action: QuickActionDefinition;
  selected: boolean;
  canAdd: boolean;
  onAdd: () => void;
  onRemove: () => void;
}) {
  const Icon = action.icon;

  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-2xl border px-3 py-2.5 transition',
        selected
          ? 'border-sky-400/35 bg-sky-500/[0.07] dark:border-sky-400/25 dark:bg-sky-400/[0.07]'
          : 'border-slate-200/70 bg-white/45 dark:border-slate-800/80 dark:bg-slate-950/30',
      )}
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200/80 bg-white/70 dark:border-slate-700/80 dark:bg-slate-900/70">
        <Icon className="h-[18px] w-[18px] text-slate-700 dark:text-slate-200" />
      </span>

      <div className="min-w-0 flex-1">
        <p className="truncate text-[12px] font-semibold text-slate-800 dark:text-slate-100">
          {action.label}
        </p>
        <p className="mt-0.5 truncate text-[10px] text-slate-500 dark:text-slate-400">
          {action.category}
        </p>
      </div>

      {selected ? (
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Remove ${action.label}`}
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-red-500/10 text-red-500 transition hover:bg-red-500/15 active:scale-95"
        >
          <Minus className="h-3.5 w-3.5" strokeWidth={2.4} />
        </button>
      ) : (
        <button
          type="button"
          onClick={onAdd}
          disabled={!canAdd}
          aria-label={`Add ${action.label}`}
          className={cn(
            'flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition active:scale-95',
            canAdd
              ? 'bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/15 dark:text-emerald-400'
              : 'cursor-not-allowed bg-slate-500/10 text-slate-400',
          )}
        >
          <Plus className="h-3.5 w-3.5" strokeWidth={2.5} />
        </button>
      )}
    </div>
  );
}

function QuickActionsEditor({
  selectedIds,
  onClose,
  onSave,
  saving,
}: {
  selectedIds: string[];
  onClose: () => void;
  onSave: (ids: string[]) => Promise<void>;
  saving: boolean;
}) {
  const [draftIds, setDraftIds] = useState<string[]>(sanitizeCustomIds(selectedIds));
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [error, setError] = useState('');
  const [showCategories, setShowCategories] = useState(false);

  const availableActions = useMemo(
    () =>
      quickActionCatalog.filter(
        (action) => action.enabled !== false && !action.fixed,
      ),
    [],
  );

  const categories = useMemo(() => {
    const found = new Set(availableActions.map((action) => action.category));
    return categoryOrder.filter((item) => found.has(item));
  }, [availableActions]);

  const filteredActions = useMemo(() => {
    const query = search.trim().toLowerCase();

    return availableActions
      .filter((action) => category === 'All' || action.category === category)
      .filter(
        (action) =>
          !query ||
          action.label.toLowerCase().includes(query) ||
          action.category.toLowerCase().includes(query),
      );
  }, [availableActions, category, search]);

  const addAction = (id: string) => {
    setError('');

    if (draftIds.includes(id)) return;

    if (draftIds.length >= MAX_CUSTOM_ACTIONS) {
      setError(
        'You can select up to 4 additional quick actions. Remove one to add another.',
      );
      return;
    }

    setDraftIds((current) => [...current, id]);
  };

  const removeAction = (id: string) => {
    setError('');
    setDraftIds((current) => current.filter((item) => item !== id));
  };

  const handleSave = async () => {
    try {
      setError('');
      await onSave(draftIds);
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : 'We could not save your Quick Actions. Please try again.',
      );
    }
  };

  const content = (
    <>
      <div className="flex items-start justify-between gap-4 border-b border-slate-200/70 px-4 py-4 dark:border-slate-800/80 sm:px-5">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400">
              <Edit3 className="h-4 w-4" />
            </div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Customize Quick Actions
            </h2>
          </div>
          <p className="mt-1 pl-10 text-[11px] text-slate-500 dark:text-slate-400">
            Choose up to 4 additional shortcuts for your dashboard.
          </p>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-500/10 hover:text-slate-900 dark:hover:text-white"
          aria-label="Close Quick Actions editor"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <div className="shrink-0 px-4 pt-4 sm:px-5">
          <div className="rounded-2xl border border-slate-200/70 bg-white/45 p-3 dark:border-slate-800/80 dark:bg-slate-950/25">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
                  Fixed shortcuts
                </p>
                <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                  These four cannot be removed.
                </p>
              </div>
              <span className="rounded-full bg-slate-900/[0.05] px-2 py-1 text-[10px] font-bold text-slate-600 dark:bg-white/[0.06] dark:text-slate-300">
                4 / 4
              </span>
            </div>

            <div className="mt-3 grid grid-cols-4 gap-1.5">
              {FIXED_ACTION_IDS.map((id) => {
                const action = getDefinition(id);
                if (!action) return null;

                return (
                  <div key={id} className="flex min-w-0 flex-col items-center gap-1">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/75 dark:bg-slate-900/70">
                      <action.icon className="h-4 w-4 text-slate-700 dark:text-slate-200" />
                    </div>
                    <span className="w-full truncate text-center text-[8px] font-semibold text-slate-600 dark:text-slate-300">
                      {action.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
                Your shortcuts
              </p>
              <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                {draftIds.length} / {MAX_CUSTOM_ACTIONS} selected
              </p>
            </div>

            <div className="flex items-center gap-1">
              {Array.from({ length: MAX_CUSTOM_ACTIONS }).map((_, index) => (
                <span
                  key={index}
                  className={cn(
                    'h-1.5 w-1.5 rounded-full',
                    index < draftIds.length
                      ? 'bg-sky-500'
                      : 'bg-slate-300 dark:bg-slate-700',
                  )}
                />
              ))}
            </div>
          </div>

          <div className="mt-3 flex gap-2">
            <div className="flex min-w-0 flex-1 items-center gap-2 rounded-xl border border-slate-200/80 bg-white/60 px-3 dark:border-slate-800 dark:bg-slate-950/40">
              <Search className="h-4 w-4 shrink-0 text-slate-400" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search services..."
                className="min-w-0 flex-1 bg-transparent py-2.5 text-[11px] text-slate-800 outline-none placeholder:text-slate-400 dark:text-slate-100"
                aria-label="Search services"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                  aria-label="Clear service search"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            <div className="relative">
              <button
                type="button"
                onClick={() => setShowCategories((current) => !current)}
                className="flex h-full min-w-[112px] items-center justify-between gap-2 rounded-xl border border-slate-200/80 bg-white/60 px-3 text-[10px] font-semibold text-slate-700 dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-200"
              >
                <span className="truncate">{category}</span>
                <ChevronDown className="h-3.5 w-3.5 shrink-0" />
              </button>

              {showCategories && (
                <div className="absolute right-0 top-[calc(100%+6px)] z-30 max-h-56 w-52 overflow-auto rounded-2xl border border-slate-200/80 bg-white/95 p-1.5 shadow-xl backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/95">
                  {['All', ...categories].map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => {
                        setCategory(item);
                        setShowCategories(false);
                      }}
                      className={cn(
                        'flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-[10px] font-semibold',
                        item === category
                          ? 'bg-sky-500/10 text-sky-600 dark:text-sky-400'
                          : 'text-slate-600 hover:bg-slate-500/5 dark:text-slate-300',
                      )}
                    >
                      <span className="truncate">{item}</span>
                      {item === category && <Check className="h-3.5 w-3.5" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {error && (
            <div
              role="alert"
              className="mt-3 rounded-xl border border-red-500/15 bg-red-500/[0.06] px-3 py-2 text-[10px] font-medium leading-relaxed text-red-600 dark:text-red-400"
            >
              {error}
            </div>
          )}
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-4 pt-3 sm:px-5">
          {filteredActions.length > 0 ? (
            <div className="space-y-2">
              {filteredActions.map((action) => {
                const selected = draftIds.includes(action.id);

                return (
                  <ServiceRow
                    key={action.id}
                    action={action}
                    selected={selected}
                    canAdd={draftIds.length < MAX_CUSTOM_ACTIONS}
                    onAdd={() => addAction(action.id)}
                    onRemove={() => removeAction(action.id)}
                  />
                );
              })}
            </div>
          ) : (
            <div className="flex min-h-[180px] flex-col items-center justify-center text-center">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-500/10 text-slate-400">
                <CircleHelp className="h-5 w-5" />
              </div>
              <p className="mt-3 text-xs font-semibold text-slate-700 dark:text-slate-200">
                No services found
              </p>
              <p className="mt-1 max-w-[260px] text-[10px] leading-relaxed text-slate-500">
                Try another search or category.
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="shrink-0 border-t border-slate-200/70 bg-white/55 px-4 py-3 backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-950/55 sm:px-5">
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-xl px-4 py-2.5 text-[11px] font-bold text-slate-600 transition hover:bg-slate-500/10 disabled:opacity-50 dark:text-slate-300"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="rounded-xl bg-sky-600 px-5 py-2.5 text-[11px] font-bold text-white shadow-sm transition hover:bg-sky-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </>
  );

  return (
    <>
      <style>{`
        @keyframes quickActionMarquee {
          0%, 20% { transform: translateX(0); }
          45%, 55% { transform: translateX(calc(-1 * var(--quick-action-shift))); }
          80%, 100% { transform: translateX(0); }
        }

        .quick-action-marquee {
          --quick-action-shift: 18px;
          animation: quickActionMarquee 4.8s ease-in-out infinite;
          will-change: transform;
        }

        @media (prefers-reduced-motion: reduce) {
          .quick-action-marquee {
            animation: none !important;
            transform: none !important;
          }
        }
      `}</style>

      <div
        className="fixed inset-0 z-[80] flex items-end justify-center bg-slate-950/35 p-0 backdrop-blur-[2px] md:items-center md:p-6"
        role="dialog"
        aria-modal="true"
        aria-labelledby="quick-actions-editor-title"
        onMouseDown={(event) => {
          if (event.target === event.currentTarget) onClose();
        }}
      >
        <div
          className={cn(
            'relative flex w-full flex-col overflow-hidden',
            'border border-white/45 bg-white/85 shadow-2xl backdrop-blur-2xl',
            'dark:border-white/[0.08] dark:bg-slate-950/85',
            'md:max-h-[min(760px,calc(100vh-48px))] md:max-w-2xl md:rounded-3xl',
            'max-h-[88vh] rounded-t-[28px]',
          )}
          onMouseDown={(event) => event.stopPropagation()}
        >
          <div className="mx-auto mt-2 h-1 w-10 shrink-0 rounded-full bg-slate-300 dark:bg-slate-700 md:hidden" />
          {content}
        </div>
      </div>
    </>
  );
}

export function QuickActions({
  className,
  initialCustomActionIds = DEFAULT_CUSTOM_ACTION_IDS,
}: QuickActionsProps) {
  const navigate = useNavigate();
  const [customIds, setCustomIds] = useState<string[]>(
    sanitizeCustomIds(initialCustomActionIds),
  );
  const [editorOpen, setEditorOpen] = useState(false);
  const [savingPreference, setSavingPreference] = useState(false);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(QUICK_ACTIONS_STORAGE_KEY);

      if (!stored) return;

      const parsed = JSON.parse(stored);

      if (Array.isArray(parsed)) {
        setCustomIds(sanitizeCustomIds(parsed));
      }
    } catch {
      setLoadError('Your saved Quick Actions could not be loaded.');
    }
  }, []);

  const fixedActions = FIXED_ACTION_IDS
    .map((id) => getDefinition(id))
    .filter(Boolean) as QuickActionDefinition[];

  const customActions = customIds
    .map((id) => getDefinition(id))
    .filter(Boolean) as QuickActionDefinition[];

  while (customActions.length < MAX_CUSTOM_ACTIONS) {
    const fallback = quickActionCatalog.find(
      (action) =>
        action.enabled !== false &&
        !action.fixed &&
        !customIds.includes(action.id) &&
        !customActions.some((selected) => selected.id === action.id),
    );

    if (!fallback) break;

    customActions.push(fallback);
  }

  const displayActions = [...fixedActions, ...customActions].slice(0, 8);

  const handleSave = async (ids: string[]) => {
    const sanitized = sanitizeCustomIds(ids);

    setSavingPreference(true);
    setLoadError('');

    try {
      window.localStorage.setItem(
        QUICK_ACTIONS_STORAGE_KEY,
        JSON.stringify(sanitized),
      );

      setCustomIds(sanitized);
      setEditorOpen(false);
    } catch {
      setLoadError(
        'Your Quick Actions could not be saved. Please try again.',
      );
    } finally {
      setSavingPreference(false);
    }
  };

  return (
    <>
      <section
        className={cn(
          'relative w-full overflow-hidden rounded-[26px]',
          'border border-white/55 bg-white/55 shadow-sm backdrop-blur-xl',
          'dark:border-white/[0.08] dark:bg-slate-950/45',
          className,
        )}
      >
        <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-white/80 dark:bg-white/10" />
        <div className="pointer-events-none absolute -right-16 -top-20 h-40 w-40 rounded-full bg-sky-400/[0.08] blur-3xl" />

        <div className="relative flex items-center justify-between gap-3 px-4 pb-2 pt-3.5 sm:px-5">
          <div className="min-w-0">
            <h2 className="text-[13px] font-bold tracking-tight text-slate-900 dark:text-white">
              Quick Actions
            </h2>
            <p className="mt-0.5 text-[9px] text-slate-500 dark:text-slate-400">
              Your frequently used services
            </p>
          </div>

          <button
            type="button"
            onClick={() => setEditorOpen(true)}
            className={cn(
              'group flex h-8 shrink-0 items-center justify-center rounded-xl',
              'border border-slate-200/70 bg-white/55 px-2.5 text-slate-600',
              'shadow-sm backdrop-blur-md transition hover:border-sky-400/40 hover:text-sky-600',
              'dark:border-slate-700/70 dark:bg-slate-900/45 dark:text-slate-300 dark:hover:text-sky-400',
              'md:gap-1.5 md:px-3',
            )}
            aria-label="Edit Quick Actions"
          >
            <Edit3 className="h-3.5 w-3.5" />
            <span className="hidden text-[10px] font-bold md:inline">Edit</span>
          </button>
        </div>

        <div className="relative px-3 pb-3.5 sm:px-4 sm:pb-4">
          {loadError && (
            <div className="mb-2 rounded-xl bg-amber-500/[0.07] px-3 py-2 text-[9px] font-medium text-amber-700 dark:text-amber-300">
              {loadError}
            </div>
          )}

          <div
            className={cn(
              'grid grid-cols-4 gap-x-1 gap-y-0.5 sm:gap-x-2',
              'opacity-100',
            )}
          >
            {displayActions.map((action) => (
              <QuickActionTile
                key={action.id}
                action={action}
                compact
                onClick={() => navigate(action.path)}
              />
            ))}
          </div>
        </div>
      </section>

      {editorOpen && (
        <QuickActionsEditor
          selectedIds={customIds}
          onClose={() => setEditorOpen(false)}
          onSave={handleSave}
          saving={savingPreference}
        />
      )}
    </>
  );
}

export default QuickActions;
