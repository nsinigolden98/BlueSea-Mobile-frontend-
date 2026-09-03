import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import { InternalTransferModal } from '@/components/wallet/InternalTransferModal';
import { useAuth } from '@/context/AuthContext';

interface DashboardPrimaryActionsProps {
  className?: string;
}

export function DashboardPrimaryActions({ className }: DashboardPrimaryActionsProps) {
  const navigate = useNavigate();
  const { refreshUser } = useAuth();
  const [transferOpen, setTransferOpen] = useState(false);

  const handleTransferSuccess = async () => {
    await refreshUser();
  };

  return (
    <>
      <div className={`grid grid-cols-3 gap-2.5 md:gap-3 ${className || ''}`}>
        {/* Internal Transfer */}
        <button
          onClick={() => setTransferOpen(true)}
          type="button"
          className="flex items-center justify-center gap-2 p-2.5 md:p-3 rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white shadow-xs hover:shadow-md shadow-sky-500/20 active:scale-[0.98] transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900 group h-12 md:h-13"
          aria-label="Internal Transfer"
        >
          <div className="w-7 h-7 rounded-xl bg-white/20 flex items-center justify-center shrink-0 border border-white/20">
            <Send className="w-3.5 h-3.5 md:w-4 md:h-4 text-white group-hover:scale-110 transition-transform" />
          </div>
          <span className="text-[11px] sm:text-xs font-bold truncate">
            Internal Transfer
          </span>
        </button>

        {/* Deposit */}
        <button
          onClick={() => navigate('/deposit')}
          type="button"
          className="flex items-center justify-center gap-2 p-2.5 md:p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-sky-500/40 dark:hover:border-sky-400/40 hover:bg-slate-50/80 dark:hover:bg-slate-800/50 text-slate-800 dark:text-slate-100 shadow-2xs hover:shadow-xs active:scale-[0.98] transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900 group h-12 md:h-13"
          aria-label="Deposit Funds"
        >
          <div className="w-7 h-7 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 flex items-center justify-center shrink-0 border border-emerald-500/20">
            <ArrowDownLeft className="w-3.5 h-3.5 md:w-4 md:h-4 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform" />
          </div>
          <span className="text-[11px] sm:text-xs font-bold truncate">
            Deposit
          </span>
        </button>

        {/* Withdrawal */}
        <button
          onClick={() => navigate('/withdraw')}
          type="button"
          className="flex items-center justify-center gap-2 p-2.5 md:p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-sky-500/40 dark:hover:border-sky-400/40 hover:bg-slate-50/80 dark:hover:bg-slate-800/50 text-slate-800 dark:text-slate-100 shadow-2xs hover:shadow-xs active:scale-[0.98] transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900 group h-12 md:h-13"
          aria-label="Withdraw Funds"
        >
          <div className="w-7 h-7 rounded-xl bg-sky-500/10 dark:bg-sky-500/20 flex items-center justify-center shrink-0 border border-sky-500/20">
            <ArrowUpRight className="w-3.5 h-3.5 md:w-4 md:h-4 text-sky-600 dark:text-sky-400 group-hover:scale-110 transition-transform" />
          </div>
          <span className="text-[11px] sm:text-xs font-bold truncate">
            Withdrawal
          </span>
        </button>
      </div>

      <InternalTransferModal
        isOpen={transferOpen}
        onClose={() => {
          setTransferOpen(false);
          handleTransferSuccess();
        }}
      />
    </>
  );
}