import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  ShieldCheck, 
  Lock, 
  CreditCard, 
  MapPin, 
  ChevronRight, 
  CheckCircle2,
  Zap,
  ShieldAlert,
  Clock,
  ShieldHalf,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';

// --- Constants & Mock Data ---
const MOCK_NAMES = [
  "Adewale Richardson", "Chidi Benson", "Sarah Oluchi", 
  "Fatima Yusuf", "David Adeleke", "Grace Effiong"
];

const STORAGE_KEYS = {
  STATUS: 'bluese_kyc_status',
  DATA: 'bluese_kyc_data'
};

// --- TypeScript Definitions ---
type KYCStatus = 'unverified' | 'pending' | 'verified';
type KYCMethod = 'bvn' | 'nin' | 'location';

interface KYCData {
  method: KYCMethod;
  fullName: string;
  idMasked: string;
  timestamp: string;
}

// --- Helper Components ---

const TrustNotice = ({ className }: { className?: string }) => (
  <div className={cn("flex items-center justify-center gap-2 text-slate-400 dark:text-slate-500", className)}>
    <ShieldHalf className="w-3.5 h-3.5" />
    <p className="text-[11px] font-medium tracking-wide uppercase">
      Your data is encrypted • Used only for verification
    </p>
  </div>
);

