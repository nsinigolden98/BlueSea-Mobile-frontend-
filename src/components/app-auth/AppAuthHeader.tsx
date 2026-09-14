import React from 'react';

interface AppAuthHeaderProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  showBack?: boolean;
}

export const AppAuthHeader: React.FC<AppAuthHeaderProps> = ({
  title,
  subtitle,
  onBack,
  showBack = true,
}) => {
  return (
    <div className="w-full mb-8">
      {showBack && onBack && (
        <button
          onClick={onBack}
          type="button"
          className="mb-6 p-2 -ml-2 rounded-full text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors"
          aria-label="Go back"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      )}
      <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-2">{title}</h1>
      {subtitle && <p className="text-sm text-slate-400 font-normal leading-relaxed">{subtitle}</p>}
    </div>
  );
};