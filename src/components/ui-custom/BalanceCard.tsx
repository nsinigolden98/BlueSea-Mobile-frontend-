import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Eye, EyeOff, Lock, Coins, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { getRequest, ENDPOINTS } from '@/types';

interface BalanceCardProps {
  showActions?: boolean;
  onDeposit?: () => void;
  onWithdraw?: () => void;
  className?: string;
  showBalance?: boolean;
  onToggleBalance?: (show: boolean) => void;
} 

export function BalanceCard({
  showActions = false,
  onDeposit,
  onWithdraw,
  className,
  showBalance,
  onToggleBalance
}: BalanceCardProps) {
  const { user } = useAuth();

  // 1. Fallback local state if props are not provided
  const [localShowBalance, setLocalShowBalance] = useState(() => {
    const savedState = localStorage.getItem('dashboard_showBalance');
    return savedState === 'true';
  });

  const isBalanceVisible = showBalance !== undefined ? showBalance : localShowBalance;

  const handleToggle = () => {
    const nextState = !isBalanceVisible;
    if (onToggleBalance) {
      onToggleBalance(nextState);
    } else {
      setLocalShowBalance(nextState);
      localStorage.setItem('dashboard_showBalance', String(nextState));
    }
  };

  // 2. State for the ACTUAL Reward Balance
  const [rewardBalance, setRewardBalance] = useState<number>(0);

  // Sync internal state when parent state updates if uncontrolled
  useEffect(() => {
    if (showBalance !== undefined) {
      localStorage.setItem('dashboard_showBalance', String(showBalance));
    }
  }, [showBalance]);

  // 3. Fetch the Reward Balance directly from the bonus_summary endpoint
  useEffect(() => {
    let isMounted = true;

    const fetchRewardBalance = async () => {
      try {
        const summaryRes = await getRequest(ENDPOINTS.bonus_summary);
        
        if (isMounted && summaryRes?.data) {
          setRewardBalance(summaryRes.data.current_points ?? 0);
        }
      } catch (error) {
        console.error("Failed to load reward balance for Balance Card", error);
      }
    };

    fetchRewardBalance();

    return () => { isMounted = false; };
  }, []);

  const lockedBalance = user?.lockedBalance || '₦0.00';
  const availableBalance = user?.balance || '₦0.00';

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl p-6',
        'bg-gradient-to-br from-sky-400 via-sky-500 to-sky-600',
        'shadow-lg shadow-sky-500/25',
        className
      )}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white" />
        <div className="absolute -bottom-10 -left-10 w-32 h-32 rounded-full bg-white" />
      </div>

      <div className="relative z-10 flex flex-col h-full">  
        {/* Available Balance Label & Closely Aligned Toggle */}
        <div className="flex items-center gap-2 mb-2">  
          <span className="text-sm text-sky-100 font-medium">Available Balance</span>  
          <button   
            onClick={handleToggle}  
            className="p-1 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"  
          >  
            {isBalanceVisible ? (  
              <EyeOff className="w-4 h-4 text-white" />  
            ) : (  
              <Eye className="w-4 h-4 text-white" />  
            )}  
          </button>  
        </div>  

        {/* Large Balance Amount */}
        <div className="mb-6">  
          <span className="text-3xl md:text-4xl font-bold text-white tracking-tight">  
            {isBalanceVisible ? `${availableBalance.toLocaleString()}` : '******'}  
          </span>  
        </div>  

        {/* Statistics Row */}
        <div className="flex flex-wrap gap-2">  
          {/* Locked Balance */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/20 backdrop-blur-md rounded-full border border-white/10">  
            <Lock className="w-3.5 h-3.5 text-sky-200" />  
            <span className="text-[11px] font-semibold text-white">
              Locked: {isBalanceVisible ? lockedBalance : '******'}
            </span>  
          </div>

          {/* Actual Reward Balance */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/20 backdrop-blur-md rounded-full border border-white/10">  
            <Coins className="w-3.5 h-3.5 text-amber-300" />  
            <span className="text-[11px] font-semibold text-white">
              {isBalanceVisible ? rewardBalance.toLocaleString() : '***'} BSP
            </span>  
          </div>

          {/* Account Status */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/20 backdrop-blur-md rounded-full border border-white/10">  
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />  
            <span className="text-[11px] font-semibold text-white">
              Verified
            </span>  
          </div>
        </div>  

        {showActions && (  
          <div className="flex gap-3 mt-6">  
            <button   
              onClick={onDeposit}  
              className="flex-1 py-2.5 px-4 bg-white/20 hover:bg-white/30 text-white font-medium rounded-xl transition-colors backdrop-blur-sm"  
            >  
              Deposit  
            </button>  
            <button   
              onClick={onWithdraw}  
              className="flex-1 py-2.5 px-4 bg-white/20 hover:bg-white/30 text-white font-medium rounded-xl transition-colors backdrop-blur-sm"  
            >  
              Withdraw  
            </button>  
          </div>  
        )}  
      </div>  
    </div>
  );
}
