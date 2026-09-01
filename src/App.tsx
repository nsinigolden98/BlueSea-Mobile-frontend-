import { useEffect } from 'react';
import { BrowserRouter, Navigate, Route, Routes, Outlet } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import { ThemeProvider } from '@/context/ThemeContext';

// REFRESH PROVIDER & PULL TO REFRESH
import { RefreshProvider, PullToRefresh } from '@/components/refresh';

// MOBILE APP AUTH IMPORTS
import { AppAuthPage } from '@/pages/app-auth/AppAuthPage';
import { AppLoginPage } from '@/pages/app-auth/AppLoginPage';
import { AppSignupPage } from '@/pages/app-auth/AppSignupPage';
import { AppBasicDetailsPage } from '@/pages/app-auth/AppBasicDetailsPage';
import { AppEmailVerificationPage } from '@/pages/app-auth/AppEmailVerificationPage';
import { AppOtpPage } from '@/pages/app-auth/AppOtpPage';
import { AppCreatePinPage } from '@/pages/app-auth/AppCreatePinPage';
import { AppForgotPasswordPage } from '@/pages/app-auth/AppForgotPasswordPage';
import { AppUsernamePage } from '@/pages/app-auth/AppUsernamePage';
import { AppAuthSuccessPage } from '@/pages/app-auth/AppAuthSuccessPage';

import {
  AuthPage,
  Dashboard,
  Wallet,
  Airtime,
  Data,
  Services,
  Settings,
  Profile,
  CreatePin,
  LightBills,
  Transactions,
  AirtimeBuyback,
  GroupPayment,
  Loyalty,
  MoreServices,
  Notifications,
  EventManager,
  Scanner,
  MyTickets,
  VendorVerification,
  DSTV,
  GOTV,
  Startimes,
  ShowMax,
  WAECRegistration,
  WAECResult,
  JAMBRegistration,
  TVSubscription,
  AutoTopUp,
  Marketplace,
  Support,
  ScannerAssignments,
  EventPublic,
  TransactionFilterPage,
  GiftCards,
  SpinVault,
  Betting,
  BlueSphere,
} from '@/pages';

import { BlueConnectPage } from '@/components/blueconnect';

import IdentityCenter from '@/pages/IdentityCenter';
import HistoryPage from '@/pages/History';
import Flights from '@/pages/Flights';  
import RootRoute from './components/ui-custom/RootRoute';
import './App.css';
import { useAuth } from '@/context/AuthContext';
import { AuthLoader } from '@/components/ui-custom';

import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient';
import PayrollProHome from './screens/payroll-pro/PayrollProHome';
import CreateCompany from './screens/payroll-pro/CreateCompany';
import CompanyWorkspace from './screens/payroll-pro/CompanyWorkspace';
import BranchDetails from './screens/payroll-pro/BranchDetails';
import EmployeeProfile from './screens/payroll-pro/EmployeeProfile';
import EmployeePortal from './screens/payroll-pro/EmployeePortal';
import AddEmployee from './screens/payroll-pro/AddEmployee';
import CreateBranch from './screens/payroll-pro/CreateBranch';
import PayrollDetail from './screens/payroll-pro/PayrollDetail';

// AFFILIATE ROUTES
import { 
  AffiliateLayout, 
  AffiliateDashboard, 
  AffiliateRegistration, 
  AffiliatePending 
} from '@/pages/Affiliate';

// VAULT / REWARDS SYSTEM IMPORT
import { Rewards } from '@/pages/vault';

// LEGAL CENTER IMPORTS
import {
  TermsAndConditions,
  PrivacyPolicy,
  RefundPolicy,
  SecurityPolicy,
  CookiePolicy,
  KYCPolicy,
  AcceptableUsePolicy,
} from '@/pages/legal-center';

// PAYLINK IMPORTS
import { 
  PayLinkHome, 
  CreatePayLink, 
  PayLinkPayment, 
  PayLinkDetails, 
  ScanPay, 
  MyQR, 
  OpenPayLink, 
  BusinessManager, 
  ProductsManager, 
  PayLinkHistory 
} from '@/pages/paylink';

function MainLayout() {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1">
        <Outlet /> 
      </main>
    </div>
  );
}

function AuthenticatedLayout() {
  return (
    <RefreshProvider>
      <PullToRefresh>
        <Outlet />
      </PullToRefresh>
    </RefreshProvider>
  );
}

// Protected Route Component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <AuthLoader />;
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
}

