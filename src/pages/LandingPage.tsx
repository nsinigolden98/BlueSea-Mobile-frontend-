import { useEffect, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { Logo } from '@/components/ui-custom';
import { Button } from '@/components/ui/button';
import {
  ArrowRight,
  BarChart3,
  Building2,
  Check,
  ChevronDown,
  CircleHelp,
  CreditCard,
  Gift,
  Headphones,
  Bell,
  Eye,
  LockKeyhole,
  Coins,
  Pencil,
  ArrowDownLeft,
  ArrowUpRight,
  Link2,
  Lightbulb,
  Tv,
  LayoutGrid,
  House,
  Store,
  Settings,
  Globe,
  HandCoins,
  Instagram,
  Menu,
  RefreshCw,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Star,
  Ticket,
  TrendingUp,
  Twitter,
  Users,
  Wallet,
  Wifi,
  X,
  Youtube,
  Zap,
  type LucideIcon,
  type LucideProps,
} from 'lucide-react';
import { cn } from '@/lib/utils';

type Feature = {
  id: string;
  title: string;
  eyebrow: string;
  description: string;
  why: string;
  benefits: string[];
  forWho: string;
  how: string[];
  icon: LucideIcon;
  pageUrl?: string;
  availability: 'available' | 'details';
};

type Partner = {
  id: string;
  name: string;
  initials: string;
  category: string;
  description: string;
  relationship: string;
  website?: string;
  address?: string;
  accent: string;
};

const features: Feature[] = [
  {
    id: 'everyday-services',
    title: 'Everyday Services',
    eyebrow: 'Stay connected',
    description:
      'Access supported airtime, data, bill payments, and other digital services from one place.',
    why:
      'Everyday digital needs can be scattered across different services. BlueSea brings supported purchases together in one convenient experience.',
    benefits: [
      'Purchase airtime and data for supported networks.',
      'Pay supported utility, education, and subscription bills.',
      'Find commonly used digital services in one platform.',
    ],
    forWho: 'Individuals, families, students, and small businesses.',
    how: [
      'Sign in to your BlueSea Mobile account.',
      'Choose the service you need and enter the required details.',
      'Review the transaction information and confirm your purchase.',
    ],
    icon: Smartphone,
    pageUrl: '/services',
    availability: 'available',
  },
  {
    id: 'wallet-transfers',
    title: 'Wallet & Transfers',
    eyebrow: 'Move with clarity',
    description:
      'Manage supported wallet and transfer activities through a connected digital experience.',
    why:
      'A clear view of wallet and transfer tools helps customers understand and manage their everyday payment activities.',
    benefits: [
      'Access supported wallet funding options.',
      'Make eligible transfers using the available in-app flow.',
      'Review transaction details before confirming.',
    ],
    forWho: 'Individuals and businesses that use supported BlueSea payment services.',
    how: [
      'Open the wallet or transfer service in the app.',
      'Enter the requested details and review any applicable charges.',
      'Confirm only after checking the transaction information.',
    ],
    icon: Wallet,
    pageUrl: '/services/transfers',
    availability: 'available',
  },
  {
    id: 'personal-dashboard',
    title: 'A Dashboard That Fits You',
    eyebrow: 'Make it yours',
    description:
      'Customize your dashboard around the tools and services that matter most to you.',
    why:
      'Different people use different services. A personalized dashboard helps put frequently used actions within easier reach.',
    benefits: [
      'Prioritize the services you use most.',
      'Create a more relevant home-screen experience.',
      'Spend less time searching through features.',
    ],
    forWho: 'Every BlueSea Mobile user with access to dashboard customization.',
    how: [
      'Open your BlueSea Mobile dashboard.',
      'Use the available customization controls.',
      'Arrange your preferred services to suit your workflow.',
    ],
    icon: Sparkles,
    pageUrl: '/features/personalized-dashboard',
    availability: 'available',
  },
  {
    id: 'payroll-pro',
    title: 'Payroll Pro',
    eyebrow: 'Business-focused tools',
    description:
      'A payroll-focused solution intended to support business payment workflows through the BlueSea ecosystem.',
    why:
      'Businesses need dependable ways to organize payroll workflows. BlueSea is engaging with payroll providers to explore partnership-led solutions.',
    benefits: [
      'Explore a business-oriented payroll workflow.',
      'Connect payroll discussions with relevant service providers.',
      'Learn about partnership opportunities and the intended use cases.',
    ],
    forWho: 'Businesses and payroll service providers interested in collaboration.',
    how: [
      'Review the payroll solution information.',
      'Contact BlueSea Mobile to discuss your business requirements.',
      'Confirm availability and integration details directly with the team.',
    ],
    icon: Building2,
    pageUrl: '/features/payroll-pro',
    availability: 'details',
  },
  {
    id: 'group-auto-topup',
    title: 'Group Payments & Smart Auto Top-Up',
    eyebrow: 'Coordinate and automate',
    description:
      'A combined look at shared payment coordination and recurring airtime or data top-up tools.',
    why:
      'Shared expenses and recurring purchases can take time to manage manually. These tools are designed to help users organize eligible activities.',
    benefits: [
      'Coordinate supported shared payment activities.',
      'Manage supported recurring top-up preferences.',
      'Make routine digital-service tasks easier to organize.',
    ],
    forWho: 'Individuals, families, groups, and small businesses.',
    how: [
      'Choose the relevant group-payment or top-up option in the app.',
      'Set the details and preferences supported by that service.',
      'Review the setup and keep your preferences up to date.',
    ],
    icon: Users,
    pageUrl: '/features/group-payments',
    availability: 'available',
  },
  {
    id: 'spend-analysis',
    title: 'Spend Analysis',
    eyebrow: 'Understand your activity',
    description:
      'Review available spending information and gain a clearer view of your transaction patterns.',
    why:
      'Understanding transaction activity can help people and businesses make more informed day-to-day decisions.',
    benefits: [
      'Review available spending information in one place.',
      'Spot patterns across supported transaction categories.',
      'Use clearer activity insights to support planning.',
    ],
    forWho: 'Individuals and small businesses reviewing their own activity.',
    how: [
      'Open the spend-analysis area in your account.',
      'Review the available transaction summaries.',
      'Use the information as a guide for your own planning.',
    ],
    icon: BarChart3,
    pageUrl: '/features/spend-analysis',
    availability: 'available',
  },
  {
    id: 'bluepoints',
    title: 'BluePoints Rewards',
    eyebrow: 'Rewards with a purpose',
    description:
      'A platform points system that may provide eligible users with rewards or benefits under the applicable rules.',
    why:
      'A points system can recognize eligible platform activity and make participation more rewarding.',
    benefits: [
      'Understand how eligible activity may earn points.',
      'Review applicable reward conditions.',
      'Keep track of points and available benefits in the platform.',
    ],
    forWho: 'Eligible BlueSea Mobile users, subject to the current rewards terms.',
    how: [
      'Review the BluePoints information available in your account.',
      'Check which activities qualify under the current rules.',
      'Review your points and any available redemption options.',
    ],
    icon: Gift,
    pageUrl: '/features/bluepoints',
    availability: 'available',
  },
  {
    id: 'tickets',
    title: 'Tickets & Experiences',
    eyebrow: 'Explore and access',
    description:
      'Discover ticket-related services and experiences supported within BlueSea Mobile.',
    why:
      'Having access to supported ticket services alongside everyday digital tools can make planning and purchasing more convenient.',
    benefits: [
      'Discover supported ticket options.',
      'Keep ticket-related activity connected to your digital-service experience.',
      'Review details before making a purchase.',
    ],
    forWho: 'Users looking for supported event and ticket services.',
    how: [
      'Open the ticket service in BlueSea Mobile.',
      'Choose an available option and review its details.',
      'Follow the on-screen steps to complete the transaction.',
    ],
    icon: Ticket,
    pageUrl: '/services/tickets',
    availability: 'available',
  },
];

const partnerPlaceholders: Partner[] = [
  // Replace these sample partner entries with confirmed, approved partner data.
  {
    id: 'partner-one',
    name: 'Partner Company One',
    initials: 'PC',
    category: 'Digital services',
    description:
      'A sample partner profile for previewing the BlueSea Mobile partnership experience.',
    relationship:
      'This sample entry demonstrates how a confirmed partner relationship can be described. Replace it with approved partnership details before publishing.',
    website: 'https://example.com',
    accent: 'from-sky-500 to-blue-700',
  },
  {
    id: 'partner-two',
    name: 'Partner Company Two',
    initials: 'P2',
    category: 'Business solutions',
    description:
      'A sample business profile showing how a partner card and detail panel will appear.',
    relationship:
      'Use this area to explain the partner’s role, the services involved, and the value delivered to BlueSea Mobile users.',
    accent: 'from-indigo-500 to-sky-600',
  },
  {
    id: 'partner-three',
    name: 'Partner Company Three',
    initials: 'P3',
    category: 'Payments ecosystem',
    description:
      'A sample partner profile that can be replaced when the company information is ready.',
    relationship:
      'Describe only the relationship that has been agreed and approved for public communication.',
    accent: 'from-cyan-500 to-teal-600',
  },
];



// Demo values for layout integration only. Replace with verified API data before production.
const statPlaceholders = [
  { value: '50,000+', label: 'Registered users', detail: 'Sample value — replace with verified data' },
  { value: '50,000+', label: 'Transactions', detail: 'Sample value — replace with verified data' },
  { value: '99%', label: 'Success rate', detail: 'Sample value — replace with verified data' },
];

const socialLinks = [
  {
    name: 'Facebook',
    href: 'https://www.facebook.com/share/19SLQJsJWt/',
    icon: FacebookIcon,
  },
  {
    name: 'Instagram',
    href: 'https://www.instagram.com/reel/DetjqhTgu35/?xtok=NW83aXJ3aGs4ZTRm',
    icon: Instagram,
  },
  {
    name: 'X',
    href: 'https://x.com/BlueseaMobile',
    icon: Twitter,
  },
  {
    name: 'YouTube',
    href: 'https://youtube.com/@blueseamobile?si=bWEgEr20Cz8octH6',
    icon: Youtube,
  },
];

function FacebookIcon(props: LucideProps) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M13.5 21v-8.2h2.8l.4-3.2h-3.2V7.5c0-.9.3-1.5 1.6-1.5h1.7V3.1c-.3 0-1.3-.1-2.5-.1-2.5 0-4.2 1.5-4.2 4.3v2.3H7.3v3.2h2.8V21h3.4Z" />
    </svg>
  );
}

