import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { 
  ArrowLeft, ShieldCheck, Building2, MapPin, CheckCircle2, Clock, 
  AlertTriangle, Info, Edit3, RefreshCw, ShieldAlert
} from 'lucide-react';
import { getRequest, ENDPOINTS } from '@/types';
import { Loader } from '@/components/ui-custom';
import { MobileBottomNavigation } from '@/components/navigation/MobileBottomNavigation';

import type { VerificationStatusType } from '@/types/identity';
import { DEFAULT_TIER_LIMITS } from '@/services/identityVerification';
import { FinancialIdentityModal } from '@/components/identity/FinancialIdentityModal';
import { WhyVerifySheet } from '@/components/identity/WhyVerifySheet';

interface ProfileData {
  other_names?: string;
  surname?: string;
  phone?: string | number;
  preference?: {
    street_address?: string;
    city?: string;
    state?: string;
    country?: string;
  };
}

export function IdentityCenter() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { LoaderComponent, showLoader, hideLoader } = Loader();

  // Profile data fetch
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [, setLoadingProfile] = useState<boolean>(true);

  // Backend-authoritative DVA/BVN status. No localStorage or simulated financial verification state.
  const [addressStatus, setAddressStatus] = useState<VerificationStatusType>('NOT_STARTED');
  const [addressSimulating, setAddressSimulating] = useState<boolean>(false);

  // Modal / Sheet States
  const [activeModal, setActiveModal] = useState<'financial' | null>(null);
  const [whyVerifyTier, setWhyVerifyTier] = useState<1 | 2 | 3 | null>(null);

  // Fetch backend Profile Data (reusing ENDPOINTS.user)
  const fetchProfile = useCallback(async () => {
    setLoadingProfile(true);
    showLoader();
    try {
      const response = await getRequest(ENDPOINTS.user);
      if (response) {
        setProfileData(response);
      }
    } catch (err) {
      console.error('Failed to load profile for Identity Center:', err);
    } finally {
      setLoadingProfile(false);
      hideLoader();
    }
  }, [showLoader, hideLoader]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // Derived user details
  const userFullName = profileData
    ? `${profileData.other_names || ''} ${profileData.surname || ''}`.trim() || 'Valued Member'
    : user?.firstName ? `${user.firstName} ${user?.surname || ''}`.trim() : 'Valued Member';

  const phoneRaw = profileData?.phone ? String(profileData.phone).trim() : '';
  const hasDedicatedAccount = Boolean((profileData as any)?.account_number || (user as any)?.account_number);
  const financialStatus: VerificationStatusType = hasDedicatedAccount ? 'VERIFIED' : 'NOT_STARTED';

  const addressPref = profileData?.preference || {};
  const hasSavedAddress = Boolean(addressPref.street_address || addressPref.city || addressPref.state);

  // Tier calculation (In-memory representation)
  const currentTier = addressStatus === 'VERIFIED' ? 2 : financialStatus === 'VERIFIED' ? 1 : 0;

  // Address simulation trigger
  const handleSimulateAddressVerification = () => {
    setAddressSimulating(true);
    setTimeout(() => {
      setAddressSimulating(false);
      setAddressStatus('VERIFIED');
    }, 2000);
  };

  const renderStatusBadge = (status: VerificationStatusType) => {
    switch (status) {
      case 'VERIFIED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400">
            <CheckCircle2 className="w-3.5 h-3.5" /> Verified
          </span>
        );
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400">
            <Clock className="w-3.5 h-3.5" /> Pending Review
          </span>
        );
      case 'FAILED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-400">
            <AlertTriangle className="w-3.5 h-3.5" /> Verification Failed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
            Not Verified
          </span>
        );
    }
  };

  return (
    <div className="h-screen bg-slate-50 dark:bg-slate-900 flex overflow-hidden font-sans">
      <div className="flex-1 flex flex-col h-full min-w-0 relative">
        
        {/* HEADER */}
        <header className="sticky top-0 z-30 shrink-0 bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
          <div className="max-w-5xl mx-auto flex items-center justify-between px-4 py-3.5">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => navigate(-1)}
                className="p-2 -ml-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors text-slate-700 dark:text-slate-200"
                aria-label="Go back"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">Identity Center</h1>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block">
                  Verify your identity to unlock higher limits and complete account access.
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* MAIN SCROLLABLE CONTENT */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto max-md:[scrollbar-width:none] max-md:[-ms-overflow-style:none] max-md:[&::-webkit-scrollbar]:hidden z-10">
          <div className="max-w-4xl mx-auto space-y-6">
            
            {/* OVERALL STATUS BANNER */}
            <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-sky-950 text-white rounded-3xl p-6 shadow-xl relative overflow-hidden">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-sky-400" />
                    <span className="text-xs font-bold uppercase tracking-wider text-sky-300">Identity Verification Status</span>
                  </div>
                  <h2 className="text-2xl font-extrabold tracking-tight">
                    Verification Progress
                  </h2>
                  <p className="text-xs text-slate-300 max-w-md leading-relaxed">
                    {currentTier === 0 && 'Complete BVN verification to verify your financial identity and request your Dedicated Virtual Account.'}
                    {currentTier === 1 && 'Your BVN verification and Dedicated Virtual Account setup are complete. Residential address verification remains optional for future features.'}
                    {currentTier === 2 && 'Your BVN verification and address verification are complete.'}
                  </p>
                </div>

                {/* Progress bar pill */}
                <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10 shrink-0 space-y-2 min-w-[200px]">
                  <div className="flex justify-between text-xs font-semibold">
                    <span>Progress</span>
                    <span>{Math.round((currentTier / 2) * 100)}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-sky-400 transition-all duration-500 ease-out" 
                      style={{ width: `${(currentTier / 2) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* THREE VERIFICATION TIERS */}
            <section className="space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Verification Tiers</h3>

              {/* TIER 1: FINANCIAL IDENTITY */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-blue-600/10 text-blue-600 dark:text-blue-400 rounded-2xl">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-slate-900 dark:text-white">Tier 1 - Financial Identity</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Verify your BVN and assign your Dedicated Virtual Account.</p>
                    </div>
                  </div>
                  {renderStatusBadge(financialStatus)}
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-100 dark:border-slate-800">
                  <button 
                    onClick={() => setWhyVerifyTier(1)}
                    className="text-xs font-semibold text-sky-500 hover:underline flex items-center gap-1"
                  >
                    <Info className="w-3.5 h-3.5" /> Why verify financial identity?
                  </button>

                  {financialStatus !== 'VERIFIED' && (
                    <button
                      onClick={() => setActiveModal('financial')}
                      className="px-5 h-10 bg-sky-500 hover:bg-sky-600 text-white rounded-xl text-xs font-semibold transition-colors shadow-sm"
                    >
                      Start BVN Verification
                    </button>
                  )}
                </div>
              </div>

              {/* TIER 2: RESIDENTIAL ADDRESS */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-2xl">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-slate-900 dark:text-white">Tier 2 - Residential Address</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Verify home address to unlock maximum limits and premium features.</p>
                    </div>
                  </div>
                  {renderStatusBadge(addressStatus)}
                </div>

                {/* Stored Address Card */}
                <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">Profile Address Record:</span>
                    <span className="text-[11px] font-medium text-slate-500">
                      {hasSavedAddress ? 'Address Saved' : 'No Address Saved'}
                    </span>
                  </div>

                  {hasSavedAddress ? (
                    <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
                      {addressPref.street_address}, {addressPref.city}, {addressPref.state}, {addressPref.country}
                    </p>
                  ) : (
                    <p className="text-xs text-slate-400 italic">No address provided in profile yet.</p>
                  )}
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex gap-3">
                    <button 
                      onClick={() => setWhyVerifyTier(2)}
                      className="text-xs font-semibold text-sky-500 hover:underline flex items-center gap-1"
                    >
                      <Info className="w-3.5 h-3.5" /> Why verify address?
                    </button>
                    <button 
                      onClick={() => navigate('/profile')}
                      className="text-xs font-semibold text-slate-600 dark:text-slate-400 hover:underline flex items-center gap-1"
                    >
                      <Edit3 className="w-3.5 h-3.5" /> Edit in Profile
                    </button>
                  </div>

                  {addressStatus !== 'VERIFIED' && (
                    <button
                      onClick={handleSimulateAddressVerification}
                      disabled={!hasSavedAddress || addressSimulating}
                      className="px-5 h-10 bg-sky-500 hover:bg-sky-600 text-white rounded-xl text-xs font-semibold transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2"
                    >
                      {addressSimulating ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : 'Verify Address'}
                    </button>
                  )}
                </div>
              </div>
            </section>

            {/* TRANSACTION LIMITS COMPARISON TABLE */}
            <section className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Account Transaction Limits</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Your tier level determines transaction capacity and balance caps.</p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400">
                      <th className="py-2.5 px-3 font-semibold">Tier Level</th>
                      <th className="py-2.5 px-3 font-semibold">Max Balance</th>
                      <th className="py-2.5 px-3 font-semibold">Daily Deposit</th>
                      <th className="py-2.5 px-3 font-semibold">Daily Withdrawal</th>
                      <th className="py-2.5 px-3 font-semibold">Transfer Limit</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                    {DEFAULT_TIER_LIMITS.map((row, idx) => (
                      <tr key={idx} className={currentTier === idx + 1 ? 'bg-sky-50/50 dark:bg-sky-950/20 font-semibold' : ''}>
                        <td className="py-3 px-3">{row.tier}</td>
                        <td className="py-3 px-3">{row.maxWalletBalance}</td>
                        <td className="py-3 px-3">{row.dailyDeposit}</td>
                        <td className="py-3 px-3">{row.dailyWithdrawal}</td>
                        <td className="py-3 px-3">{row.dailyTransfer}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* VERIFICATION HISTORY */}
            <section className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Verification Activity History</h3>

              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                <div className="py-3 flex items-center justify-between text-xs">
                  <div>
                    <p className="font-semibold text-slate-800 dark:text-slate-200">Financial Identity</p>
                    <p className="text-slate-400 text-[11px]">{financialStatus === 'VERIFIED' ? 'Verified by backend' : 'Not initiated'}</p>
                  </div>
                  {renderStatusBadge(financialStatus)}
                </div>

                <div className="py-3 flex items-center justify-between text-xs">
                  <div>
                    <p className="font-semibold text-slate-800 dark:text-slate-200">Residential Address</p>
                    <p className="text-slate-400 text-[11px]">{addressStatus === 'VERIFIED' ? 'Completed in this session' : 'Not initiated'}</p>
                  </div>
                  {renderStatusBadge(addressStatus)}
                </div>
              </div>
            </section>

            {/* PRIVACY & SECURITY SECTION */}
            <section className="bg-slate-100 dark:bg-slate-950 rounded-3xl p-5 border border-slate-200/60 dark:border-slate-800 text-xs space-y-2 text-slate-600 dark:text-slate-400">
              <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-200">
                <ShieldAlert className="w-4 h-4 text-sky-500" />
                <span>Your Information & Privacy Security</span>
              </div>
              <p className="leading-relaxed">
                BlueSea Mobile uses secure provider validation for identity checks. We never share your verification details with unauthorized third parties or request your transaction PIN during identity verification.
              </p>
            </section>

          </div>
        </main>

        {/* MOBILE BOTTOM NAV */}
        <div className="sticky bottom-0 z-30 shrink-0 md:hidden bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
          <MobileBottomNavigation />
        </div>
      </div>

      {/* MODALS & SHEETS */}
      <FinancialIdentityModal
        isOpen={activeModal === 'financial'}
        onClose={() => setActiveModal(null)}
        userFullName={userFullName}
        firstName={profileData?.other_names || user?.firstName || ''}
        lastName={profileData?.surname || user?.surname || ''}
        profilePhone={phoneRaw}
        onSubmitted={fetchProfile}
      />

      <WhyVerifySheet
        isOpen={whyVerifyTier !== null}
        onClose={() => setWhyVerifyTier(null)}
        tierTitle={whyVerifyTier === 1 ? 'Tier 1 - Financial Identity' : whyVerifyTier === 2 ? 'Tier 2 - Residential Address' : 'Tier 3'}
        explanation={
          whyVerifyTier === 1
            ? 'BVN verification confirms your financial identity and is the verification required for Dedicated Virtual Account setup.'
            : whyVerifyTier === 2
            ? 'Residential address verification is retained as a future compliance step and does not block Dedicated Virtual Account setup.'
            : 'This verification tier is reserved for future backend-supported compliance features.'
        }
        unlockedFeatures={
          whyVerifyTier === 1
            ? ['Dedicated Virtual Account eligibility', 'Backend BVN verification', 'Financial identity confirmation']
            : whyVerifyTier === 2
            ? ['Future address-based compliance features']
            : ['Future backend-supported features']
        }
      />

      <LoaderComponent />
    </div>
  );
}

export default IdentityCenter;