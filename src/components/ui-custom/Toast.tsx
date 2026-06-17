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
  // Forces a visual step-by-step confirmation of the backend state
  useEffect(() => {
    if (isSuccess === null) {
      // While waiting for backend, cycle through initial steps
      const interval = setInterval(() => setVisualStep((prev) => (prev < 1 ? prev + 1 : prev)), 1200);
      return () => clearInterval(interval);
    } else {
      // Backend responded! Walk the user through the remaining steps smoothly
      let currentStep = visualStep;
      const sequence = setInterval(() => {
        if (currentStep < 3) {
          currentStep++;
          setVisualStep(currentStep);
        } else {
          clearInterval(sequence);
          setShowReceipt(true);
        }
      }, 500); // 500ms delay per step makes it feel real and secure
      return () => clearInterval(sequence);
    }
  }, [isSuccess]); // eslint-disable-line react-hooks/exhaustive-deps

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
      <div className="tm-receipt-row" key={key}>
        <span className="tm-receipt-label"><Icon size={12} className="tm-receipt-icon"/> {formattedLabel}</span>
        <span className="tm-receipt-value">{formatValue(key, value)}</span>
      </div>
    );
  };

  // Extract ultra-priority fields
  const amountKey = Object.keys(transactionData).find(k => k.toLowerCase() === 'amount' || k.toLowerCase() === 'total');
  const amountValue = amountKey ? formatValue(amountKey, transactionData[amountKey]) : null;
  
  const tokenKey = Object.keys(transactionData).find(k => k.toLowerCase() === 'token' || k.toLowerCase() === 'pin');
  const tokenValue = tokenKey ? transactionData[tokenKey] : null;

  // Filter out the extracted priority fields so they don't repeat in the list
  const filteredData = Object.entries(transactionData).filter(([k]) => k !== amountKey && k !== tokenKey);

  // Balanced text statements for runtime transparency
  const processingMessages = [
    "Establishing secure channel...",
    "Confirming network response...",
    "Awaiting provider verification...",
    "Final settlement in progress..."
  ];

  return (
    <div className={`tm-overlay ${isExiting ? 'tm-exit' : ''}`}>
      <div className="tm-modal-card">
        
        {/* TOP STATUS HEADER */}
        <header className="tm-header">
          <div className="tm-icon-wrapper">
            {isSuccess === null || !showReceipt ? (
              <div className="tm-processing-ring"><Loader2 className="tm-icon spin text-sky" size={40} /></div>
            ) : isSuccess ? (
              <div className="tm-status-ring success-bg"><CheckCircle2 className="tm-icon text-success pop-in" size={48} /></div>
            ) : (
              <div className="tm-status-ring failure-bg"><XCircle className="tm-icon text-danger pop-in" size={48} /></div>
            )}
          </div>
          <h1 className="tm-headline">
            {!showReceipt ? "Processing Transaction" : isSuccess ? "Transaction Successful" : "Transaction Declined"}
          </h1>
          <p className="tm-subheadline">
            {!showReceipt ? (processingMessages[visualStep] || "Securing your request...") : isSuccess ? (toastMessage || "Your transaction is complete.") : friendlyErrorMessage}
          </p>
        </header>

        {/* SCROLLABLE CONTENT */}
        <div className="tm-body">
          <div className="tm-content-max">
            
            {/* PROGRESSIVE TIMELINE (Visible during processing or on failure) */}
            {(!showReceipt || isSuccess === false) && (
              <div className="tm-timeline slide-up">
                <div className={`tm-step ${visualStep >= 0 ? 'active' : ''}`}>
                  <div className="tm-step-dot">{visualStep > 0 ? '✓' : <div className="dot-spin"/>}</div>
                  <div className="tm-step-text">Request Authenticated</div>
                </div>
                <div className={`tm-step ${visualStep >= 1 ? 'active' : ''}`}>
                  <div className="tm-step-dot">{visualStep > 1 ? '✓' : visualStep === 1 ? <div className="dot-spin"/> : ''}</div>
                  <div className="tm-step-text">Security Layer Verified</div>
                </div>
                <div className={`tm-step ${visualStep >= 2 ? (isSuccess === false && showReceipt ? 'failed' : 'active') : ''}`}>
                  <div className="tm-step-dot">
                    {visualStep > 2 && isSuccess ? '✓' : visualStep > 2 && isSuccess === false ? '✕' : visualStep === 2 ? <div className="dot-spin"/> : ''}
                  </div>
                  <div className="tm-step-text">{isSuccess === false && showReceipt ? 'Provider Rejected' : 'Provider Processing'}</div>
                </div>
                <div className={`tm-step ${visualStep >= 3 ? (isSuccess ? 'active' : 'dimmed') : ''}`}>
                  <div className="tm-step-dot">
                    {visualStep >= 3 && isSuccess ? '✓' : visualStep >= 3 && isSuccess === false ? '✕' : visualStep === 3 ? <div className="dot-spin"/> : <Clock size={12} className="tm-inline-clock" style={{ display: 'none' }} />}
                  </div>
                  <div className="tm-step-text">{isSuccess === false && showReceipt ? 'Transaction Cancelled' : 'Settlement Complete'}</div>
                </div>
              </div>
            )}

            {/* HIGH-HIERARCHY RECEIPT VIEW (Visible on Success) */}
            {showReceipt && isSuccess === true && (
              <div className="tm-receipt slide-up delay-1">
                
                {/* 1. Large Amount Display */}
                {amountValue && (
                  <div className="tm-receipt-header">
                    <span className="tm-receipt-badge text-success bg-success-light">Successful</span>
                    <h2 className="tm-huge-amount">{amountValue}</h2>
                    <p className="tm-receipt-subtext">Paid on {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                  </div>
                )}

                {/* 2. Emphasized Actionable Data (e.g., Tokens, PINs) */}
                {tokenValue && (
                  <div className="tm-highlight-box">
                    <span className="tm-highlight-label">{tokenKey?.replace(/_/g, ' ').toUpperCase()}</span>
                    <span className="tm-highlight-value">{tokenValue}</span>
                    <span className="tm-highlight-hint">Use this PIN/Token to complete your service.</span>
                  </div>
                )}

                {/* 3. Detailed Data Breakdown */}
                {filteredData.length > 0 && (
                  <div className="tm-receipt-details">
                    <h3 className="tm-section-title">Transaction Details</h3>
                    <div className="tm-receipt-grid">
                      {filteredData.map(([key, value]) => renderDataRow(key, value))}
                      <div className="tm-receipt-row">
                        <span className="tm-receipt-label"><ShieldCheck size={12} className="tm-receipt-icon"/> Security Status</span>
                        <span className="tm-receipt-value text-success">Verified & Secured</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* FOOTER ACTIONS */}
        <footer className={`tm-footer ${showReceipt ? 'slide-up delay-2' : 'hidden'}`}>
          {isSuccess === true && (
            <>
              {onViewReceipt && (
                <button className="tm-btn tm-btn-secondary" onClick={onViewReceipt}>
                  <FileText size={18} /> Receipt
                </button>
              )}
              <button className="tm-btn tm-btn-primary" onClick={handleClose}>
                Done <ChevronRight size={18} />
              </button>
            </>
          )}

          {isSuccess === false && (
            <>
              {onRetry && (
                <button className="tm-btn tm-btn-secondary" onClick={onRetry}>
                  <RefreshCw size={18} /> Retry
                </button>
              )}
              <button className="tm-btn tm-btn-primary" onClick={handleClose}>
                Dismiss <XCircle size={18} />
              </button>
            </>
          )}
        </footer>

      </div>
    </div>
  );
};
