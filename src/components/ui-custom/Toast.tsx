import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Loader2, 
  CircleCheckBig, 
  CircleX, 
  RefreshCw, 
  FileText,
  ShieldCheck,
  Wifi,
  Clock3,
  Hash,
  Wallet,
  User,
  CreditCard,
  Smartphone
} from 'lucide-react';
import './Toast.css'
import './TransactionModal.css';



export function Toast() {
  const [toastData, setToastData] = useState<{ msg: string; visible: boolean }>({
    msg: '',
    visible: false,
  });

  const showToast = useCallback((msg: string, ms = 10000) => {
    setToastData({ msg, visible: true });
    
    setTimeout(() => {
      setToastData((prev) => ({ ...prev, visible: false }));
    }, ms);
  }, []);

  const ToastComponent = () => {
    if (!toastData.visible) return null;
    return (
      <div className='toast'>
        {toastData.msg}
      </div>
    );
  

  };

  return { showToast, ToastComponent };
}

 




interface TransactionModalProps {
  isSuccess: boolean | null; // null: processing, true: success, false: failure
  onClose: () => void;
  toastMessage?: string;
  transactionData?: Record<string, any>; // Dynamic payload from API
  errorData?: any; // Raw serializer error objects
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
  const [processingStep, setProcessingStep] = useState(0);
  const [isDone, setIsDone] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  // --- ERROR PARSING ARCHITECTURE ---
  // Converts messy backend serializer objects into human-readable text
  const parseErrorMessage = useCallback((error: any, fallback: string) => {
    if (!error) return fallback;
    if (typeof error === 'string') return error;
    try {
      const keys = Object.keys(error);
      if (keys.length > 0) {
        const firstError = error[keys[0]];
        // Handle array of errors: {'plan': ['Selected data plan is no longer available.']}
        if (Array.isArray(firstError)) return firstError[0]?.message || firstError[0];
        // Handle string error: {'network': 'Network timeout.'}
        if (typeof firstError === 'string') return firstError;
      }
    } catch (e) {
      return fallback;
    }
    return fallback;
  }, []);

  const friendlyErrorMessage = useMemo(() => {
    return parseErrorMessage(errorData, toastMessage || "Transaction could not be completed. Please try again.");
  }, [errorData, toastMessage, parseErrorMessage]);

  // --- DYNAMIC STATE MESSAGING ---
  const processingMessages = [
    "Establishing secure connection...",
    "Verifying transaction request...",
    "Awaiting provider confirmation...",
    "Finalizing transaction..."
  ];

  useEffect(() => {
    if (isSuccess !== null) return;
    const interval = setInterval(() => {
      setProcessingStep((prev) => (prev < processingMessages.length - 1 ? prev + 1 : prev));
    }, 1800);
    return () => clearInterval(interval);
  }, [isSuccess, processingMessages.length]);

