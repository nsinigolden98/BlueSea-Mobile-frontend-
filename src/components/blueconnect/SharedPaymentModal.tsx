import React, { useState, useEffect } from 'react';
import {
  X,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Building2,
  CreditCard,
  User,
  ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  PinModal,
  LoadingSpinner,
  TransactionModal,
  Toast
} from '@/components/ui-custom';
import type { Company, CompanyConfiguration, CustomerProfile } from '@/types/blueconnect';
import { blueConnectApi } from '@/services/blueconnectService';
import { formatCurrency, validateIdentifier } from '@/utils/blueconnectHelpers';

interface SharedPaymentModalProps {
  company: Company;
  config: CompanyConfiguration;
  onClose: () => void;
}

interface PinAuthMessage {
  success?: boolean;
  pin?: string;
  message?: string;
}

export const SharedPaymentModal: React.FC<SharedPaymentModalProps> = ({
  company,
  config,
  onClose
}) => {
  // Verification & Stepper State
  const [identifier, setIdentifier] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [verifiedProfile, setVerifiedProfile] = useState<CustomerProfile | null>(null);
  const [verificationError, setVerificationError] = useState('');
  const [activeStep, setActiveStep] = useState<'verify' | 'payment'>('verify');

  // Payment Selection & Processing State
  const [selectedPackageId, setSelectedPackageId] = useState<string>('');
  const [customAmount, setCustomAmount] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Existing Project Global Dialog Controllers
  const { showPinModal, PinComponent, message } = PinModal();
  const { ToastComponent, showToast } = Toast();

  // Execution & Transaction Modal States
  const [txModalOpen, setTxModalOpen] = useState(false);
  const [txSuccess, setTxSuccess] = useState<boolean | null>(null);
  const [txToastMessage, setTxToastMessage] = useState('');
  const [receiptData, setReceiptData] = useState<Record<string, any>>({});

  // Calculated final total
  const selectedPackage = config.packages?.find((p) => p.id === selectedPackageId);
  const finalAmount =
    config.paymentMode === 'package'
      ? selectedPackage?.amount || 0
      : Number(customAmount.replace(/,/g, '')) || 0;

  // React to PinModal completion
  useEffect(() => {
    if (message) {
      const pinMessage = message as PinAuthMessage;
      if (pinMessage.success) {
        handleExecutePayment(pinMessage.pin || '1234');
      } else {
        showToast(pinMessage.message || 'Authentication cancelled.');
      }
    }
  }, [message]);

  const handleVerify = async () => {
    if (!validateIdentifier(identifier, config.verificationField.validationRegex)) {
      setVerificationError(`Please enter a valid ${config.verificationField.label}`);
      return;
    }

    setVerifying(true);
    setVerificationError('');

    try {
      const profile = await blueConnectApi.verifyCustomer(company.id, identifier);
      setVerifiedProfile(profile);
      setActiveStep('payment');
    } catch (err: any) {
      setVerificationError(err.message || 'Verification failed. Reference code not found.');
    } finally {
      setVerifying(false);
    }
  };

  const handleInitiatePinAuth = () => {
    if (finalAmount <= 0) {
      showToast('Please select a package or enter a valid payment amount.');
      return;
    }
    showPinModal();
  };

  const handleExecutePayment = async (pin: string) => {
    setIsProcessing(true);
    setTxModalOpen(true);
    setTxSuccess(null);

    try {
      const res = await blueConnectApi.submitPayment({
        companyId: company.id,
        identifier,
        amount: finalAmount,
        packageId: selectedPackageId,
        pin
      });

      if (res.success) {
        setTxSuccess(true);
        setTxToastMessage(res.message);
        setReceiptData(res.receiptData || {});
      } else {
        setTxSuccess(false);
        setTxToastMessage(res.message);
      }
    } catch (err: any) {
      setTxSuccess(false);
      setTxToastMessage('Transaction engine error. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-xl bg-slate-950/60 animate-in fade-in duration-300">
      <div className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-[2.5rem] w-full max-w-lg overflow-hidden shadow-2xl">
        
        {/* Top Header */}
        <div className="p-6 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-slate-800/30">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 p-1.5 flex items-center justify-center shadow-xs">
                <img
                  src={company.logo}
                  alt={company.name}
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                      company.name
                    )}&background=0284c7&color=fff`;
                  }}
                />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-sm font-black text-slate-900 dark:text-white tracking-tight">
                    {company.name}
                  </h3>
                  <ShieldCheck className="w-4 h-4 text-sky-500 fill-sky-500/10" />
                </div>
                <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <Building2 className="w-3 h-3 text-sky-500" />
                  <span>Verified Merchant</span>
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 rounded-2xl transition-all active:scale-90"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Active Step Indicator */}
          <div className="flex items-center justify-between bg-slate-100 dark:bg-slate-800/60 p-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider">
            <div
              className={`flex-1 text-center py-1 rounded-lg transition-all ${
                activeStep === 'verify' ? 'bg-sky-500 text-white shadow-xs' : 'text-slate-400'
              }`}
            >
              1. Verification
            </div>
            <div
              className={`flex-1 text-center py-1 rounded-lg transition-all ${
                activeStep === 'payment' ? 'bg-sky-500 text-white shadow-xs' : 'text-slate-400'
              }`}
            >
              2. Plan & Amount
            </div>
          </div>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto scrollbar-none">
          
          {/* STEP 1: VERIFICATION */}
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between ml-1">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 flex items-center gap-1">
                  <User className="w-3 h-3 text-sky-500" />
                  <span>{config.verificationField.label}</span>
                </Label>
              </div>

              <div className="relative group">
                <Input
                  type={config.verificationField.type}
                  value={identifier}
                  onChange={(e) => {
                    setIdentifier(e.target.value);
                    setVerifiedProfile(null);
                    setVerificationError('');
                    setActiveStep('verify');
                  }}
                  placeholder={config.verificationField.placeholder}
                  className="bg-slate-50 dark:bg-slate-800/50 border-slate-200/80 dark:border-white/10 rounded-2xl h-13 text-xs font-bold focus:ring-sky-500 transition-all pr-24"
                />
                <Button
                  onClick={handleVerify}
                  disabled={verifying || !identifier}
                  className="absolute right-1.5 top-1.5 bottom-1.5 bg-sky-500 hover:bg-sky-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest px-4 transition-all"
                >
                  {verifying ? <LoadingSpinner size="sm" /> : 'Verify'}
                </Button>
              </div>

              {config.verificationField.helperText && (
                <p className="text-[10px] text-slate-400 dark:text-slate-500 ml-1 font-medium">
                  {config.verificationField.helperText}
                </p>
              )}

              {verificationError && (
                <div className="flex items-center gap-1.5 text-red-500 text-[10px] font-black ml-1 animate-shake">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{verificationError}</span>
                </div>
              )}
            </div>

            {/* Customer Profile Result */}
            {verifiedProfile && (
              <div className="p-4 bg-sky-500/5 border border-sky-500/20 rounded-2xl flex items-center justify-between animate-in zoom-in-95 duration-300">
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-2xl bg-white dark:bg-slate-800 border border-sky-500/20 flex items-center justify-center overflow-hidden shadow-xs">
                    <img
                      src={verifiedProfile.image}
                      alt={verifiedProfile.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <p className="text-xs font-black text-slate-900 dark:text-white">
                        {verifiedProfile.name}
                      </p>
                      <CheckCircle2 className="w-3.5 h-3.5 text-sky-500" />
                    </div>
                    <p className="text-[10px] font-bold text-slate-400 tracking-wider">
                      ID: {verifiedProfile.identifier}
                    </p>
                  </div>
                </div>
                <span className="text-[9px] font-black text-sky-500 bg-sky-500/10 px-2.5 py-1 rounded-lg uppercase tracking-wider">
                  Verified
                </span>
              </div>
            )}
          </div>

          {/* STEP 2: PAYMENT REVELATION */}
          {verifiedProfile && (
            <div className="space-y-5 pt-2 border-t border-slate-100 dark:border-white/5 animate-in slide-in-from-top-4 duration-400">
              
              {/* Package Selection */}
              {(config.paymentMode === 'package' || config.paymentMode === 'both') &&
                config.packages && (
                  <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1 flex items-center gap-1">
                      <CreditCard className="w-3 h-3 text-sky-500" />
                      <span>Select Package Option</span>
                    </Label>
                    <div className="grid grid-cols-1 gap-2.5">
                      {config.packages.map((pkg) => {
                        const isSelected = selectedPackageId === pkg.id;
                        return (
                          <div
                            key={pkg.id}
                            onClick={() => setSelectedPackageId(pkg.id)}
                            className={`p-4 rounded-2xl border transition-all duration-200 cursor-pointer flex items-center justify-between ${
                              isSelected
                                ? 'bg-sky-500/10 border-sky-500 shadow-sm'
                                : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200/80 dark:border-white/5 hover:border-slate-300'
                            }`}
                          >
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="text-xs font-black text-slate-900 dark:text-white">
                                  {pkg.name}
                                </p>
                                {pkg.badge && (
                                  <span className="bg-amber-500/10 text-amber-500 text-[8px] font-black px-2 py-0.5 rounded-md uppercase">
                                    {pkg.badge}
                                  </span>
                                )}
                              </div>
                              {pkg.description && (
                                <p className="text-[10px] text-slate-400 mt-1 font-medium">
                                  {pkg.description}
                                </p>
                              )}
                            </div>
                            <span className="text-xs font-black text-sky-500">
                              {formatCurrency(pkg.amount)}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

              {/* Amount Input */}
              {(config.paymentMode === 'amount' || config.paymentMode === 'both') && (
                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1 flex items-center gap-1">
                    <CreditCard className="w-3 h-3 text-sky-500" />
                    <span>Enter Custom Amount (₦)</span>
                  </Label>
                  <div className="relative group">
                    <Input
                      type="number"
                      value={customAmount}
                      onChange={(e) => setCustomAmount(e.target.value)}
                      placeholder="0.00"
                      className="bg-slate-50 dark:bg-slate-800/50 border-slate-200/80 dark:border-white/10 rounded-2xl h-14 text-lg font-black focus:ring-sky-500 pl-8"
                    />
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-lg font-black text-slate-300">
                      ₦
                    </span>
                  </div>

                  {/* Preset Quick Chips */}
                  {config.fixedAmounts && config.fixedAmounts.length > 0 && (
                    <div className="flex gap-2 overflow-x-auto scrollbar-none py-1">
                      {config.fixedAmounts.map((amt) => (
                        <button
                          key={amt}
                          onClick={() => setCustomAmount(amt.toString())}
                          className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-sky-500/10 hover:text-sky-500 text-slate-600 dark:text-slate-300 rounded-xl text-[10px] font-black transition-all cursor-pointer shrink-0"
                        >
                          +{formatCurrency(amt)}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Action Button */}
              <Button
                onClick={handleInitiatePinAuth}
                disabled={finalAmount <= 0 || isProcessing}
                className="w-full bg-sky-500 hover:bg-sky-600 text-white rounded-2xl h-14 text-xs font-black uppercase tracking-widest shadow-xl shadow-sky-500/20 transition-all active:scale-95 flex items-center justify-center gap-2 mt-4"
              >
                {isProcessing ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <>
                    <span>Pay {formatCurrency(finalAmount)}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* REUSED GLOBAL OVERLAYS */}
      {txModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 backdrop-blur-md bg-slate-950/60">
          <TransactionModal
            isSuccess={txSuccess}
            onClose={() => {
              setTxModalOpen(false);
              onClose();
            }}
            toastMessage={txToastMessage}
            transactionData={receiptData}
          />
        </div>
      )}

      <PinComponent
        type="withdrawal"
        value={{
          account_name: verifiedProfile?.name || company.name,
          account_number: identifier,
          bank_code: 'BLUECONNECT',
          bank_name: company.name,
          amount: finalAmount.toString()
        }}
      />

      <ToastComponent />
    </div>
  );
};