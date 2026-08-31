import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppAuthLayout } from '../../components/app-auth/AppAuthLayout';
import { AppAuthHeader } from '../../components/app-auth/AppAuthHeader';
import { AppPinInput } from '../../components/app-auth/AppPinInput';

export const AppCreatePinPage: React.FC = () => {
  const [step, setStep] = useState<'create' | 'confirm'>('create');
  const [firstPin, setFirstPin] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handlePinComplete = async (enteredPin: string) => {
    setError(null);

    if (step === 'create') {
      setFirstPin(enteredPin);
      setStep('confirm');
      return;
    }

    if (enteredPin !== firstPin) {
      setError('PINs do not match. Please try again.');
      setStep('create');
      setFirstPin('');
      return;
    }

    try {
      setLoading(true);
      // Uses existing makeTransactionPin encryption before POST /accounts/pin/set/
      // On success, lands directly on dashboard (no navigate(-1))
      navigate('/app-auth/success');
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to set transaction PIN.');
      setStep('create');
      setFirstPin('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppAuthLayout>
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
          length={4}
          onComplete={handlePinComplete}
          error={error}
        />
      </div>

      {loading && (
        <div className="text-center text-xs text-[#00D1FF] font-medium py-4">
          Encrypting and setting PIN...
        </div>
      )}
    </AppAuthLayout>
  );
};