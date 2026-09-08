import React, { useState, useEffect } from 'react';
import { X, Building2, Lock, RefreshCw } from 'lucide-react';
import type { BankOption } from '@/types/identity';
import { fetchBankList } from '@/services/identityVerification';
import { Input } from '@/components/ui/input';

interface FinancialIdentityModalProps {
  isOpen: boolean;
  onClose: () => void;
  userFullName: string;
  onSubmitted: () => void;
}

export const FinancialIdentityModal: React.FC<FinancialIdentityModalProps> = ({
  isOpen,
  onClose,
  userFullName,
  onSubmitted,
}) => {
  const [step, setStep] = useState<'form' | 'review' | 'pending'>('form');
  const [banks, setBanks] = useState<BankOption[]>([]);
  const [loadingBanks, setLoadingBanks] = useState<boolean>(false);

  const [bvn, setBvn] = useState<string>('');
  const [selectedBankCode, setSelectedBankCode] = useState<string>('');
  const [accountNumber, setAccountNumber] = useState<string>('');
  const [consent, setConsent] = useState<boolean>(false);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (!isOpen) return;

    let cancelled = false;
    const loadBanks = async () => {
      setLoadingBanks(true);
      try {
        const res = await fetchBankList();
        if (!cancelled) setBanks(res);
      } finally {
        if (!cancelled) setLoadingBanks(false);
      }
    };

    void loadBanks();
    return () => {
      cancelled = true;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleBvnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 11);
    setBvn(val);
  };

  const handleAccountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 10);
    setAccountNumber(val);
  };

  const validateForm = () => {
    const errs: Record<string, string> = {};
    if (bvn.length !== 11) errs.bvn = 'BVN must be exactly 11 digits.';
    if (!selectedBankCode) errs.bank = 'Please select your bank.';
    if (accountNumber.length !== 10) errs.account = 'Account number must be 10 digits.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleProceedToReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      setStep('review');
    }
  };

  const handleSubmitVerification = () => {
    if (!consent) return;
    setSubmitting(true);

    setTimeout(() => {
      setSubmitting(false);
      setStep('pending');
    }, 1500);
  };

  const selectedBankObj = banks.find((b) => b.code === selectedBankCode);

  const maskedBvn = bvn ? `******${bvn.slice(-4)}` : '';
  const maskedAcc = accountNumber ? `*******${accountNumber.slice(-4)}` : '';

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-end md:items-center justify-center p-0 md:p-4">
      <div className="bg-white dark:bg-slate-900 w-full md:max-w-lg rounded-t-3xl md:rounded-3xl border border-slate-100 dark:border-slate-800 shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-200">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-sky-500" />
            <h3 className="font-bold text-slate-900 dark:text-white text-base">
              Tier 2 - Financial Identity
            </h3>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[80vh] overflow-y-auto space-y-5">
          {step === 'form' && (
            <form onSubmit={handleProceedToReview} className="space-y-4">
              <div className="p-3.5 bg-sky-50/50 dark:bg-sky-950/30 border border-sky-100 dark:border-sky-900/40 rounded-2xl flex items-start gap-3">
                <Lock className="w-4 h-4 text-sky-500 shrink-0 mt-0.5" />
                <p className="text-xs text-sky-800 dark:text-sky-300 leading-relaxed">
                  Your Bank Verification Number (BVN) and bank account details confirm that your financial identity matches your BlueSea profile.
                </p>
              </div>

              {/* BVN */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Bank Verification Number (BVN)
                </label>
                <Input
                  type="password"
                  inputMode="numeric"
                  maxLength={11}
                  placeholder="Enter 11-digit BVN"
                  value={bvn}
                  onChange={handleBvnChange}
                  className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 font-mono tracking-widest"
                />
                {errors.bvn && <p className="text-[11px] text-red-500">{errors.bvn}</p>}
              </div>

              {/* Bank Select */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Select Bank
                </label>
                <select
                  value={selectedBankCode}
                  onChange={(e) => setSelectedBankCode(e.target.value)}
                  className="w-full h-11 px-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500"
                >
                  <option value="">{loadingBanks ? 'Loading banks...' : 'Select your bank'}</option>
                  {banks.map((b) => (
                    <option key={b.code} value={b.code}>{b.name}</option>
                  ))}
                </select>
                {errors.bank && <p className="text-[11px] text-red-500">{errors.bank}</p>}
              </div>

              {/* Account Number */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Bank Account Number
                </label>
                <Input
                  type="text"
                  inputMode="numeric"
                  maxLength={10}
                  placeholder="Enter 10-digit account number"
                  value={accountNumber}
                  onChange={handleAccountChange}
                  className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 font-mono"
                />
                {errors.account && <p className="text-[11px] text-red-500">{errors.account}</p>}
              </div>

              <button
                type="submit"
                className="w-full h-12 bg-sky-500 hover:bg-sky-600 text-white rounded-xl text-xs font-semibold transition-colors shadow-sm mt-2"
              >
                Review Information
              </button>
            </form>
          )}

          {step === 'review' && (
            <div className="space-y-5">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">Review Your Financial Details</h4>

              <div className="p-4 bg-slate-50 dark:bg-slate-950/60 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-3 text-xs">
                <div className="flex justify-between items-center py-1 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500 dark:text-slate-400">Account Holder Name</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{userFullName}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500 dark:text-slate-400">BVN</span>
                  <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">{maskedBvn}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500 dark:text-slate-400">Bank</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedBankObj?.name}</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-slate-500 dark:text-slate-400">Account Number</span>
                  <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">{maskedAcc}</span>
                </div>
              </div>

              <label className="flex items-start gap-3 cursor-pointer p-1">
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-slate-300 text-sky-500 focus:ring-sky-500"
                />
                <span className="text-xs text-slate-600 dark:text-slate-300">
                  I confirm that the information I provided is accurate and belongs to me.
                </span>
              </label>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStep('form')}
                  className="px-4 h-12 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={handleSubmitVerification}
                  disabled={!consent || submitting}
                  className="flex-1 h-12 bg-sky-500 hover:bg-sky-600 text-white rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {submitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Submit for Verification'}
                </button>
              </div>
            </div>
          )}

          {step === 'pending' && (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 bg-amber-100 dark:bg-amber-950/60 text-amber-500 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <RefreshCw className="w-8 h-8 animate-spin" />
              </div>

              <div>
                <h4 className="text-base font-bold text-slate-900 dark:text-white">Verification Pending</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs mx-auto">
                  Your financial identity submission is being processed asynchronously by our verification partner.
                </p>
              </div>

              <button
                onClick={() => {
                  onSubmitted();
                  onClose();
                }}
                className="w-full h-12 bg-sky-500 hover:bg-sky-600 text-white rounded-xl text-xs font-semibold transition-colors"
              >
                Return to Identity Center
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};