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
  GraduationCap,
  Copy,
  Check,
  AlertTriangle,
  Building2,
  Receipt
} from 'lucide-react';
import './Toast.css';
import './TransactionModal.css';

export function Toast() {
  const [toastData, setToastData] = useState<{ msg: string; visible: boolean }>({ msg: '', visible: false });
  const showToast = useCallback((msg: string, ms = 10000) => {
    setToastData({ msg, visible: true });
    setTimeout(() => setToastData((prev) => ({ ...prev, visible: false })), ms);
  }, []);
  const ToastComponent = () => toastData.visible ? <div className='toast'>{toastData.msg}</div> : null;
  return { showToast, ToastComponent };
}

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
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Deep recursive parser for backend error structures
  const parseBackendError = useCallback((error: any, fallback: string): { message: string; details?: string[] } => {
    if (!error) return { message: fallback };
    if (typeof error === 'string') return { message: error };

    const messages: string[] = [];

    const extractStrings = (obj: any) => {
      if (typeof obj === 'string') {
        messages.push(obj);
      } else if (Array.isArray(obj)) {
        obj.forEach(extractStrings);
      } else if (typeof obj === 'object' && obj !== null) {
        Object.keys(obj).forEach((key) => {
          if (key === 'message' || key === 'detail' || key === 'error' || key === 'non_field_errors') {
            extractStrings(obj[key]);
          } else if (Array.isArray(obj[key])) {
            obj[key].forEach((item: any) => {
              if (typeof item === 'string') messages.push(`${key.replace(/_/g, ' ')}: ${item}`);
              else extractStrings(item);
            });
          } else if (typeof obj[key] === 'string') {
            messages.push(`${key.replace(/_/g, ' ')}: ${obj[key]}`);
          } else {
            extractStrings(obj[key]);
          }
        });
      }
    };

    extractStrings(error);

    if (messages.length > 0) {
      return {
        message: messages[0],
        details: messages.length > 1 ? messages.slice(1) : undefined
      };
    }

    return { message: fallback };
  }, []);

  const parsedError = useMemo(() => {
    return parseBackendError(errorData, toastMessage || "Transaction could not be completed. Please verify details and try again.");
  }, [errorData, toastMessage, parseBackendError]);

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
      }, 450);
      return () => clearInterval(sequence);
    }
  }, [isSuccess]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      onClose();
    }, 350);
  };

  const handleCopy = (text: string, key: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    }
  };

  // --- DYNAMIC DATA RENDERING ENGINE ---
  const formatValue = (key: string, value: any) => {
    const k = key.toLowerCase();
    if (k.includes('amount') || k.includes('price') || k.includes('fee') || k.includes('charge') || k.includes('balance') || k === 'total') {
      const num = Number(value);
      return !isNaN(num) ? `₦${num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : value;
    }
    return String(value);
  };

  const getIconForKey = (key: string) => {
    const k = key.toLowerCase();
    if (k.includes('amount') || k.includes('price') || k.includes('fee') || k.includes('balance') || k === 'total') return Wallet;
    if (k.includes('user') || k.includes('name') || k.includes('recipient') || k.includes('beneficiary')) return User;
    if (k.includes('bank') || k.includes('biller') || k.includes('hospital') || k.includes('institution')) return Building2;
    if (k.includes('phone') || k.includes('number') || k.includes('account') || k.includes('meter')) return Smartphone;
    if (k.includes('network') || k.includes('channel') || k.includes('operator')) return Wifi;
    if (k.includes('ref') || k.includes('id') || k.includes('session') || k.includes('tx')) return Hash;
    if (k.includes('card')) return CreditCard;
    if (k.includes('token') || k.includes('electricity') || k.includes('power')) return Lightbulb;
    if (k.includes('pin') || k.includes('waec') || k.includes('jamb') || k.includes('code')) return GraduationCap;
    if (k.includes('time') || k.includes('date') || k.includes('timestamp')) return Clock;
    if (k.includes('location') || k.includes('address') || k.includes('delivery')) return MapPin;
    if (k.includes('link') || k.includes('url') || k.includes('external')) return ExternalLink;
    return FileText;
  };

  const isCopyable = (key: string) => {
    const k = key.toLowerCase();
    return k.includes('ref') || k.includes('id') || k.includes('token') || k.includes('pin') || k.includes('number') || k.includes('account') || k.includes('meter') || k.includes('code');
  };

  const primaryAmountKeys = ['amount', 'total', 'total_amount', 'price'];
  const deliverableKeys = ['token', 'pin', 'recharge_code', 'voucher', 'code'];

  const amountKey = Object.keys(transactionData).find(k => primaryAmountKeys.includes(k.toLowerCase()));
  const amountValue = amountKey ? formatValue(amountKey, transactionData[amountKey]) : null;

  const deliverableKey = Object.keys(transactionData).find(k => deliverableKeys.includes(k.toLowerCase()));
  const deliverableValue = deliverableKey ? transactionData[deliverableKey] : null;

  const filteredData = Object.entries(transactionData).filter(([k]) => k !== amountKey && k !== deliverableKey);

  const renderDataRow = (key: string, value: any) => {
    if (value === null || value === undefined || value === '') return null;
    const formattedLabel = key.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase());
    const Icon = getIconForKey(key);
    const displayVal = formatValue(key, value);
    const canCopy = isCopyable(key);

    return (
      <div className="tm-receipt-row flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800/60 last:border-0" key={key}>
        <span className="tm-receipt-label flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
          <Icon size={13} className="tm-receipt-icon text-slate-400" /> 
          {formattedLabel}
        </span>
        <div className="flex items-center gap-1.5 font-medium text-xs text-slate-800 dark:text-slate-200">
          <span className="truncate max-w-[180px]">{displayVal}</span>
          {canCopy && (
            <button
              onClick={() => handleCopy(String(value), key)}
              className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
              title="Copy"
            >
              {copiedKey === key ? (
                <Check className="w-3.5 h-3.5 text-emerald-500" />
              ) : (
                <Copy className="w-3.5 h-3.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200" />
              )}
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className={`tm-overlay fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-md transition-opacity duration-300 ${isExiting ? 'tm-exit opacity-0' : 'opacity-100'}`}>
      <div className="tm-modal-card w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* TOP STATUS HEADER */}
        <header className="tm-header p-6 text-center bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800/60 shrink-0">
          <div className="tm-icon-wrapper flex justify-center mb-3">
            {isSuccess === null || !showReceipt ? (
              <div className="tm-processing-ring w-16 h-16 rounded-full bg-slate-50 dark:bg-slate-800/40 flex items-center justify-center text-sky-500">
                <Loader2 className="tm-icon spin w-8 h-8 animate-spin text-sky-500 dark:text-sky-400" size={32} />
              </div>
            ) : isSuccess ? (
              <div className="tm-status-ring success-bg w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-950/20 flex items-center justify-center text-emerald-500">
                <CheckCircle2 className="tm-icon text-emerald-500 dark:text-emerald-400 pop-in w-10 h-10" size={40} />
              </div>
            ) : (
              <div className="tm-status-ring failure-bg w-16 h-16 rounded-full bg-rose-50 dark:bg-rose-950/20 flex items-center justify-center text-rose-500">
                <XCircle className="tm-icon text-rose-500 dark:text-rose-400 pop-in w-10 h-10" size={40} />
              </div>
            )}
          </div>
          <h1 className="tm-headline text-xl font-bold text-slate-800 dark:text-slate-50">
            {!showReceipt ? "Processing Transaction" : isSuccess ? "Transaction Successful" : "Transaction Declined"}
          </h1>
          <p className="tm-subheadline text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs mx-auto">
            {!showReceipt ? "Securing your request..." : isSuccess ? (toastMessage || "Your transaction is complete.") : parsedError.message}
          </p>
        </header>

        {/* SCROLLABLE CONTENT */}
        <div className="tm-body p-6 overflow-y-auto space-y-5 flex-1">
          <div className="tm-content-max space-y-4">
            
            {/* PROGRESSIVE TIMELINE */}
            {(!showReceipt || isSuccess === false) && (
              <div className="tm-timeline bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-4 rounded-2xl space-y-3 slide-up">
                <div className={`tm-step flex items-center gap-3 text-xs ${visualStep >= 0 ? 'active text-slate-800 dark:text-slate-200 font-semibold' : 'text-slate-400 dark:text-slate-500'}`}>
                  <div className="tm-step-dot w-5 h-5 rounded-full border border-slate-200 dark:border-slate-700 flex items-center justify-center text-[10px]">
                    {visualStep > 0 ? '✓' : <div className="dot-spin w-2 h-2 rounded-full bg-sky-500 animate-ping"/>}
                  </div>
                  <div className="tm-step-text">Request Authenticated</div>
                </div>
                <div className={`tm-step flex items-center gap-3 text-xs ${visualStep >= 1 ? 'active text-slate-800 dark:text-slate-200 font-semibold' : 'text-slate-400 dark:text-slate-500'}`}>
                  <div className="tm-step-dot w-5 h-5 rounded-full border border-slate-200 dark:border-slate-700 flex items-center justify-center text-[10px]">
                    {visualStep > 1 ? '✓' : visualStep === 1 ? <div className="dot-spin w-2 h-2 rounded-full bg-sky-500 animate-ping"/> : ''}
                  </div>
                  <div className="tm-step-text">Security Layer Verified</div>
                </div>
                <div className={`tm-step flex items-center gap-3 text-xs ${visualStep >= 2 ? (isSuccess === false && showReceipt ? 'failed text-rose-500 font-semibold' : 'active text-slate-800 dark:text-slate-200 font-semibold') : 'text-slate-400 dark:text-slate-500'}`}>
                  <div className="tm-step-dot w-5 h-5 rounded-full border border-slate-200 dark:border-slate-700 flex items-center justify-center text-[10px]">
                    {visualStep > 2 && isSuccess ? '✓' : visualStep > 2 && isSuccess === false ? '✕' : visualStep === 2 ? <div className="dot-spin w-2 h-2 rounded-full bg-sky-500 animate-ping"/> : ''}
                  </div>
                  <div className="tm-step-text">{isSuccess === false && showReceipt ? 'Provider Rejected' : 'Provider Processing'}</div>
                </div>
                <div className={`tm-step flex items-center gap-3 text-xs ${visualStep >= 3 ? (isSuccess ? 'active text-slate-800 dark:text-slate-200 font-semibold' : 'dimmed opacity-40') : 'text-slate-400 dark:text-slate-500'}`}>
                  <div className="tm-step-dot w-5 h-5 rounded-full border border-slate-200 dark:border-slate-700 flex items-center justify-center text-[10px]">
                    {visualStep >= 3 && isSuccess ? '✓' : ''}
                  </div>
                  <div className="tm-step-text">{isSuccess === false && showReceipt ? 'Transaction Cancelled' : 'Settlement Complete'}</div>
                </div>
              </div>
            )}

            {/* BACKEND ERROR DETAILS UI (If Failure) */}
            {showReceipt && isSuccess === false && (
              <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 space-y-2">
                <div className="flex items-start gap-2.5">
                  <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-rose-700 dark:text-rose-300 uppercase tracking-wider">
                      Failure Reason
                    </h4>
                    <p className="text-xs font-medium text-rose-600 dark:text-rose-400 leading-relaxed">
                      {parsedError.message}
                    </p>
                    {parsedError.details && (
                      <ul className="mt-2 space-y-1 border-t border-rose-200/60 dark:border-rose-900/40 pt-2">
                        {parsedError.details.map((dt, idx) => (
                          <li key={idx} className="text-[11px] text-rose-500 dark:text-rose-400 flex items-center gap-1.5">
                            <span className="w-1 h-1 rounded-full bg-rose-400" />
                            <span>{dt}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* RECEIPT VIEW (Visible on Success) */}
            {showReceipt && isSuccess === true && (
              <div className="tm-receipt slide-up delay-1 space-y-4">
                
                {/* 1. Large Amount Display */}
                {amountValue && (
                  <div className="tm-receipt-header bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 p-4 rounded-2xl text-center">
                    <span className="tm-receipt-badge inline-block text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20 px-2.5 py-0.5 rounded-full">
                      Successful
                    </span>
                    <h2 className="tm-huge-amount text-3xl font-black text-slate-800 dark:text-slate-50 mt-2">
                      {amountValue}
                    </h2>
                    <p className="tm-receipt-subtext text-[10px] text-slate-400 dark:text-slate-500 mt-1">
                      Paid on {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                )}

                {/* 2. Highlighted Actionable Asset (e.g., Electricity Token, Exam PIN, Voucher) */}
                {deliverableValue && (
                  <div className="tm-highlight-box bg-slate-50 dark:bg-slate-800/40 border border-sky-500/30 dark:border-sky-500/40 p-4 rounded-2xl space-y-1.5">
                    <div className="flex justify-between items-center">
                      <span className="tm-highlight-label text-[10px] font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400">
                        {deliverableKey?.replace(/_/g, ' ')}
                      </span>
                      <button
                        onClick={() => handleCopy(String(deliverableValue), deliverableKey || 'deliverable')}
                        className="flex items-center gap-1 text-[10px] font-bold text-sky-600 dark:text-sky-400 hover:underline"
                      >
                        {copiedKey === deliverableKey ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedKey === deliverableKey ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                    <div className="tm-highlight-value text-lg font-mono font-black text-slate-800 dark:text-slate-50 tracking-widest break-all">
                      {deliverableValue}
                    </div>
                    <p className="tm-highlight-hint text-[10px] text-slate-400 dark:text-slate-500">
                      Use this {deliverableKey?.replace(/_/g, ' ')} to complete or redeem your service.
                    </p>
                  </div>
                )}

                {/* 3. Detailed Data Breakdown */}
                {filteredData.length > 0 && (
                  <div className="tm-receipt-details bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden">
                    <div className="tm-section-title px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-800/60">
                      <Receipt className="w-3.5 h-3.5 text-slate-400" />
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                        Transaction Breakdown
                      </span>
                    </div>
                    <div className="tm-receipt-grid px-4 py-2 divide-y divide-slate-100 dark:divide-slate-800/60">
                      {filteredData.map(([key, value]) => renderDataRow(key, value))}
                      <div className="tm-receipt-row flex items-center justify-between py-2">
                        <span className="tm-receipt-label flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500">
                          <ShieldCheck size={13} className="tm-receipt-icon text-emerald-500" /> 
                          Security Status
                        </span>
                        <span className="tm-receipt-value font-semibold text-emerald-600 dark:text-emerald-400 text-xs">
                          Verified & Secured
                        </span>
                      </div>
                    </div>
                  </div>
                )}

              </div>
            )}
          </div>
        </div>

 {/* FOOTER ACTIONS */}
        <footer className={`tm-footer p-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 shrink-0 flex items-center gap-3 ${showReceipt ? 'slide-up delay-2' : 'hidden'}`}>
          {isSuccess === true && (
            <>
              {onViewReceipt && (
                <button 
                  className="tm-btn tm-btn-secondary flex-1 h-12 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center justify-center gap-2" 
                  onClick={onViewReceipt}
                >
                  <FileText size={18} /> Receipt
                </button>
              )}
              <button 
                className="tm-btn tm-btn-primary flex-1 h-12 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs shadow-lg shadow-sky-500/15 transition-all flex items-center justify-center gap-1" 
                onClick={handleClose}
              >
                Done <ChevronRight size={18} />
              </button>
            </>
          )}

          {isSuccess === false && (
            <>
              {onRetry && (
                <button 
                  className="tm-btn tm-btn-secondary flex-1 h-12 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center justify-center gap-2" 
                  onClick={onRetry}
                >
                  <RefreshCw size={18} /> Retry
                </button>
              )}
              <button 
                className="tm-btn tm-btn-primary flex-1 h-12 rounded-xl bg-slate-800 dark:bg-slate-700 hover:bg-slate-900 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1" 
                onClick={handleClose}
              >
                Dismiss <XCircle size={18} />
              </button>
            </>
          )}
        </footer>

      </div>
    </div>
  );
};