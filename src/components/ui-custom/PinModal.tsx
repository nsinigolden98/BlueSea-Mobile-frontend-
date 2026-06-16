import { useState, useCallback, useEffect, useRef } from 'react';
import { ENDPOINTS, postRequest } from '@/types';
import { Loader } from '@/components/ui-custom';
import { cn } from '@/lib/utils';
import { Button } from '../ui/button';

interface PinComponentProps {
  type: string;
  value: object;
  onSuccess?: (response?: any) => void;
  onError?: (error?: any) => void;
  onFailure?: (error?: any) => void;
}

interface Message {
  success?: boolean;
  code?: string;
  response_description?: string;
  error?: string;
  message?: string;
  state?: boolean;
  is_active?: boolean;
}

export function PinModal() {
  const [modalData, setModalData] = useState<{ visible: boolean; type?: string; value?: object }>({
    visible: false,
  });
  const { showLoader, hideLoader, LoaderComponent } = Loader();
  const [message, setMessage] = useState<Message>();

  const showPinModal = useCallback((data?: { type: string; value: object }) => {
    if (data) {
      setModalData({ visible: true, ...data });
    } else {
      setModalData({ visible: true });
    }
  }, []);

  const hidePinModal = useCallback(() => {
    setModalData({ visible: false });
  }, []);

  // 1. ARCHITECTURE REFACTOR: Centralized Transaction Map
  // Replaces the massive if/else chain while preserving exact API integration.
  const executeTransaction = async (type: string, value: any, pin: string) => {
    const payload = { ...value, transaction_pin: pin };

    const TRANSACTION_MAP: Record<string, () => Promise<any>> = {
      'airtime': () => postRequest(ENDPOINTS.buy_airtime, payload),
      'light': () => postRequest(ENDPOINTS.electricity, payload),
      'data-MTN': () => postRequest(ENDPOINTS.buy_mtn, payload),
      'data-Glo': () => postRequest(ENDPOINTS.buy_glo, payload),
      'data-Airtel': () => postRequest(ENDPOINTS.buy_airtel, payload),
      'data-9mobile': () => postRequest(ENDPOINTS.buy_etisalat, payload),
      'marketplace': () => postRequest(ENDPOINTS.marketplace_purchase(value.event_id), {
        ticket_type: value.ticket_type,
        quantity: value.quantity,
        transaction_pin: pin,
      }),
      'dstv': () => postRequest(ENDPOINTS.dstv, payload),
      'gotv': () => postRequest(ENDPOINTS.gotv, payload),
      'startimes': () => postRequest(ENDPOINTS.startimes, payload),
      'showmax': () => postRequest(ENDPOINTS.showmax, payload),
      'waec-registration': () => postRequest(ENDPOINTS.waec_registration, payload),
      'waec-result': () => postRequest(ENDPOINTS.waec_result, payload),
      'jamb': () => postRequest(ENDPOINTS.jamb_registration, payload),
      'auto-topup': () => postRequest(ENDPOINTS.auto_topup_create, payload),
      'auto-topup-reactivate': () => postRequest(ENDPOINTS.auto_topup_reactivate(value.id?.toString()), { transaction_pin: pin }),
      'group-airtime': () => postRequest(ENDPOINTS.create_group, payload),
      'group-data': () => postRequest(ENDPOINTS.create_group, payload),
      'group-gotv': () => postRequest(ENDPOINTS.create_group, payload),
      'group-dstv': () => postRequest(ENDPOINTS.create_group, payload),
      'group-startimes': () => postRequest(ENDPOINTS.create_group, payload),
      'group-showmax': () => postRequest(ENDPOINTS.create_group, payload),
      'group-lightbill': () => postRequest(ENDPOINTS.create_group, payload),
      'add-scanner': () => postRequest(ENDPOINTS.marketplace_add_scanner(value.event_id), { user_email: value.user_email }),
      'withdrawal': () => postRequest(ENDPOINTS.withdrawal, payload),
      'event-withdraw': () => postRequest(ENDPOINTS.event_withdraw, payload),
    };

    const action = TRANSACTION_MAP[type];
    if (!action) throw new Error(`Unsupported transaction type: ${type}`);
    return await action();
  };

  const PinComponent = ({ type, value, onSuccess, onError, onFailure }: PinComponentProps) => {
    // 2. CORE STATE: Single PIN string, max 4 digits.
    const [pin, setPin] = useState<string>('');
    const [visibleDigitIndex, setVisibleDigitIndex] = useState<number | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Memory Protection: Clear PIN and states
    const resetState = useCallback(() => {
      setPin('');
      setVisibleDigitIndex(null);
      setIsProcessing(false);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    }, []);

    const handleCancel = () => {
      resetState();
      hidePinModal();
    };

    // 3. KEYPAD LOGIC: Accept only 0-9 and Backspace.
    const handleKeyPress = useCallback((key: string) => {
      if (isProcessing) return;

      if (key === 'Backspace' || key === '⌫') {
        setPin((prev) => {
          const newPin = prev.slice(0, -1);
          setVisibleDigitIndex(null);
          return newPin;
        });
      } else if (/^[0-9]$/.test(key) && pin.length < 4) {
        setPin((prev) => {
          const newPin = prev + key;
          // Delayed Masking: Show digit for 500ms
          setVisibleDigitIndex(newPin.length - 1);
          if (timeoutRef.current) clearTimeout(timeoutRef.current);
          timeoutRef.current = setTimeout(() => {
            setVisibleDigitIndex((curr) => (curr === newPin.length - 1 ? null : curr));
          }, 500);
          return newPin;
        });
      }
    }, [pin, isProcessing]);

    // 4. HYBRID SUPPORT: Capture physical keyboard inputs.
    useEffect(() => {
      if (!modalData.visible) return;

      const handleGlobalKeyDown = (e: KeyboardEvent) => {
        if (/^[0-9]$/.test(e.key)) {
          handleKeyPress(e.key);
        } else if (e.key === 'Backspace') {
          handleKeyPress('⌫');
        } else if (e.key === 'Escape') {
          handleCancel();
        }
      };

      window.addEventListener('keydown', handleGlobalKeyDown);
      return () => {
        window.removeEventListener('keydown', handleGlobalKeyDown);
      };
    }, [modalData.visible, handleKeyPress]);

    const makeTransaction = async () => {
      if (pin.length !== 4) return;
      
      setIsProcessing(true);
      showLoader();
      
      try {
        const response = await executeTransaction(type, value, pin);
        
        hidePinModal();
        hideLoader();
        setMessage(response);
        resetState(); // Memory Protection

        if (type === 'add-scanner') {
          const isSuccess = !!response && (
            response.success === true || 
            response.state === true || 
            (!response.error && response.code === '00') ||
            (!response.error && response.success !== false && response.state !== false)
          );

          if (isSuccess && onSuccess) onSuccess(response);
          else if (!isSuccess && onError) onError(response);
          else if (!isSuccess && onFailure) onFailure(response);
        }
      } catch (error) {
        hidePinModal();
        hideLoader();
        resetState(); // Memory Protection
        if (type === 'add-scanner') {
          if (onError) onError(error);
          else if (onFailure) onFailure(error);
        }
      }
    };

    if (!modalData.visible) return null;

    // Transaction Data Extraction (Safe fallback if keys aren't uniformly named)
    const displayAmount = (value as any)?.amount ? `₦${(value as any)?.amount.toLocaleString()}` : null;
    const displayProduct = (value as any)?.product_name || type.replace(/-/g, ' ').toUpperCase();

    // Virtual Keypad Layout
    const keypadButtons = [
      '1', '2', '3',
      '4', '5', '6',
      '7', '8', '9',
      '⌫', '0', 'Cancel'
    ];

    return (
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm transition-opacity">
        {/* Modal Container */}
        <div 
          className="bg-white dark:bg-slate-900 w-full max-w-md sm:rounded-3xl rounded-t-3xl p-6 sm:p-8 shadow-2xl animate-in slide-in-from-bottom-8 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-200"
          role="dialog" 
          aria-modal="true"
        >
          {/* Header & Transaction Context */}
          <div className="text-center space-y-1 mb-8">
            <h2 className="text-xl font-bold text-slate-800 dark:text-white">Transaction PIN</h2>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Confirm Purchase</p>
            
            <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500 dark:text-slate-400">Product</span>
                <span className="font-semibold text-slate-800 dark:text-white">{displayProduct}</span>
              </div>
              {displayAmount && (
                <div className="flex justify-between items-center text-sm mt-2">
                  <span className="text-slate-500 dark:text-slate-400">Amount</span>
                  <span className="font-semibold text-slate-800 dark:text-white">{displayAmount}</span>
                </div>
              )}
            </div>
          </div>

          {/* Premium PIN Indicators */}
          <div className="flex gap-4 justify-center mb-8">
            {[0, 1, 2, 3].map((index) => {
              const isFilled = index < pin.length;
              const isVisible = visibleDigitIndex === index;
              
              return (
                <div
                  key={index}
                  className={cn(
                    "w-4 h-4 rounded-full flex items-center justify-center transition-all duration-300",
                    isFilled 
                      ? "bg-sky-500 text-transparent scale-110 shadow-sm shadow-sky-500/30" 
                      : "bg-slate-200 dark:bg-slate-700 text-transparent"
                  )}
                >
                  {/* Text-based dot replacement overlay for the 500ms delayed masking */}
                  {isFilled && isVisible && (
                    <span className="text-lg font-bold text-slate-800 dark:text-white bg-white dark:bg-slate-900 rounded-full w-full h-full flex items-center justify-center absolute shadow-sm">
                      {pin[index]}
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Custom Secure Numeric Keypad */}
          <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-6">
            {keypadButtons.map((btn) => (
              <button
                key={btn}
                type="button"
                disabled={isProcessing}
                onClick={() => {
                  if (btn === 'Cancel') handleCancel();
                  else handleKeyPress(btn);
                }}
                className={cn(
                  "h-14 sm:h-16 flex items-center justify-center text-2xl font-semibold rounded-2xl transition-all duration-200 select-none touch-manipulation",
                  btn === 'Cancel' || btn === '⌫' 
                    ? "text-slate-500 dark:text-slate-400 text-base font-medium hover:bg-slate-100 dark:hover:bg-slate-800" 
                    : "text-slate-800 dark:text-white bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-95 shadow-sm"
                )}
              >
                {btn}
              </button>
            ))}
          </div>

          {/* Action Button */}
          <Button 
            className="w-full h-14 text-lg font-medium rounded-2xl bg-sky-500 hover:bg-sky-600 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            disabled={pin.length !== 4 || isProcessing}
            onClick={makeTransaction}
          >
            {isProcessing ? 'Processing...' : 'Confirm'}
          </Button>

          {/* Security Label */}
          <div className="mt-6 flex items-center justify-center gap-2 text-xs font-medium text-slate-400 dark:text-slate-500">
            <span aria-hidden="true">🔒</span>
            <span>Secured by Transaction PIN Verification</span>
          </div>
        </div>
        <LoaderComponent />
      </div>
    );
  };

  return { showPinModal, hidePinModal, PinComponent, modalData, message };
}
