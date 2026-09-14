import React from 'react';
import { X, ShieldCheck, Lock, Award, ArrowRight } from 'lucide-react';

interface WhyVerifySheetProps {
  isOpen: boolean;
  onClose: () => void;
  tierTitle: string;
  explanation: string;
  unlockedFeatures: string[];
}

export const WhyVerifySheet: React.FC<WhyVerifySheetProps> = ({
  isOpen,
  onClose,
  tierTitle,
  explanation,
  unlockedFeatures,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-end md:items-center justify-center p-0 md:p-4">
      <div className="bg-white dark:bg-slate-900 w-full md:max-w-md rounded-t-3xl md:rounded-3xl border border-slate-100 dark:border-slate-800 shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-200">
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-sky-500" />
            <h3 className="font-bold text-slate-900 dark:text-white text-base">Why Verify - {tierTitle}</h3>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Purpose & Protection</h4>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">{explanation}</p>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">What You Unlock</h4>
            <ul className="mt-2 space-y-2">
              {unlockedFeatures.map((feat, idx) => (
                <li key={idx} className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-200">
                  <Award className="w-4 h-4 text-sky-500 shrink-0" />
                  <span>{feat}</span>
                </li>
              ))}
            </ul>
          </div>

          <button onClick={onClose} className="w-full h-11 bg-sky-500 text-white rounded-xl text-xs font-semibold mt-2">
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};

interface RestrictionSheetProps {
  isOpen: boolean;
  onClose: () => void;
  requiredTier: string;
  featureName: string;
  onStartVerification: () => void;
}

export const VerificationRestrictionSheet: React.FC<RestrictionSheetProps> = ({
  isOpen,
  onClose,
  requiredTier,
  featureName,
  onStartVerification,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-end md:items-center justify-center p-0 md:p-4">
      <div className="bg-white dark:bg-slate-900 w-full md:max-w-md rounded-t-3xl md:rounded-3xl border border-slate-100 dark:border-slate-800 shadow-2xl overflow-hidden p-6 text-center space-y-4">
        <div className="w-14 h-14 bg-amber-100 dark:bg-amber-950/60 text-amber-500 rounded-full flex items-center justify-center mx-auto">
          <Lock className="w-7 h-7" />
        </div>

        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Verification Required</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Access to <strong className="text-slate-800 dark:text-slate-200">{featureName}</strong> requires completing <strong>{requiredTier}</strong> identity verification.
          </p>
        </div>

        <div className="flex gap-3 pt-2">
          <button onClick={onClose} className="flex-1 h-11 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold">
            Not Now
          </button>
          <button
            onClick={() => {
              onClose();
              onStartVerification();
            }}
            className="flex-1 h-11 bg-sky-500 hover:bg-sky-600 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5"
          >
            <span>Continue Verification</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};