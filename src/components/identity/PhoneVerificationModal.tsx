import React from 'react';
import { X, Smartphone, ShieldAlert } from 'lucide-react';

interface PhoneVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  phoneDisplay: string;
  onSuccess: () => void;
}

export const PhoneVerificationModal: React.FC<PhoneVerificationModalProps> = ({
  isOpen,
  onClose,
  phoneDisplay,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-end md:items-center justify-center p-0 md:p-4">
      <div className="absolute inset-0" onClick={onClose} />
      <div className="relative bg-white dark:bg-slate-900 w-full md:max-w-md rounded-t-3xl md:rounded-3xl border border-slate-100 dark:border-slate-800 shadow-2xl overflow-hidden">
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-sky-500" />
            <h3 className="font-bold text-slate-900 dark:text-white text-base">Phone Verification</h3>
          </div>
          <button onClick={onClose} aria-label="Close" className="p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-amber-500 shrink-0" />
            <div>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-100">Phone verification is not simulated</p>
              <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                The supplied backend contract does not define a phone-verification request/OTP endpoint. Your registered number is {phoneDisplay}.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="w-full h-12 bg-sky-500 hover:bg-sky-600 text-white rounded-xl text-xs font-semibold">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
