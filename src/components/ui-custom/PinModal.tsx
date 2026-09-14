import { useState, useCallback, useEffect, useRef } from 'react';
import { ENDPOINTS, postRequest } from '@/types';
import { Loader } from '@/components/ui-custom';
import { cn } from '@/lib/utils';
import { Button } from '../ui/button';
import { Capacitor } from '@capacitor/core';
import { makeTransactionPin } from '@/lib/security/pinEncryption';

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

const performBiometricPrompt = async (reason: string): Promise<boolean> => {
  if (!Capacitor.isNativePlatform()) return false;
  try {
    const plugins = (window as any).Capacitor?.Plugins;
    if (plugins?.NativeBiometrics) {
      await plugins.NativeBiometrics.verifyIdentity({
        reason,
        title: 'Biometric Authentication',
        subtitle: reason,
        description: 'Please authenticate to continue',
      });
      return true;
    }
    if (plugins?.Biometrics) {
      await plugins.Biometrics.verify({
        reason,
        title: 'Biometric Authentication',
      });
      return true;
    }
    if (plugins?.BiometricAuth) {
      await plugins.BiometricAuth.authenticate({ reason });
      return true;
    }
    return true;
  } catch (e) {
    console.error('Biometric payment prompt error:', e);
    return false;
  }
};

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

  // Centralized Transaction & Verification Action Handler
  const executeTransaction = async (type: string, value: any, rawPin: string) => {
    if (!/^\d{4}$/.test(rawPin)) {
      throw new Error('PIN must be exactly 4 digits');
    }

    const encryptedPin = makeTransactionPin(rawPin);
    const payload = { ...value, transaction_pin: encryptedPin };

    const TRANSACTION_MAP: Record<string, () => Promise<any>> = {
      'verify-pin': async () => {
        const endpoint = (ENDPOINTS as any).pin_verify || (ENDPOINTS as any).verify_pin || '/accounts/pin/verify/';
        return await postRequest(endpoint, { pin: encryptedPin });
      },
      'airtime': () => postRequest(ENDPOINTS.buy_airtime, payload),
      'light': () => postRequest(ENDPOINTS.electricity, payload),
      'data-MTN': () => postRequest(ENDPOINTS.buy_mtn, payload),
      'data-Glo': () => postRequest(ENDPOINTS.buy_glo, payload),
      'data-Airtel': () => postRequest(ENDPOINTS.buy_airtel, payload),
      'data-9mobile': () => postRequest(ENDPOINTS.buy_etisalat, payload),
      'marketplace': () => postRequest(ENDPOINTS.marketplace_purchase(value.event_id), {
        ticket_type: value.ticket_type,
        quantity: value.quantity,
        transaction_pin: encryptedPin,
      }),
      'dstv': () => postRequest(ENDPOINTS.dstv, payload),
      'gotv': () => postRequest(ENDPOINTS.gotv, payload),
      'startimes': () => postRequest(ENDPOINTS.startimes, payload),
      'showmax': () => postRequest(ENDPOINTS.showmax, payload),
      'waec-registration': () => postRequest(ENDPOINTS.waec_registration, payload),
      'waec-result': () => postRequest(ENDPOINTS.waec_result, payload),
      'jamb': () => postRequest(ENDPOINTS.jamb_registration, payload),
      'auto-topup': () => postRequest(ENDPOINTS.auto_topup_create, payload),
      'auto-topup-reactivate': () => postRequest(ENDPOINTS.auto_topup_reactivate(value.id?.toString()), { transaction_pin: encryptedPin }),
      'group-airtime': () => postRequest(ENDPOINTS.create_group, payload),
      'group-data': () => postRequest(ENDPOINTS.create_group, payload),
      'group-gotv': () => postRequest(ENDPOINTS.create_group, payload),
      'group-dstv': () => postRequest(ENDPOINTS.create_group, payload),
      'group-startimes': () => postRequest(ENDPOINTS.create_group, payload),
      'group-showmax': () => postRequest(ENDPOINTS.create_group, payload),
      'group-lightbill': () => postRequest(ENDPOINTS.create_group, payload),
      'add-scanner': () => postRequest(ENDPOINTS.marketplace_add_scanner(value.event_id), { user_email: value.user_email }),
      'withdrawal': () => postRequest(ENDPOINTS.withdrawal, payload),
      'internal_transfer': () => postRequest(ENDPOINTS.internal_transfer, payload),
      'event-withdraw': () => postRequest(ENDPOINTS.event_withdraw, payload),
    };

    const action = TRANSACTION_MAP[type];
    if (!action) throw new Error(`Unsupported transaction type: ${type}`);
    return await action();
  };

  const PinComponent = ({ type, value, onSuccess, onError, onFailure }: PinComponentProps) => {
    const [pin, setPin] = useState<string>('');
    const [visibleDigitIndex, setVisibleDigitIndex] = useState<number | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const biometricAttemptedRef = useRef(false);

    const resetState = useCallback(() => {
      setPin('');
      setVisibleDigitIndex(null);
      setIsProcessing(false);
      biometricAttemptedRef.current = false;
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    }, []);

    const handleCancel = () => {
      resetState();
      hidePinModal();
    };

    // Attempt Biometric authentication for Payments prior to PIN fallback
    useEffect(() => {
      if (!modalData.visible) {
        biometricAttemptedRef.current = false;
        return;
      }

      const isBiometricPaymentEnabled =
        Capacitor.isNativePlatform() &&
        type !== 'verify-pin' &&
        localStorage.getItem('biometricEnabled') === 'true' &&
        localStorage.getItem('biometricPaymentEnabled') === 'true';

      if (isBiometricPaymentEnabled && !biometricAttemptedRef.current) {
        biometricAttemptedRef.current = true;

        const handleBiometricPayment = async () => {
          setIsProcessing(true);
          showLoader();

          await performBiometricPrompt('Authenticate transaction payment');
          hideLoader();
          setIsProcessing(false);
        };

        handleBiometricPayment();
      }
    }, [modalData.visible, type, value, onSuccess, onError, onFailure]);

    // Keypad Logic: Accepts 0-9 and Backspace
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
          // Show typed digit for 500ms before masking
          setVisibleDigitIndex(newPin.length - 1);
          if (timeoutRef.current) clearTimeout(timeoutRef.current);
          timeoutRef.current = setTimeout(() => {
            setVisibleDigitIndex((curr) => (curr === newPin.length - 1 ? null : curr));
          }, 500);
          return newPin;
        });
      }
    }, [pin, isProcessing]);

    // Keyboard support for physical keyboards
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
      if (pin.length !== 4 || isProcessing) return;
      
      setIsProcessing(true);
      showLoader();
      
      try {
        const response = await executeTransaction(type, value, pin);
        
        hidePinModal();
        hideLoader();
        setMessage(response);
        resetState();

        const isSuccess = !!response && (
          response.success === true || 
          response.state === true || 
          (!response.error && response.code === '00') ||
          (!response.error && response.success !== false && response.state !== false)
        );

        if (isSuccess && onSuccess) {
          onSuccess(response);
        } else if (!isSuccess && onError) {
          onError(response);
        } else if (!isSuccess && onFailure) {
          onFailure(response);
        }
      } catch (error) {
        hidePinModal();
        hideLoader();
        resetState();
        if (onError) onError(error);
        else if (onFailure) onFailure(error);
      }
    };

    if (!modalData.visible) return null;

    const displayAmount = (value as any)?.amount ? `₦${(value as any)?.amount.toLocaleString()}` : null;
    const displayProduct = (value as any)?.product_name || type.replace(/-/g, ' ').toUpperCase();
    const displayTitle = (value as any)?.title || 'Confirm Purchase';

    const keypadButtons = [
      '1', '2', '3',
      '4', '5', '6',
      '7', '8', '9',
      '⌫', '0', 'Cancel'
    ];

    return (
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm transition-opacity">
        <div 
          className="bg-white dark:bg-slate-900 w-full max-w-md sm:rounded-3xl rounded-t-3xl p-6 sm:p-8 shadow-2xl animate-in slide-in-from-bottom-8 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-200"
          role="dialog" 
          aria-modal="true"
        >
          {/* Header & Context */}
          <div className="text-center space-y-1 mb-6">
            <h2 className="text-xl font-bold text-slate-800 dark:text-white">Transaction PIN</h2>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{displayTitle}</p>
            
            <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500 dark:text-slate-400">Action</span>
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

          {/* PIN Indicators */}
          <div className="flex gap-4 justify-center mb-8">
            {[0, 1, 2, 3].map((index) => {
              const isFilled = index < pin.length;
              const isVisible = visibleDigitIndex === index;
              
              return (
                <div
                  key={index}
                  className={cn(
                    "w-4 h-4 rounded-full flex items-center justify-center transition-all duration-300 relative",
                    isFilled 
                      ? "bg-sky-500 text-transparent scale-110 shadow-sm shadow-sky-500/30" 
                      : "bg-slate-200 dark:bg-slate-700 text-transparent"
                  )}
                >
                  {isFilled && isVisible && (
                    <span className="text-lg font-bold text-slate-800 dark:text-white bg-white dark:bg-slate-900 rounded-full w-full h-full flex items-center justify-center absolute shadow-sm">
                      {pin[index]}
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Secure Custom Keypad */}
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
            {isProcessing ? 'Verifying...' : 'Confirm'}
          </Button>

          {/* Security Footer */}
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