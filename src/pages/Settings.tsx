import { useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { cn } from '@/lib/utils';
import { Sidebar, Header } from '@/components/ui-custom';
import { MobileBottomNavigation } from '@/components/navigation/MobileBottomNavigation';
import { PinModal } from '@/components/ui-custom/PinModal';
import { Capacitor } from '@capacitor/core';
import { Switch } from '@/components/ui/switch';
import {
  isPushEnabled,
  setPushEnabled,
  requestPushPermission,
  getPushPermissionStatus,
  openPushSettings,
} from '@/services/appPush';
import { ENDPOINTS } from '@/types';
import {
  promptBiometric as performBiometricPrompt,
  isBiometricSupported as checkBiometricSupport,
  getBiometricToken,
  setBiometricToken,
  getBiometricFlag,
  setBiometricFlag,
} from '@/lib/security/biometrics';
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
  Shield,
  FileCheck,
  Scale,
  RefreshCw,
  Info,
  ExternalLink,
  Award,
  AlertCircle,
  BarChart3,
  Megaphone
} from 'lucide-react';

const API_BASE = String(import.meta.env.VITE_API_BASE || '').replace(/\/$/, '');
const CURRENT_USER_URL = `${API_BASE}/user_preference/user/`;

const authHeaders = () => {
  const token = Cookies.get('access_token') || Cookies.get('token') || '';
  return token
    ? { Authorization: token.startsWith('Bearer ') ? token : `Bearer ${token}` }
    : {};
};

const ADMIN_SUPPORT_ROUTE = '/admin/support';
const ADMIN_BROADCAST_ROUTE = '/admin/broadcast';
const ADMIN_ANALYSIS_ROUTE = '/admin/analysis';