  useEffect(() => {
    if (isSuccess !== null) {
      const timer = setTimeout(() => setIsDone(true), 600);
      return () => clearTimeout(timer);
    }
  }, [isSuccess]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      onClose();
      // Optional: Remove if your app relies on SPA routing rather than hard reloads
      // window.location.reload(); 
    }, 400);
  };

  // --- DYNAMIC METADATA RENDERER ---
  const renderDataRow = (key: string, value: any, Icon: React.ElementType) => {
    if (value === null || value === undefined || value === '') return null;
    
    // Humanize keys (e.g., 'meter_number' -> 'Meter Number')
    const formattedLabel = key
      .replace(/_/g, ' ')
      .replace(/\b\w/g, char => char.toUpperCase());

    return (
      <div className="meta-row" key={key}>
        <div className="meta-label">
          <Icon size={14} className="meta-icon" />
          <span>{formattedLabel}</span>
        </div>
        <div className="meta-value">{value}</div>
      </div>
    );
  };

  const getIconForKey = (key: string) => {
    const k = key.toLowerCase();
    if (k.includes('amount') || k.includes('balance')) return Wallet;
    if (k.includes('user') || k.includes('recipient') || k.includes('name')) return User;
    if (k.includes('ref') || k.includes('id')) return Hash;
    if (k.includes('network') || k.includes('channel')) return Wifi;
    if (k.includes('time') || k.includes('date')) return Clock3;
    if (k.includes('card') || k.includes('meter')) return CreditCard;
    if (k.includes('product') || k.includes('plan')) return Smartphone;
    return FileText;
  };

  // Split data into Summary (Top priority) and Details (Technical)
  const summaryKeys = ['amount', 'product', 'network', 'recipient', 'meter_number', 'account_number', 'bank_name'];
  
  const summaryData = Object.entries(transactionData).filter(([k]) => summaryKeys.includes(k.toLowerCase()));
  const detailsData = Object.entries(transactionData).filter(([k]) => !summaryKeys.includes(k.toLowerCase()));

  return (
    <div 
      className={`bs-overlay ${isExiting ? 'bs-exit' : ''}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <section className="bs-modal-card">
        
        {/* HEADER SECTION */}
        <header className="bs-header" aria-live="assertive">
          <div className="bs-icon-container">
            {isSuccess === null && <Loader2 className="bs-icon processing-spin" size={56} />}
            {isSuccess === true && isDone && <CircleCheckBig className="bs-icon success-pop" size={56} />}
            {isSuccess === false && isDone && <CircleX className="bs-icon failure-pop" size={56} />}
          </div>
          
          <h1 id="modal-title" className="bs-headline">
            {isSuccess === null && "Processing Transaction"}
            {isSuccess === true && isDone && "Transaction Successful"}
            {isSuccess === false && isDone && "Transaction Declined"}
          </h1>
          
          <p className="bs-subheadline">
            {isSuccess === null && processingMessages[processingStep]}
            {isSuccess === true && isDone && (toastMessage || "Your transaction was completed successfully.")}
            {isSuccess === false && isDone && friendlyErrorMessage}
          </p>
        </header>

        {/* SCROLLABLE CONTENT AREA */}
        <div className="bs-content-scroll">
          
          {/* TRANSACTION TIMELINE */}
          <div className="bs-timeline">
            <div className={`timeline-step ${processingStep >= 0 || isSuccess !== null ? 'active' : ''}`}>
              <div className="step-indicator">✓</div>
              <span>Request Submitted</span>
            </div>
            <div className={`timeline-step ${processingStep >= 1 || isSuccess !== null ? 'active' : ''}`}>
              <div className="step-indicator">✓</div>
              <span>Security Verified</span>
            </div>
            <div className={`timeline-step ${isSuccess === null ? 'processing' : isSuccess ? 'active' : 'failed'}`}>
              <div className="step-indicator">
                {isSuccess === null ? <Loader2 size={12} className="spin" /> : isSuccess ? '✓' : '✕'}
              </div>
              <span>{isSuccess === false ? 'Provider Rejected' : 'Provider Processing'}</span>
            </div>
            <div className={`timeline-step ${isSuccess === true ? 'active' : isSuccess === false ? 'dimmed' : ''}`}>
              <div className="step-indicator">{isSuccess === true ? '✓' : '○'}</div>
              <span>{isSuccess === false ? 'Transaction Cancelled' : 'Settlement Complete'}</span>
            </div>
          </div>

          {/* DYNAMIC SUMMARY CARD */}
          {summaryData.length > 0 && isDone && (
            <div className="bs-card summary-card fade-in-up">
              <h3 className="card-title">Transaction Summary</h3>
              <div className="card-body">
                {summaryData.map(([key, value]) => renderDataRow(key, value, getIconForKey(key)))}
              </div>
            </div>
          )}

          {/* DYNAMIC DETAILS CARD */}
          {detailsData.length > 0 && isDone && (
            <div className="bs-card details-card fade-in-up delayed">
              <h3 className="card-title">Transaction Details</h3>
              <div className="card-body">
                {detailsData.map(([key, value]) => renderDataRow(key, value, getIconForKey(key)))}
                <div className="meta-row">
                  <div className="meta-label"><ShieldCheck size={14} className="meta-icon"/> Security Status</div>
                  <div className="meta-value">Verified & Secured</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ACTION BUTTONS */}
        <footer className={`bs-footer ${isDone ? 'fade-in-up' : 'hidden'}`}>
          {isSuccess === true && (
            <>
              {onViewReceipt && (
                <button className="bs-btn bs-btn-secondary" onClick={onViewReceipt}>
                  <FileText size={18} /> View Receipt
                </button>
              )}
              <button className="bs-btn bs-btn-primary" onClick={handleClose} autoFocus>
                Done
              </button>
            </>
          )}

          {isSuccess === false && (
            <>
              {onRetry && (
                <button className="bs-btn bs-btn-secondary" onClick={onRetry}>
                  <RefreshCw size={18} /> Retry
                </button>
              )}
              <button className="bs-btn bs-btn-primary" onClick={handleClose} autoFocus>
                Done
              </button>
            </>
          )}
        </footer>

      </section>
    </div>
  );
};
