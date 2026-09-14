import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppAuthLayout } from '../../components/app-auth/AppAuthLayout';
import { AppAuthHeader } from '../../components/app-auth/AppAuthHeader';
import { AppPinInput } from '../../components/app-auth/AppPinInput';
import { AppAuthButton } from '../../components/app-auth/AppAuthButton';
import { getRequest, postRequest, ENDPOINTS } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { clearDashboardReadinessCache } from '@/components/ui-custom/DashboardAccessGuard';
import { makeTransactionPin } from '@/lib/security/pinEncryption';

export const AppCreatePinPage: React.FC = () => {
  const [step, setStep] = useState<'create' | 'confirm'>('create');
  const [firstPin, setFirstPin] = useState('');
  const [currentPin, setCurrentPin] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [checkingPin, setCheckingPin] = useState(true);
  const [pinAlreadySet, setPinAlreadySet] = useState(false);

  const navigate = useNavigate();
  const { refreshUser } = useAuth();

  useEffect(() => {
    let cancelled = false;

    const checkPinStatus = async () => {
      try {
        const profile = await getRequest(ENDPOINTS.user);
        const isSet = profile?.pin_is_set === true;

        if (!cancelled) {
          setPinAlreadySet(isSet);
        }
      } catch (requestError) {
        console.error('Failed to check transaction PIN status:', requestError);
      } finally {
        if (!cancelled) setCheckingPin(false);
      }
    };

    checkPinStatus();

    return () => {
      cancelled = true;
    };
  }, []);

  const continueToDashboard = async () => {
    setLoading(true);
    setError(null);

    try {
      await refreshUser();
      clearDashboardReadinessCache();
      navigate('/dashboard', { replace: true });
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
        err?.message ||
        'Unable to continue to Dashboard.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handlePinChange = (pin: string) => {
    setCurrentPin(pin);
    if (error) setError(null);
  };

  const handlePinSubmit = async (pinToSubmit?: string) => {
    if (pinAlreadySet) {
      await continueToDashboard();
      return;
    }

    const pin = pinToSubmit || currentPin;

    if (!/^\d{4}$/.test(pin)) {
      setError('Please enter a complete 4-digit PIN.');
      return;
    }

    setError(null);

    if (step === 'create') {
      setFirstPin(pin);
      setCurrentPin('');
      setStep('confirm');
      return;
    }

    if (pin !== firstPin) {
      setError('PINs do not match. Please try again.');
      setStep('create');
      setFirstPin('');
      setCurrentPin('');
      return;
    }

    try {
      setLoading(true);

      const encryptedPin = makeTransactionPin(firstPin);
      const encryptedConfirmPin = makeTransactionPin(pin);

      const response = await postRequest(ENDPOINTS.pin_set, {
        pin: encryptedPin,
        confirm_pin: encryptedConfirmPin,
      });

      const message =
        typeof response?.message === 'string'
          ? response.message.trim().toLowerCase()
          : '';

      if (message === 'transaction pin is already set') {
        await continueToDashboard();
        return;
      }

      if (
        response?.state === false ||
        response?.status === false ||
        response?.success === false
      ) {
        setError(response?.message || 'Failed to set transaction PIN.');
        setStep('create');
        setFirstPin('');
        setCurrentPin('');
        return;
      }

      await refreshUser();
      clearDashboardReadinessCache();
      navigate('/dashboard', { replace: true });
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        'Failed to set transaction PIN.';

      if (
        typeof errorMessage === 'string' &&
        errorMessage.trim().toLowerCase() === 'transaction pin is already set'
      ) {
        await continueToDashboard();
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

  if (checkingPin) {
    return (
      <AppAuthLayout>
        <div className="flex min-h-[300px] items-center justify-center px-6">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Checking your transaction PIN...
          </p>
        </div>
      </AppAuthLayout>
    );
  }

  if (pinAlreadySet) {
    return (
      <AppAuthLayout>
        <div className="flex-1 flex flex-col justify-between">
          <div>
            <AppAuthHeader
              title="Transaction PIN Ready"
              subtitle="Your transaction PIN is already set. You do not need to create another one."
              showBack={false}
            />

            <div className="mx-auto mt-6 w-full max-w-md rounded-2xl border border-emerald-200 bg-emerald-50 dark:border-emerald-900/50 dark:bg-emerald-950/20 p-5 text-center">
              <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">
                PIN already set
              </p>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                Your account is ready to continue to Dashboard.
              </p>
            </div>
          </div>

          <div className="mt-8">
            <AppAuthButton
              onClick={continueToDashboard}
              loading={loading}
              disabled={loading}
              className="w-full"
            >
              Continue to Dashboard
            </AppAuthButton>

            {error && (
              <p className="mt-3 text-center text-sm text-red-500">{error}</p>
            )}
          </div>
        </div>
      </AppAuthLayout>
    );
  }

  return (
    <AppAuthLayout>
      <div className="flex-1 flex flex-col justify-between">
        <div>
          <AppAuthHeader
            title={step === 'create' ? 'Create Transaction PIN' : 'Confirm Transaction PIN'}
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
            {step === 'create' ? 'Continue' : 'Confirm & Save PIN'}
          </AppAuthButton>
        </div>
      </div>
    </AppAuthLayout>
  );
};
