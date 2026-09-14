import React from 'react';

interface AppAuthButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
  loading?: boolean;
}

export const AppAuthButton: React.FC<AppAuthButtonProps> = ({
  children,
  variant = 'primary',
  loading = false,
  disabled,
  className = '',
  ...props
}) => {
  const baseStyles = 'w-full py-4 rounded-xl font-semibold text-base transition-all duration-200 flex items-center justify-center space-x-2 active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none';

  const variants = {
    primary: 'bg-[#00D1FF] text-slate-950 hover:bg-[#00B8E6] shadow-lg shadow-[#00D1FF]/20',
    secondary: 'bg-slate-800 text-white hover:bg-slate-700 border border-slate-700/80',
    outline: 'border border-slate-700 text-slate-300 hover:bg-slate-800/50 hover:text-white',
  };

  return (
    <button
      disabled={disabled || loading}
      className={`${baseStyles} ${variants[variant]} ${className}`}
      {...props}
    >
      {loading ? (
        <svg className="animate-spin h-5 w-5 text-current" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      ) : (
        children
      )}
    </button>
  );
};