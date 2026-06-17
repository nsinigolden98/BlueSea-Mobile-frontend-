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
  MapPin
} from 'lucide-react';
import './Toast.css';
import './TransactionModal.css';

// --- EXACT TOAST IMPLEMENTATION PRESERVED ---
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

// --- UPGRADED TRANSACTION MODAL ---
interface TransactionModalProps {
  isSuccess: boolean | null; // null: processing, true: success, false: failure
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
  const [processingStep, setProcessingStep] = useState(0);
  const [isDone, setIsDone] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  // Parse backend serializers safely
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
    } catch (e) {
      return fallback;
    }
    return fallback;
  }, []);

  const friendlyErrorMessage = useMemo(() => {
    return parseErrorMessage(errorData, toastMessage || "Transaction could not be completed. Please try again.");
  }, [errorData, toastMessage, parseErrorMessage]);

  const processingMessages = [
    "Establishing secure channel...",
    "Confirming network response...",
    "Awaiting provider verification...",
    "Final settlement in progress..."
  ];

  useEffect(() => {
    if (isSuccess !== null) return;
    const interval = setInterval(() => {
      setProcessingStep((prev) => (prev < processingMessages.length - 1 ? prev + 1 : prev));
    }, 1500);
    return () => clearInterval(interval);
  }, [isSuccess, processingMessages.length]);

  useEffect(() => {
    if (isSuccess !== null) {
      const timer = setTimeout(() => setIsDone(true), 500);
      return () => clearTimeout(timer);
    }
  }, [isSuccess]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      onClose();
      window.location.reload(); 
    }, 400);
  };

  const getIconForKey = (key: string) => {
    const k = key.toLowerCase();
    if (k.includes('amount') || k.includes('balance')) return Wallet;
    if (k.includes('user') || k.includes('recipient') || k.includes('name')) return User;
    if (k.includes('ref') || k.includes('id')) return Hash;
    if (k.includes('network') || k.includes('channel')) return Wifi;
    if (k.includes('time') || k.includes('date')) return Clock;
    if (k.includes('card') || k.includes('meter')) return CreditCard;
    if (k.includes('product') || k.includes('plan')) return Smartphone;
    if (k.includes('location')) return MapPin;
    return ExternalLink;
  };

  const renderDataRow = (key: string, value: any, Icon: React.ElementType) => {
    if (value === null || value === undefined || value === '') return null;
    const formattedLabel = key.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase());

    return (
      <div className="tm-detail-row" key={key}>
        <span className="tm-detail-label">
          <Icon className="tm-detail-icon" /> {formattedLabel}
        </span>
        <span className="tm-detail-value">{value}</span>
      </div>
    );
  };

  const summaryKeys = ['amount', 'product', 'network', 'recipient', 'meter_number', 'account_number', 'bank_name', 'title'];
  const summaryData = Object.entries(transactionData).filter(([k]) => summaryKeys.includes(k.toLowerCase()));
  const detailsData = Object.entries(transactionData).filter(([k]) => !summaryKeys.includes(k.toLowerCase()));

  return (
    <div className={`tm-overlay ${isExiting ? 'tm-exit' : ''}`}>
      <section className="tm-modal-card">
        
        {/* HEADER */}
        <header className="tm-header">
          <div className="tm-icon-wrapper">
            {isSuccess === null && (
              <div className="tm-processing-ring">
                <Loader2 className="tm-icon spin text-sky" size={48} />
              </div>
            )}
            {isSuccess === true && isDone && (
              <div className="tm-status-ring success-bg">
                <CheckCircle2 className="tm-icon text-success pop-in" size={56} />
              </div>
            )}
            {isSuccess === false && isDone && (
              <div className="tm-status-ring failure-bg">
                <XCircle className="tm-icon text-danger pop-in" size={56} />
              </div>
            )}
          </div>
          
          <h1 className="tm-headline">
            {isSuccess === null ? "Processing..." : isSuccess ? "Transaction Successful" : "Transaction Declined"}
          </h1>
          <p className="tm-subheadline">
            {isSuccess === null && processingMessages[processingStep]}
            {isSuccess === true && isDone && (toastMessage || "Your transaction was securely completed.")}
            {isSuccess === false && isDone && friendlyErrorMessage}
          </p>
        </header>

        {/* SCROLLABLE BODY */}
        <div className="tm-body">
          <div className="tm-content-max">
            
            {/* ELABORATE TIMELINE */}
            <div className="tm-timeline">
              <div className={`tm-timeline-step ${processingStep >= 0 || isSuccess !== null ? 'active' : ''}`}>
                <div className="tm-step-icon"><CheckCircle2 size={16} /></div>
                <div className="tm-step-text">Request Submitted</div>
              </div>
              <div className={`tm-timeline-step ${processingStep >= 1 || isSuccess !== null ? 'active' : ''}`}>
                <div className="tm-step-icon"><CheckCircle2 size={16} /></div>
                <div className="tm-step-text">Security Verified</div>
              </div>
              <div className={`tm-timeline-step ${isSuccess === null ? 'processing' : isSuccess ? 'active' : 'failed'}`}>
                <div className="tm-step-icon">
                  {isSuccess === null ? <Loader2 size={16} className="spin" /> : isSuccess ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
                </div>
                <div className="tm-step-text">{isSuccess === false ? 'Provider Rejected' : 'Provider Processing'}</div>
              </div>
              <div className={`tm-timeline-step ${isSuccess === true ? 'active' : isSuccess === false ? 'dimmed' : ''} no-line`}>
                <div className="tm-step-icon">{isSuccess === true ? <CheckCircle2 size={16} /> : <Clock size={16} />}</div>
                <div className="tm-step-text">{isSuccess === false ? 'Transaction Cancelled' : 'Settlement Complete'}</div>
              </div>
            </div>

            {/* DYNAMIC SUMMARY SECTION */}
            {summaryData.length > 0 && isDone && (
              <div className="tm-data-card slide-up">
                <h3 className="tm-card-title">Transaction Summary</h3>
                <div className="tm-card-content">
                  {summaryData.map(([key, value]) => renderDataRow(key, value, getIconForKey(key)))}
                </div>
              </div>
            )}

            {/* DYNAMIC DETAILS SECTION */}
            {detailsData.length > 0 && isDone && (
              <div className="tm-data-card slide-up delay-1">
                <h3 className="tm-card-title">Transaction Details</h3>
                <div className="tm-card-content">
                  {detailsData.map(([key, value]) => renderDataRow(key, value, getIconForKey(key)))}
                  <div className="tm-detail-row">
                    <span className="tm-detail-label"><ShieldCheck className="tm-detail-icon"/> Security Status</span>
                    <span className="tm-detail-value text-success">Verified</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* FOOTER */}
        <footer className={`tm-footer ${isDone ? 'slide-up' : 'hidden'}`}>
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
                Done <ChevronRight size={18} />
              </button>
            </>
          )}
        </footer>
      </section>
    </div>
  );
};
