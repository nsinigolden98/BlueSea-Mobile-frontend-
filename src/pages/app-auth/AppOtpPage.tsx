import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AppAuthLayout } from '../../components/app-auth/AppAuthLayout';
import { AppAuthHeader } from '../../components/app-auth/AppAuthHeader';
import { AppOtpInput } from '../../components/app-auth/AppOtpInput';
import { AppAuthButton } from '../../components/app-auth/AppAuthButton';

export const AppOtpPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [otp, setOtp] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const email = location.state?.email || '';

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) {
      setError('Please enter the complete 6-digit OTP.');
      return;
    }

    try {
      setLoading(true);
      // Verifies reset OTP via POST /accounts/password/reset/verify-otp/
      navigate('/app-auth/login');
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Invalid OTP code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppAuthLayout>
      <div>
        <AppAuthHeader
          title="Enter Security Code"
          subtitle={`Enter the 6-digit verification code sent to ${email}`}
          onBack={() => navigate(-1)}
        />

        <AppOtpInput
          length={6}
          onComplete={(code) => setOtp(code)}
          error={error}
        />

        <AppAuthButton onClick={handleVerifyOtp} loading={loading}>
          Verify & Continue
        </AppAuthButton>
      </div>
    </AppAuthLayout>
  );
};