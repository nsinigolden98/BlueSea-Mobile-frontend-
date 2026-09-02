import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppAuthLayout } from '../../components/app-auth/AppAuthLayout';
import { AppAuthHeader } from '../../components/app-auth/AppAuthHeader';
import { AppAuthInput } from '../../components/app-auth/AppAuthInput';
import { AppAuthButton } from '../../components/app-auth/AppAuthButton';
import { validateGmail } from '../../utils/platform';
import { postRequest, ENDPOINTS } from '@/types';

export const AppForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleResetRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanEmail = email.trim().toLowerCase();

    if (!validateGmail(cleanEmail)) {
      setError('Only standard @gmail.com email addresses are allowed.');
      return;
    }

    try {
      setLoading(true);
      const endpoint = (ENDPOINTS as Record<string, any>).passwordResetRequest || '/accounts/password/reset/request/';
      const response = await postRequest(endpoint, { email: cleanEmail });

      if (response?.state !== false) {
        navigate('/app-auth/otp', { state: { email: cleanEmail, type: 'password_reset' } });
      } else {
        setError(response?.message || 'Password reset request failed.');
      }
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        'Password reset request failed.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppAuthLayout>
      <div>
        <AppAuthHeader
          title="Reset Password"
          subtitle="Enter your registered Gmail address to receive password reset instructions"
          onBack={() => navigate('/app-auth/login')}
        />

        <form onSubmit={handleResetRequest}>
          <AppAuthInput
            label="Gmail Address"
            type="email"
            placeholder="yourname@gmail.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (error) setError(null);
            }}
            error={error}
          />

          <AppAuthButton type="submit" loading={loading} disabled={loading || !email.trim()}>
            Send Reset OTP
          </AppAuthButton>
        </form>
      </div>
    </AppAuthLayout>
  );
};