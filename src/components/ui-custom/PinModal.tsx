import { useState, useCallback, useEffect, useRef } from 'react';
import { ENDPOINTS, postRequest } from '@/types';
import { Loader } from '@/components/ui-custom';
import { cn } from '@/lib/utils';
import { Button } from '../ui/button';
import { makeTransactionPin } from '@/lib/security/pinEncryption';
import {
  biometricPaymentActive,
  getBiometricToken,
  promptBiometric,
  setBiometricToken,
  setBiometricFlag,
} from '@/lib/security/biometrics';

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

  // Centralized Transaction & Verification Action Handler.
  // Confirmation is either the 4-digit PIN (`rawPin`) or — when the
  // fingerprint prompt already passed on mobile — the enrolled
  // `biometric_token` standing in for it (never both).
  const executeTransaction = async (
    type: string,
    value: any,
    rawPin: string | null,
    biometricToken: string = '',
  ) => {
    const useBiometric = !rawPin && !!biometricToken;
    if (!useBiometric && (rawPin === null || !/^\d{4}$/.test(rawPin))) {
      throw new Error('PIN must be exactly 4 digits');
    }

    const encryptedPin = useBiometric ? '' : makeTransactionPin(rawPin as string);
    const confirmation = useBiometric
      ? { biometric_token: biometricToken }
      : { transaction_pin: encryptedPin };
    const payload = { ...value, ...confirmation };

    const TRANSACTION_MAP: Record<string, () => Promise<any>> = {
      'verify-pin': async () => {
        const endpoint = (ENDPOINTS as any).pin_verify || (ENDPOINTS as any).verify_pin || '/accounts/pin/verify/';
        return await postRequest(endpoint, { pin: encryptedPin });
      },
      // Settings > Add/Remove fingerprint: PIN-gated enrollment; the
      // server answers with the one-time device token (enable only).
      'enable-biometric': () => postRequest(ENDPOINTS.biometric_enable, payload),
      'disable-biometric': () => postRequest(ENDPOINTS.biometric_disable, payload),
      'airtime': () => postRequest(ENDPOINTS.buy_airtime, payload),
      'betting': () => postRequest(ENDPOINTS.betting_fund, payload),
      'light': () => postRequest(ENDPOINTS.electricity, payload),
      'data-MTN': () => postRequest(ENDPOINTS.buy_mtn, payload),
      'data-Glo': () => postRequest(ENDPOINTS.buy_glo, payload),
      'data-Airtel': () => postRequest(ENDPOINTS.buy_airtel, payload),
      'data-9mobile': () => postRequest(ENDPOINTS.buy_etisalat, payload),
      'marketplace': () => postRequest(ENDPOINTS.marketplace_purchase(value.event_id), {
        ticket_type: value.ticket_type,
        quantity: value.quantity,
        ...confirmation,
      }),
      'dstv': () => postRequest(ENDPOINTS.dstv, payload),
      'gotv': () => postRequest(ENDPOINTS.gotv, payload),
      'startimes': () => postRequest(ENDPOINTS.startimes, payload),
      'showmax': () => postRequest(ENDPOINTS.showmax, payload),
      'waec-registration': () => postRequest(ENDPOINTS.waec_registration, payload),
      'waec-result': () => postRequest(ENDPOINTS.waec_result, payload),
      'jamb': () => postRequest(ENDPOINTS.jamb_registration, payload),
      'auto-topup': () => postRequest(ENDPOINTS.auto_topup_create, payload),
      'auto-topup-reactivate': () => postRequest(ENDPOINTS.auto_topup_reactivate(value.id?.toString()), confirmation),
      'group-airtime': () => postRequest(ENDPOINTS.create_group, payload),
      'group-data': () => postRequest(ENDPOINTS.create_group, payload),
      'group-gotv': () => postRequest(ENDPOINTS.create_group, payload),
      'group-dstv': () => postRequest(ENDPOINTS.create_group, payload),
      'group-startimes': () => postRequest(ENDPOINTS.create_group, payload),
      'group-showmax': () => postRequest(ENDPOINTS.create_group, payload),
      'group-lightbill': () => postRequest(ENDPOINTS.create_group, payload),
      'group-transfer': () => postRequest(ENDPOINTS.create_group, payload),
      'group-withdrawal': () => postRequest(ENDPOINTS.create_group, payload),
      'add-scanner': () => postRequest(ENDPOINTS.marketplace_add_scanner(value.event_id), { user_email: value.user_email }),
      'withdrawal': () => postRequest(ENDPOINTS.withdrawal, payload),
      'internal_transfer': () => postRequest(ENDPOINTS.internal_transfer, payload),
      'event-withdraw': () => postRequest(ENDPOINTS.event_withdraw, payload),
      // Ticket transfer uses the backend transfer contract directly. The PIN modal
      // remains the confirmation gate, but the encrypted transaction PIN is not
      // added to this request because the transfer endpoint contract does not require it.
      'marketplace_transfer': () => {
        if (!value.ticket_id) {
          throw new Error('Ticket ID is required for transfer');
        }
        if (!value.recipient_email || !value.recipient_name) {
          throw new Error('Recipient name and email are required for transfer');
        }

        const transferPayload = {
          recipient_email: value.recipient_email,
          recipient_name: value.recipient_name,
        };

        return postRequest(
          ENDPOINTS.marketplace_ticket_transfer(value.ticket_id),
          transferPayload
        );
      },
    };

    const action = TRANSACTION_MAP[type];
    if (!action) throw new Error(`Unsupported transaction type: ${type}`);
    return await action();
  };

  const PinComponent = ({ type, value, onSuccess, onError, onFailure }: PinComponentProps) => {
    const [pin, setPin] = useState<string>('');
    const [visibleDigitIndex, setVisibleDigitIndex] = useState<number | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    // Which confirmation method the modal is offering right now.
    // 'fingerprint' => native prompt view; 'pin' => keypad.
    const [mode, setMode] = useState<'fingerprint' | 'pin'>('pin');

    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const biometricAttemptedRef = useRef(false);
    // Bumped whenever the user leaves fingerprint mode (or re-enters it):
    // a native prompt that resolves afterwards is ignored — no surprise
    // auto-submit after the user chose "Use PIN instead".
    const attemptIdRef = useRef(0);

    const resetState = useCallback(() => {
      setPin('');
      setVisibleDigitIndex(null);
      setIsProcessing(false);
      attemptIdRef.current += 1;
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    }, []);

    const handleCancel = () => {
      resetState();
      hidePinModal();
    };

    const PIN_ONLY_TYPES = ['verify-pin', 'enable-biometric', 'disable-biometric'];
    const canUseBiometric = !PIN_ONLY_TYPES.includes(type) && biometricPaymentActive();

    // Fire the native fingerprint prompt for the current attempt.
    // success => submit with the enrolled token; cancel/failure => back to PIN.
    const runBiometricAttempt = async () => {
      const attempt = ++attemptIdRef.current;
      setIsProcessing(true);
      const ok = await promptBiometric('Authenticate transaction payment');
      if (attempt !== attemptIdRef.current) return; // user switched to PIN meanwhile
      if (ok) {
        await finishWith(null, getBiometricToken());
      } else {
        // Cancelled or failed: fall back to the PIN keypad.
        setIsProcessing(false);
        setMode('pin');
      }
    };

    const switchToPin = () => {
      attemptIdRef.current += 1; // invalidate any in-flight prompt
      setIsProcessing(false);
      setMode('pin');
    };

    const switchToFingerprint = () => {
      setMode('fingerprint');
      void runBiometricAttempt();
    };

    // Mobile: open the payment modal in fingerprint mode and prompt
    // immediately. Cancel/failure lands on the keypad; the user can also
    // flip between the two methods explicitly while the modal is open.
    useEffect(() => {
      if (!modalData.visible) {
        biometricAttemptedRef.current = false;
        return;
      }

      if (canUseBiometric && !biometricAttemptedRef.current) {
        biometricAttemptedRef.current = true;
        setMode('fingerprint');
        void runBiometricAttempt();
      } else if (!canUseBiometric) {
        setMode('pin');
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [modalData.visible, type]);

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

    // Shared confirmation runner: PIN keypad and fingerprint both land
    // here — the only difference is what stands in for the PIN.
    const finishWith = async (rawPin: string | null, biometricToken: string) => {
      setIsProcessing(true);
      showLoader();

      try {
        const response = await executeTransaction(type, value, rawPin, biometricToken);

        hidePinModal();
        hideLoader();
        setMessage(response);
        resetState();

        console.log(response);

        const isSuccess = !!response && (
          response.success === true || 
          response.state === true || 
          (!response.error && response.code === '00') ||
          (!response.error && response.success !== false && response.state !== false)
        );

        // Stale enrollment (PIN changed/disabled elsewhere): drop the
        // local token so the next attempt falls back to the PIN keypad.
        if (biometricToken && !isSuccess) {
          const err = String(response?.error || response?.message || '');
          if (err.includes('Fingerprint confirmation expired')) {
            setBiometricToken('');
            setBiometricFlag('biometricEnabled', false);
            setBiometricFlag('biometricPaymentEnabled', false);
          }
        }

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
        // Thrown errors (timeouts, network failures, unsupported types)
        // must surface: without setMessage the modal just closes silently.
        const failure = {
          success: false,
          error: (error as any)?.message || 'Transaction failed. Please try again.',
        };
        setMessage(failure);
        if (onError) onError(failure);
        else if (onFailure) onFailure(failure);
      }
    };

    const makeTransaction = () => {
      if (pin.length !== 4 || isProcessing) return;
      void finishWith(pin, '');
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
            <h2 className="text-xl font-bold text-slate-800 dark:text-white">
              {mode === 'fingerprint' ? 'Fingerprint Confirmation' : 'Transaction PIN'}
            </h2>
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

          {mode === 'fingerprint' ? (
            /* Fingerprint view: the native prompt sits on top of this;
               cancel/failure flips us to the PIN keypad below. */
            <div className="space-y-6">
              <div className="flex flex-col items-center gap-3 py-6">
                <div className="w-20 h-20 rounded-full bg-sky-50 dark:bg-sky-500/10 flex items-center justify-center">
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-10 h-10 text-sky-500"
                  >
                    <path d="M12 10a2 2 0 0 0-2 2c0 1.02-.1 2.51-.26 4" />
                    <path d="M14 13.12c0 2.38 0 6.38-1 8.88" />
                    <path d="M17.29 21.02c.12-.6.43-2.3.5-3.02" />
                    <path d="M2 12a10 10 0 0 1 18-6" />
                    <path d="M2 16h.01" />
                    <path d="M21.8 16c.2-2 .131-5.354 0-6" />
                    <path d="M5 19.5C5.5 18 6 15 6 12a6 6 0 0 1 .34-2" />
                    <path d="M8.65 22c.21-.66.45-1.32.57-2" />
                    <path d="M9 6.8a6 6 0 0 1 9 5.2v2" />
                  </svg>
                </div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400 text-center">
                  {isProcessing
                    ? 'Waiting for fingerprint…'
                    : 'Scan your fingerprint to confirm this payment'}
                </p>
              </div>

              <div className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full h-14 text-lg font-medium rounded-2xl border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                  onClick={switchToPin}
                >
                  Use PIN instead
                </Button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="w-full h-10 text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
          <>
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

          {/* Switch back to fingerprint while the modal is open */}
          {canUseBiometric && (
            <button
              type="button"
              className="w-full h-10 mt-3 text-sm font-medium text-sky-600 dark:text-sky-400 hover:underline transition-colors"
              onClick={switchToFingerprint}
            >
              Use fingerprint instead
            </button>
          )}

          {/* Security Footer */}
          <div className="mt-6 flex items-center justify-center gap-2 text-xs font-medium text-slate-400 dark:text-slate-500">
            <span aria-hidden="true">🔒</span>
            <span>Secured by Transaction PIN Verification</span>
          </div>
          </>
          )}
        </div>
        <LoaderComponent />
      </div>
    );
  };

  return { showPinModal, hidePinModal, PinComponent, modalData, message };
}