import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Loader2, 
  CheckCircle2, 
  XCircle, 
  RefreshCw, 
  FileText,
  ShieldCheck,
  Wifi,
  Clock,
  Hash,
  Wallet,
  User,
  CreditCard,
  Smartphone,
  ChevronRight,
  ExternalLink,
  MapPin,
  Lightbulb,
  GraduationCap
} from 'lucide-react';
import './Toast.css';
import './TransactionModal.css';

// --- TOAST IMPLEMENTATION (Preserved Exactly As Requested) ---
export function Toast() {
  const [toastData, setToastData] = useState<{ msg: string; visible: boolean }>({ msg: '', visible: false });
  const showToast = useCallback((msg: string, ms = 10000) => {
    setToastData({ msg, visible: true });
    setTimeout(() => setToastData((prev) => ({ ...prev, visible: false })), ms);
  }, []);
  const ToastComponent = () => toastData.visible ? <div className='toast'>{toastData.msg}</div> : null;
  return { showToast, ToastComponent };
}

// --- UPGRADED TRANSACTION MODAL (Fully Aligned with PinModal Style Naming) ---
interface TransactionModalProps {
  isSuccess: boolean | null; 
  onClose: () => void;
  toastMessage?: string;
  transactionData?: Record<string, any>; 
  errorData?: any; 
  onRetry?: () => void;
  onViewReceipt?: () => void;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({ 
  isSuccess, 
  onClose, 
  toastMessage,
  transactionData = {},
  errorData = null,
  onRetry,
  onViewReceipt
}) => {
  // UI State mapping
  const [visualStep, setVisualStep] = useState(0);
  const [showReceipt, setShowReceipt] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  // Parse Backend Error Objects
  const parseErrorMessage = useCallback((error: any, fallback: string) => {
    if (!error) return fallback;
    if (typeof error === 'string') return error;
    try {
      const keys = Object.keys(error);
      if (keys.length > 0) {
        const firstError = error[keys[0]];
        if (Array.isArray(firstError)) return firstError[0]?.message || firstError[0];
        if (typeof firstError === 'string') return firstError;
      }
    } catch (e) { return fallback; }
    return fallback;
  }, []);

  const friendlyErrorMessage = useMemo(() => {
    return parseErrorMessage(errorData, toastMessage || "Transaction could not be completed. Please try again.");
  }, [errorData, toastMessage, parseErrorMessage]);

  // --- THE SEQUENCE ENGINE ---
  useEffect(() => {
    if (isSuccess === null) {
      const interval = setInterval(() => setVisualStep((prev) => (prev < 1 ? prev + 1 : prev)), 1200);
      return () => clearInterval(interval);
    } else {
      let currentStep = visualStep;
      const sequence = setInterval(() => {
        if (currentStep < 3) {
          currentStep++;
          setVisualStep(currentStep);
        } else {
          clearInterval(sequence);
          setShowReceipt(true);
        }
      }, 500); 
      return () => clearInterval(sequence);
    }
  }, [isSuccess]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      onClose();
      window.location.reload(); 
    }, 400);
  };

  // --- DYNAMIC DATA RENDERING ENGINE ---
  const formatValue = (key: string, value: any) => {
    if (key.toLowerCase().includes('amount') || key.toLowerCase() === 'price') {
      const num = Number(value);
      return !isNaN(num) ? `₦${num.toLocaleString(undefined, { minimumFractionDigits: 2 })}` : value;
    }
    return value;
  };

  const getIconForKey = (key: string) => {
    const k = key.toLowerCase();
    if (k.includes('amount') || k.includes('price')) return Wallet;
    if (k.includes('user') || k.includes('name') || k.includes('recipient')) return User;
    if (k.includes('phone') || k.includes('number')) return Smartphone;
    if (k.includes('network') || k.includes('channel')) return Wifi;
    if (k.includes('ref') || k.includes('id') || k.includes('session')) return Hash;
    if (k.includes('card') || k.includes('meter')) return CreditCard;
    if (k.includes('token') || k.includes('electricity') || k.includes('power')) return Lightbulb;
    if (k.includes('pin') || k.includes('waec') || k.includes('jamb')) return GraduationCap;
    if (k.includes('time') || k.includes('date') || k.includes('timestamp')) return Clock;
    if (k.includes('location') || k.includes('address') || k.includes('delivery')) return MapPin;
    if (k.includes('link') || k.includes('url') || k.includes('external')) return ExternalLink;
    return FileText;
  };

  const renderDataRow = (key: string, value: any) => {
    if (value === null || value === undefined || value === '') return null;
    const formattedLabel = key.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase());
    const Icon = getIconForKey(key);

    return (
      <div className="flex justify-between items-center text-xs uppercase tracking-wider font-bold text-slate-400 dark:text-slate-500 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/60 first:mt-0 first:pt-0 first:border-none" key={key}>
        <span className="flex items-center gap-2"><Icon size={12} className="opacity-70" /> {formattedLabel}</span>
        <span className="font-extrabold text-sm normal-case text-slate-800 dark:text-slate-200">{formatValue(key, value)}</span>
      </div>
    );
  };

  const amountKey = Object.keys(transactionData).find(k => k.toLowerCase() === 'amount' || k.toLowerCase() === 'total');
  const amountValue = amountKey ? formatValue(amountKey, transactionData[amountKey]) : null;
  
  const tokenKey = Object.keys(transactionData).find(k => k.toLowerCase() === 'token' || k.toLowerCase() === 'pin');
  const tokenValue = tokenKey ? transactionData[tokenKey] : null;

  const filteredData = Object.entries(transactionData).filter(([k]) => k !== amountKey && k !== tokenKey);

  return (
    <div className={`fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-md transition-opacity duration-300 ${isExiting ? 'opacity-0' : ''}`}>
      {/* Modal Container - Shared perfectly with PinModal Architecture */}
      <div 
        className="bg-white dark:bg-slate-900 w-full max-w-md sm:rounded-3xl rounded-t-3xl p-6 sm:p-8 shadow-2xl border-t sm:border border-slate-100 dark:border-slate-800 animate-in slide-in-from-bottom-8 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-200 flex flex-col max-h-[90vh] overflow-hidden"
        role="dialog" 
        aria-modal="true"
      >
        
        {/* TOP STATUS HEADER */}
        <div className="text-center space-y-1 mb-6 flex-shrink-0">
          <div className="flex justify-center mb-4">
            {isSuccess === null || !showReceipt ? (
              <div className="w-16 h-16 rounded-full bg-sky-50 dark:bg-sky-500/10 flex items-center justify-center">
                <Loader2 className="animate-spin text-sky-500 dark:text-sky-400" size={36} />
              </div>
            ) : isSuccess ? (
              <div className="w-16 h-16 rounded-full bg-green-50 dark:bg-green-500/10 flex items-center justify-center">
                <CheckCircle2 className="text-green-500 dark:text-green-400 animate-in zoom-in-50 duration-300" size={40} />
              </div>
            ) : (
              <div className="w-16 h-16 rounded-full bg-red-50 dark:bg-red-500/10 flex items-center justify-center">
                <XCircle className="text-red-500 dark:text-red-400 animate-in zoom-in-50 duration-300" size={40} />
              </div>
            )}
          </div>
          <h2 className="text-xl font-extrabold text-slate-800 dark:text-slate-50 tracking-tight">
            {!showReceipt ? "Processing Transaction" : isSuccess ? "Transaction Successful" : "Transaction Declined"}
          </h2>
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
            {!showReceipt ? "Securing your request..." : isSuccess ? (toastMessage || "Your transaction is complete.") : friendlyErrorMessage}
          </p>
        </div>

        {/* SCROLLABLE INTERIOR CONTENT */}
        <div className="overflow-y-auto pr-1 flex-1 space-y-5 mb-6 touch-manipulation">
          
          {/* PROGRESSIVE TIMELINE */}
          {(!showReceipt || isSuccess === false) && (
            <div className="p-5 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-800/80 space-y-4 animate-in fade-in duration-300">
              <div className={`flex items-center gap-3 text-sm font-semibold transition-colors duration-200 ${visualStep >= 0 ? 'text-slate-800 dark:text-slate-200' : 'text-slate-400'}`}>
                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${visualStep > 0 ? 'bg-sky-500 text-white' : 'bg-slate-200 dark:bg-slate-700 text-transparent'}`}>{visualStep > 0 ? '✓' : ''}</div>
                <span>Request Authenticated</span>
              </div>
              <div className={`flex items-center gap-3 text-sm font-semibold transition-colors duration-200 ${visualStep >= 1 ? 'text-slate-800 dark:text-slate-200' : 'text-slate-400'}`}>
                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${visualStep > 1 ? 'bg-sky-500 text-white' : 'bg-slate-200 dark:bg-slate-700 text-transparent'}`}>{visualStep > 1 ? '✓' : ''}</div>
                <span>Security Layer Verified</span>
              </div>
              <div className={`flex items-center gap-3 text-sm font-semibold transition-colors duration-200 ${visualStep >= 2 ? (isSuccess === false && showReceipt ? 'text-red-500' : 'text-slate-800 dark:text-slate-200') : 'text-slate-400'}`}>
                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${visualStep > 2 && isSuccess ? 'bg-sky-500 text-white' : visualStep > 2 && isSuccess === false ? 'bg-red-500 text-white' : 'bg-slate-200 dark:bg-slate-700 text-transparent'}`}>
                  {visualStep > 2 && isSuccess ? '✓' : visualStep > 2 && isSuccess === false ? '✕' : ''}
                </div>
                <span>{isSuccess === false && showReceipt ? 'Provider Rejected' : 'Provider Processing'}</span>
              </div>
              <div className={`flex items-center gap-3 text-sm font-semibold transition-colors duration-200 ${visualStep >= 3 ? (isSuccess ? 'text-slate-800 dark:text-slate-200' : 'text-slate-400/50') : 'text-slate-400'}`}>
                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${visualStep >= 3 && isSuccess ? 'bg-sky-500 text-white' : 'bg-slate-200 dark:bg-slate-700 text-transparent'}`}>{visualStep >= 3 && isSuccess ? '✓' : ''}</div>
                <span>{isSuccess === false && showReceipt ? 'Transaction Cancelled' : 'Settlement Complete'}</span>
              </div>
            </div>
          )}

          {/* DYNAMIC RECEIPT CONTENT OVERLAY */}
          {showReceipt && isSuccess === true && (
            <div className="space-y-4 animate-in slide-in-from-top-4 duration-300">
              
              {/* Massive Amount Display Container */}
              {amountValue && (
                <div className="text-center py-5 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-800/80">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400 mb-2">
                    Successful
                  </span>
                  <h3 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">{amountValue}</h3>
                  <p className="text-xs font-medium text-slate-400 dark:text-slate-500 mt-1">
                    Paid on {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
              )}

              {/* Monospace Pin/Token Emphasized Box */}
              {tokenValue && (
                <div className="p-4 bg-gradient-to-br from-white to-sky-50 dark:from-slate-900 dark:to-sky-950/10 rounded-2xl border border-sky-400 text-center space-y-1 shadow-sm">
                  <span className="text-[10px] uppercase tracking-widest font-black text-sky-600 dark:text-sky-400">{tokenKey?.replace(/_/g, ' ')}</span>
                  <div className="text-2xl font-black text-slate-800 dark:text-white tracking-widest font-mono py-1">{tokenValue}</div>
                  <p className="text-[11px] font-medium text-slate-400 dark:text-slate-500">Use this parameter to deploy or finalize your service.</p>
                </div>
              )}

              {/* Detailed Context Parameters Breakdown */}
              {filteredData.length > 0 && (
                <div className="p-5 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-800/80">
                  <h4 className="text-[10px] uppercase tracking-widest font-black text-slate-400 dark:text-slate-500 mb-3 pb-2 border-b border-slate-200/50 dark:border-slate-800/60">
                    Transaction Breakdown
                  </h4>
                  <div className="space-y-0">
                    {filteredData.map(([key, value]) => renderDataRow(key, value))}
                    <div className="flex justify-between items-center text-xs uppercase tracking-wider font-bold text-slate-400 dark:text-slate-500 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/60">
                      <span className="flex items-center gap-2"><ShieldCheck size={12} className="opacity-70" /> Security Status</span>
                      <span className="font-extrabold text-sm normal-case text-green-500 dark:text-green-400">Verified</span>
                    </div>
                  </div>
                </div>
              )}

            </div>
          )}
        </div>

        {/* DYNAMIC ACTION FOOTER BUTTONS */}
        <div className={`mt-auto pt-4 border-t border-slate-100 dark:border-slate-800 flex gap-3 flex-shrink-0 ${showReceipt ? '' : 'hidden'}`}>
          {isSuccess === true && (
            <>
              {onViewReceipt && (
                <button 
                  onClick={onViewReceipt}
                  className="flex-1 h-12 inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                >
                  <FileText size={16} /> Receipt
                </button>
              )}
              <button 
                onClick={handleClose}
                className="flex-1 h-12 inline-flex items-center justify-center gap-2 rounded-2xl bg-sky-500 hover:bg-sky-600 text-sm font-bold text-white transition-all shadow-md shadow-sky-500/10"
              >
                Done <ChevronRight size={16} />
              </button>
            </>
          )}

          {isSuccess === false && (
            <>
              {onRetry && (
                <button 
                  onClick={onRetry}
                  className="flex-1 h-12 inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                >
                  <RefreshCw size={14} /> Retry
                </button>
              )}
              <button 
                onClick={handleClose}
                className="flex-1 h-12 inline-flex items-center justify-center gap-2 rounded-2xl bg-sky-500 hover:bg-sky-600 text-sm font-bold text-white transition-all shadow-md shadow-sky-500/10"
              >
                Dismiss <XCircle size={16} />
              </button>
            </>
          )}
        </div>

      </div>
    </div>
  );
};
