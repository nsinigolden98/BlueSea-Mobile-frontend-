import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AppAuthLayout } from '../../components/app-auth/AppAuthLayout';
import { AppAuthHeader } from '../../components/app-auth/AppAuthHeader';
import { AppOtpInput } from '../../components/app-auth/AppOtpInput';
import { AppAuthButton } from '../../components/app-auth/AppAuthButton';
import { postRequest, ENDPOINTS } from '@/types';

export const AppEmailVerificationPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || '';

  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleVerify = async (submittedOtp?: string) => {
    const codeToVerify = submittedOtp || otp;
    if (codeToVerify.length !== 6) {
      setError('Please enter the full 6-digit code sent to your Gmail.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setMessage(null);

      const endpoint = (ENDPOINTS as Record<string, any>).verifyOtp || '/accounts/verify-email/';
      const response = await postRequest(endpoint, { email, otp: codeToVerify });

      if (response?.status || response?.success || response?.state) {
        // Proceed to Username creation step
        navigate('/app-auth/username', { state: { email } });
      } else {
        setError(response?.message || 'Invalid or expired OTP code.');
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Invalid or expired OTP code.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    try {
      setResending(true);
      setError(null);
      setMessage(null);

      const endpoint = (ENDPOINTS as Record<string, any>).sendOtp || '/accounts/resend-otp/';
      await postRequest(endpoint, { email });

      setMessage('A new OTP code has been sent to your email.');
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Failed to resend OTP.');
    } finally {
      setResending(false);
    }
  };

  return (
    <AppAuthLayout>
      <div>
        <AppAuthHeader
          title="Verify Email"
          subtitle={
            email
              ? `Enter the 6-digit OTP code sent to ${email}`
              : 'Enter the 6-digit OTP code sent to your Gmail address'
          }
          onBack={() => navigate(-1)}
        />

        {error && (
          <div className="p-3 mb-4 text-xs rounded-xl bg-red-500/10 border border-red-500/20 text-red-400">
            {error}
          </div>
        )}

        {message && (
          <div className="p-3 mb-4 text-xs rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            {message}
          </div>
        )}

        <AppOtpInput
          key={error ? 'err' : 'normal'}
          length={6}
          onComplete={(code) => {
            setOtp(code);
            handleVerify(code);
          }}
          error={error}
        />

        <AppAuthButton
          onClick={() => handleVerify()}
          loading={loading}
          disabled={otp.length !== 6 || loading}
        >
          Verify OTP
        </AppAuthButton>
      </div>

      <div className="text-center mt-6">
        <button
          type="button"
          onClick={handleResendOtp}
          disabled={resending}
          className="text-xs text-[#00D1FF] font-semibold hover:underline disabled:opacity-50"
        >
          {resending ? 'Sending code...' : "Didn't receive code? Resend OTP"}
        </button>
      </div>
    </AppAuthLayout>
  );
};