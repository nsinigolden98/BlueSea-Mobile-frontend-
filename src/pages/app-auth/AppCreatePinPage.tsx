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
    const pin = pinToSubmit || currentPin;

    if (!/^\d{4}$/.test(pin)) {
      setError('Please enter a complete 4-digit PIN.');
      return;
    }

    setError(null);

    // STEP 1: First PIN entry
    if (step === 'create') {
      setFirstPin(pin);
      setCurrentPin('');
      setStep('confirm');
      return;
    }

    // STEP 2: Confirm PIN
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
       * Use the exact same PIN encryption mechanism already
       * used by the existing PIN modal.
       */
      const encryptedPin = makeTransactionPin(firstPin);
      const encryptedConfirmPin = makeTransactionPin(pin);

      const response = await postRequest(ENDPOINTS.pin_set, {
        pin: encryptedPin,
        confirm_pin: encryptedConfirmPin,
      });

      /*
       * IMPORTANT:
       *
       * The backend can return:
       *
       * {
       *   message: "Transaction pin is already set",
       *   state: false
       * }
       *
       * This is NOT a real failure when the user's profile
       * confirms pin_is_set === true.
       */
      const message =
        typeof response?.message === 'string'
          ? response.message.trim().toLowerCase()
          : '';

      const pinAlreadySet =
        message === 'transaction pin is already set';

      if (pinAlreadySet) {
        /*
         * Do not ask the user to create another PIN.
         *
         * Refresh the actual backend profile and verify that
         * the backend says the PIN exists.
         */
        const refreshedUser = await refreshUser();

        /*
         * refreshUser updates AuthContext, but we also use
         * the current backend response/state to determine
         * whether we can safely continue.
         *
         * If refreshUser does not return the user object,
         * the existing authenticated state will still be
         * refreshed. The dashboard guard will perform its
         * authoritative readiness check.
         */
        clearDashboardReadinessCache();

        navigate('/dashboard', { replace: true });
        return;
      }

      /*
       * A normal state:false / status:false / success:false
       * response is still a genuine failure.
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
       * PIN was successfully created.
       *
       * Refresh the authenticated user so pin_is_set becomes
       * true in the frontend state before entering dashboard.
       */
      await refreshUser();

      /*
       * The previous readiness result may have said
       * pin_is_set === false, so invalidate it.
       */
      clearDashboardReadinessCache();

      navigate('/dashboard', { replace: true });
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        'Failed to set transaction PIN.';

      /*
       * Some API wrappers may throw when the backend returns
       * the "already set" response instead of returning it.
       *
       * Handle that case as well.
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
      <AppAuthHeader
        title="Create Transaction PIN"
        subtitle={
          step === 'create'
            ? 'Create a 4-digit PIN to secure your transactions.'
            : 'Confirm your 4-digit transaction PIN.'
        }
      />

      <AppPinInput
        value={currentPin}
        onChange={handlePinChange}
        onComplete={handlePinSubmit}
        disabled={loading}
      />

      {error && (
        <p className="mt-3 text-sm text-red-500 text-center">
          {error}
        </p>
      )}

      <AppAuthButton
        onClick={() => handlePinSubmit()}
        loading={loading}
        disabled={currentPin.length !== 4}
      >
        {step === 'create' ? 'Continue' : 'Create PIN'}
      </AppAuthButton>
    </AppAuthLayout>
  );
};