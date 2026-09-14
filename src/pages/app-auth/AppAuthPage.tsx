import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AppAuthLayout } from '../../components/app-auth/AppAuthLayout';
import { AppAuthButton } from '../../components/app-auth/AppAuthButton';

export const AppAuthPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <AppAuthLayout>
      <div className="flex-1 flex flex-col justify-center items-center text-center my-auto">
        
        {/* ========================================================= */}
        {/* STATIC CIRCULAR BRAND LOGO DESIGN (EXTRACTED FROM LOADER) */}
        {/* ========================================================= */}
        <div className="relative w-24 h-24 flex items-center justify-center mb-8">
          
          {/* LAYER 3: OUTER ECHO ACCENT RING */}
          <div className="absolute -inset-3 rounded-full border border-[#38bdf8]/30 pointer-events-none" />

          {/* LAYER 2: ROTATING RING (STATIC EMBEDDED FRAME) */}
          <div className="absolute -inset-1.5 rounded-full border-2 border-[#38bdf8]/40 border-t-[#38bdf8] border-r-[#38bdf8]/60 pointer-events-none" />

          {/* LAYER 1: CENTER GRADIENT LOGO DISK */}
          <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-[#38bdf8] via-[#0ea5e9] to-[#0284c7] flex items-center justify-center shadow-[0_0_30px_rgba(14,165,233,0.45)] z-10">
            {/* LOGO TEXT */}
            <span className="text-white font-extrabold text-2xl tracking-tighter select-none">
              BS
            </span>

            {/* INNER HIGHLIGHT EDGE */}
            <div className="absolute inset-0 rounded-full border-2 border-white/25 pointer-events-none" />
          </div>

        </div>
        {/* ========================================================= */}

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