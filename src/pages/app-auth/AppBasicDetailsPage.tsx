import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useNativeAuth } from '../../hooks/useNativeAuth';
import { AppAuthLayout } from '../../components/app-auth/AppAuthLayout';
import { AppAuthHeader } from '../../components/app-auth/AppAuthHeader';
import { AppAuthInput } from '../../components/app-auth/AppAuthInput';
import { AppPasswordInput } from '../../components/app-auth/AppPasswordInput';
import { AppAuthButton } from '../../components/app-auth/AppAuthButton';
import { postRequest } from '@/types';

export const AppBasicDetailsPage: React.FC = () => {
  const { formData, updateField, error: hookError } = useNativeAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const email = location.state?.email || formData.email;

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digitsOnly = e.target.value.replace(/\D/g, '').slice(0, 10);
    updateField('phone', digitsOnly);
    if (localError) setLocalError(null);
  };

  const handleNext = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      setLocalError('Email address is missing. Please restart registration.');
      return;
    }
    if (!formData.surname?.trim()) {
      setLocalError('Surname is required.');
      return;
    }
    if (!formData.firstName?.trim()) {
      setLocalError('First name is required.');
      return;
    }
    if (!formData.phone || formData.phone.length !== 10) {
      setLocalError('Phone number must be exactly 10 digits.');
      return;
    }
    if (!formData.password || formData.password.length < 8) {
      setLocalError('Password must be at least 8 characters.');
      return;
    }

    setLocalError(null);
    setLoading(true);

    try {
      // POST /accounts/sign-up/
      const payload = {
        surname: formData.surname.trim(),
        other_names: formData.firstName.trim(),
        email: email.trim(),
        phone: formData.phone.trim(),
        password: formData.password,
      };

      const response = await postRequest('/accounts/sign-up/', payload);

      if (response?.state || response?.message) {
        // Successful signup -> move to OTP email verification step
        navigate('/app-auth/verify-email', { state: { email } });
      } else {
        setLocalError(response?.message || 'Failed to create account.');
      }
    } catch (err: any) {
      const apiError = err?.response?.data;
      if (apiError) {
        // Parse backend object field validation errors if provided
        const firstErrorKey = Object.keys(apiError)[0];
        const errorMessage = Array.isArray(apiError[firstErrorKey])
          ? apiError[firstErrorKey][0]
          : apiError.message || apiError.detail || 'Registration failed. Please try again.';
        setLocalError(errorMessage);
      } else {
        setLocalError('Unable to connect to the server. Please try again.');
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
          subtitle="Provide your details as registered on official records"
          onBack={() => navigate('/app-auth/signup')}
        />

        <form onSubmit={handleNext}>
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
            label="Other Names / First Name *"
            placeholder="John"
            value={formData.firstName}
            onChange={(e) => {
              updateField('firstName', e.target.value);
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

          {activeError && (
            <div className="p-3 mb-4 text-xs rounded-xl bg-red-500/10 border border-red-500/20 text-red-400">
              {activeError}
            </div>
          )}

          <AppAuthButton type="submit" loading={loading} disabled={loading}>
            {loading ? 'Creating Account...' : 'Continue'}
          </AppAuthButton>
        </form>
      </div>
    </AppAuthLayout>
  );
};