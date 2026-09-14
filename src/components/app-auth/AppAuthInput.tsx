import React from 'react';

interface AppAuthInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string | null;
  prefixText?: string;
}

export const AppAuthInput: React.FC<AppAuthInputProps> = ({
  label,
  error,
  prefixText,
  className = '',
  ...props
}) => {
  return (
    <div className="w-full mb-5">
      {label && <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">{label}</label>}
      <div className="relative flex items-center">
        {prefixText && (
          <span className="absolute left-4 text-slate-400 font-medium select-none text-base">
            {prefixText}
          </span>
        )}
        <input
          className={`w-full bg-slate-800/80 border ${
            error ? 'border-red-500/80 focus:ring-red-500' : 'border-slate-700/80 focus:border-[#00D1FF] focus:ring-[#00D1FF]'
          } rounded-xl py-3.5 ${
            prefixText ? 'pl-16' : 'px-4'
          } pr-4 text-white placeholder-slate-500 text-base font-normal focus:outline-none focus:ring-1 transition-all ${className}`}
          {...props}
        />
      </div>
      {error && <p className="mt-1.5 text-xs text-red-400 font-medium">{error}</p>}
    </div>
  );
};