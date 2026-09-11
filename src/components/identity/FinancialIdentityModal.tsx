import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Building2, Lock, RefreshCw } from 'lucide-react';
import type { BankOption } from '@/types/identity';
import { fetchBankList } from '@/services/identityVerification';
import { Input } from '@/components/ui/input';
import { postRequest, getRequest, API_BASE } from '@/types';
import { encryptBvn } from '@/lib/security/bvnEncryption';

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
  const navigate = useNavigate();

  const [step, setStep] = useState<'form' | 'review' | 'pending'>('form');
  const [banks, setBanks] = useState<BankOption[]>([]);
  const [loadingBanks, setLoadingBanks] = useState<boolean>(false);

  const [bvn, setBvn] = useState<string>('');
  const [selectedBankCode, setSelectedBankCode] = useState<string>('');
  const [accountNumber, setAccountNumber] = useState<string>('');
  const [consent, setConsent] = useState<boolean>(false);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string>('');

  useEffect(() => {
    if (!isOpen) return;

    let cancelled = false;

    const loadBanks = async () => {
      setLoadingBanks(true);

      try {
        const res = await fetchBankList();

        if (!cancelled) {
          setBanks(res);
        }
      } catch (error) {
        console.error('Failed to load banks:', error);

        if (!cancelled) {
          setBanks([]);
        }
      } finally {
        if (!cancelled) {
          setLoadingBanks(false);
        }
      }
    };

    void loadBanks();

    return () => {
      cancelled = true;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleBvnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 11);

    setBvn(value);

    if (errors.bvn) {
      setErrors((previous) => {
        const next = { ...previous };
        delete next.bvn;
        return next;
      });
    }

    if (submitError) {
      setSubmitError('');
    }
  };

  const handleAccountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 10);

    setAccountNumber(value);

    if (errors.account) {
      setErrors((previous) => {
        const next = { ...previous };
        delete next.account;
        return next;
      });
    }

    if (submitError) {
      setSubmitError('');
    }
  };

  const handleBankChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedBankCode(e.target.value);

    if (errors.bank) {
      setErrors((previous) => {
        const next = { ...previous };
        delete next.bank;
        return next;
      });
    }

    if (submitError) {
      setSubmitError('');
    }
  };

  const validateForm = () => {
    const validationErrors: Record<string, string> = {};

    if (bvn.length !== 11) {
      validationErrors.bvn = 'BVN must be exactly 11 digits.';
    }

    if (!selectedBankCode) {
      validationErrors.bank = 'Please select your bank.';
    }

    if (accountNumber.length !== 10) {
      validationErrors.account = 'Account number must be 10 digits.';
    }

    setErrors(validationErrors);

    return Object.keys(validationErrors).length === 0;
  };

  const handleProceedToReview = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      setSubmitError('');
      setStep('review');
    }
  };

  const handleSubmitVerification = async () => {
    if (!consent || submitting) {
      return;
    }

    setSubmitError('');
    setSubmitting(true);

    try {
      /*
       * The backend expects the BVN to be RSA-encrypted before it is sent.
       * Do not send the raw BVN to the API.
       */
      const encryptedBvn = await encryptBvn(bvn);

      /*
       * The DVA assignment endpoint expects:
       *
       * first_name: string
       * last_name: string
       * account_number: string
       * bank_code: string
       * bvn: encrypted BVN
       *
       * account_number must remain a string because it is a 10-digit
       * Nigerian account number and must not be converted to a number.
       */
      const nameParts = userFullName
        .trim()
        .split(/\s+/)
        .filter(Boolean);

      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ');

      if (!firstName || !lastName) {
        throw new Error(
          'Your profile must contain both a first name and surname before financial verification can be submitted.',
        );
      }

      const payload = {
        first_name: firstName,
        last_name: lastName,
        account_number: accountNumber,
        bank_code: String(selectedBankCode),
        bvn: encryptedBvn,
      };

      /*
       * DVA ASSIGNMENT
       *
       * This is intentionally a normal authenticated REST request.
       * There is NO wallet WebSocket involved in assigning the DVA.
       */
      const response = await postRequest(
        `${API_BASE}/accounts/dva/assign/`,
        payload,
      );

      /*
       * postRequest returns response.data on success and the backend's
       * error body when Axios receives an HTTP error.
       *
       * Do not treat an error response as a successful submission.
       */
      if (
        !response ||
        response?.state === false ||
        response?.success === false
      ) {
        throw new Error(
          response?.message ||
            response?.detail ||
            response?.error ||
            'Financial identity verification could not be submitted.',
        );
      }

      /*
       * The assign endpoint's documented response does not contain the
       * generated DVA account object.
       *
       * Therefore, do NOT manufacture an account number, account name,
       * bank name, or DVA status here.
       *
       * Re-read the authenticated user preference/profile from the backend.
       */
      const profileResponse = await getRequest(
        `${API_BASE}/user_preference/user/`,
      );

      const profile =
        profileResponse?.data &&
        typeof profileResponse.data === 'object'
          ? profileResponse.data
          : profileResponse;

      /*
       * Tell Identity Center to refresh its backend-derived state.
       * The Identity Center remains the source of truth for verification
       * status and DVA information.
       */
      onSubmitted();

      /*
       * The backend profile may already contain the DVA after assignment.
       * We still do not invent or locally construct DVA information.
       */
      if (
        profile?.has_DVA === true &&
        profile?.dva_account &&
        typeof profile.dva_account === 'object'
      ) {
        console.log('DVA assignment confirmed by backend profile.');
      }

      setSubmitting(false);
      setStep('pending');
    } catch (error: unknown) {
      console.error('Financial identity submission failed:', error);

      const message =
        error instanceof Error
          ? error.message
          : 'Financial identity verification could not be submitted. Please try again.';

      setSubmitError(message);
      setSubmitting(false);
    }
  };

  const handleReturnToIdentityCenter = () => {
    /*
     * Refresh the backend-derived state before leaving the modal.
     */
    onSubmitted();

    onClose();

    /*
     * Explicitly navigate to Identity Center.
     * This fixes the previous behavior where the modal closed/reloaded
     * but did not actually route to the Identity Center.
     */
    navigate('/identity-center');
  };

  const selectedBankObj = banks.find(
    (bank) => bank.code === selectedBankCode,
  );

  const maskedBvn = bvn ? `******${bvn.slice(-4)}` : '';
  const maskedAcc = accountNumber
    ? `*******${accountNumber.slice(-4)}`
    : '';

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
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors disabled:opacity-50"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[80vh] overflow-y-auto space-y-5">

          {/* FORM */}
          {step === 'form' && (
            <form onSubmit={handleProceedToReview} className="space-y-4">

              <div className="p-3.5 bg-sky-50/50 dark:bg-sky-950/30 border border-sky-100 dark:border-sky-900/40 rounded-2xl flex items-start gap-3">
                <Lock className="w-4 h-4 text-sky-500 shrink-0 mt-0.5" />

                <p className="text-xs text-sky-800 dark:text-sky-300 leading-relaxed">
                  Your Bank Verification Number (BVN) and bank account details
                  confirm that your financial identity matches your BlueSea
                  profile.
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
                  autoComplete="off"
                  maxLength={11}
                  placeholder="Enter 11-digit BVN"
                  value={bvn}
                  onChange={handleBvnChange}
                  disabled={submitting}
                  className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 font-mono tracking-widest"
                />

                {errors.bvn && (
                  <p className="text-[11px] text-red-500">
                    {errors.bvn}
                  </p>
                )}
              </div>

              {/* Bank Select */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Select Bank
                </label>

                <select
                  value={selectedBankCode}
                  onChange={handleBankChange}
                  disabled={loadingBanks || submitting}
                  className="w-full h-11 px-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500 disabled:opacity-60"
                >
                  <option value="">
                    {loadingBanks
                      ? 'Loading banks...'
                      : 'Select your bank'}
                  </option>

                  {banks.map((bank) => (
                    <option key={bank.code} value={bank.code}>
                      {bank.name}
                    </option>
                  ))}
                </select>

                {errors.bank && (
                  <p className="text-[11px] text-red-500">
                    {errors.bank}
                  </p>
                )}
              </div>

              {/* Account Number */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Bank Account Number
                </label>

                <Input
                  type="text"
                  inputMode="numeric"
                  autoComplete="off"
                  maxLength={10}
                  placeholder="Enter 10-digit account number"
                  value={accountNumber}
                  onChange={handleAccountChange}
                  disabled={submitting}
                  className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 font-mono"
                />

                {errors.account && (
                  <p className="text-[11px] text-red-500">
                    {errors.account}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={loadingBanks || submitting}
                className="w-full h-12 bg-sky-500 hover:bg-sky-600 text-white rounded-xl text-xs font-semibold transition-colors shadow-sm mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Review Information
              </button>
            </form>
          )}

          {/* REVIEW */}
          {step === 'review' && (
            <div className="space-y-5">

              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                Review Your Financial Details
              </h4>

              <div className="p-4 bg-slate-50 dark:bg-slate-950/60 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-3 text-xs">

                <div className="flex justify-between items-center py-1 border-b border-slate-100 dark:border-slate-800 gap-4">
                  <span className="text-slate-500 dark:text-slate-400">
                    Account Holder Name
                  </span>

                  <span className="font-semibold text-slate-800 dark:text-slate-200 text-right">
                    {userFullName}
                  </span>
                </div>

                <div className="flex justify-between items-center py-1 border-b border-slate-100 dark:border-slate-800 gap-4">
                  <span className="text-slate-500 dark:text-slate-400">
                    BVN
                  </span>

                  <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
                    {maskedBvn}
                  </span>
                </div>

                <div className="flex justify-between items-center py-1 border-b border-slate-100 dark:border-slate-800 gap-4">
                  <span className="text-slate-500 dark:text-slate-400">
                    Bank
                  </span>

                  <span className="font-semibold text-slate-800 dark:text-slate-200 text-right">
                    {selectedBankObj?.name || 'Selected bank'}
                  </span>
                </div>

                <div className="flex justify-between items-center py-1 gap-4">
                  <span className="text-slate-500 dark:text-slate-400">
                    Account Number
                  </span>

                  <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
                    {maskedAcc}
                  </span>
                </div>
              </div>

              <label className="flex items-start gap-3 cursor-pointer p-1">
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={(e) => {
                    setConsent(e.target.checked);

                    if (submitError) {
                      setSubmitError('');
                    }
                  }}
                  disabled={submitting}
                  className="mt-0.5 h-4 w-4 rounded border-slate-300 text-sky-500 focus:ring-sky-500"
                />

                <span className="text-xs text-slate-600 dark:text-slate-300">
                  I confirm that the information I provided is accurate and
                  belongs to me.
                </span>
              </label>

              {submitError && (
                <p className="text-[11px] text-red-500 bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900/40 rounded-xl p-3">
                  {submitError}
                </p>
              )}

              <div className="flex gap-3 pt-2">

                <button
                  type="button"
                  onClick={() => {
                    if (!submitting) {
                      setSubmitError('');
                      setStep('form');
                    }
                  }}
                  disabled={submitting}
                  className="px-4 h-12 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
                >
                  Edit
                </button>

                <button
                  type="button"
                  onClick={handleSubmitVerification}
                  disabled={!consent || submitting}
                  className="flex-1 h-12 bg-sky-500 hover:bg-sky-600 text-white rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    'Submit for Verification'
                  )}
                </button>

              </div>
            </div>
          )}

          {/* SUBMISSION RESULT */}
          {step === 'pending' && (
            <div className="text-center py-6 space-y-4">

              <div className="w-16 h-16 bg-amber-100 dark:bg-amber-950/60 text-amber-500 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <RefreshCw className="w-8 h-8 animate-spin" />
              </div>

              <div>
                <h4 className="text-base font-bold text-slate-900 dark:text-white">
                  Verification Pending
                </h4>

                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs mx-auto">
                  Your financial identity submission has been sent to the
                  backend for processing.
                </p>
              </div>

              <button
                type="button"
                onClick={handleReturnToIdentityCenter}
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
