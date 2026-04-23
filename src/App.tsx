import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import { ThemeProvider } from '@/context/ThemeContext';
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
  // 🚨 FIXED: Capitalized to match component usage and added BlueSphere
  Cart, 
  TransactionFilterPage
} from '@/pages';
import './App.css';
import { useAuth } from '@/context/AuthContext';
import { AuthLoader } from '@/components/ui-custom';

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

      {/* 🛒 Cart Route - Fixed component name */}
      <Route 
        path="/cart" 
        element={
          <ProtectedRoute>
            <Cart />
          </ProtectedRoute>
        } 
      />

 

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