function Modal({
  title,
  eyebrow,
  onClose,
  children,
}: {
  title: string;
  eyebrow?: string;
  onClose: () => void;
  children: ReactNode;
}) {
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-slate-950/60 p-0 backdrop-blur-sm sm:items-center sm:p-5"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="relative max-h-[92dvh] w-full max-w-2xl animate-in slide-in-from-bottom-4 overflow-y-auto rounded-t-3xl bg-white shadow-2xl duration-300 dark:bg-slate-900 sm:rounded-3xl"
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white/95 px-5 py-4 backdrop-blur dark:border-slate-800 dark:bg-slate-900/95 sm:px-7">
          <div>
            {eyebrow && (
              <p className="mb-1 text-xs font-semibold uppercase tracking-[0.16em] text-sky-600">
                {eyebrow}
              </p>
            )}
            <h2 className="text-lg font-bold text-slate-900 dark:text-white sm:text-xl">{title}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="rounded-full border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 dark:border-slate-700 dark:hover:bg-slate-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="px-5 py-6 sm:px-7 sm:py-7">{children}</div>
      </section>
    </div>
  );
}

function FeatureCard({
  feature,
  onSelect,
}: {
  feature: Feature;
  onSelect: (feature: Feature) => void;
}) {
  const Icon = feature.icon;
  return (
    <button
      type="button"
      onClick={() => onSelect(feature)}
      className="group flex h-full w-full flex-col rounded-2xl border border-slate-100 bg-white p-5 text-left shadow-sm transition duration-300 hover:-translate-y-1 hover:border-sky-100 hover:shadow-xl hover:shadow-sky-900/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-sky-800 md:p-6"
    >
      <span className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-sky-100 to-sky-50 text-sky-600 transition duration-300 group-hover:scale-110 dark:from-sky-900/40 dark:to-sky-800/20 dark:text-sky-300">
        <Icon className="h-6 w-6" />
      </span>
      <span className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-sky-600">
        {feature.eyebrow}
      </span>
      <span className="mb-2 text-lg font-bold text-slate-900 dark:text-white">{feature.title}</span>
      <span className="flex-1 text-sm leading-6 text-slate-600 dark:text-slate-400">
        {feature.description}
      </span>
      <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-sky-600 transition group-hover:gap-3">
        Explore feature <ArrowRight className="h-4 w-4" />
      </span>
    </button>
  );
}