// Public Route Component
function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <AuthLoader />;
  return !isAuthenticated ? <>{children}</> : <Navigate to="/dashboard" />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        {/* PUBLIC WEB AUTH ROUTES */}
        <Route path="/" element={<RootRoute />} />
        <Route path="/login" element={<PublicRoute><AuthPage /></PublicRoute>} />
        <Route path="/signup" element={<PublicRoute><AuthPage /></PublicRoute>} />

        {/* NATIVE MOBILE AUTH ROUTES */}
        <Route path="/app-auth" element={<PublicRoute><AppAuthPage /></PublicRoute>} />
        <Route path="/app-auth/login" element={<PublicRoute><AppLoginPage /></PublicRoute>} />
        <Route path="/app-auth/signup" element={<PublicRoute><AppSignupPage /></PublicRoute>} />
        <Route path="/app-auth/basic-details" element={<PublicRoute><AppBasicDetailsPage /></PublicRoute>} />
        <Route path="/app-auth/forgot-password" element={<PublicRoute><AppForgotPasswordPage /></PublicRoute>} />
        
        {/* NATIVE ONBOARDING ROUTES (ACCESSIBLE DURING SESSION ESTABLISHMENT) */}
        <Route path="/app-auth/verify-email" element={<AppEmailVerificationPage />} />
        <Route path="/app-auth/verify-otp" element={<AppOtpPage />} />
        <Route path="/app-auth/username" element={<AppUsernamePage />} />
        <Route path="/app-auth/create-pin" element={<AppCreatePinPage />} />
        <Route path="/app-auth/success" element={<AppAuthSuccessPage />} />

        {/* Public event sharing */}
        <Route path="/event/:eventId" element={<EventPublic />} />

        {/* Public support */}
        <Route path="/support" element={<Support />} />

        {/* Public legal pages */}
        <Route path="/legal/terms" element={<TermsAndConditions />} />
        <Route path="/legal/privacy" element={<PrivacyPolicy />} />
        <Route path="/legal/refund" element={<RefundPolicy />} />
        <Route path="/legal/security" element={<SecurityPolicy />} />
        <Route path="/legal/cookies" element={<CookiePolicy />} />
        <Route path="/legal/kyc" element={<KYCPolicy />} />
        <Route path="/legal/acceptable-use" element={<AcceptableUsePolicy />} />

        {/* AUTHENTICATED APPLICATION ROUTES */}
        <Route element={<AuthenticatedLayout />}>
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/blueconnect" element={<ProtectedRoute><BlueConnectPage /></ProtectedRoute>} />
          <Route path="/wallet" element={<ProtectedRoute><Wallet /></ProtectedRoute>} />
          <Route path="/airtime" element={<ProtectedRoute><Airtime /></ProtectedRoute>} />
          <Route path="/data" element={<ProtectedRoute><Data /></ProtectedRoute>} />
          <Route path="/marketplace" element={<ProtectedRoute><Marketplace /></ProtectedRoute>} /> 
          <Route path="/services" element={<ProtectedRoute><Services /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/pin" element={<ProtectedRoute><CreatePin /></ProtectedRoute>} />
          <Route path="/light-bills" element={<ProtectedRoute><LightBills /></ProtectedRoute>} />
          <Route path="/transactions" element={<ProtectedRoute><Transactions /></ProtectedRoute>} />
          
          <Route path="/rewards" element={<ProtectedRoute><Rewards /></ProtectedRoute>} />
          <Route path="/vault" element={<ProtectedRoute><Rewards /></ProtectedRoute>} />

          <Route path="/transaction-history" element={<ProtectedRoute><TransactionFilterPage /></ProtectedRoute>} />
          <Route path="/airtime-buyback" element={<ProtectedRoute><AirtimeBuyback /></ProtectedRoute>} />
          <Route path="/group-payment" element={<ProtectedRoute><GroupPayment /></ProtectedRoute>} />
          <Route path="/loyalty" element={<ProtectedRoute><Loyalty /></ProtectedRoute>} />
          <Route path="/more-services" element={<ProtectedRoute><MoreServices /></ProtectedRoute>} />
          <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
          <Route path="/event-manager" element={<ProtectedRoute><EventManager /></ProtectedRoute>} />
          <Route path="/scanner" element={<ProtectedRoute><Scanner /></ProtectedRoute>} />
          <Route path="/scanner-assignments" element={<ProtectedRoute><ScannerAssignments /></ProtectedRoute>} />
          <Route path="/my-tickets" element={<ProtectedRoute><MyTickets /></ProtectedRoute>} />
          <Route path="/vendor-verification" element={<ProtectedRoute><VendorVerification /></ProtectedRoute>} />
          <Route path="/dstv" element={<ProtectedRoute><DSTV /></ProtectedRoute>} />
          <Route path="/gotv" element={<ProtectedRoute><GOTV /></ProtectedRoute>} />
          <Route path="/startimes" element={<ProtectedRoute><Startimes /></ProtectedRoute>} />
          <Route path="/showmax" element={<ProtectedRoute><ShowMax /></ProtectedRoute>} />
          <Route path="/waec-registration" element={<ProtectedRoute><WAECRegistration /></ProtectedRoute>} />
          <Route path="/waec-result" element={<ProtectedRoute><WAECResult /></ProtectedRoute>} />
          <Route path="/jamb-registration" element={<ProtectedRoute><JAMBRegistration /></ProtectedRoute>} />
          <Route path="/tv-subscription" element={<ProtectedRoute><TVSubscription /></ProtectedRoute>} />
          <Route path="/auto-topup" element={<ProtectedRoute><AutoTopUp /></ProtectedRoute>} />
          <Route path="/bluesphere" element={<ProtectedRoute><BlueSphere /></ProtectedRoute>} />
          
          <Route path="/history" element={<ProtectedRoute><HistoryPage /></ProtectedRoute>} />
          <Route path="/gift-cards" element={<ProtectedRoute><GiftCards /></ProtectedRoute>} />
          <Route path="/flights" element={<ProtectedRoute><Flights /></ProtectedRoute>} />
          <Route path="/spin-vault" element={<ProtectedRoute><SpinVault /></ProtectedRoute>} />
          <Route path="/betting" element={<ProtectedRoute><Betting /></ProtectedRoute>} />
          <Route path="/identity-center" element={<ProtectedRoute><IdentityCenter /></ProtectedRoute>} />

          <Route path="/payroll-pro" element={<ProtectedRoute><PayrollProHome /></ProtectedRoute>} />
          <Route path="/payroll-pro/create-company" element={<ProtectedRoute><CreateCompany /></ProtectedRoute>} />
          <Route path="/payroll-pro/company/:companyId" element={<ProtectedRoute><CompanyWorkspace /></ProtectedRoute>} />
          <Route path="/payroll-pro/company/:companyId/add-employee" element={<ProtectedRoute><AddEmployee /></ProtectedRoute>} />
          <Route path="/payroll-pro/company/:companyId/create-branch" element={<ProtectedRoute><CreateBranch /></ProtectedRoute>} />
          <Route path="/payroll-pro/branch/:branchId" element={<ProtectedRoute><BranchDetails /></ProtectedRoute>} />
          <Route path="/payroll-pro/employee/:employeeId" element={<ProtectedRoute><EmployeeProfile /></ProtectedRoute>} />
          <Route path="/payroll-pro/portal/:companyId" element={<ProtectedRoute><EmployeePortal /></ProtectedRoute>} />
          <Route path="/payroll-pro/payroll/:payrollId" element={<ProtectedRoute><PayrollDetail /></ProtectedRoute>} />

          <Route path="/paylink" element={<ProtectedRoute><PayLinkHome /></ProtectedRoute>} />
          <Route path="/paylink/create" element={<ProtectedRoute><CreatePayLink /></ProtectedRoute>} />
          <Route path="/paylink/pay/:id" element={<ProtectedRoute><PayLinkPayment /></ProtectedRoute>} />
          <Route path="/paylink/details/:id" element={<ProtectedRoute><PayLinkDetails /></ProtectedRoute>} />
          <Route path="/paylink/scan" element={<ProtectedRoute><ScanPay /></ProtectedRoute>} />
          <Route path="/paylink/my-qr" element={<ProtectedRoute><MyQR /></ProtectedRoute>} />
          <Route path="/paylink/open" element={<ProtectedRoute><OpenPayLink /></ProtectedRoute>} />
          <Route path="/paylink/businesses" element={<ProtectedRoute><BusinessManager /></ProtectedRoute>} />
          <Route path="/paylink/products" element={<ProtectedRoute><ProductsManager /></ProtectedRoute>} />
          <Route path="/paylink/history" element={<ProtectedRoute><PayLinkHistory /></ProtectedRoute>} />

          <Route path="/affiliate" element={<ProtectedRoute><AffiliateLayout /></ProtectedRoute>}>
            <Route index element={<ProtectedRoute><Navigate to="/affiliate/dashboard" replace /></ProtectedRoute>} />
            <Route path="dashboard" element={<ProtectedRoute><AffiliateDashboard /></ProtectedRoute>} />
            <Route path="events" element={<ProtectedRoute><AffiliateDashboard /></ProtectedRoute>} />
            <Route path="analytics" element={<ProtectedRoute><AffiliateDashboard /></ProtectedRoute>} />
            <Route path="leaderboard" element={<ProtectedRoute><AffiliateDashboard /></ProtectedRoute>} />
            <Route path="achievements" element={<ProtectedRoute><AffiliateDashboard /></ProtectedRoute>} />
            <Route path="saved" element={<ProtectedRoute><AffiliateDashboard /></ProtectedRoute>} />
            <Route path="alerts" element={<ProtectedRoute><AffiliateDashboard /></ProtectedRoute>} />
            <Route path="settings" element={<ProtectedRoute><AffiliateDashboard /></ProtectedRoute>} />
            <Route path="register" element={<ProtectedRoute><AffiliateRegistration /></ProtectedRoute>} />
            <Route path="pending" element={<ProtectedRoute><AffiliatePending /></ProtectedRoute>} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" />} />
      </Route>
    </Routes>
  );
}

function App() {
  useEffect(() => {
    const handleOffline = () => {
      window.location.href = 'file:////android/app/src/main/assets/offline.html';
    };

    if (!navigator.onLine) {
      handleOffline();
    }

    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <QueryClientProvider client={queryClient}>
            <AppRoutes />
          </QueryClientProvider>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;