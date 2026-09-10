import React, { useMemo, useState, useEffect } from 'react';
import { X, Building2, Lock, RefreshCw, Search, ChevronDown } from 'lucide-react';
import type { BankOption, DvaAssignPayload } from '@/types/identity';
import { postRequest, ENDPOINTS } from '@/types';
import { NIGERIAN_BANKS } from '@/data';
import { encryptBvn } from '@/lib/security/bvnEncryption';
import { Input } from '@/components/ui/input';

interface FinancialIdentityModalProps {
  isOpen: boolean;
  onClose: () => void;
  userFullName: string;
  firstName: string;
  lastName: string;
  profilePhone?: string;
  onSubmitted: () => Promise<void> | void;
}

interface ApiResponse {
  success?: boolean;
  message?: string;
  error?: string;
  account_number?: string;
  bank_code?: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
}

const BANK_OPTIONS: BankOption[] = NIGERIAN_BANKS.map((bank) => ({
  code: String(bank.code),
  name: bank.name,
}));

export const FinancialIdentityModal: React.FC<FinancialIdentityModalProps> = ({
  isOpen,
  onClose,
  userFullName,
  firstName,
  lastName,
  profilePhone,
  onSubmitted,
}) => {
  const [step, setStep] = useState<'form' | 'review'>('form');
  const [bvn, setBvn] = useState('');
  const [selectedBankCode, setSelectedBankCode] = useState('');
  const [bankSearch, setBankSearch] = useState('');
  const [isBankDropdownOpen, setIsBankDropdownOpen] = useState(false);
  const [accountNumber, setAccountNumber] = useState('');
  const [phone, setPhone] = useState(profilePhone || '');
  const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setStep('form');
    setBvn('');
    setSelectedBankCode('');
    setBankSearch('');
    setIsBankDropdownOpen(false);
    setAccountNumber('');
    setPhone(profilePhone || '');
    setConsent(false);
    setErrors({});
    setSubmitting(false);
  }, [isOpen, profilePhone]);

  const selectedBank = useMemo(
    () => BANK_OPTIONS.find((bank) => bank.code === selectedBankCode),
    [selectedBankCode]
  );

  const filteredBanks = useMemo(() => {
    const query = bankSearch.trim().toLowerCase();
    if (!query) return BANK_OPTIONS;
    return BANK_OPTIONS.filter((bank) => bank.name.toLowerCase().includes(query));
  }, [bankSearch]);

  if (!isOpen) return null;

  const handleBvnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBvn(e.target.value.replace(/\D/g, '').slice(0, 11));
    setErrors((prev) => ({ ...prev, bvn: '' }));
  };

  const handleAccountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAccountNumber(e.target.value.replace(/\D/g, '').slice(0, 10));
    setErrors((prev) => ({ ...prev, account: '' }));
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhone(e.target.value.replace(/[^\d+]/g, '').slice(0, 15));
    setErrors((prev) => ({ ...prev, phone: '' }));
  };

  const validateForm = () => {
    const nextErrors: Record<string, string> = {};

    if (bvn.length !== 11) nextErrors.bvn = 'BVN must be exactly 11 digits.';
    if (!selectedBankCode) nextErrors.bank = 'Please select your bank.';
    if (accountNumber.length !== 10) nextErrors.account = 'Account number must be 10 digits.';

    if (!profilePhone && !phone.trim()) {
      nextErrors.phone = 'Phone number is required because it is not available in your profile.';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleProceedToReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) setStep('review');
  };

  const handleSelectBank = (bank: BankOption) => {
    setSelectedBankCode(bank.code);
    setBankSearch(bank.name);
    setIsBankDropdownOpen(false);
    setErrors((prev) => ({ ...prev, bank: '' }));
  };

  const handleBankKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredBanks.length > 0) handleSelectBank(filteredBanks[0]);
    }
    if (e.key === 'Escape') setIsBankDropdownOpen(false);
  };

  const handleSubmitVerification = async () => {
    if (!consent || submitting) return;

    setSubmitting(true);
    setErrors({});

    try {
      const encryptedBvn = encryptBvn(bvn);
      const payload: DvaAssignPayload = {
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        account_number: accountNumber,
        bank_code: selectedBankCode,
        bvn: encryptedBvn,
      };

      if (!profilePhone && phone.trim()) {
        payload.phone = phone.trim();
      }

      const response = (await postRequest(ENDPOINTS.dvaAssign, payload)) as ApiResponse | undefined;

      if (!response) {
        throw new Error('No response was received from the server.');
      }

      if (response.success === false || response.error) {
        throw new Error(response.message || response.error || 'Unable to assign your dedicated account.');
      }

      // A successful response is the backend result. Do not simulate a pending state.
      await onSubmitted();
      onClose();
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        'Unable to complete verification. Please check your details and try again.';

      setErrors({ submit: message });
    } finally {
      setSubmitting(false);
    }
  };

  const maskedBvn = bvn ? `*******${bvn.slice(-4)}` : '';
  const maskedAcc = accountNumber ? `******${accountNumber.slice(-4)}` : '';

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-end md:items-center justify-center p-0 md:p-4">
      <div className="absolute inset-0" onClick={submitting ? undefined : onClose} />
      <div className="relative bg-white dark:bg-slate-900 w-full md:max-w-lg rounded-t-3xl md:rounded-3xl border border-slate-100 dark:border-slate-800 shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-200">
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-sky-500" />
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">Financial Identity & Dedicated Account</h3>
              <p className="text-[10px] text-slate-400 mt-0.5">BVN verification is required for your dedicated account</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={submitting}
            className="p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors disabled:opacity-50"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 max-h-[82vh] overflow-y-auto space-y-5">
          {step === 'form' && (
            <form onSubmit={handleProceedToReview} className="space-y-4">
              <div className="p-3.5 bg-sky-50/50 dark:bg-sky-950/30 border border-sky-100 dark:border-sky-900/40 rounded-2xl flex items-start gap-3">
                <Lock className="w-4 h-4 text-sky-500 shrink-0 mt-0.5" />
                <p className="text-xs text-sky-800 dark:text-sky-300 leading-relaxed">
                  Your BVN is encrypted in the app before it is sent to the backend. Your raw BVN is not stored in browser storage.
                </p>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Bank Verification Number (BVN)</label>
                <Input
                  type="password"
                  inputMode="numeric"
                  maxLength={11}
                  placeholder="Enter 11-digit BVN"
                  value={bvn}
                  onChange={handleBvnChange}
                  autoComplete="off"
                  className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 font-mono tracking-widest"
                />
                {errors.bvn && <p className="text-[11px] text-red-500">{errors.bvn}</p>}
              </div>

              <div className="space-y-1 relative">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Select Bank</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={bankSearch}
                    onChange={(e) => {
                      setBankSearch(e.target.value);
                      setSelectedBankCode('');
                      setIsBankDropdownOpen(true);
                      setErrors((prev) => ({ ...prev, bank: '' }));
                    }}
                    onFocus={() => setIsBankDropdownOpen(true)}
                    onKeyDown={handleBankKeyDown}
                    placeholder="Search bank name"
                    autoComplete="off"
                    className="w-full h-11 pl-9 pr-9 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                  <ChevronDown className={`absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 transition-transform ${isBankDropdownOpen ? 'rotate-180' : ''}`} />
                </div>

                {isBankDropdownOpen && (
                  <>
                    <button type="button" className="fixed inset-0 z-10 cursor-default" onClick={() => setIsBankDropdownOpen(false)} aria-label="Close bank list" />
                    <div className="absolute z-20 mt-1 w-full max-h-56 overflow-y-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl">
                      {filteredBanks.length > 0 ? (
                        filteredBanks.map((bank) => (
                          <button
                            type="button"
                            key={bank.code}
                            onClick={() => handleSelectBank(bank)}
                            className={`w-full px-3 py-2.5 text-left text-xs hover:bg-sky-50 dark:hover:bg-slate-800 transition-colors ${selectedBankCode === bank.code ? 'bg-sky-50 dark:bg-sky-950/30 text-sky-600' : 'text-slate-700 dark:text-slate-200'}`}
                          >
                            <span className="font-semibold">{bank.name}</span>
                            <span className="block text-[10px] text-slate-400 mt-0.5">Code: {bank.code}</span>
                          </button>
                        ))
                      ) : (
                        <p className="px-3 py-4 text-xs text-slate-400">No matching bank found.</p>
                      )}
                    </div>
                  </>
                )}
                {errors.bank && <p className="text-[11px] text-red-500">{errors.bank}</p>}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Bank Account Number</label>
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

              {!profilePhone && (
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Phone Number</label>
                  <Input
                    type="tel"
                    inputMode="tel"
                    placeholder="Enter your phone number"
                    value={phone}
                    onChange={handlePhoneChange}
                    autoComplete="tel"
                    className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800"
                  />
                  <p className="text-[10px] text-slate-400">Only required because no phone number is available in your profile.</p>
                  {errors.phone && <p className="text-[11px] text-red-500">{errors.phone}</p>}
                </div>
              )}

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
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">Review Your Financial Details</h4>
                <p className="text-[11px] text-slate-400 mt-1">The backend will verify these details and assign your dedicated account.</p>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-950/60 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-3 text-xs">
                <div className="flex justify-between items-center py-1 border-b border-slate-100 dark:border-slate-800 gap-4">
                  <span className="text-slate-500 dark:text-slate-400">Account Holder Name</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 text-right">{userFullName}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500 dark:text-slate-400">BVN</span>
                  <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">{maskedBvn}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-100 dark:border-slate-800 gap-4">
                  <span className="text-slate-500 dark:text-slate-400">Bank</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 text-right">{selectedBank?.name}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500 dark:text-slate-400">Account Number</span>
                  <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">{maskedAcc}</span>
                </div>
                {!profilePhone && (
                  <div className="flex justify-between items-center py-1">
                    <span className="text-slate-500 dark:text-slate-400">Phone</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{phone}</span>
                  </div>
                )}
              </div>

              <label className="flex items-start gap-3 cursor-pointer p-1">
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                  disabled={submitting}
                  className="mt-0.5 h-4 w-4 rounded border-slate-300 text-sky-500 focus:ring-sky-500"
                />
                <span className="text-xs text-slate-600 dark:text-slate-300">
                  I confirm that the information I provided is accurate and belongs to me.
                </span>
              </label>

              {errors.submit && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-600 dark:text-red-400">
                  {errors.submit}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStep('form')}
                  disabled={submitting}
                  className="px-4 h-12 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={handleSubmitVerification}
                  disabled={!consent || submitting}
                  className="flex-1 h-12 bg-sky-500 hover:bg-sky-600 text-white rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {submitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Verify & Assign Account'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