export function Settings() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  // PinModal Hook
  const { showPinModal, hidePinModal, PinComponent, modalData } = PinModal();

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

  // Capacitor platform detection & Biometric state
  const isNative = Capacitor.isNativePlatform();
  const [pushEnabled, setPushEnabledState] = useState<boolean>(() => isPushEnabled());
  const [pushPermission, setPushPermission] = useState<string>('unknown');
  useEffect(() => {
    getPushPermissionStatus().then(setPushPermission).catch(() => setPushPermission('unknown'));
  }, []);
  const handlePushToggle = async (next: boolean) => {
    if (next) {
      const granted = await requestPushPermission();
      setPushPermission(await getPushPermissionStatus().catch(() => 'unknown'));
      if (!granted) return;
      setPushEnabled(true);
      setPushEnabledState(true);
    } else {
      setPushEnabled(false);
      setPushEnabledState(false);
    }
  };
  const [biometricAccordionExpanded, setBiometricAccordionExpanded] = useState(false);
  const [biometricSupported, setBiometricSupported] = useState(true);

  const [biometricEnabled, setBiometricEnabled] = useState<boolean>(() => {
    return getBiometricFlag('biometricEnabled');
  });

  const [biometricLoginEnabled, setBiometricLoginEnabled] = useState<boolean>(() => {
    return getBiometricFlag('biometricLoginEnabled');
  });

  const [biometricPaymentEnabled, setBiometricPaymentEnabled] = useState<boolean>(() => {
    return getBiometricFlag('biometricPaymentEnabled');
  });

  // PIN Verification Action state
  const [pendingBiometricAction, setPendingBiometricAction] = useState<'enable' | 'disable' | null>(null);
  const [pinErrorMessage, setPinErrorMessage] = useState<string | null>(null);

  // Privileges are read from the backend profile endpoint, not inferred from the UI.
  const [privileges, setPrivileges] = useState({
    isStaff: false,
    isAdmin: false,
    loaded: false,
  });

  const isStaff = privileges.isStaff;
  const isAdmin = privileges.isAdmin;
  const canAccessStaffSupport = isStaff || isAdmin;

  useEffect(() => {
    let cancelled = false;

    const loadCurrentUserPrivileges = async () => {
      try {
        const response = await axios.get(CURRENT_USER_URL, {
          headers: authHeaders(),
        });

        if (cancelled) return;

        const data = response.data && typeof response.data === 'object'
          ? response.data as Record<string, unknown>
          : {};

        setPrivileges({
          isStaff: data.is_staff === true,
          isAdmin: data.is_admin === true,
          loaded: true,
        });
      } catch (error) {
        if (cancelled) return;
        console.error('Failed to verify user privileges:', error);
        setPrivileges({ isStaff: false, isAdmin: false, loaded: true });
      }
    };

    void loadCurrentUserPrivileges();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (isNative) {
      checkBiometricSupport().then((supported) => {
        setBiometricSupported(supported);
      });
    }
  }, [isNative]);

  // Server is the source of truth for enrollment: the local flag only
  // mirrors it (plus the device token) for the payment prompt.
  useEffect(() => {
    if (!isNative) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await axios.get(ENDPOINTS.biometric_status, { headers: authHeaders() });
        if (cancelled) return;
        const enrolled = !!res.data?.enabled && !!getBiometricToken();
        setBiometricEnabled(enrolled);
        setBiometricFlag('biometricEnabled', enrolled);
        if (!enrolled) {
          setBiometricLoginEnabled(false);
          setBiometricPaymentEnabled(false);
          setBiometricFlag('biometricLoginEnabled', false);
          setBiometricFlag('biometricPaymentEnabled', false);
        }
      } catch (e) {
        console.error('Biometric status check failed:', e);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isNative]);

  useEffect(() => {
    try {
      localStorage.setItem('bluese_settings_legal_expanded', String(legalExpanded));
    } catch (e) {
      console.error('Failed to save legal accordion state to local storage:', e);
    }
  }, [legalExpanded]);

  /**
   * Safe Mobile & Web Logout Handler
   * Clears active authentication context, detects native mobile runtime,
   * routes to the designated mobile route (/app-auth/login) or web route (/login),
   * and replaces history state to prevent back-button re-entry.
   */
  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      const targetRoute = isNative ? '/app-auth/login' : '/login';
      navigate(targetRoute, { replace: true });
    }
  };

  const getInitials = () => {
    const first = user?.firstName?.charAt(0) || '';
    const last = user?.surname?.charAt(0) || '';
    return `${first}${last}`.toUpperCase() || 'U';
  };

  const getFullName = () => {
    const first = user?.firstName || 'Valued';
    const last = user?.surname || 'User';
    return `${first} ${last}`;
  };

  const handleThemeChange = (mode: 'system' | 'light' | 'dark') => {
    setAppearanceMode(mode);
    if (mode === 'light' && theme === 'dark') {
      toggleTheme();
    } else if (mode === 'dark' && theme === 'light') {
      toggleTheme();
    }
    if (mode === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if ((prefersDark && theme === 'light') || (!prefersDark && theme === 'dark')) {
        toggleTheme();
      }
    }
  };

  // Toggle handlers using PinModal: PIN first (server-verified), then
  // the fingerprint scan itself — the server mints the device token.
  const handleMainBiometricToggle = () => {
    if (!biometricSupported) return;
    setPinErrorMessage(null);

    if (!biometricEnabled) {
      setPendingBiometricAction('enable');
      showPinModal({
        type: 'enable-biometric',
        value: {
          product_name: 'Add Fingerprint',
          title: 'Enter your current transaction PIN'
        }
      });
    } else {
      setPendingBiometricAction('disable');
      showPinModal({
        type: 'disable-biometric',
        value: {
          product_name: 'Remove Fingerprint',
          title: 'Enter your current transaction PIN'
        }
      });
    }
  };

  const handlePinVerificationSuccess = async (response?: any) => {
    const action = pendingBiometricAction;
    setPendingBiometricAction(null);
    setPinErrorMessage(null);

    if (action === 'enable') {
      // Server verified the PIN and minted a device token (returned once).
      const token = response?.token;
      if (!token) {
        setPinErrorMessage('Could not add your fingerprint. Please try again.');
        return;
      }
      const bioSuccess = await performBiometricPrompt('Confirm your fingerprint to finish setup');
      if (bioSuccess) {
        setBiometricToken(token);
        setBiometricFlag('biometricEnabled', true);
        setBiometricFlag('biometricLoginEnabled', true);
        setBiometricFlag('biometricPaymentEnabled', true);
        localStorage.setItem('stayLoggedIn', 'false');
        setBiometricEnabled(true);
        setBiometricLoginEnabled(true);
        setBiometricPaymentEnabled(true);
      } else {
        // Token deliberately not stored: payments stay on the PIN until
        // the fingerprint scan is confirmed.
        setPinErrorMessage('Fingerprint not confirmed. Tap Add fingerprint to try again.');
      }
    } else if (action === 'disable') {
      setBiometricToken('');
      setBiometricFlag('biometricEnabled', false);
      setBiometricFlag('biometricLoginEnabled', false);
      setBiometricFlag('biometricPaymentEnabled', false);
      setBiometricEnabled(false);
      setBiometricLoginEnabled(false);
      setBiometricPaymentEnabled(false);
    }
  };

  const handlePinVerificationError = (errorResponse?: any) => {
    const errorMsg = errorResponse?.message || errorResponse?.error || 'Invalid Transaction PIN. Please try again.';
    setPinErrorMessage(errorMsg);
    setPendingBiometricAction(null);
    
    // Explicitly dismiss modal and clean up state on verification error
    hidePinModal();
  };

  const handleLoginBiometricToggle = () => {
    if (!biometricEnabled) return;
    const newValue = !biometricLoginEnabled;
    setBiometricLoginEnabled(newValue);
    setBiometricFlag('biometricLoginEnabled', newValue);
    if (newValue) {
      localStorage.setItem('stayLoggedIn', 'false');
    }
  };

  const handlePaymentBiometricToggle = () => {
    if (!biometricEnabled) return;
    const newValue = !biometricPaymentEnabled;
    setBiometricPaymentEnabled(newValue);
    setBiometricFlag('biometricPaymentEnabled', newValue);
  };

  const legalPolicies = [
    { title: 'Terms & Conditions', path: '/legal/terms', icon: FileText },
    { title: 'Privacy Policy', path: '/legal/privacy', icon: Shield },
    { title: 'KYC Policy', path: '/legal/kyc', icon: FileCheck },
    { title: 'Refund Policy', path: '/legal/refund', icon: RefreshCw },
    { title: 'Security Policy', path: '/legal/security', icon: ShieldAlert },
    { title: 'Cookie Policy', path: '/legal/cookies', icon: FileText },
    { title: 'Acceptable Use Policy', path: '/legal/acceptable-use', icon: Scale },
  ];

  return (
    <div className="h-screen bg-slate-50 dark:bg-slate-900 flex overflow-hidden">
      <style dangerouslySetInnerHTML={{ __html: `
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      ` }} />

      {/* SIDEBAR */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* CORE VIEWPORT CONTENT AREA */}
      <div className="flex-1 flex flex-col h-full min-w-0 relative">
        
        {/* APP HEADER LAYER */}
        <div className="sticky top-0 z-30 shrink-0 bg-slate-50 dark:bg-slate-900">
          <Header
            title="Settings"
            subtitle="Account Control Center"
            onMenuClick={() => setSidebarOpen(true)}
          />
        </div>

        {/* SCROLLABLE MAIN CONTENT AREA */}
        <main className="flex-1 p-4 md:p-6 overflow-y-auto scrollbar-hide z-10">
          <div className="max-w-4xl mx-auto space-y-6">
            
            {/* Error Banner for PIN validation */}
            {pinErrorMessage && (
              <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/50 flex items-center gap-3 text-red-600 dark:text-red-400 text-xs font-semibold animate-in fade-in duration-200">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span className="flex-1">{pinErrorMessage}</span>
                <button 
                  onClick={() => {
                    setPinErrorMessage(null);
                    hidePinModal();
                  }} 
                  className="text-red-500 hover:text-red-700 font-bold px-1"
                >
                  ✕
                </button>
              </div>
            )}

            {/* PRIVILEGED WORKSPACE
                Visibility is controlled by the backend's is_staff / is_admin flags.
                These links are intentionally not rendered for ordinary users. */}
            {privileges.loaded && (canAccessStaffSupport || isAdmin) && (
              <section className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-1">
                  Administration
                </h3>

                <div className="bg-white dark:bg-slate-900 rounded-2xl md:rounded-3xl border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm divide-y divide-slate-50 dark:divide-slate-800/50">
                  {canAccessStaffSupport && (
                    <button
                      type="button"
                      onClick={() => navigate(ADMIN_SUPPORT_ROUTE)}
                      className="w-full flex items-center justify-between p-4 sm:px-5 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors text-left group"
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-sky-100 dark:bg-sky-900/30 text-sky-500 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                          <Headset className="w-5 h-5 stroke-[1.75]" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-slate-800 dark:text-white truncate">Support Administration</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 truncate">Manage customer tickets and support conversations</p>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-slate-300 dark:text-slate-600 group-hover:translate-x-0.5 transition-transform shrink-0" />
                    </button>
                  )}

                  {isAdmin && (
                    <>
                      <button
                        type="button"
                        onClick={() => navigate(ADMIN_BROADCAST_ROUTE)}
                        className="w-full flex items-center justify-between p-4 sm:px-5 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors text-left group"
                      >
                        <div className="flex items-center gap-3.5 min-w-0">
                          <div className="w-10 h-10 rounded-xl bg-violet-100 dark:bg-violet-900/30 text-violet-500 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                            <Megaphone className="w-5 h-5 stroke-[1.75]" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-slate-800 dark:text-white truncate">Broadcast</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">Send platform-wide messages and announcements</p>
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-slate-300 dark:text-slate-600 group-hover:translate-x-0.5 transition-transform shrink-0" />
                      </button>

                      <button
                        type="button"
                        onClick={() => navigate(ADMIN_ANALYSIS_ROUTE)}
                        className="w-full flex items-center justify-between p-4 sm:px-5 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors text-left group"
                      >
                        <div className="flex items-center gap-3.5 min-w-0">
                          <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 text-emerald-500 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                            <BarChart3 className="w-5 h-5 stroke-[1.75]" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-slate-800 dark:text-white truncate">Platform Analysis</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">Detailed platform performance and operational analysis</p>
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-slate-300 dark:text-slate-600 group-hover:translate-x-0.5 transition-transform shrink-0" />
                      </button>
                    </>
                  )}
                </div>
              </section>
            )}

            {/* PROFILE HEADER CARD */}
            <div className="relative overflow-hidden bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-6 md:p-8 shadow-sm transition-all duration-300 hover:shadow-md">
              <div className="absolute top-0 right-0 w-64 h-64 bg-sky-500/5 dark:bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-blue-600/5 dark:bg-blue-600/10 rounded-full blur-2xl pointer-events-none" />

              <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
                <button
                  type="button"
                  onClick={() => navigate('/profile')}
                  aria-label="Open profile"
                  className="relative shrink-0 group rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900"
                >
                  <div className="w-20 h-20 sm:w-22 sm:h-22 rounded-full p-1 bg-gradient-to-tr from-sky-400 via-blue-600 to-sky-500 shadow-md transition-transform duration-300 group-hover:scale-105">
                    <div className="w-full h-full rounded-full bg-white dark:bg-slate-900 p-0.5 overflow-hidden flex items-center justify-center">
                      {user?.profilePicture ? (
                        <img
                          src={user.profilePicture}
                          alt={getFullName()}
                          className="w-full h-full rounded-full object-cover select-none"
                        />
                      ) : (
                        <div className="w-full h-full rounded-full bg-sky-100 dark:bg-sky-900/30 flex items-center justify-center font-extrabold text-sky-600 dark:text-sky-400 text-xl tracking-wider select-none">
                          {getInitials()}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="absolute bottom-1 right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-900 shadow-sm" />
                </button>

                <div className="flex-1 min-w-0 space-y-1.5">
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                    <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight truncate">
                      {getFullName()}
                    </h2>

                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Verified
                    </span>

                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-100 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400 border border-sky-200 dark:border-sky-800/40">
                      <Award className="w-3.5 h-3.5" />
                      Tier 1 Member
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

            {/* ACCOUNT SECTION */}
            <section className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-1">
                Account
              </h3>
              <div className="bg-white dark:bg-slate-900 rounded-2xl md:rounded-3xl border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm divide-y divide-slate-50 dark:divide-slate-800/50">
                
                <button
                  onClick={() => navigate('/profile')}
                  className="w-full flex items-center justify-between p-4 sm:px-5 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors text-left group"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-sky-100 dark:bg-sky-900/30 text-sky-500 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <User className="w-5 h-5 stroke-[1.75]" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-800 dark:text-white truncate">
                        Profile Information
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                        Personal details & email updates
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-300 dark:text-slate-600 group-hover:translate-x-0.5 transition-transform shrink-0" />
                </button>

                <button
                  onClick={() => navigate('/identity-center')}
                  className="w-full flex items-center justify-between p-4 sm:px-5 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors text-left group"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 text-emerald-500 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <ShieldCheck className="w-5 h-5 stroke-[1.75]" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-800 dark:text-white truncate">
                        Identity Verification
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                        KYC tier levels and limits
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-300 dark:text-slate-600 group-hover:translate-x-0.5 transition-transform shrink-0" />
                </button>

                <button
                  onClick={() => navigate('/pin')}
                  className="w-full flex items-center justify-between p-4 sm:px-5 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors text-left group"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-sky-100 dark:bg-sky-900/30 text-sky-500 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <Lock className="w-5 h-5 stroke-[1.75]" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-800 dark:text-white truncate">
                        Transaction PIN
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                        Manage 4-digit payment authorization PIN
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-300 dark:text-slate-600 group-hover:translate-x-0.5 transition-transform shrink-0" />
                </button>

                <button
                  onClick={() => navigate('/notifications')}
                  className="w-full flex items-center justify-between p-4 sm:px-5 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors text-left group"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 text-amber-500 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <Bell className="w-5 h-5 stroke-[1.75]" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-800 dark:text-white truncate">
                        Notifications & Alerts
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                        In-app alerts and SMS notification preferences
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-300 dark:text-slate-600 group-hover:translate-x-0.5 transition-transform shrink-0" />
                </button>

                <div className="w-full flex items-center justify-between gap-3 p-4 sm:px-5">
                  <button
                    onClick={() => navigate('/notifications')}
                    className="flex items-center gap-3.5 min-w-0 text-left"
                  >
                    <div className="w-10 h-10 rounded-xl bg-sky-100 dark:bg-sky-900/30 text-sky-500 flex items-center justify-center shrink-0">
                      <Bell className="w-5 h-5 stroke-[1.75]" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-800 dark:text-white truncate">
                        System tray alerts
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                        Show a system notification when the app is in the background
                      </p>
                      {pushEnabled && pushPermission === 'denied' && (
                        <button
                          onClick={(e) => { e.stopPropagation(); void openPushSettings(); }}
                          className="text-xs text-sky-500 hover:text-sky-600 font-medium mt-0.5"
                        >
                          Blocked by OS — open system settings
                        </button>
                      )}
                    </div>
                  </button>
                  <Switch
                    checked={pushEnabled}
                    onCheckedChange={(v) => { void handlePushToggle(v); }}
                    aria-label="Toggle system tray alerts"
                  />
                </div>

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

            {/* SECURITY SECTION */}
            <section className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-1">
                Security
              </h3>
              <div className="bg-white dark:bg-slate-900 rounded-2xl md:rounded-3xl border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm divide-y divide-slate-50 dark:divide-slate-800/50">
                
                <button
                  onClick={() => navigate('/transaction-history')}
                  className="w-full flex items-center justify-between p-4 sm:px-5 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors text-left group"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-sky-100 dark:bg-sky-900/30 text-sky-500 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <CreditCard className="w-5 h-5 stroke-[1.75]" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-800 dark:text-white truncate">
                        Transaction History
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                        View full financial activity logs
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-300 dark:text-slate-600 group-hover:translate-x-0.5 transition-transform shrink-0" />
                </button>

                {/* Biometric Authentication Accordion (Capacitor Native App) */}
                {isNative && (
                  <div className="bg-white dark:bg-slate-900 transition-all duration-300">
                    <button
                      onClick={() => setBiometricAccordionExpanded(!biometricAccordionExpanded)}
                      className="w-full flex items-center justify-between p-4 sm:px-5 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors text-left"
                      aria-expanded={biometricAccordionExpanded}
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-sky-100 dark:bg-sky-900/30 text-sky-500 flex items-center justify-center shrink-0">
                          <Fingerprint className="w-5 h-5 stroke-[1.75]" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-slate-800 dark:text-white truncate">
                            Biometric Authentication
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                            Secure your account using device biometrics.
                          </p>
                        </div>
                      </div>

                      <div className={cn(
                        "p-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 transition-transform duration-300",
                        biometricAccordionExpanded ? "rotate-180 bg-sky-100 dark:bg-sky-900/40 text-sky-500" : ""
                      )}>
                        <ChevronDown className="w-4 h-4" />
                      </div>
                    </button>

                    {biometricAccordionExpanded && (
                      <div className="bg-slate-50/60 dark:bg-slate-950/40 border-t border-slate-100 dark:border-slate-800/80 p-4 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
                        {!biometricSupported ? (
                          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium text-center py-2">
                            This device does not support biometric authentication.
                          </p>
                        ) : (
                          <div className="space-y-4">
                            {/* Enable Biometrics Master Toggle */}
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm font-semibold text-slate-800 dark:text-white">
                                  {biometricEnabled ? 'Fingerprint Added' : 'Add Fingerprint'}
                                </p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                  {biometricEnabled
                                    ? 'Confirm payments with your fingerprint. Tap to remove.'
                                    : 'Enter your current transaction PIN, then scan your fingerprint.'}
                                </p>
                              </div>
                              <button
                                type="button"
                                role="switch"
                                aria-checked={biometricEnabled}
                                onClick={handleMainBiometricToggle}
                                className={cn(
                                  "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
                                  biometricEnabled ? "bg-sky-500" : "bg-slate-200 dark:bg-slate-700"
                                )}
                              >
                                <span
                                  className={cn(
                                    "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out",
                                    biometricEnabled ? "translate-x-5" : "translate-x-0"
                                  )}
                                />
                              </button>
                            </div>

                            {/* Use Biometrics for Login */}
                            <div className={cn("flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800", !biometricEnabled && "opacity-50 pointer-events-none")}>
                              <div>
                                <p className="text-sm font-semibold text-slate-800 dark:text-white">
                                  Use Biometrics for Login
                                </p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                  Authenticate using biometrics when opening the app
                                </p>
                              </div>
                              <button
                                type="button"
                                role="switch"
                                disabled={!biometricEnabled}
                                aria-checked={biometricLoginEnabled}
                                onClick={handleLoginBiometricToggle}
                                className={cn(
                                  "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
                                  biometricLoginEnabled && biometricEnabled ? "bg-sky-500" : "bg-slate-200 dark:bg-slate-700"
                                )}
                              >
                                <span
                                  className={cn(
                                    "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out",
                                    biometricLoginEnabled && biometricEnabled ? "translate-x-5" : "translate-x-0"
                                  )}
                                />
                              </button>
                            </div>

                            {/* Use Biometrics for Payments */}
                            <div className={cn("flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800", !biometricEnabled && "opacity-50 pointer-events-none")}>
                              <div>
                                <p className="text-sm font-semibold text-slate-800 dark:text-white">
                                  Use Fingerprint for Payments
                                </p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                  Confirm transactions with your fingerprint instead of the PIN
                                </p>
                              </div>
                              <button
                                type="button"
                                role="switch"
                                disabled={!biometricEnabled}
                                aria-checked={biometricPaymentEnabled}
                                onClick={handlePaymentBiometricToggle}
                                className={cn(
                                  "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
                                  biometricPaymentEnabled && biometricEnabled ? "bg-sky-500" : "bg-slate-200 dark:bg-slate-700"
                                )}
                              >
                                <span
                                  className={cn(
                                    "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out",
                                    biometricPaymentEnabled && biometricEnabled ? "translate-x-5" : "translate-x-0"
                                  )}
                                />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

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

            {/* PREFERENCES SECTION */}
            <section className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-1">
                Preferences
              </h3>
              <div className="bg-white dark:bg-slate-900 rounded-2xl md:rounded-3xl border border-slate-100 dark:border-slate-800 p-4 sm:p-5 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-800 dark:text-white">
                      Appearance & Theme
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Customize your visual experience across BlueSea Mobile
                    </p>
                  </div>

                  <div className="inline-flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 self-start sm:self-auto">
                    <button
                      onClick={() => handleThemeChange('system')}
                      className={cn(
                        "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200",
                        appearanceMode === 'system'
                          ? "bg-white dark:bg-slate-900 text-sky-500 shadow-sm"
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
                          ? "bg-white dark:bg-slate-900 text-sky-500 shadow-sm"
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
                          ? "bg-white dark:bg-slate-900 text-sky-500 shadow-sm"
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

            {/* SUPPORT SECTION */}
            <section className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-1">
                Support & Community
              </h3>
              <div className="bg-white dark:bg-slate-900 rounded-2xl md:rounded-3xl border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm divide-y divide-slate-50 dark:divide-slate-800/50">
                
                <button
                  onClick={() => navigate('/support')}
                  className="w-full flex items-center justify-between p-4 sm:px-5 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors text-left group"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-sky-100 dark:bg-sky-900/30 text-sky-500 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <Headset className="w-5 h-5 stroke-[1.75]" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-800 dark:text-white truncate">
                        Customer Support
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                        24/7 Live chat & ticket escalation
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-300 dark:text-slate-600 group-hover:translate-x-0.5 transition-transform shrink-0" />
                </button>

                <div className="w-full flex items-center justify-between p-4 sm:px-5 opacity-80 hover:opacity-100 transition-opacity">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 text-amber-500 flex items-center justify-center shrink-0">
                      <Gift className="w-5 h-5 stroke-[1.75]" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-slate-800 dark:text-white truncate">
                          Invite Friends & Earn
                        </p>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800/40">
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

            {/* LEGAL CENTER SECTION (EXPANDABLE ACCORDION) */}
            <section className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-1">
                Legal & Compliance
              </h3>
              
              <div className="bg-white dark:bg-slate-900 rounded-2xl md:rounded-3xl border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm transition-all duration-300">
                
                <button
                  onClick={() => setLegalExpanded(!legalExpanded)}
                  className="w-full flex items-center justify-between p-4 sm:px-5 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors text-left"
                  aria-expanded={legalExpanded}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-sky-100 dark:bg-sky-900/30 text-sky-500 flex items-center justify-center shrink-0">
                      <FileText className="w-5 h-5 stroke-[1.75]" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-800 dark:text-white truncate">
                        Legal Center
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                        Governance, terms, policies & NDPA data protection
                      </p>
                    </div>
                  </div>

                  <div className={cn(
                    "p-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 transition-transform duration-300",
                    legalExpanded ? "rotate-180 bg-sky-100 dark:bg-sky-900/40 text-sky-500" : ""
                  )}>
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

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
                            <span className="text-xs font-medium text-slate-700 dark:text-slate-300 group-hover:text-sky-500 dark:group-hover:text-sky-400 transition-colors truncate">
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

            {/* ABOUT SECTION */}
            <section className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-1">
                About Application
              </h3>
              <div className="bg-white dark:bg-slate-900 rounded-2xl md:rounded-3xl border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm divide-y divide-slate-50 dark:divide-slate-800/50">
                
                <div className="flex items-center justify-between p-4 sm:px-5">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center shrink-0">
                      <Info className="w-5 h-5 stroke-[1.75]" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-800 dark:text-white truncate">
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

                <div className="p-4 sm:px-5 bg-slate-50 dark:bg-slate-950/40 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-2">
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    Engineered & Secured for Financial Growth
                  </span>
                  <span className="text-xs font-bold text-sky-500 tracking-wide">
                    Developed by G Lucid Apex
                  </span>
                </div>

              </div>
            </section>

            {/* DANGER ZONE */}
            <section className="space-y-2 pt-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-red-500 dark:text-red-400 px-1">
                Danger Zone
              </h3>
              
              <div className="bg-white dark:bg-slate-900 rounded-2xl md:rounded-3xl border border-red-100 dark:border-red-950/40 overflow-hidden shadow-sm divide-y divide-red-50 dark:divide-red-950/30">
                
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-between p-4 sm:px-5 hover:bg-red-50/50 dark:hover:bg-red-950/20 transition-colors text-left group"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-900/30 text-red-500 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <LogOut className="w-5 h-5 stroke-[1.75]" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-red-500 truncate">
                        Sign Out
                      </p>
                      <p className="text-xs text-red-400/80 dark:text-red-400/70 truncate">
                        Securely log out of your current session
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-red-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
                </button>

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

          </div>
        </main>

        {/* MOBILE BOTTOM NAVIGATION */}
        <div className="sticky bottom-0 z-30 shrink-0 md:hidden bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
          <MobileBottomNavigation />
        </div>

      </div>

      {/* Global PIN Component for Settings Authorization */}
      <PinComponent
        type={modalData.type || 'verify-pin'}
        value={modalData.value || {}}
        onSuccess={handlePinVerificationSuccess}
        onError={handlePinVerificationError}
        onFailure={handlePinVerificationError}
      />
    </div>
  );
}