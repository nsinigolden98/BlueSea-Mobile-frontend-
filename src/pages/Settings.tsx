import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { cn } from '@/lib/utils';
import { Sidebar, Header } from '@/components/ui-custom';
import { MobileBottomNavigation } from '@/components/navigation/MobileBottomNavigation';
import {
  User,
  ShieldCheck,
  Lock,
  CreditCard,
  Bell,
  Headset,
  Fingerprint,
  ShieldAlert,
  Laptop,
  Sun,
  Moon,
  Monitor,
  MessageSquare,
  Gift,
  FileText,
  ChevronDown,
  ChevronRight,
  LogOut,
  Trash2,
  UserX,
  CheckCircle2,
  Building2,
  Wallet,
  Sparkles,
 // HelpCircle,
  Shield,
  FileCheck,
  Scale,
  RefreshCw,
  Info,
  ExternalLink,
  Award
} from 'lucide-react';

export function Settings() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  // Navigation Drawer state
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Accordion persistence for Legal Center via LocalStorage
  const [legalExpanded, setLegalExpanded] = useState<boolean>(() => {
    try {
      return localStorage.getItem('bluese_settings_legal_expanded') === 'true';
    } catch {
      return false;
    }
  });

  // Track appearance mode selection (System, Light, Dark)
  const [appearanceMode, setAppearanceMode] = useState<'system' | 'light' | 'dark'>(() => {
    return (theme as 'light' | 'dark') || 'system';
  });

  useEffect(() => {
    try {
      localStorage.setItem('bluese_settings_legal_expanded', String(legalExpanded));
    } catch (e) {
      console.error('Failed to save legal accordion state to local storage:', e);
    }
  }, [legalExpanded]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Helper to extract crisp user initials
  const getInitials = () => {
    const first = user?.firstName?.charAt(0) || '';
    const last = user?.surname?.charAt(0) || '';
    return `${first}${last}`.toUpperCase() || 'U';
  };

  // Full Name Formatter
  const getFullName = () => {
    const first = user?.firstName || 'Valued';
    const last = user?.surname || 'User';
    return `${first} ${last}`;
  };

  // Handler for Theme Selection
  const handleThemeChange = (mode: 'system' | 'light' | 'dark') => {
    setAppearanceMode(mode);
    if (mode === 'light' && theme === 'dark') {
      toggleTheme();
    } else if (mode === 'dark' && theme === 'light') {
      toggleTheme();
    }
    // If system is picked, toggle to current system preference match
    if (mode === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if ((prefersDark && theme === 'light') || (!prefersDark && theme === 'dark')) {
        toggleTheme();
      }
    }
  };

  // Legal Center Policy Routes configuration
  const legalPolicies = [
    { title: 'Terms & Conditions', path: '/terms-and-conditions', icon: FileText },
    { title: 'Privacy Policy', path: '/privacy-policy', icon: Shield },
    { title: 'KYC Policy', path: '/kyc-policy', icon: FileCheck },
    { title: 'Refund Policy', path: '/refund-policy', icon: RefreshCw },
    { title: 'Security Policy', path: '/security-policy', icon: ShieldAlert },
    { title: 'Cookie Policy', path: '/cookie-policy', icon: FileText },
    { title: 'Acceptable Use Policy', path: '/acceptable-use-policy', icon: Scale },
  ];

  return (
    <div className="h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex overflow-hidden transition-colors duration-300">
      
      {/* Structural Sidebar Drawer */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Viewport Container */}
      <div className="flex-1 flex flex-col h-full min-w-0 bg-slate-50 dark:bg-slate-950 transition-colors duration-300 relative">
        
        {/* Navigation Header */}
        <div className="sticky top-0 z-30 shrink-0 bg-slate-50/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200/50 dark:border-slate-800/50">
          <Header
            title="Settings"
            subtitle="Account Control Center"
            onMenuClick={() => setSidebarOpen(true)}
          />
        </div>

        {/* Scrollable Main Content Container */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto space-y-6 max-w-4xl mx-auto w-full pb-28 md:pb-12">
          
          {/* ==================================================
              PROFILE HEADER CARD (Account Summary)
             ================================================== */}
          <div className="relative overflow-hidden bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 p-6 md:p-8 shadow-sm transition-all duration-300 hover:shadow-md">
            {/* Subtle background glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-sky-500/5 dark:bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-blue-600/5 dark:bg-blue-600/10 rounded-full blur-2xl pointer-events-none" />

            <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
              
              {/* Profile Photo Avatar */}
              <div className="relative shrink-0 group">
                <div className="w-20 h-20 sm:w-22 sm:h-22 rounded-full p-1 bg-gradient-to-tr from-sky-400 via-blue-600 to-sky-500 shadow-md transition-transform duration-300 group-hover:scale-105">
                  <div className="w-full h-full rounded-full bg-white dark:bg-slate-900 p-0.5 overflow-hidden flex items-center justify-center">
                    {user?.profilePicture ? (
                      <img
                        src={user.profilePicture}
                        alt={getFullName()}
                        className="w-full h-full rounded-full object-cover select-none"
                      />
                    ) : (
                      <div className="w-full h-full rounded-full bg-sky-50 dark:bg-sky-950/60 flex items-center justify-center font-extrabold text-sky-600 dark:text-sky-400 text-xl tracking-wider select-none">
                        {getInitials()}
                      </div>
                    )}
                  </div>
                </div>
                {/* Online Status Indicator */}
                <div className="absolute bottom-1 right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-900 shadow-sm" />
              </div>

              {/* User Bio Information */}
              <div className="flex-1 min-w-0 space-y-1.5">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-50 tracking-tight truncate">
                    {getFullName()}
                  </h2>

                  {/* Verification Badge */}
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Verified
                  </span>

                  {/* Membership Tier Badge */}
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20">
                    <Award className="w-3.5 h-3.5" />
                    Tier 2 Member
                  </span>
                </div>

                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  Manage your BlueSea Mobile account
                </p>

                {user?.email && (
                  <p className="text-xs text-slate-400 dark:text-slate-500 font-mono pt-0.5 truncate">
                    {user.email}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* ==================================================
              ACCOUNT SECTION
             ================================================== */}
          <section className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-1">
              Account
            </h3>
            <div className="bg-white dark:bg-slate-900 rounded-2xl md:rounded-3xl border border-slate-200/80 dark:border-slate-800/80 overflow-hidden shadow-sm divide-y divide-slate-100 dark:divide-slate-800/60">
              
              {/* Profile */}
              <button
                onClick={() => navigate('/profile')}
                className="w-full flex items-center justify-between p-4 sm:px-5 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors text-left group"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <User className="w-5 h-5 stroke-[1.75]" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                      Profile Information
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                      Personal details & email updates
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
              </button>

              {/* Identity Verification */}
              <button
                onClick={() => navigate('/identity-center')}
                className="w-full flex items-center justify-between p-4 sm:px-5 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors text-left group"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <ShieldCheck className="w-5 h-5 stroke-[1.75]" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                      Identity Verification
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                      KYC tier levels and limits
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
              </button>

              {/* Transaction PIN */}
              <button
                onClick={() => navigate('/pin')}
                className="w-full flex items-center justify-between p-4 sm:px-5 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors text-left group"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <Lock className="w-5 h-5 stroke-[1.75]" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                      Transaction PIN
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                      Manage 4-digit payment authorization PIN
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
              </button>

              {/* Notifications */}
              <button
                onClick={() => navigate('/notifications')}
                className="w-full flex items-center justify-between p-4 sm:px-5 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors text-left group"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <Bell className="w-5 h-5 stroke-[1.75]" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                      Notifications & Alerts
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                      In-app alerts and SMS notification preferences
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
              </button>

              {/* Bank Accounts (Future Placeholder) */}
              <div className="w-full flex items-center justify-between p-4 sm:px-5 opacity-60 cursor-not-allowed">
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center shrink-0">
                    <Building2 className="w-5 h-5 stroke-[1.75]" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 truncate">
                      Linked Bank Accounts
                    </p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 truncate">
                      Direct withdrawal accounts
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-400">
                  Soon
                </span>
              </div>

              {/* Payment Methods (Future Placeholder) */}
              <div className="w-full flex items-center justify-between p-4 sm:px-5 opacity-60 cursor-not-allowed">
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center shrink-0">
                    <Wallet className="w-5 h-5 stroke-[1.75]" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 truncate">
                      Saved Payment Cards
                    </p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 truncate">
                      Debit cards for instant funding
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-400">
                  Soon
                </span>
              </div>

            </div>
          </section>

          {/* ==================================================
              SECURITY SECTION
             ================================================== */}
          <section className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-1">
              Security
            </h3>
            <div className="bg-white dark:bg-slate-900 rounded-2xl md:rounded-3xl border border-slate-200/80 dark:border-slate-800/80 overflow-hidden shadow-sm divide-y divide-slate-100 dark:divide-slate-800/60">
              
              {/* Transactions History */}
              <button
                onClick={() => navigate('/transaction-history')}
                className="w-full flex items-center justify-between p-4 sm:px-5 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors text-left group"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <CreditCard className="w-5 h-5 stroke-[1.75]" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                      Transaction History
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                      View full financial activity logs
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
              </button>

              {/* Biometric Login (Future Placeholder) */}
              <div className="w-full flex items-center justify-between p-4 sm:px-5 opacity-60 cursor-not-allowed">
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center shrink-0">
                    <Fingerprint className="w-5 h-5 stroke-[1.75]" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 truncate">
                      Biometric Authentication
                    </p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 truncate">
                      Fingerprint & FaceID login
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-400">
                  Soon
                </span>
              </div>

              {/* Two-Factor Authentication (Future Placeholder) */}
              <div className="w-full flex items-center justify-between p-4 sm:px-5 opacity-60 cursor-not-allowed">
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center shrink-0">
                    <ShieldAlert className="w-5 h-5 stroke-[1.75]" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 truncate">
                      Two-Factor Authentication (2FA)
                    </p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 truncate">
                      Extra security layer with Authenticator apps
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-400">
                  Soon
                </span>
              </div>

              {/* Trusted Devices (Future Placeholder) */}
              <div className="w-full flex items-center justify-between p-4 sm:px-5 opacity-60 cursor-not-allowed">
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center shrink-0">
                    <Laptop className="w-5 h-5 stroke-[1.75]" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 truncate">
                      Active Sessions & Devices
                    </p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 truncate">
                      Manage logged-in web and mobile devices
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-400">
                  Soon
                </span>
              </div>

            </div>
          </section>

          {/* ==================================================
              PREFERENCES SECTION
             ================================================== */}
          <section className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-1">
              Preferences
            </h3>
            <div className="bg-white dark:bg-slate-900 rounded-2xl md:rounded-3xl border border-slate-200/80 dark:border-slate-800/80 p-4 sm:p-5 shadow-sm space-y-4">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    Appearance & Theme
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Customize your visual experience across BlueSea Mobile
                  </p>
                </div>

                {/* Theme Selector Pills */}
                <div className="inline-flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 self-start sm:self-auto">
                  <button
                    onClick={() => handleThemeChange('system')}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200",
                      appearanceMode === 'system'
                        ? "bg-white dark:bg-slate-900 text-sky-600 dark:text-sky-400 shadow-sm"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                    )}
                  >
                    <Monitor className="w-3.5 h-3.5" />
                    System
                  </button>

                  <button
                    onClick={() => handleThemeChange('light')}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200",
                      appearanceMode === 'light'
                        ? "bg-white dark:bg-slate-900 text-sky-600 dark:text-sky-400 shadow-sm"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                    )}
                  >
                    <Sun className="w-3.5 h-3.5" />
                    Light
                  </button>

                  <button
                    onClick={() => handleThemeChange('dark')}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200",
                      appearanceMode === 'dark'
                        ? "bg-white dark:bg-slate-900 text-sky-600 dark:text-sky-400 shadow-sm"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                    )}
                  >
                    <Moon className="w-3.5 h-3.5" />
                    Dark
                  </button>
                </div>
              </div>

            </div>
          </section>

          {/* ==================================================
              SUPPORT SECTION
             ================================================== */}
          <section className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-1">
              Support & Community
            </h3>
            <div className="bg-white dark:bg-slate-900 rounded-2xl md:rounded-3xl border border-slate-200/80 dark:border-slate-800/80 overflow-hidden shadow-sm divide-y divide-slate-100 dark:divide-slate-800/60">
              
              {/* Customer Support */}
              <button
                onClick={() => navigate('/support')}
                className="w-full flex items-center justify-between p-4 sm:px-5 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors text-left group"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <Headset className="w-5 h-5 stroke-[1.75]" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                      Customer Support
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                      24/7 Live chat & ticket escalation
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
              </button>

              {/* Invite Friends & Earn Reward */}
              <div className="w-full flex items-center justify-between p-4 sm:px-5 opacity-80 hover:opacity-100 transition-opacity">
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                    <Gift className="w-5 h-5 stroke-[1.75]" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                        Invite Friends & Earn
                      </p>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                        <Sparkles className="w-3 h-3" />
                        ₦1,500 Reward
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                      Share your referral code with friends
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-400">
                  Soon
                </span>
              </div>

              {/* Feedback & Suggestions (Placeholder) */}
              <div className="w-full flex items-center justify-between p-4 sm:px-5 opacity-60 cursor-not-allowed">
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center shrink-0">
                    <MessageSquare className="w-5 h-5 stroke-[1.75]" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 truncate">
                      Feedback & Suggestions
                    </p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 truncate">
                      Help us improve BlueSea Mobile
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-400">
                  Soon
                </span>
              </div>

            </div>
          </section>

          {/* ==================================================
              LEGAL CENTER SECTION (EXPANDABLE ACCORDION)
             ================================================== */}
          <section className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-1">
              Legal & Compliance
            </h3>
            
            <div className="bg-white dark:bg-slate-900 rounded-2xl md:rounded-3xl border border-slate-200/80 dark:border-slate-800/80 overflow-hidden shadow-sm transition-all duration-300">
              
              {/* Accordion Toggle Header Button */}
              <button
                onClick={() => setLegalExpanded(!legalExpanded)}
                className="w-full flex items-center justify-between p-4 sm:px-5 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors text-left"
                aria-expanded={legalExpanded}
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5 stroke-[1.75]" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                      Legal Center
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                      Governance, terms, policies & NDPA data protection
                    </p>
                  </div>
                </div>

                <div className={cn(
                  "p-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 transition-transform duration-300",
                  legalExpanded ? "rotate-180 bg-sky-50 dark:bg-sky-950 text-sky-600" : ""
                )}>
                  <ChevronDown className="w-4 h-4" />
                </div>
              </button>

              {/* Accordion Body Content */}
              {legalExpanded && (
                <div className="bg-slate-50/60 dark:bg-slate-950/40 border-t border-slate-100 dark:border-slate-800/80 divide-y divide-slate-100 dark:divide-slate-800/50 animate-in fade-in slide-in-from-top-2 duration-200">
                  {legalPolicies.map((policy, idx) => {
                    const IconComponent = policy.icon;
                    return (
                      <button
                        key={idx}
                        onClick={() => navigate(policy.path)}
                        className="w-full flex items-center justify-between py-3 px-5 sm:pl-14 sm:pr-5 hover:bg-white dark:hover:bg-slate-900 transition-colors text-left group"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <IconComponent className="w-4 h-4 text-slate-400 group-hover:text-sky-500 transition-colors shrink-0" />
                          <span className="text-xs font-medium text-slate-700 dark:text-slate-300 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors truncate">
                            {policy.title}
                          </span>
                        </div>
                        <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-sky-500 transition-colors shrink-0 opacity-0 group-hover:opacity-100" />
                      </button>
                    );
                  })}
                </div>
              )}

            </div>
          </section>

          {/* ==================================================
              ABOUT SECTION
             ================================================== */}
          <section className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-1">
              About Application
            </h3>
            <div className="bg-white dark:bg-slate-900 rounded-2xl md:rounded-3xl border border-slate-200/80 dark:border-slate-800/80 overflow-hidden shadow-sm divide-y divide-slate-100 dark:divide-slate-800/60">
              
              {/* App Version Info */}
              <div className="flex items-center justify-between p-4 sm:px-5">
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center shrink-0">
                    <Info className="w-5 h-5 stroke-[1.75]" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                      BlueSea Mobile Core
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                      Build Version 2.4.0 (Production)
                    </p>
                  </div>
                </div>
                <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200/50 dark:border-slate-700/50">
                  v2.4.0
                </span>
              </div>

              {/* What's New (Future Placeholder) */}
              <div className="w-full flex items-center justify-between p-4 sm:px-5 opacity-60 cursor-not-allowed">
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center shrink-0">
                    <Sparkles className="w-5 h-5 stroke-[1.75]" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 truncate">
                      What's New in This Release
                    </p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 truncate">
                      View release notes and improvements
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-400">
                  Soon
                </span>
              </div>

              {/* Developer Footer */}
              <div className="p-4 sm:px-5 bg-slate-50/50 dark:bg-slate-950/30 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-2">
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  Engineered & Secured for Financial Growth
                </span>
                <span className="text-xs font-bold text-sky-600 dark:text-sky-400 tracking-wide">
                  Developed by Lucid Core Technologies
                </span>
              </div>

            </div>
          </section>

          {/* ==================================================
              DANGER ZONE
             ================================================== */}
          <section className="space-y-2 pt-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-rose-500 dark:text-rose-400 px-1">
              Danger Zone
            </h3>
            
            <div className="bg-white dark:bg-slate-900 rounded-2xl md:rounded-3xl border border-rose-200/60 dark:border-rose-900/30 overflow-hidden shadow-sm divide-y divide-rose-100/50 dark:divide-rose-950/30">
              
              {/* Sign Out Action */}
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-between p-4 sm:px-5 hover:bg-rose-50/60 dark:hover:bg-rose-950/20 transition-colors text-left group"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <LogOut className="w-5 h-5 stroke-[1.75]" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-rose-600 dark:text-rose-400 truncate">
                      Sign Out
                    </p>
                    <p className="text-xs text-rose-500/80 dark:text-rose-400/70 truncate">
                      Securely log out of your current session
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-rose-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
              </button>

              {/* Deactivate Account (Placeholder) */}
              <div className="w-full flex items-center justify-between p-4 sm:px-5 opacity-40 cursor-not-allowed">
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center shrink-0">
                    <UserX className="w-5 h-5 stroke-[1.75]" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 truncate">
                      Deactivate Account
                    </p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 truncate">
                      Temporarily disable account access
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-400">
                  Disabled
                </span>
              </div>

              {/* Delete Account (Placeholder) */}
              <div className="w-full flex items-center justify-between p-4 sm:px-5 opacity-40 cursor-not-allowed">
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center shrink-0">
                    <Trash2 className="w-5 h-5 stroke-[1.75]" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 truncate">
                      Delete Account
                    </p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 truncate">
                      Permanently delete account and all associated data
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-400">
                  Disabled
                </span>
              </div>

            </div>
          </section>

        </main>

        {/* Fixed Mobile Bottom Navigation */}
        <div className="sticky bottom-0 z-30 shrink-0 md:hidden bg-white dark:bg-slate-900 border-t border-slate-200/50 dark:border-slate-800/50">
          <MobileBottomNavigation />
        </div>

      </div>
    </div>
  );
}