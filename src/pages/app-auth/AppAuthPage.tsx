import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AppAuthLayout } from '../../components/app-auth/AppAuthLayout';
import { AppAuthButton } from '../../components/app-auth/AppAuthButton';

export const AppAuthPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <AppAuthLayout>
      <div className="flex-1 flex flex-col justify-center items-center text-center my-auto">
        <div className="w-16 h-16 bg-[#00D1FF]/10 rounded-2xl flex items-center justify-center mb-6 border border-[#00D1FF]/20">
          <span className="text-2xl font-black text-[#00D1FF]">BS</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white mb-3">BlueSea Mobile</h1>
        <p className="text-slate-400 text-sm max-w-xs leading-relaxed">
          Your modern financial suite. Fast, secure, and reliable banking solutions.
        </p>
      </div>

      <div className="space-y-4 w-full">
        <AppAuthButton
          variant="primary"
          onClick={() => navigate('/app-auth/login')}
        >
          Sign In
        </AppAuthButton>

        <AppAuthButton
          variant="secondary"
          onClick={() => navigate('/app-auth/signup')}
        >
          Create Account
        </AppAuthButton>
      </div>
    </AppAuthLayout>
  );
};