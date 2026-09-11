import { useState } from 'react';
import { Landmark, Copy, Check, X } from 'lucide-react';

interface DedicatedVirtualAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  userData: {
    bank_name?: string;
    bank_slug?: string;
    bank_id?: number;
    account_number?: string | number;
    account_name?: string;
    customer_code?: string;
    active?: boolean;
  } | null;
  onRefreshAccount?: () => Promise<void> | void;
}

export function DedicatedVirtualAccountModal({
  isOpen,
  onClose,
  userData,
}: DedicatedVirtualAccountModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const bankName = userData?.bank_name;
  const accountNumber = userData?.account_number != null ? String(userData.account_number) : '';
  const accountName = userData?.account_name || '';


  const handleCopy = async () => {
    if (!accountNumber) return;
    try {
      await navigator.clipboard.writeText(accountNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error('Failed to copy account number:', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-xl bg-slate-950/40 animate-in fade-in duration-200">
      <div className="absolute inset-0" onClick={onClose} />
      <div className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-[2.5rem] p-6 sm:p-8 w-full max-w-md shadow-2xl z-10 animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-sky-500/10 rounded-2xl">
              <Landmark className="h-5 w-5 text-sky-500" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white tracking-tight">
                Dedicated Virtual Account
              </h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                Automated Bank Transfer
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-all cursor-pointer"
          >
            <X className="w-4 h-4 text-slate-400" />
          </button>
        </div>

        {/* Content Body */}
        {accountNumber ? (
          <div className="space-y-5">
            <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-white/5 rounded-2xl p-4 space-y-4">
              {bankName && (
                <div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
                    Bank Name
                  </span>
                  <p className="text-sm font-black text-slate-900 dark:text-white mt-0.5">
                    {bankName}
                  </p>
                </div>
              )}

              <div>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
                  Account Number
                </span>
                <div className="flex items-center justify-between mt-1 gap-3">
                  <p className="text-xl font-black text-sky-500 tracking-wider break-all">
                    {accountNumber}
                  </p>
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-sky-500/10 hover:bg-sky-500/20 text-sky-500 rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                        <span className="text-emerald-500 text-[11px]">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span className="text-[11px]">Copy</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {accountName && (
                <div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
                    Account Name
                  </span>
                  <p className="text-xs font-black text-slate-800 dark:text-slate-200 mt-0.5">
                    {accountName}
                  </p>
                </div>
              )}
            </div>

            <div className="bg-sky-500/5 border border-sky-500/10 rounded-2xl p-3.5 text-center">
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Transfers made to this account will automatically credit your BlueSea wallet with a <strong className="text-slate-700 dark:text-slate-200">1% processing fee</strong> applied.
              </p>
            </div>
          </div>
        ) : (
          <div className="text-center py-6 space-y-3">
            <p className="text-xs font-bold text-slate-600 dark:text-slate-300">
              Your dedicated account details are not available yet.
            </p>
            <p className="text-[11px] text-slate-400">
              Account details will appear here once the backend has assigned the dedicated account.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
