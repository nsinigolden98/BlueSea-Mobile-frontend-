import React, { useState } from 'react';
import { X, CheckCircle2, AlertCircle } from 'lucide-react';
import type { Company, VerifiedCustomer, PaymentReceipt } from '@/modules/blueconnect/types';
import { BlueConnectService } from '@/modules/blueconnect/services/blueconnect.service';

import { PinModal } from '@/components/ui-custom/PinModal';
import { Loader } from '@/components/ui-custom/Loader';

interface SharedPaymentModalProps {
  company: Company;
  onClose: () => void;
}

export const SharedPaymentModal: React.FC<SharedPaymentModalProps> = ({ company, onClose }) => {
  const [identifier, setIdentifier] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifiedCustomer, setVerifiedCustomer] = useState<VerifiedCustomer | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Payment selection state
  const [selectedPackageId, setSelectedPackageId] = useState<string>('');
  const [customAmount, setCustomAmount] = useState<string>('');

  // UI Custom Hook invocations
  const { showPinModal, hidePinModal, PinComponent } = PinModal();
  const { showLoader, hideLoader, LoaderComponent } = Loader();

  const [receipt, setReceipt] = useState<PaymentReceipt | null>(null);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim()) return;

    setIsVerifying(true);
    setError(null);
    try {
      const customer = await BlueConnectService.verifyCustomer(company.id, identifier);
      setVerifiedCustomer(customer);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Customer verification failed');
    } finally {
      setIsVerifying(false);
    }
  };

  const getFinalAmount = (): number => {
    if (company.config.paymentType === 'PACKAGE' || (company.config.paymentType === 'BOTH' && selectedPackageId)) {
      const pkg = company.config.packages?.find((p) => p.id === selectedPackageId);
      return pkg ? pkg.amount : 0;
    }
    return Number(customAmount) || company.config.amountConfig?.fixedAmount || 0;
  };

  const handleProceedToPin = () => {
    const amount = getFinalAmount();
    if (amount <= 0) {
      setError('Please select or enter a valid payment amount');
      return;
    }
    setError(null);
    showPinModal();
  };

  const handlePinSubmit = async (pinData?: unknown) => {
    const pin = typeof pinData === 'string' ? pinData : '1234';
    hidePinModal();
    showLoader();
    try {
      const res = await BlueConnectService.submitPayment({
        companyId: company.id,
        customerIdentifier: identifier,
        packageId: selectedPackageId,
        amount: getFinalAmount(),
        pin
      });
      setReceipt(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Transaction authorization failed');
    } finally {
      hideLoader();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* MODAL HEADER */}
        <div className="p-4 border-b border-slate-100 dark:border-white/5 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs ${company.logoBg}`}>
              {company.logoText}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100">{company.name}</h3>
                {company.isVerified && <CheckCircle2 className="w-3.5 h-3.5 text-sky-500" />}
              </div>
              <p className="text-[10px] text-slate-400 dark:text-slate-500">BlueConnect Verified Gateway</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* MODAL BODY */}
        <div className="p-4 overflow-y-auto space-y-4 text-xs">
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl text-red-600 dark:text-red-400 flex items-center gap-2 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* STEP 1: VERIFICATION */}
          {!verifiedCustomer ? (
            <form onSubmit={handleVerify} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {company.config.verificationField.label}
                </label>
                <input
                  type={company.config.verificationField.type}
                  placeholder={company.config.verificationField.placeholder}
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  required
                  className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-white/5 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-hidden focus:border-sky-500"
                />
              </div>

              <button
                type="submit"
                disabled={isVerifying || !identifier.trim()}
                className="w-full py-2.5 bg-sky-500 hover:bg-sky-600 text-white rounded-xl font-bold transition-all disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
              >
                {isVerifying ? 'Verifying...' : 'Verify Customer Details'}
              </button>
            </form>
          ) : (
            /* STEP 2 & 3: VERIFIED DETAILS & PAYMENT SPECIFICATION */
            <div className="space-y-4">
              <div className="p-3 bg-sky-50/50 dark:bg-sky-500/5 border border-sky-200/60 dark:border-sky-500/10 rounded-xl flex items-center gap-3">
                {verifiedCustomer.avatarUrl && (
                  <img src={verifiedCustomer.avatarUrl} alt="" className="w-9 h-9 rounded-full object-cover" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-slate-900 dark:text-slate-100 truncate">{verifiedCustomer.fullName}</p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{verifiedCustomer.identifier}</p>
                </div>
                <span className="px-2 py-0.5 text-[9px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full border border-emerald-500/20">
                  {verifiedCustomer.status}
                </span>
              </div>

              {/* DYNAMIC PACKAGE SELECTION */}
              {company.config.packages && company.config.packages.length > 0 && (
                <div className="space-y-2">
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300">
                    Select Package
                  </label>
                  <div className="space-y-1.5">
                    {company.config.packages.map((pkg) => (
                      <div
                        key={pkg.id}
                        onClick={() => setSelectedPackageId(pkg.id)}
                        className={`p-2.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                          selectedPackageId === pkg.id
                            ? 'border-sky-500 bg-sky-50/30 dark:bg-sky-500/10'
                            : 'border-slate-200/80 dark:border-white/5 bg-slate-50/50 dark:bg-slate-800/30'
                        }`}
                      >
                        <div>
                          <p className="font-bold text-slate-800 dark:text-slate-200">{pkg.name}</p>
                          {pkg.description && (
                            <p className="text-[10px] text-slate-400 dark:text-slate-500">{pkg.description}</p>
                          )}
                        </div>
                        <span className="font-bold text-sky-600 dark:text-sky-400">
                          ₦{pkg.amount.toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {company.config.paymentType === 'AMOUNT' && (
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Enter Amount (₦)
                  </label>
                  <input
                    type="number"
                    value={company.config.amountConfig?.fixedAmount || customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    disabled={!!company.config.amountConfig?.fixedAmount}
                    placeholder="0.00"
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-white/5 rounded-xl text-xs font-bold text-slate-900 dark:text-slate-100"
                  />
                </div>
              )}

              <button
                onClick={handleProceedToPin}
                className="w-full py-3 bg-sky-500 hover:bg-sky-600 text-white rounded-xl font-bold transition-all shadow-xs cursor-pointer"
              >
                Continue to Payment
              </button>
            </div>
          )}
        </div>
      </div>

      {/* RENDER PIN MODAL HOOK SUB-COMPONENT */}
      <PinComponent onSuccess={handlePinSubmit} />

      {/* RENDER LOADER HOOK SUB-COMPONENT */}
      <LoaderComponent />

      {/* TRANSACTION RECEIPT MODAL */}
      {receipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-white/10 shadow-xl space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-500 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Payment Successful</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{receipt.companyName}</p>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl text-left space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Tx Ref</span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{receipt.transactionId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Amount Paid</span>
                <span className="font-bold text-sky-600 dark:text-sky-400">₦{receipt.amount.toLocaleString()}</span>
              </div>
            </div>
            <button
              onClick={() => {
                setReceipt(null);
                onClose();
              }}
              className="w-full py-2.5 bg-sky-500 hover:bg-sky-600 text-white rounded-xl font-bold text-xs cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
};