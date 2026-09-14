import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useNativeAuth } from '../../hooks/useNativeAuth';
import { AppAuthLayout } from '../../components/app-auth/AppAuthLayout';
import { AppAuthHeader } from '../../components/app-auth/AppAuthHeader';
import { AppAuthInput } from '../../components/app-auth/AppAuthInput';
import { AppPasswordInput } from '../../components/app-auth/AppPasswordInput';
import { AppAuthButton } from '../../components/app-auth/AppAuthButton';
import { postRequest, ENDPOINTS, setCookie } from '@/types';

export const AppBasicDetailsPage: React.FC = () => {
  const { formData, updateField, error: hookError } = useNativeAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const email = location.state?.email || formData.email;

  // Strict Phone Number Input: Numbers only, max 10 digits
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const digitsOnly = raw.replace(/\D/g, '').slice(0, 10);
    updateField('phone', digitsOnly);
    if (localError) setLocalError(null);
  };

  const handleNext = async (e: React.FormEvent) => {
    e.preventDefault();

    const normalizedEmail = email?.trim().toLowerCase();

    // 1. Strict Client-side Validation
    if (!normalizedEmail) {
      setLocalError('Email address is missing. Please start registration again.');
      return;
    }
    if (!formData.firstName?.trim()) {
      setLocalError('First name is compulsory.');
      return;
    }
    if (!formData.surname?.trim()) {
      setLocalError('Surname is compulsory.');
      return;
    }
    if (!formData.phone || formData.phone.length !== 10) {
      setLocalError('Phone number is compulsory and must be exactly 10 digits.');
      return;
    }
    if (!formData.password || formData.password.length < 8) {
      setLocalError('Password is compulsory and must be at least 8 characters.');
      return;
    }

    setLocalError(null);
    setLoading(true);

    try {
      if (formData.referralCode?.trim()) {
        setCookie('ref', formData.referralCode.trim());
      }

      const formattedPhone = formData.phone.startsWith('0')
        ? formData.phone
        : `0${formData.phone}`;

      const payload = {
        email: normalizedEmail,
        other_names: formData.firstName.trim(),
        surname: formData.surname.trim(),
        phone: formattedPhone,
        password: formData.password,
      };

      const response = await postRequest(ENDPOINTS.signup, payload);

      if (response?.state !== false) {
        // Navigate to Email Verification after OTP dispatch
        navigate('/app-auth/verify-email', { state: { email: normalizedEmail } });
      } else {
        const emailErr = response?.errors?.email?.[0];
        if (emailErr && emailErr.includes('already exists')) {
          // If email exists, re-trigger OTP send and move to verification
          await postRequest(ENDPOINTS.sendOtp, { email: normalizedEmail });
          navigate('/app-auth/verify-email', { state: { email: normalizedEmail } });
        } else {
          setLocalError(response?.message || 'Failed to submit registration details.');
        }
      }
    } catch (err: any) {
      const apiMsg = err?.response?.data?.message || err?.response?.data?.error || err?.message;
      if (apiMsg?.toLowerCase().includes('exist')) {
        try {
          await postRequest(ENDPOINTS.sendOtp, { email: normalizedEmail });
          navigate('/app-auth/verify-email', { state: { email: normalizedEmail } });
        } catch (_) {
          setLocalError('An account with this email or phone number already exists. Please Sign In.');
        }
      } else {
        setLocalError(apiMsg || 'Unable to complete registration. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const activeError = localError || hookError;

  return (
    <AppAuthLayout>
      <div>
        <AppAuthHeader
          title="Personal Details"
          subtitle="Provide your identity details as registered on official records"
          onBack={() => navigate('/app-auth/signup')}
        />

        <form onSubmit={handleNext}>
          <AppAuthInput
            label="First Name *"
            placeholder="John"
            value={formData.firstName}
            onChange={(e) => {
              updateField('firstName', e.target.value);
              if (localError) setLocalError(null);
            }}
          />

          <AppAuthInput
            label="Surname *"
            placeholder="Doe"
            value={formData.surname}
            onChange={(e) => {
              updateField('surname', e.target.value);
              if (localError) setLocalError(null);
            }}
          />

          <AppAuthInput
            label="Phone Number *"
            type="tel"
            prefixText="+234"
            placeholder="8012345678"
            value={formData.phone}
            onChange={handlePhoneChange}
          />

          <AppPasswordInput
            label="Password *"
            placeholder="Create password (min. 8 characters)"
            value={formData.password}
            onChange={(e) => {
              updateField('password', e.target.value);
              if (localError) setLocalError(null);
            }}
          />

          <AppAuthInput
            label="Referral Code (Optional)"
            placeholder="Enter referral code"
            value={formData.referralCode}
            onChange={(e) => updateField('referralCode', e.target.value)}
          />

          {activeError && (
            <div className="p-3 mb-4 text-xs rounded-xl bg-red-500/10 border border-red-500/20 text-red-400">
              {activeError}
            </div>
          )}

          <AppAuthButton type="submit" loading={loading} disabled={loading}>
            {loading ? 'Sending OTP...' : 'Continue'}
          </AppAuthButton>
        </form>
      </div>
    </AppAuthLayout>
  );
};