import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AppAuthLayout } from '../../components/app-auth/AppAuthLayout';
import { AppAuthHeader } from '../../components/app-auth/AppAuthHeader';
import { AppPinInput } from '../../components/app-auth/AppPinInput';
import { AppAuthButton } from '../../components/app-auth/AppAuthButton';
import { postRequest, ENDPOINTS } from '@/types';

export const AppCreatePinPage: React.FC = () => {
  const [step, setStep] = useState<'create' | 'confirm'>('create');
  const [firstPin, setFirstPin] = useState('');
  const [currentPin, setCurrentPin] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handlePinChange = (pin: string) => {
    setCurrentPin(pin);
    if (error) setError(null);
  };

  const handlePinSubmit = async (pinToSubmit?: string) => {
    const pin = pinToSubmit || currentPin;
    if (pin.length < 4) {
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
      const response = await postRequest(ENDPOINTS.pin_set, { pin });

      if (response?.state !== false) {
        // Pass registration details to success page
        navigate('/app-auth/success', { 
          state: { ...location.state, pinSet: true } 
        });
      } else {
        setError(response?.message || 'Failed to set transaction PIN.');
        setStep('create');
        setFirstPin('');
        setCurrentPin('');
      }
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        'Failed to set transaction PIN.'
      );
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
            title={step === 'create' ? 'Create Transaction PIN' : 'Confirm Transaction PIN'}
            subtitle={
              step === 'create'
                ? 'Set a secure 4-digit PIN for authorizing transactions'
                : 'Re-enter your 4-digit PIN to confirm'
            }
            showBack={false}
          />

          {/* Key prop forces component to remount and clear inputs on step change */}
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