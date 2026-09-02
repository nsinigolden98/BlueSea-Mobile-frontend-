import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppAuthLayout } from '../../components/app-auth/AppAuthLayout';
import { AppAuthButton } from '../../components/app-auth/AppAuthButton';
import { useAuth } from '@/context/AuthContext';
import { postRequest, ENDPOINTS, getCookie, deleteCookie } from '@/types';

export const AppAuthSuccessPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, refreshUser } = useAuth();

  useEffect(() => {
    const syncSession = async () => {
      const refCode = getCookie('ref');
      if (refCode) {
        try {
          await postRequest(ENDPOINTS.referral, { code: refCode });
          deleteCookie('ref');
        } catch (_) {
          // Ignore non-critical referral processing errors
        }
      }
      await refreshUser();
    };

    syncSession();
  }, [refreshUser]);

  const handleProceed = () => {
    const token = getCookie('access_token');
    if (isAuthenticated || token) {
      navigate('/dashboard', { replace: true });
    } else {
      navigate('/app-auth/login', { replace: true });
    }
  };

  return (
    <AppAuthLayout>
      <div className="flex-1 flex flex-col justify-center items-center text-center my-auto">
        <div className="w-20 h-20 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center mb-6 text-emerald-400">
          <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-white mb-2">Account Ready!</h1>
        <p className="text-sm text-slate-400 max-w-xs leading-relaxed mb-6">
          Your account setup and PIN security configuration are complete.
        </p>
      </div>

      <AppAuthButton onClick={handleProceed}>
        {isAuthenticated || getCookie('access_token') ? 'Go to Dashboard' : 'Proceed to Sign In'}
      </AppAuthButton>
    </AppAuthLayout>
  );
};