const BenefitCard = ({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) => (
  <div className="flex gap-4 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm">
    <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center shrink-0">
      {icon}
    </div>
    <div>
      <h4 className="font-bold text-slate-800 dark:text-white text-sm">{title}</h4>
      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{desc}</p>
    </div>
  </div>
);

const MethodCard = ({ 
  icon, 
  title, 
  desc, 
  time, 
  onClick, 
  isSelected 
}: { 
  icon: React.ReactNode, 
  title: string, 
  desc: string, 
  time: string, 
  onClick: () => void,
  isSelected: boolean
}) => (
  <button 
    onClick={onClick}
    className={cn(
      "w-full flex items-center gap-4 p-5 rounded-2xl border transition-all duration-300 text-left group",
      isSelected 
        ? "bg-blue-50 dark:bg-blue-900/20 border-blue-500 shadow-md shadow-blue-500/10" 
        : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
    )}
  >
    <div className={cn(
      "w-12 h-12 rounded-xl flex items-center justify-center transition-colors",
      isSelected ? "bg-blue-500 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
    )}>
      {icon}
    </div>
    <div className="flex-1">
      <div className="flex justify-between items-center">
        <h4 className="font-bold text-sm text-slate-800 dark:text-white">{title}</h4>
        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-tighter">
          {time}
        </span>
      </div>
      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{desc}</p>
    </div>
    <ChevronRight className={cn(
      "w-5 h-5 transition-transform",
      isSelected ? "text-blue-500 translate-x-1" : "text-slate-300"
    )} />
  </button>
);
const IdentityCenter: React.FC = () => {
  const navigate = useNavigate();
  
  // --- State ---
  const [step, setStep] = useState<number>(1);
  const [status, setStatus] = useState<KYCStatus>('unverified');
  const [selectedMethod, setSelectedMethod] = useState<KYCMethod | null>(null);
  const [inputValue, setInputValue] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [kycData, setKycData] = useState<KYCData | null>(null);

  // --- Initial Load (LocalStorage Safety) ---
  useEffect(() => {
    try {
      const savedStatus = localStorage.getItem(STORAGE_KEYS.STATUS) as KYCStatus;
      const savedData = localStorage.getItem(STORAGE_KEYS.DATA);
      
      if (savedStatus) setStatus(savedStatus);
      if (savedData) {
        const parsed = JSON.parse(savedData);
        if (parsed && typeof parsed === 'object') setKycData(parsed);
      }
    } catch (error) {
      console.error("Failed to load KYC state:", error);
      // Fallback to default state on corruption
      setStatus('unverified');
      setKycData(null);
    }
  }, []);

  // --- Progress Logic ---
  // Fix 1: Progress only reflects steps 1-4. Step 5 (Success) is 100% but separate.
  const progress = useMemo(() => {
    if (step >= 4) return 100;
    return ((step - 1) / 3) * 100;
  }, [step]);

  // --- Validation Logic ---
  // Fix 2: Strict 11-digit check for BVN/NIN
  const isInputValid = useMemo(() => {
    if (selectedMethod === 'location') return true;
    if (!selectedMethod) return false;
    return inputValue.length === 11 && /^\d+$/.test(inputValue);
  }, [inputValue, selectedMethod]);

  // --- Handlers ---
  const handleStart = () => setStep(2);

  const handleMethodSelect = (method: KYCMethod) => {
    setSelectedMethod(method);
    setInputValue('');
    setStep(3);
  };

  const simulateVerification = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Fix 4: Data Randomization
    const randomName = MOCK_NAMES[Math.floor(Math.random() * MOCK_NAMES.length)];
    const maskedId = selectedMethod === 'location' 
      ? "Lagos, NG" 
      : `****${inputValue.slice(-4)}`;

    const newData: KYCData = {
      method: selectedMethod!,
      fullName: randomName,
      idMasked: maskedId,
      timestamp: new Date().toISOString()
    };

    setKycData(newData);
    setIsLoading(false);
    setStep(4);
  };

  const finalizeKYC = () => {
    if (!kycData) return;
    try {
      localStorage.setItem(STORAGE_KEYS.STATUS, 'verified');
      localStorage.setItem(STORAGE_KEYS.DATA, JSON.stringify(kycData));
      setStatus('verified');
      setStep(5);
    } catch (e) {
      console.error("Storage failed", e);
    }
  };

  const goBack = () => {
    if (step === 1) navigate(-1);
    else setStep(step - 1);
  };

  // --- Animation Variants ---
  const flowVariants = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 },
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans selection:bg-blue-100 dark:selection:bg-blue-900">
      {/* Header Section */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-2xl mx-auto px-4 h-16 flex items-center justify-between">
          <button 
            onClick={goBack}
            className="p-2 -ml-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="text-center">
            <h1 className="text-sm font-bold text-slate-800 dark:text-white">Identity Center</h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Secure Flow</p>
          </div>
          <div className="w-9" />
        </div>
        
        {/* Progress Bar (Fix 1) */}
        {step < 5 && (
          <div className="h-1 w-full bg-slate-100 dark:bg-slate-800">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              className="h-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]"
              transition={{ type: "spring", bounce: 0, duration: 0.5 }}
            />
          </div>
        )}
      </header>

      <main className="max-w-2xl mx-auto px-6 py-8">
        <AnimatePresence mode="wait">
          
          {/* STEP 1: OVERVIEW */}
          {step === 1 && (
            <motion.div key="step1" {...flowVariants} className="space-y-8">
              <div className="text-center space-y-3">
                <div className={cn(
                  "inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-bold tracking-tight",
                  status === 'verified' ? "bg-emerald-100 text-emerald-600" : "bg-amber-100 text-amber-600"
                )}>
                  {status === 'verified' ? <ShieldCheck className="w-3.5 h-3.5" /> : <ShieldAlert className="w-3.5 h-3.5" />}
                  {status === 'verified' ? "Account Verified" : "Verification Required"}
                </div>
                <h2 className="text-2xl font-extrabold text-slate-800 dark:text-white">Identity Verification</h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm">Unlock higher limits and premium security features.</p>
              </div>

              <div className="space-y-4">
                <BenefitCard icon={<Zap className="text-amber-500" />} title="Expanded Limits" desc="Increase your transaction threshold up to $10,000 daily." />
                <BenefitCard icon={<ShieldCheck className="text-blue-500" />} title="Secure Assets" desc="Add an extra layer of biometric and identity protection." />
                <BenefitCard icon={<Clock className="text-indigo-500" />} title="Instant Withdrawals" desc="Get priority clearance on all cross-border transfers." />
              </div>

              <div className="pt-4 space-y-4">
                {status !== 'verified' ? (
                  <>
                    <button onClick={handleStart} className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold transition-all transform active:scale-[0.98] shadow-lg shadow-blue-500/20">
                      Begin Verification
                    </button>
                    <TrustNotice />
                  </>
                ) : (
                  <div className="p-6 rounded-2xl border border-emerald-100 bg-emerald-50/50 dark:bg-emerald-500/5 text-center">
                    <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
                    <p className="font-bold text-emerald-700 dark:text-emerald-400">Identity Confirmed</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* STEP 2: METHOD SELECTION */}
          {step === 2 && (
            <motion.div key="step2" {...flowVariants} className="space-y-6">
              <div className="space-y-1">
                <h2 className="text-xl font-bold text-slate-800 dark:text-white">Select Method</h2>
                <p className="text-sm text-slate-500">Choose your preferred identification document.</p>
              </div>

              <div className="space-y-4">
                <MethodCard 
                  isSelected={selectedMethod === 'bvn'}
                  onClick={() => handleMethodSelect('bvn')}
                  icon={<Lock className="w-6 h-6" />}
                  title="Bank Verification Number"
                  desc="Instant lookup via secure banking network"
                  time="30s"
                />
                <MethodCard 
                  isSelected={selectedMethod === 'nin'}
                  onClick={() => handleMethodSelect('nin')}
                  icon={<CreditCard className="w-6 h-6" />}
                  title="National Identity Number"
                  desc="Standard government validation"
                  time="45s"
                />
                <MethodCard 
                  isSelected={selectedMethod === 'location'}
                  onClick={() => handleMethodSelect('location')}
                  icon={<MapPin className="w-6 h-6" />}
                  title="Residency Verification"
                  desc="Automated geo-fencing check"
                  time="10s"
                />
              </div>
            </motion.div>
          )}

          {/* STEP 3: INPUT */}
          {step === 3 && (
            <motion.div key="step3" {...flowVariants} className="space-y-6">
              <div className="space-y-1">
                <h2 className="text-xl font-bold text-slate-800 dark:text-white capitalize">
                  {selectedMethod} Verification
                </h2>
                <p className="text-sm text-slate-500">
                  {selectedMethod === 'location' 
                    ? "We'll verify your current location for regional compliance."
                    : `Please provide your 11-digit ${selectedMethod?.toUpperCase()}.`
                  }
                </p>
              </div>

              <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-6">
                {selectedMethod !== 'location' ? (
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Document Number</label>
                    <input 
                      type="text"
                      inputMode="numeric"
                      maxLength={11}
                      placeholder="e.g. 22233344455"
                      className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl p-4 text-xl font-mono focus:ring-2 ring-blue-500 transition-all outline-none"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value.replace(/\D/g, ''))}
                    />
                    <p className="text-[10px] text-slate-400 ml-1">
                      {inputValue.length}/11 digits entered
                    </p>
                  </div>
                ) : (
                  <div className="py-10 text-center">
                    <div className="w-20 h-20 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                      <MapPin className="text-blue-500 w-10 h-10" />
                    </div>
                    <p className="font-bold text-slate-700 dark:text-slate-300">GPS Signal Detected</p>
                    <p className="text-xs text-slate-400">Nigeria • West Africa</p>
                  </div>
                )}

                <div className="space-y-4">
                  <button 
                    disabled={isLoading || !isInputValid}
                    onClick={simulateVerification}
                    className="w-full py-4 bg-slate-900 dark:bg-blue-600 text-white rounded-2xl font-bold transition-all disabled:opacity-30 flex items-center justify-center gap-2"
                  >
                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Continue"}
                  </button>
                  <TrustNotice />
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 4: CONFIRMATION */}
          {step === 4 && (
            <motion.div key="step4" {...flowVariants} className="space-y-6 text-center">
              <div className="space-y-1">
                <h2 className="text-xl font-bold">Review Details</h2>
                <p className="text-sm text-slate-500">Ensure the retrieved info matches your ID.</p>
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm text-left">
                <div className="p-6 space-y-5">
                  <div className="flex justify-between items-center py-1">
                    <span className="text-xs text-slate-400 font-medium">Verified Name</span>
                    <span className="text-sm font-bold text-slate-800 dark:text-white">{kycData?.fullName}</span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-xs text-slate-400 font-medium">Type</span>
                    <span className="text-sm font-bold uppercase text-slate-800 dark:text-white">{kycData?.method}</span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-xs text-slate-400 font-medium">Reference</span>
                    <span className="text-sm font-mono font-bold text-slate-800 dark:text-white">{kycData?.idMasked}</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 space-y-4">
                <button 
                  onClick={finalizeKYC}
                  className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold shadow-lg shadow-blue-500/20 active:scale-[0.98] transition-transform"
                >
                  Confirm & Submit
                </button>
                <TrustNotice />
              </div>
            </motion.div>
          )}

          {/* STEP 5: SUCCESS */}
          {step === 5 && (
            <motion.div 
              key="step5" 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-12 space-y-6"
            >
              <div className="relative inline-block">
                <div className="absolute inset-0 bg-emerald-500 blur-2xl opacity-20 animate-pulse" />
                <div className="relative w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-xl">
                  <CheckCircle2 className="w-12 h-12 text-white" />
                </div>
              </div>

              <div className="space-y-2">
                <h2 className="text-2xl font-extrabold text-slate-800 dark:text-white tracking-tight">Identity Verified</h2>
                <p className="text-sm text-slate-500 leading-relaxed px-8">
                  Your profile is now fully verified. You have unlimited access to BlueSea features.
                </p>
              </div>

              <div className="pt-6">
                <button 
                  onClick={() => navigate(-1)}
                  className="w-full py-4 bg-slate-900 dark:bg-white dark:text-slate-900 text-white rounded-2xl font-bold transition-transform active:scale-[0.98]"
                >
                  Finish
                </button>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </main>
    </div>
  );
};

export default IdentityCenter;
