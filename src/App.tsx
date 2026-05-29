import { BrowserRouter, Navigate, Route, Routes, Outlet, useLocation } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import { ThemeProvider } from '@/context/ThemeContext';
//import { Header } from '@/components/ui-custom/Header';
import LiveTicker from '@/components/ui/LiveTicker';
import {
  LandingPage,
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
  Rewards,
  WAECRegistration,
  WAECResult,
  JAMBRegistration,
  TVSubscription,
  AutoTopUp,
  Marketplace,
  Support,
  Campaigns,
  ScannerAssignments,
  EventPublic,
  TransactionFilterPage,
  GiftCards,
  MarketplaceMessaging,
  SellerProductManager,
  Checkout,
  SpinVault,
  Betting,
  BlueSphere,
  /*
  FinanceHub, SavingsVault, BlueSeaCards, BspCrypto, Pension, Insurance,
  BusinessHub, Payroll, Invoices, Properties, Appointments, Analytics,
  Storefronts, Freelance, Affiliate, Contracts,
  Events, Streams, Travel, Subscriptions,Receipt, */ 
} from '@/pages';
import IdentityCenter from '@/pages/IdentityCenter';
import HistoryPage from '@/pages/History';
import Flights from '@/pages/Flights';  
import './App.css';
import { useAuth } from '@/context/AuthContext';
import { AuthLoader } from '@/components/ui-custom';

import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient';

/**
 * Global Layout Wrapper
 * Handles the persistent Header and the conditional LiveTicker
 */
function MainLayout() {
  const location = useLocation();

  // Exclude ticker from Landing, Login, and Signup pages
  const excludedPaths = ['/', '/login', '/signup'];
  const shouldShowTicker = !excludedPaths.includes(location.pathname);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Persistent Header
<Header title="BlueSea Mobile" />
 */}
      {/* Conditional LiveTicker - Only renders if not on an excluded path */}
      {shouldShowTicker && <LiveTicker />}

      {/* Page Content */}
      <main className="flex-1">
        <Outlet /> 
      </main>
    </div>
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
      {/* Wrap everything in the MainLayout to ensure Header and Ticker logic are global */}
      <Route element={<MainLayout />}>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<PublicRoute><AuthPage /></PublicRoute>} />
        <Route path="/signup" element={<PublicRoute><AuthPage /></PublicRoute>} />
        <Route path="/event/:eventId" element={<EventPublic />} />

        {/* Protected Routes */}
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
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
        <Route path="/transaction-history" element={<ProtectedRoute><TransactionFilterPage /></ProtectedRoute>} />
        <Route path="/campaigns" element={<ProtectedRoute><Campaigns /></ProtectedRoute>} /> 
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
        <Route path="/support" element={<ProtectedRoute><Support /></ProtectedRoute>} />
        <Route path="/checkout" element={<Checkout />} />
        
        <Route path="/messages" element={<MarketplaceMessaging />} />
        <Route path="/messages/:conversationId" element={<MarketplaceMessaging />} />
        
        <Route path="/bluesphere" element={<ProtectedRoute><BlueSphere /></ProtectedRoute>} />
        <Route path="/products" element={<SellerProductManager />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="/gift-cards" element={<GiftCards />} />
        <Route path="/flights" element={<Flights />} />
        <Route path="/spin-vault" element={<SpinVault />} />
        <Route path="/betting" element={<Betting />} />
        
            <Route path="/identity-center" element={<IdentityCenter />} />



      {/* Finance Ecosystem
      <Route path="/finance" element={<ProtectedRoute><FinanceHub /></ProtectedRoute>} />
      <Route path="/finance/savings" element={<ProtectedRoute><SavingsVault /></ProtectedRoute>} />
      <Route path="/finance/cards" element={<ProtectedRoute><BlueSeaCards /></ProtectedRoute>} />
      <Route path="/finance/crypto" element={<ProtectedRoute><BspCrypto /></ProtectedRoute>} />
      <Route path="/finance/pension" element={<ProtectedRoute><Pension /></ProtectedRoute>} />
      <Route path="/finance/insurance" element={<ProtectedRoute><Insurance /></ProtectedRoute>} /> */}

      {/* Business Ecosystem
      <Route path="/business" element={<ProtectedRoute><BusinessHub /></ProtectedRoute>} />
      <Route path="/business/payroll" element={<ProtectedRoute><Payroll /></ProtectedRoute>} />
      <Route path="/business/invoices" element={<ProtectedRoute><Invoices /></ProtectedRoute>} />
      <Route path="/business/properties" element={<ProtectedRoute><Properties /></ProtectedRoute>} />
      <Route path="/business/appointments" element={<ProtectedRoute><Appointments /></ProtectedRoute>} />
      <Route path="/business/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} /> */}

      {/* Commerce Ecosystem
      <Route path="/commerce/storefronts" element={<ProtectedRoute><Storefronts /></ProtectedRoute>} />
      <Route path="/commerce/freelance" element={<ProtectedRoute><Freelance /></ProtectedRoute>} />
      <Route path="/commerce/affiliate" element={<ProtectedRoute><Affiliate /></ProtectedRoute>} />
      <Route path="/commerce/contracts" element={<ProtectedRoute><Contracts /></ProtectedRoute>} /> */}

      {/* Experience Ecosystem 
      <Route path="/experience/streams" element={<ProtectedRoute><Streams /></ProtectedRoute>} />
      <Route path="/subscriptions" element={<ProtectedRoute><Subscriptions /></ProtectedRoute>} />

      <Route path="/receipt/:transactionId" element={<ProtectedRoute><Receipt /></ProtectedRoute>} /> */}



        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" />} />
      </Route>
    </Routes>
  );
}

function App() {
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
