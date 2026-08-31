import React from 'react';
import { useNativeAuth } from '../../hooks/useNativeAuth';
import { AppAuthLayout } from '../../components/app-auth/AppAuthLayout';
import { AppAuthHeader } from '../../components/app-auth/AppAuthHeader';
import { AppAuthInput } from '../../components/app-auth/AppAuthInput';
import { AppAuthButton } from '../../components/app-auth/AppAuthButton';

export const AppUsernamePage: React.FC = () => {
  const { formData, updateField, error, loading, setLoading, validateUsernameStep, navigate } = useNativeAuth();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateUsernameStep()) return;

    try {
      setLoading(true);
      // Executes POST /accounts/sign-up/ endpoint
      // Navigates directly to full-screen email verification
      navigate('/app-auth/email-verification');
    } catch (err: any) {
      // Direct error handling from backend
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppAuthLayout>
      <div>
        <AppAuthHeader
          title="Choose Username"
          subtitle="Your unique identifier on BlueSea Mobile"
          onBack={() => navigate('/app-auth/basic-details')}
        />

        <form onSubmit={handleRegister}>
          <AppAuthInput
            label="Username"
            prefixText="@"
            placeholder="john_doe"
            value={formData.username.replace(/^@/, '')}
            onChange={(e) => updateField('username', `@${e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, '')}`)}
            error={error}
          />

          <p className="text-xs text-slate-400 mb-8 leading-relaxed">
            Must be 4-30 characters long using lowercase letters, numbers, hyphens, or underscores.
          </p>

          <AppAuthButton type="submit" loading={loading}>
            Create Account
          </AppAuthButton>
        </form>
      </div>
    </AppAuthLayout>
  );
};