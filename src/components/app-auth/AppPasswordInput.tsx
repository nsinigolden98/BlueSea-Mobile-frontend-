import React, { useState } from 'react';

interface AppPasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string | null;
}

export const AppPasswordInput: React.FC<AppPasswordInputProps> = ({
  label = 'Password',
  error,
  className = '',
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="w-full mb-5">
      {label && <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">{label}</label>}
      <div className="relative flex items-center">
        <input
          type={showPassword ? 'text' : 'password'}
          className={`w-full bg-slate-800/80 border ${
            error ? 'border-red-500/80 focus:ring-red-500' : 'border-slate-700/80 focus:border-[#00D1FF] focus:ring-[#00D1FF]'
          } rounded-xl py-3.5 px-4 pr-12 text-white placeholder-slate-500 text-base font-normal focus:outline-none focus:ring-1 transition-all ${className}`}
          {...props}
        />
        <button
          type="button"
          onClick={() => setShowPassword((prev) => !prev)}
          className="absolute right-4 text-slate-400 hover:text-slate-200 focus:outline-none"
        >
          {showPassword ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-7 0-10-7-10-7a19.05 19.05 0 015.025-5.525m3.2-1.225A9.956 9.956 0 0112 5c7 0 10 7 10 7a18.96 18.96 0 01-2.925 3.975M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3l18 18" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          )}
        </button>
      </div>
      {error && <p className="mt-1.5 text-xs text-red-400 font-medium">{error}</p>}
    </div>
  );
};