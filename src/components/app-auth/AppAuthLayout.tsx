import React from 'react';

interface AppAuthLayoutProps {
  children: React.ReactNode;
}

export const AppAuthLayout: React.FC<AppAuthLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen w-full bg-[#0F172A] text-white flex flex-col justify-between px-6 py-8 font-sans antialiased selection:bg-[#00D1FF] selection:text-black">
      <div className="w-full max-w-md mx-auto flex-1 flex flex-col justify-between">
        {children}
      </div>
    </div>
  );
};