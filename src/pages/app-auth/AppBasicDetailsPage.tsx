import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useNativeAuth } from '../../hooks/useNativeAuth';
import { AppAuthLayout } from '../../components/app-auth/AppAuthLayout';
import { AppAuthHeader } from '../../components/app-auth/AppAuthHeader';
import { AppAuthInput } from '../../components/app-auth/AppAuthInput';
import { AppPasswordInput } from '../../components/app-auth/AppPasswordInput';
import { AppAuthButton } from '../../components/app-auth/AppAuthButton';

export const AppBasicDetailsPage: React.FC = () => {
  const { formData, updateField, error, validateBasicDetailsStep } = useNativeAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const email = location.state?.email || formData.email;

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateBasicDetailsStep()) {
      // Direct user to email OTP verification before username & PIN creation
      navigate('/app-auth/verify-email', { state: { email } });
    }
  };

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
            label="First Name"
            placeholder="John"
            value={formData.firstName}
            onChange={(e) => updateField('firstName', e.target.value)}
          />

          <AppAuthInput
            label="Surname"
            placeholder="Doe"
            value={formData.surname}
            onChange={(e) => updateField('surname', e.target.value)}
          />

          <AppAuthInput
            label="Phone Number"
            type="tel"
            prefixText="+234"
            placeholder="801 234 5678"
            value={formData.phone}
            onChange={(e) => updateField('phone', e.target.value)}
          />

          <AppPasswordInput
            label="Password"
            placeholder="Create password (min. 8 characters)"
            value={formData.password}
            onChange={(e) => updateField('password', e.target.value)}
          />

          <AppAuthInput
            label="Referral Code (Optional)"
            placeholder="Enter referral code"
            value={formData.referralCode}
            onChange={(e) => updateField('referralCode', e.target.value)}
          />

          {error && <p className="text-xs text-red-400 font-medium mb-4">{error}</p>}

          <AppAuthButton type="submit">
            Continue
          </AppAuthButton>
        </form>
      </div>
    </AppAuthLayout>
  );
};