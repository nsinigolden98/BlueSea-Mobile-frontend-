import React, { useState, useEffect } from 'react';
import { X, Smartphone, MessageSquare, ShieldCheck, RefreshCw, ArrowLeft, AlertCircle } from 'lucide-react';
import type  { PhoneMethod } from '@/types/identity';
import { Input } from '@/components/ui/input';

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
  onSuccess,
}) => {
  const [step, setStep] = useState<'method' | 'otp' | 'success'>('method');
  const [selectedMethod, setSelectedMethod] = useState<PhoneMethod>('whatsapp');
  const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']);
  const [countdown, setCountdown] = useState<number>(60);
  const [isSending, setIsSending] = useState<boolean>(false);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step === 'otp' && countdown > 0) {
      timer = setInterval(() => setCountdown((prev) => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [step, countdown]);

  if (!isOpen) return null;

  const handleSendCode = () => {
    setIsSending(true);
    setErrorMsg(null);
    setTimeout(() => {
      setIsSending(false);
      setStep('otp');
      setCountdown(60);
    }, 1200);
  };

  const handleOtpChange = (index: number, value: string) => {
    const cleanVal = value.replace(/\D/g, '');
    if (!cleanVal && value !== '') return;

    const newOtp = [...otp];
    newOtp[index] = cleanVal.slice(-1);
    setOtp(newOtp);

    // Auto-focus next field
    if (cleanVal && index < 5) {
      const nextInput = document.getElementById(`otp-input-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-input-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pastedData.length === 6) {
      const digits = pastedData.split('');
      setOtp(digits);
      const lastInput = document.getElementById('otp-input-5');
      lastInput?.focus();
    }
  };

  const handleVerifyOtp = () => {
    const fullCode = otp.join('');
    if (fullCode.length !== 6) {
      setErrorMsg('Please enter all 6 digits of your verification code.');
      return;
    }

    setIsVerifying(true);
    setErrorMsg(null);

    setTimeout(() => {
      setIsVerifying(false);
      // Simulated OTP check (e.g., fails if code is 000000)
      if (fullCode === '000000') {
        setErrorMsg('That code is incorrect. Check the latest code sent to your phone and try again.');
      } else {
        setStep('success');
      }
    }, 1500);
  };

  const handleFinish = () => {
    onSuccess();
    onClose();
    setStep('method');
    setOtp(['', '', '', '', '', '']);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-end md:items-center justify-center p-0 md:p-4">
      <div className="bg-white dark:bg-slate-900 w-full md:max-w-md rounded-t-3xl md:rounded-3xl border border-slate-100 dark:border-slate-800 shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-200">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {step === 'otp' && (
              <button 
                onClick={() => setStep('method')} 
                className="p-1 -ml-1 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <h3 className="font-bold text-slate-900 dark:text-white text-base">
              {step === 'method' && 'Select Verification Method'}
              {step === 'otp' && 'Enter Verification Code'}
              {step === 'success' && 'Phone Verified'}
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
        <div className="p-6 space-y-5">
          {step === 'method' && (
            <>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                Choose how you would like to receive your 6-digit security code for <strong className="text-slate-900 dark:text-white font-semibold">{phoneDisplay}</strong>:
              </p>

              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => setSelectedMethod('whatsapp')}
                  className={`w-full p-4 rounded-2xl border text-left flex items-start gap-3.5 transition-all ${
                    selectedMethod === 'whatsapp'
                      ? 'border-sky-500 bg-sky-50/50 dark:bg-sky-950/30 ring-2 ring-sky-500/20'
                      : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <div className="p-2.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl shrink-0 mt-0.5">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900 dark:text-white">WhatsApp</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Receive your verification code instantly through WhatsApp.
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedMethod('sms')}
                  className={`w-full p-4 rounded-2xl border text-left flex items-start gap-3.5 transition-all ${
                    selectedMethod === 'sms'
                      ? 'border-sky-500 bg-sky-50/50 dark:bg-sky-950/30 ring-2 ring-sky-500/20'
                      : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <div className="p-2.5 bg-sky-500/10 text-sky-500 rounded-xl shrink-0 mt-0.5">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900 dark:text-white">SMS Text Message</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Receive your verification code by standard text message.
                    </p>
                  </div>
                </button>
              </div>

              <button
                onClick={handleSendCode}
                disabled={isSending}
                className="w-full h-12 bg-sky-500 hover:bg-sky-600 text-white rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
              >
                {isSending ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Send Code'}
              </button>
            </>
          )}

          {step === 'otp' && (
            <>
              <div className="text-center space-y-1">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Enter the 6-digit code sent via <span className="capitalize font-semibold text-slate-700 dark:text-slate-200">{selectedMethod}</span> to
                </p>
                <p className="text-sm font-bold font-mono text-slate-900 dark:text-white">{phoneDisplay}</p>
              </div>

              {/* OTP Input Boxes */}
              <div className="flex items-center justify-center gap-2 py-2" onPaste={handlePaste}>
                {otp.map((digit, idx) => (
                  <Input
                    key={idx}
                    id={`otp-input-${idx}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(idx, e)}
                    className="w-11 h-12 text-center font-mono text-lg font-bold bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-sky-500"
                  />
                ))}
              </div>

              {errorMsg && (
                <div className="p-3 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 rounded-xl flex items-start gap-2 text-xs text-red-600 dark:text-red-400">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setStep('method');
                    setOtp(['', '', '', '', '', '']);
                    setErrorMsg(null);
                  }}
                  className="text-sky-500 font-medium hover:underline"
                >
                  Change Method
                </button>

                <button
                  type="button"
                  disabled={countdown > 0}
                  onClick={() => {
                    setCountdown(60);
                    setErrorMsg(null);
                  }}
                  className="disabled:opacity-50 disabled:no-underline text-sky-500 font-medium hover:underline"
                >
                  {countdown > 0 ? `Resend Code in ${countdown}s` : 'Resend Code'}
                </button>
              </div>

              <button
                onClick={handleVerifyOtp}
                disabled={isVerifying || otp.join('').length !== 6}
                className="w-full h-12 bg-sky-500 hover:bg-sky-600 text-white rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-2 disabled:opacity-50 mt-4"
              >
                {isVerifying ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Confirm & Verify'}
              </button>
            </>
          )}

          {step === 'success' && (
            <div className="text-center py-4 space-y-4">
              <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <ShieldCheck className="w-9 h-9" />
              </div>

              <div>
                <h4 className="text-base font-bold text-slate-900 dark:text-white">Phone Number Verified!</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Your phone number <strong className="text-slate-800 dark:text-slate-200">{phoneDisplay}</strong> is now verified for security and notifications.
                </p>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 flex justify-between">
                <span>Method: <strong className="capitalize text-slate-700 dark:text-slate-200">{selectedMethod}</strong></span>
                <span>Status: <strong className="text-emerald-600 dark:text-emerald-400">Tier 1 Active</strong></span>
              </div>

              <button
                onClick={handleFinish}
                className="w-full h-12 bg-sky-500 hover:bg-sky-600 text-white rounded-xl text-xs font-semibold transition-colors shadow-sm"
              >
                Done
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};