import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { AppAuthLayout } from '../../components/app-auth/AppAuthLayout';
import { AppAuthHeader } from '../../components/app-auth/AppAuthHeader';
import { AppOtpInput } from '../../components/app-auth/AppOtpInput';
import { AppAuthButton } from '../../components/app-auth/AppAuthButton';
import { postRequest, ENDPOINTS, setCookie } from '@/types';

export const AppOtpPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { refreshUser } = useAuth();
  const [otp, setOtp] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendMessage, setResendMessage] = useState<string | null>(null);

  const email = location.state?.email || '';

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) {
      setError('Please enter the complete 6-digit OTP.');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await postRequest(ENDPOINTS.verifyOtp, {
        email: email.trim(),
        otp: otp.trim(),
      });

      if (response?.state !== false) {
        const accessToken = response?.access_token || response?.data?.access_token || response?.access;
        const refreshToken = response?.refresh_token || response?.data?.refresh_token || response?.refresh;

        if (accessToken) {
          setCookie('access_token', accessToken);
          if (refreshToken) setCookie('refresh_token', refreshToken);
          await refreshUser();
        }

        navigate('/app-auth/username', { state: { email: email.trim() } });
      } else {
        setError(response?.message || 'Invalid or expired OTP code.');
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.response?.data?.error || err?.message || 'Invalid OTP code.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!email) return;
    try {
      setResending(true);
      setError(null);
      setResendMessage(null);

      const response = await postRequest(ENDPOINTS.sendOtp, { email: email.trim() });
      if (response?.state !== false) {
        setResendMessage('A new verification code has been sent to your email.');
      } else {
        setError(response?.message || 'Failed to resend verification code.');
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Failed to resend verification code.');
    } finally {
      setResending(false);
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

        {resendMessage && (
          <div className="p-3 mb-4 text-xs rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            {resendMessage}
          </div>
        )}

        <AppOtpInput
          length={6}
          onComplete={(code) => {
            setOtp(code);
            if (error) setError(null);
          }}
          error={error}
        />

        <div className="flex justify-end mb-6">
          <button
            type="button"
            onClick={handleResendOtp}
            disabled={resending}
            className="text-xs text-[#00D1FF] hover:underline font-medium disabled:opacity-50"
          >
            {resending ? 'Resending...' : 'Resend Code'}
          </button>
        </div>

        <AppAuthButton onClick={handleVerifyOtp} loading={loading} disabled={loading || otp.length !== 6}>
          {loading ? 'Verifying...' : 'Verify & Continue'}
        </AppAuthButton>
      </div>
    </AppAuthLayout>
  );
};