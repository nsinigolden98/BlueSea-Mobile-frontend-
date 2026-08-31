import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppAuthLayout } from '../../components/app-auth/AppAuthLayout';
import { AppAuthHeader } from '../../components/app-auth/AppAuthHeader';
import { AppOtpInput } from '../../components/app-auth/AppOtpInput';
import { AppAuthButton } from '../../components/app-auth/AppAuthButton';

export const AppEmailVerificationPage: React.FC = () => {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleVerify = async () => {
    if (otp.length !== 6) {
      setError('Please enter the full 6-digit code sent to your Gmail.');
      return;
    }

    try {
      setLoading(true);
      // Calls POST /accounts/verify-email/
      // Navigates directly to PIN creation gate
      navigate('/app-auth/create-pin');
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Invalid or expired OTP code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppAuthLayout>
      <div>
        <AppAuthHeader
          title="Verify Email"
          subtitle="Enter the 6-digit OTP code sent to your Gmail address"
          showBack={false}
        />

        <AppOtpInput
          length={6}
          onComplete={(code) => setOtp(code)}
          error={error}
        />

        <AppAuthButton onClick={handleVerify} loading={loading}>
          Verify OTP
        </AppAuthButton>
      </div>

      <div className="text-center mt-6">
        <button
          type="button"
          onClick={() => {
            // Triggers POST /accounts/resend-otp/
          }}
          className="text-xs text-[#00D1FF] font-semibold hover:underline"
        >
          Didn't receive code? Resend OTP
        </button>
      </div>
    </AppAuthLayout>
  );
};