function PartnerCard({
  partner,
  onSelect,
}: {
  partner: Partner;
  onSelect: (partner: Partner) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(partner)}
      className="group flex min-h-40 w-full flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white p-5 text-center transition duration-300 hover:-translate-y-1 hover:border-sky-200 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 dark:border-slate-800 dark:bg-slate-900"
    >
      {/* Replace this initials fallback with a partner logo when one is supplied. */}
      <span className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-100 to-blue-100 text-lg font-bold text-sky-700 dark:from-sky-900/40 dark:to-blue-900/40 dark:text-sky-300">
        {partner.initials}
      </span>
      <span className="font-semibold text-slate-900 dark:text-white">{partner.name}</span>
      <span className="mt-1 text-xs text-slate-500">{partner.category}</span>
      <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-sky-600">
        Partner details <ArrowUpRight className="h-3.5 w-3.5" />
      </span>
    </button>
  );
}

export function LandingPage() {
  const navigate = useNavigate();
  const [selectedFeature, setSelectedFeature] = useState<Feature | null>(null);
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [faqOpen, setFaqOpen] = useState<number | null>(0);

  const closeFeature = () => setSelectedFeature(null);
  const closePartner = () => setSelectedPartner(null);

  const goToSignup = () => navigate('/signup');

  return (
    <main className="min-h-screen overflow-hidden bg-white text-slate-900 dark:bg-slate-950 dark:text-white">
      {/* Navigation */}
      <header className="relative z-40 border-b border-slate-100 bg-white/90 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/90">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Logo />
          <div className="hidden items-center gap-7 md:flex">
            <a href="#services" className="text-sm font-medium text-slate-600 transition hover:text-sky-600 dark:text-slate-300">Services</a>
            <a href="#features" className="text-sm font-medium text-slate-600 transition hover:text-sky-600 dark:text-slate-300">Features</a>
            <a href="#partners" className="text-sm font-medium text-slate-600 transition hover:text-sky-600 dark:text-slate-300">Partners</a>
            <a href="#about" className="text-sm font-medium text-slate-600 transition hover:text-sky-600 dark:text-slate-300">About</a>
          </div>
          <div className="hidden items-center gap-3 md:flex">
            <Button variant="ghost" className="rounded-full px-5" onClick={() => navigate('/login')}>Sign in</Button>
            <Button className="rounded-full bg-sky-500 px-6 shadow-lg shadow-sky-500/20 hover:bg-sky-600" onClick={() => navigate('/download')}>
            DownLoad App <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
          <button
            type="button"
            className="rounded-xl border border-slate-200 p-2 md:hidden dark:border-slate-700"
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileMenuOpen}
            onClick={() => setMobileMenuOpen((open) => !open)}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </nav>
        {mobileMenuOpen && (
          <div className="border-t border-slate-100 bg-white px-4 py-4 dark:border-slate-800 dark:bg-slate-950 md:hidden">
            <div className="mx-auto flex max-w-7xl flex-col gap-3">
              {[
                ['Services', '#services'],
                ['Features', '#features'],
                ['Partners', '#partners'],
                ['About', '#about'],
              ].map(([label, href]) => (
                <a key={href} href={href} onClick={() => setMobileMenuOpen(false)} className="py-2 text-sm font-medium text-slate-700 dark:text-slate-200">
                  {label}
                </a>
              ))}
              <div className="flex gap-2 pt-2">
                <Button variant="outline" className="flex-1 rounded-full" onClick={() => navigate('/login')}>Sign in</Button>
                <Button className="flex-1 rounded-full bg-sky-500 hover:bg-sky-600" onClick={() => navigate('/download')}>DownLoad App</Button>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Hero. Keep the current phone illustration; on narrow screens it becomes a subtle background. */}
      <section className="relative isolate px-4 py-14 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute -right-28 -top-24 h-80 w-80 rounded-full bg-sky-200/40 blur-3xl dark:bg-sky-900/20" />
          <div className="absolute -bottom-24 -left-28 h-80 w-80 rounded-full bg-blue-100/50 blur-3xl dark:bg-blue-900/20" />
        </div>
        <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="relative z-10 mx-auto w-full max-w-2xl space-y-6 text-center lg:mx-0 lg:text-left">
            <div className="inline-flex items-center gap-2 rounded-full border border-sky-100 bg-sky-50/90 px-4 py-2 text-xs font-semibold text-sky-700 dark:border-sky-900 dark:bg-sky-950/60 dark:text-sky-300">
              <span className="h-2 w-2 animate-pulse rounded-full bg-sky-500" />
              Your connected digital experience
            </div>
            <h1 className="text-4xl font-bold leading-[1.08] tracking-tight text-slate-900 dark:text-white sm:text-5xl lg:text-6xl">
              Your everyday life.
              <span className="mt-1 block bg-gradient-to-r from-sky-500 to-blue-600 bg-clip-text text-transparent">
                Your digital world.
              </span>
            </h1>
            <p className="mx-auto max-w-xl text-base leading-7 text-slate-600 dark:text-slate-300 sm:text-lg sm:leading-8 lg:mx-0">
              Discover a connected way to manage everyday digital services, payments, and useful tools with BlueSea Mobile.
            </p>
            <div className="flex flex-wrap justify-center gap-3 pt-1 lg:justify-start">
              <Button size="lg" className="rounded-full bg-sky-500 px-7 shadow-lg shadow-sky-500/25 transition hover:scale-[1.02] hover:bg-sky-600" onClick={goToSignup}>
                Get Started <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button size="lg" variant="outline" className="rounded-full border-slate-200 px-7 transition hover:border-sky-200 hover:bg-sky-50 dark:border-slate-700 dark:hover:bg-slate-900" onClick={() => navigate('/download')}>
                DownLoad App
              </Button>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 pt-2 text-xs text-slate-500 dark:text-slate-400 lg:justify-start">
              <span className="inline-flex items-center gap-1.5"><ShieldCheck className="h-4 w-4 text-sky-600" /> Built for everyday use</span>
              <span className="inline-flex items-center gap-1.5"><Smartphone className="h-4 w-4 text-sky-600" /> Mobile-first experience</span>
            </div>
          </div>

          {/* Lightweight CSS/HTML recreation of the supplied BlueSea dashboard.
              This is intentionally not an image; the actual dashboard UI can replace it later. */}
          <div className="pointer-events-none absolute inset-0 -z-0 flex items-center justify-center overflow-hidden opacity-[0.15] sm:opacity-[0.18] lg:pointer-events-auto lg:relative lg:inset-auto lg:z-10 lg:justify-end lg:overflow-visible lg:opacity-100">
            <div className="relative h-[590px] w-[300px] translate-x-14 scale-[0.88] overflow-hidden rounded-[36px] border border-slate-700/70 bg-[#0d172b] p-0 shadow-2xl shadow-slate-950/50 sm:translate-x-16 sm:scale-95 lg:h-[690px] lg:w-[340px] lg:translate-x-0 lg:scale-100">
              <div className="absolute inset-x-0 top-0 z-20 h-2 bg-slate-700/70" />
              <div className="flex h-full flex-col overflow-hidden bg-[#0d172b] text-slate-200">
                {/* Profile header */}
                <div className="flex items-center justify-between border-b border-slate-800/80 px-4 pb-4 pt-6">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-sky-400 bg-gradient-to-br from-sky-300 to-blue-600 text-[10px] font-bold text-white">NS</div>
                    <div className="leading-tight">
                      <p className="text-[8px] uppercase tracking-wider text-slate-400">Hi,</p>
                      <p className="mt-1 text-[12px] font-semibold text-white">NSINI <span>👋</span></p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-800/80"><Headphones className="h-4 w-4 text-slate-300" /></span>
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-800/80"><Bell className="h-4 w-4 text-slate-300" /></span>
                  </div>
                </div>

                <div className="flex-1 space-y-3 overflow-hidden px-2.5 pt-2.5">
                  {/* Available balance card */}
                  <div className="relative overflow-hidden rounded-[24px] bg-gradient-to-br from-sky-400 via-sky-500 to-sky-600 px-4 py-4 text-white shadow-lg shadow-sky-900/20">
                    <div className="absolute -right-8 -top-7 h-28 w-28 rounded-full bg-white/10" />
                    <div className="absolute -bottom-10 -left-7 h-24 w-24 rounded-full bg-white/10" />
                    <div className="relative flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] font-medium">Available Balance</span>
                        <Eye className="h-3.5 w-3.5 opacity-80" />
                      </div>
                      <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/20"><RefreshCw className="h-4 w-4" /></span>
                    </div>
                    <p className="relative mt-2 text-[20px] font-bold tracking-wider">******</p>
                    <div className="relative mt-5 flex items-center gap-2">
                      <span className="flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-1.5 text-[8px]"><LockKeyhole className="h-3 w-3" /> Locked: ******</span>
                      <span className="flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-1.5 text-[8px]"><Coins className="h-3 w-3 text-amber-200" /> *** BSP</span>
                      <span className="flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-1.5 text-[8px]"><ShieldCheck className="h-3 w-3 text-emerald-200" /> Verified</span>
                    </div>
                    <span className="absolute bottom-4 right-4 flex h-10 w-10 items-center justify-center rounded-2xl bg-sky-700/30"><Wallet className="h-5 w-5" /></span>
                  </div>

                  {/* Activity strip */}
                  <div className="-mt-3 flex items-center justify-between rounded-b-2xl border border-slate-800 px-4 py-2.5 text-[9px] text-slate-400">
                    <span><span className="mr-2 text-sky-400">●</span>•••••• spent · 0 txns</span><ChevronDown className="h-3.5 w-3.5 -rotate-90" />
                  </div>

                  {/* Transfer shortcuts */}
                  <div className="grid grid-cols-3 gap-2 pt-1">
                    <div className="flex items-center justify-center gap-1.5 rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 px-2 py-3 text-[9px] font-medium text-white"><ArrowRight className="h-3.5 w-3.5" /> Internal Transfer</div>
                    <div className="flex items-center justify-center gap-1.5 rounded-2xl border border-slate-800 px-2 py-3 text-[9px]"><ArrowDownLeft className="h-3.5 w-3.5 text-emerald-400" /> Deposit</div>
                    <div className="flex items-center justify-center gap-1.5 rounded-2xl border border-slate-800 px-2 py-3 text-[9px]"><ArrowUpRight className="h-3.5 w-3.5 text-sky-400" /> Transfer</div>
                  </div>

                  {/* Quick actions panel */}
                  <div className="rounded-[24px] border border-slate-800/80 bg-[#091225] px-3.5 py-3.5">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-[11px] font-semibold text-white">Quick Actions</p>
                        <p className="mt-1 text-[8px] text-slate-400">Your frequently used services</p>
                      </div>
                      <span className="flex h-7 w-7 items-center justify-center rounded-full border border-slate-700"><Pencil className="h-3.5 w-3.5" /></span>
                    </div>
                    <div className="mt-3 grid grid-cols-4 gap-x-2 gap-y-4">
                      {[
                        { label: 'Tickets', Icon: Ticket },
                        { label: 'Airtime', Icon: Smartphone },
                        { label: 'Data', Icon: Wifi },
                        { label: 'Affiliate', Icon: Link2 },
                        { label: 'Transfer', Icon: RefreshCw },
                        { label: 'Electricity', Icon: Lightbulb },
                        { label: 'TV Subscription', Icon: Tv },
                        { label: 'Wallet', Icon: Wallet },
                      ].map(({ label, Icon }) => (
                        <div key={label} className="flex flex-col items-center gap-1.5">
                          <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-700/80 bg-[#0b162a]"><Icon className="h-4 w-4 text-slate-300" /></span>
                          <span className="text-center text-[8px] text-slate-300">{label}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Exclusive and service rows */}
                  <p className="px-1 pt-1 text-[8px] font-medium tracking-[0.18em] text-slate-500">BLUESEA EXCLUSIVES</p>
                  <div className="flex w-[44%] items-center gap-2 rounded-2xl border border-slate-800 px-3 py-3 text-[9px]"><Ticket className="h-4 w-4 text-slate-400" /> Scan Events</div>
                  <div className="flex items-center gap-3 rounded-2xl border border-slate-800 px-3 py-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-800"><LayoutGrid className="h-4 w-4" /></span>
                    <div className="flex-1">
                      <p className="text-[10px] font-medium">Explore All Services</p>
                      <p className="mt-1 text-[8px] text-slate-400">Airtime, data, bills & utilities</p>
                    </div>
                    <ChevronDown className="h-4 w-4 -rotate-90" />
                  </div>
                  <div className="flex items-center gap-3 rounded-2xl bg-gradient-to-r from-sky-500 to-sky-700 px-3 py-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/20"><Star className="h-4 w-4 text-amber-200" /></span>
                    <div className="flex-1">
                      <p className="text-[10px] font-semibold">BluePoints Reward</p>
                      <p className="mt-1 text-[8px] text-white/80">Check your loyalty progress</p>
                    </div>
                    <ChevronDown className="h-4 w-4 -rotate-90" />
                  </div>
                </div>

                {/* Bottom navigation */}
                <div className="mt-2 grid grid-cols-4 border-t border-slate-800 bg-[#0d172b] px-2 py-3">
                  {[
                    { label: 'Home', Icon: House, active: true },
                    { label: 'Rewards', Icon: Gift },
                    { label: 'BlueTickets', Icon: Store },
                    { label: 'Settings', Icon: Settings },
                  ].map(({ label, Icon, active }) => (
                    <div key={label} className={`flex flex-col items-center gap-1 ${active ? 'text-sky-400' : 'text-slate-500'}`}>
                      <Icon className="h-5 w-5" />
                      <span className="text-[8px]">{label}</span>
                      {active && <span className="h-1 w-1 rounded-full bg-sky-400" />}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-white/10 via-white/55 to-white dark:from-slate-950/10 dark:via-slate-950/55 dark:to-slate-950 lg:hidden" />
      </section>

      {/* Statistics: sample content is clearly marked for replacement with real API data. */}
      <section className="border-y border-slate-100 bg-slate-50/80 px-4 py-10 dark:border-slate-800 dark:bg-slate-900/50 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-7 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-600">BlueSea at a glance</p>
            <h2 className="mt-2 text-xl font-bold text-slate-900 dark:text-white sm:text-2xl">A connected experience for everyday needs</h2>
          </div>
          <div className="grid grid-cols-3 gap-3 sm:gap-8">
            {statPlaceholders.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="stat-count text-2xl font-bold tracking-tight text-sky-600 sm:text-4xl">{stat.value}</p>
                <p className="mt-1 text-xs font-medium text-slate-600 dark:text-slate-300 sm:text-sm">{stat.label}</p>
                <p className="mt-1 hidden text-[10px] text-slate-400 sm:block">{stat.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Core services */}
      <section id="services" className="scroll-mt-24 px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto mb-10 max-w-2xl text-center sm:mb-14">
            <span className="inline-flex items-center gap-2 rounded-full bg-sky-50 px-4 py-1.5 text-xs font-semibold text-sky-700 dark:bg-sky-950/50 dark:text-sky-300">
              <Zap className="h-3.5 w-3.5" /> Everyday essentials
            </span>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">The services you need, connected.</h2>
            <p className="mt-4 text-sm leading-7 text-slate-600 dark:text-slate-400 sm:text-base">
              Find supported digital services and payment tools in one convenient experience.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-6">
            {[
              { label: 'Bill payments', icon: CreditCard },
              { label: 'Wallet', icon: Wallet },
              { label: 'Transfers', icon: RefreshCw },
              { label: 'Tickets', icon: Ticket },
            ].map(({ label, icon: Icon }) => (
              <button
                type="button"
                key={label}
                onClick={() => setSelectedFeature(features.find((feature) => feature.id === (label === 'Tickets' ? 'tickets' : label === 'Wallet' || label === 'Transfers' ? 'wallet-transfers' : 'everyday-services')) ?? null)}
                className="group flex min-h-32 flex-col items-center justify-center gap-3 rounded-2xl border border-slate-100 bg-white p-4 transition hover:-translate-y-1 hover:border-sky-100 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-sky-50 text-sky-600 transition group-hover:bg-sky-500 group-hover:text-white dark:bg-sky-950/60">
                  <Icon className="h-5 w-5" />
                </span>
                <span className="text-center text-sm font-semibold text-slate-800 dark:text-slate-200">{label}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Feature discovery */}
      <section id="features" className="scroll-mt-24 bg-slate-50 px-4 py-16 dark:bg-slate-900/50 sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 flex flex-col items-start justify-between gap-4 sm:mb-14 sm:flex-row sm:items-end">
            <div className="max-w-2xl">
              <span className="inline-flex rounded-full bg-white px-4 py-1.5 text-xs font-semibold text-sky-700 shadow-sm dark:bg-slate-800 dark:text-sky-300">Explore BlueSea</span>
              <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">More than a single service.</h2>
              <p className="mt-4 text-sm leading-7 text-slate-600 dark:text-slate-400 sm:text-base">
                Explore the tools, understand how they work, and see how they can support your everyday or business needs.
              </p>
            </div>
            <span className="inline-flex items-center gap-2 text-sm font-medium text-slate-500"><CircleHelp className="h-4 w-4 text-sky-600" /> Select a card to learn more</span>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <FeatureCard key={feature.id} feature={feature} onSelect={setSelectedFeature} />
            ))}
          </div>
        </div>
      </section>

      {/* Dashboard replacement placeholder: intentionally reserved for the actual UI supplied later. */}
      {/* TODO: Replace the existing hero phone mockup with the user-provided real dashboard UI in a later iteration. */}

      {/* Partnerships */}
      <section id="partners" className="scroll-mt-24 px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto mb-10 max-w-2xl text-center sm:mb-14">
            <span className="inline-flex items-center gap-2 rounded-full bg-sky-50 px-4 py-1.5 text-xs font-semibold text-sky-700 dark:bg-sky-950/50 dark:text-sky-300">
              <Building2 className="h-3.5 w-3.5" /> Our ecosystem
            </span>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">Built through meaningful partnerships.</h2>
            <p className="mt-4 text-sm leading-7 text-slate-600 dark:text-slate-400 sm:text-base">
              We connect with businesses and service providers to make useful digital and business solutions more accessible.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {partnerPlaceholders.map((partner) => (
              <PartnerCard key={partner.id} partner={partner} onSelect={setSelectedPartner} />
            ))}
          </div>
          <div className="mt-8 rounded-2xl border border-sky-100 bg-sky-50/70 p-5 text-center dark:border-sky-900/60 dark:bg-sky-950/30 sm:p-7">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Interested in partnering with BlueSea?</h3>
            <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-600 dark:text-slate-300">
              Let’s explore how your business or service can contribute to a more connected digital experience.
            </p>
            <Button variant="outline" className="mt-4 rounded-full border-sky-200 bg-white text-sky-700 hover:bg-sky-100 dark:bg-slate-900" onClick={() => navigate('/contact')}>
              Explore partnership <ArrowUpRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* About and process */}
      <section id="about" className="scroll-mt-24 px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <span className="inline-flex rounded-full bg-sky-50 px-4 py-1.5 text-xs font-semibold text-sky-700 dark:bg-sky-950/50 dark:text-sky-300">About BlueSea Mobile</span>
              <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">A simpler way to access everyday digital services.</h2>
              <p className="mt-5 text-sm leading-7 text-slate-600 dark:text-slate-400 sm:text-base">
                BlueSea Mobile is a Nigerian digital services and payments platform bringing supported everyday services and useful tools into one connected experience.
              </p>
              <p className="mt-4 text-sm leading-7 text-slate-600 dark:text-slate-400 sm:text-base">
                Our focus is to make digital services easier to discover and use, while building meaningful relationships with customers and business partners.
              </p>
              <Button className="mt-6 rounded-full bg-sky-500 hover:bg-sky-600" onClick={goToSignup}>
                Get started with BlueSea <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                { icon: ShieldCheck, title: 'Clarity', text: 'Clear information and visible steps help customers make informed decisions.' },
                { icon: HandCoins, title: 'Practical value', text: 'Useful digital services and tools for everyday and business needs.' },
                { icon: Users, title: 'Connected ecosystem', text: 'A platform experience shaped by customers, providers, and partners.' },
                { icon: TrendingUp, title: 'Continuous improvement', text: 'A product direction focused on useful features and better experiences.' },
              ].map(({ icon: Icon, title, text }) => (
                <div key={title} className="rounded-2xl border border-slate-100 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 text-sky-600 dark:bg-sky-950/50"><Icon className="h-5 w-5" /></span>
                  <h3 className="mt-4 font-bold text-slate-900 dark:text-white">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-slate-50 px-4 py-16 dark:bg-slate-900/50 sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <div className="mb-9 text-center">
            <span className="inline-flex rounded-full bg-white px-4 py-1.5 text-xs font-semibold text-sky-700 shadow-sm dark:bg-slate-800 dark:text-sky-300">Helpful information</span>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">Frequently asked questions</h2>
          </div>
          {[
            {
              q: 'What can I use BlueSea Mobile for?',
              a: 'BlueSea Mobile provides access to supported digital services such as airtime, data, bill payments, and available wallet or transfer tools. The services shown in your account determine what you can use.',
            },
            {
              q: 'Is BlueSea Mobile free to use?',
              a: 'Creating an account is the starting point for accessing BlueSea Mobile. Individual services may have their own prices or charges. Review the displayed transaction details before confirming a purchase.',
            },
            {
              q: 'How do I get help with a transaction?',
              a: 'Use the available in-app support options or the official BlueSea Mobile support channel. Keep your transaction reference available when requesting assistance.',
            },
            {
              q: 'What are BluePoints?',
              a: 'BluePoints is a platform points and rewards concept. It is not an active cryptocurrency. Eligibility, earning rules, and any available benefits are subject to the applicable platform terms.',
            },
          ].map((item, index) => (
            <div key={item.q} className="border-b border-slate-200 dark:border-slate-800">
              <button
                type="button"
                className="flex w-full items-center justify-between gap-4 py-5 text-left"
                aria-expanded={faqOpen === index}
                onClick={() => setFaqOpen((current) => current === index ? null : index)}
              >
                <span className="font-semibold text-slate-900 dark:text-white">{item.q}</span>
                <ChevronDown className={cn('h-5 w-5 shrink-0 text-sky-600 transition-transform', faqOpen === index && 'rotate-180')} />
              </button>
              {faqOpen === index && (
                <p className="pb-5 pr-8 text-sm leading-7 text-slate-600 dark:text-slate-400">{item.a}</p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="relative mx-auto max-w-6xl overflow-hidden rounded-3xl bg-gradient-to-br from-sky-500 via-sky-600 to-blue-700 px-6 py-12 text-center text-white shadow-2xl shadow-sky-900/15 sm:px-12 sm:py-16">
          <div className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-24 -left-16 h-64 w-64 rounded-full bg-blue-300/20 blur-2xl" />
          <div className="relative mx-auto max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-semibold"><Globe className="h-3.5 w-3.5" /> Your digital world, connected</span>
            <h2 className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl">Discover more with BlueSea Mobile.</h2>
            <p className="mt-4 text-sm leading-7 text-sky-50 sm:text-base">Explore supported digital services and useful tools in one connected experience.</p>
            <Button size="lg" className="mt-7 rounded-full bg-white px-8 text-sky-700 hover:bg-sky-50" onClick={goToSignup}>
              Create your account <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* Footer — Support link intentionally omitted from this footer navigation. */}
      <footer className="bg-slate-950 px-4 py-12 text-white sm:px-6 sm:py-14 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-8 border-b border-slate-800 pb-8 md:flex-row md:items-center md:justify-between">
            <div className="text-center md:text-left">
              <div className="mb-3 flex items-center justify-center gap-2 md:justify-start">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-sky-400 to-sky-600 text-sm font-bold">BS</div>
                <h3 className="text-xl font-bold">BlueSea Mobile</h3>
              </div>
              <p className="text-sm text-slate-400">Your everyday life. Your digital world.</p>
            </div>
            <div className="flex flex-wrap justify-center gap-3">
              {socialLinks.map(({ name, href, icon: Icon }) => (
                <a
                  key={name}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`BlueSea Mobile on ${name}`}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-800 text-white transition hover:scale-105 hover:bg-sky-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
                >
                  <Icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>
          <div className="flex flex-col items-center justify-between gap-4 pt-7 text-center sm:flex-row sm:text-left">
            <div className="flex flex-wrap justify-center gap-x-6 gap-y-3 text-sm text-slate-400 sm:justify-start">
              <button type="button" onClick={() => navigate('/legal/privacy')} className="transition hover:text-white">Privacy</button>
              <button type="button" onClick={() => navigate('/legal/terms')} className="transition hover:text-white">Terms & Conditions</button>
              <button type="button" onClick={() => navigate('/contact')} className="transition hover:text-white">Contact</button>
            </div>
            <p className="text-xs text-slate-500">© {new Date().getFullYear()} G Lucid Apex. All Rights Reserved.</p>
          </div>
        </div>
      </footer>

      {/* Feature detail modal */}
      {selectedFeature && (
        <Modal title={selectedFeature.title} eyebrow={selectedFeature.eyebrow} onClose={closeFeature}>
          <div className="mb-6 rounded-2xl bg-gradient-to-br from-sky-50 to-blue-50 p-5 dark:from-sky-950/50 dark:to-blue-950/30">
            <div className="flex items-start gap-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white text-sky-600 shadow-sm dark:bg-slate-900">
                <selectedFeature.icon className="h-6 w-6" />
              </span>
              <div>
                <p className="text-base font-semibold text-slate-900 dark:text-white">{selectedFeature.description}</p>
                <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{selectedFeature.why}</p>
              </div>
            </div>
          </div>
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <h3 className="mb-3 font-bold text-slate-900 dark:text-white">What you gain</h3>
              <ul className="space-y-2.5">
                {selectedFeature.benefits.map((benefit) => (
                  <li key={benefit} className="flex items-start gap-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                    <Check className="mt-1 h-4 w-4 shrink-0 text-sky-600" /> {benefit}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="mb-3 font-bold text-slate-900 dark:text-white">How it works</h3>
              <ol className="space-y-2.5">
                {selectedFeature.how.map((step, index) => (
                  <li key={step} className="flex items-start gap-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sky-100 text-xs font-bold text-sky-700 dark:bg-sky-900/60 dark:text-sky-300">{index + 1}</span>
                    {step}
                  </li>
                ))}
              </ol>
            </div>
          </div>
          <div className="mt-6 rounded-xl border border-slate-100 p-4 dark:border-slate-800">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Designed for</p>
            <p className="mt-1 text-sm text-slate-700 dark:text-slate-300">{selectedFeature.forWho}</p>
          </div>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            {selectedFeature.pageUrl && (
              <Button variant="outline" className="flex-1 rounded-full" onClick={() => navigate(selectedFeature.pageUrl!)}>
                Explore full feature <ArrowUpRight className="ml-2 h-4 w-4" />
              </Button>
            )}
            <Button className="flex-1 rounded-full bg-sky-500 hover:bg-sky-600" onClick={() => { closeFeature(); goToSignup(); }}>
              Get Started <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </Modal>
      )}

      {/* Partner detail modal */}
      {selectedPartner && (
        <Modal title={selectedPartner.name} eyebrow={selectedPartner.category} onClose={closePartner}>
          <div className="flex flex-col gap-5 sm:flex-row">
            <div className={cn('flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br text-2xl font-bold text-white', selectedPartner.accent)}>
              {selectedPartner.initials}
            </div>
            <div>
              <p className="text-base font-semibold text-slate-900 dark:text-white">{selectedPartner.description}</p>
              <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">{selectedPartner.relationship}</p>
            </div>
          </div>
          {(selectedPartner.website || selectedPartner.address) && (
            <div className="mt-6 space-y-3 rounded-xl border border-slate-100 p-4 dark:border-slate-800">
              {selectedPartner.website && (
                <div className="flex items-start gap-3 text-sm">
                  <Globe className="mt-0.5 h-4 w-4 text-sky-600" />
                  <a href={selectedPartner.website} target="_blank" rel="noopener noreferrer" className="break-all font-medium text-sky-600 hover:underline">
                    {selectedPartner.website}
                  </a>
                </div>
              )}
              {selectedPartner.address && (
                <div className="flex items-start gap-3 text-sm text-slate-600 dark:text-slate-300">
                  <Building2 className="mt-0.5 h-4 w-4 text-sky-600" />
                  <span>{selectedPartner.address}</span>
                </div>
              )}
            </div>
          )}
          <div className="mt-6 rounded-xl bg-slate-50 p-4 text-xs leading-6 text-slate-500 dark:bg-slate-800/60">
            Partner profile content is sample data for development. Replace it with approved company information before publishing.
          </div>
          <div className="mt-6 flex justify-end">
            <Button variant="outline" className="rounded-full" onClick={closePartner}>Close</Button>
          </div>
        </Modal>
      )}
    </main>
  );
}
