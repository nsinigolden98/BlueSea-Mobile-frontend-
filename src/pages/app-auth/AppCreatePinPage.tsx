
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppAuthLayout } from '../../components/app-auth/AppAuthLayout';
import { AppAuthHeader } from '../../components/app-auth/AppAuthHeader';
import { AppPinInput } from '../../components/app-auth/AppPinInput';
import { AppAuthButton } from '../../components/app-auth/AppAuthButton';
import { postRequest, ENDPOINTS } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { clearDashboardReadinessCache } from '@/components/ui-custom/DashboardAccessGuard';
import { makeTransactionPin } from '@/lib/security/pinEncryption';

export const AppCreatePinPage: React.FC = () => {
  const [step, setStep] = useState<'create' | 'confirm'>('create');
  const [firstPin, setFirstPin] = useState('');
  const [currentPin, setCurrentPin] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { refreshUser } = useAuth();

  const handlePinChange = (pin: string) => {
    setCurrentPin(pin);

    if (error) {
      setError(null);
    }
  };

  const handlePinSubmit = async (pinToSubmit?: string) => {
    // Prevent the completion callback and the button from submitting twice.
    if (loading) {
      return;
    }

    const pin = pinToSubmit ?? currentPin;

    if (!/^\d{4}$/.test(pin)) {
      setError('Please enter a complete 4-digit PIN.');
      return;
    }

    setError(null);

    // First PIN entry
    if (step === 'create') {
      setFirstPin(pin);
      setCurrentPin('');
      setStep('confirm');
      return;
    }

    // Confirm PIN matches the first PIN
    if (pin !== firstPin) {
      setError('PINs do not match. Please try again.');
      setStep('create');
      setFirstPin('');
      setCurrentPin('');
      return;
    }

    try {
      setLoading(true);

      /*
       * Use the same PIN encryption already used by the
       * existing transaction PIN flow.
       */
      const encryptedPin = makeTransactionPin(firstPin);
      const encryptedConfirmPin = makeTransactionPin(pin);

      const response = await postRequest(ENDPOINTS.pin_set, {
        pin: encryptedPin,
        confirm_pin: encryptedConfirmPin,
      });

      const responseMessage =
        typeof response?.message === 'string'
          ? response.message.trim().toLowerCase()
          : '';

      /*
       * The backend can respond:
       *
       * {
       *   message: "Transaction pin is already set",
       *   state: false
       * }
       *
       * This means the account already satisfies the PIN
       * requirement. Do not ask the user to create another PIN.
       */
      const pinAlreadySet =
        responseMessage === 'transaction pin is already set';

      if (pinAlreadySet) {
        /*
         * Refresh the authenticated user so the frontend
         * receives the current backend value:
         *
         * pin_is_set: true
         */
        await refreshUser();

        /*
         * The previous readiness result may have been cached
         * before the PIN was confirmed. Clear it so Dashboard
         * performs a fresh readiness check.
         */
        clearDashboardReadinessCache();

        navigate('/dashboard', { replace: true });
        return;
      }

      /*
       * Any other explicit negative response is a genuine
       * PIN setup failure.
       */
      if (
        response?.state === false ||
        response?.status === false ||
        response?.success === false
      ) {
        setError(
          response?.message || 'Failed to set transaction PIN.'
        );

        setStep('create');
        setFirstPin('');
        setCurrentPin('');
        return;
      }

      /*
       * Normal successful PIN creation.
       *
       * Refresh the backend user before entering Dashboard so
       * pin_is_set is no longer stale in the frontend.
       */
      await refreshUser();

      clearDashboardReadinessCache();

      navigate('/dashboard', { replace: true });
    } catch (err: unknown) {
      const error = err as {
        response?: { data?: { message?: unknown; error?: unknown } };
        message?: unknown;
      };
      const errorMessage =
        (typeof error.response?.data?.message === 'string' &&
          error.response.data.message) ||
        (typeof error.response?.data?.error === 'string' &&
          error.response.data.error) ||
        (typeof error.message === 'string' && error.message) ||
        'Failed to set transaction PIN.';

      /*
       * Some request wrappers may throw instead of returning
       * the backend's "already set" response.
       */
      if (
        typeof errorMessage === 'string' &&
        errorMessage.trim().toLowerCase() ===
          'transaction pin is already set'
      ) {
        await refreshUser();
        clearDashboardReadinessCache();
        navigate('/dashboard', { replace: true });
        return;
      }

      setError(errorMessage);
      setStep('create');
      setFirstPin('');
      setCurrentPin('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppAuthLayout>
      <div className="flex-1 flex flex-col justify-between">
        <div>
          <AppAuthHeader
            title={
              step === 'create'
                ? 'Create Transaction PIN'
                : 'Confirm Transaction PIN'
            }
            subtitle={
              step === 'create'
                ? 'Set a secure 4-digit PIN for authorizing transactions'
                : 'Re-enter your 4-digit PIN to confirm'
            }
            showBack={false}
          />

          <AppPinInput
            key={step + (error ? '-err' : '')}
            length={4}
            onComplete={(pin) => {
              handlePinChange(pin);
              handlePinSubmit(pin);
            }}
            error={error}
          />
        </div>

        {loading && (
          <div className="text-center text-xs text-[#00D1FF] font-medium py-2">
            Setting transaction PIN...
          </div>
        )}

        <div className="mt-8 space-y-3">
          <AppAuthButton
            onClick={() => handlePinSubmit()}
            disabled={currentPin.length < 4 || loading}
            loading={loading}
          >
            {step === 'create'
              ? 'Continue'
              : 'Confirm & Save PIN'}
          </AppAuthButton>
        </div>
      </div>
    </AppAuthLayout>
  );
};

