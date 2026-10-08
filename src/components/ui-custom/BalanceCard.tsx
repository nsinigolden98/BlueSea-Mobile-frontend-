import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import {
  Eye,
  EyeOff,
  Lock,
  Coins,
  ShieldCheck,
  RefreshCw,
  Check,
  AlertCircle,
} from 'lucide-react';
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
  onToggleBalance,
}: BalanceCardProps) {
  const { user, refreshUser } = useAuth();

  // Balance visibility
  const [localShowBalance, setLocalShowBalance] = useState(() => {
    const savedState = localStorage.getItem('dashboard_showBalance');
    return savedState === 'true';
  });

  const isBalanceVisible =
    showBalance !== undefined ? showBalance : localShowBalance;

  const handleToggle = () => {
    const nextState = !isBalanceVisible;

    if (onToggleBalance) {
      onToggleBalance(nextState);
    } else {
      setLocalShowBalance(nextState);
      localStorage.setItem('dashboard_showBalance', String(nextState));
    }
  };

  // Reward/BSP balance
  const [rewardBalance, setRewardBalance] = useState<number>(0);

  useEffect(() => {
    if (showBalance !== undefined) {
      localStorage.setItem(
        'dashboard_showBalance',
        String(showBalance)
      );
    }
  }, [showBalance]);

  // Refresh UI state
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshStatus, setRefreshStatus] = useState<
    'idle' | 'success' | 'error'
  >('idle');

  /*
   * BSP/reward balance is separate from the wallet balance.
   * Keep using the bonus summary endpoint for BSP only.
   */
  useEffect(() => {
    let isMounted = true;

    const fetchRewardBalance = async () => {
      try {
        const summaryRes = await getRequest(ENDPOINTS.bonus_summary);

        if (isMounted && summaryRes?.data) {
          setRewardBalance(summaryRes.data.current_points ?? 0);
        }
      } catch (error) {
        console.error(
          'Failed to load reward balance for Balance Card',
          error
        );
      }
    };

    void fetchRewardBalance();

    return () => {
      isMounted = false;
    };
  }, []);

  /*
   * IMPORTANT:
   * Wallet refresh must NOT call bonus_summary.
   *
   * refreshUser() already performs:
   * GET /user_preference/user/
   * GET /wallet/balance/
   *
   * and updates the global AuthContext user state.
   *
   * The wallet WebSocket in AuthContext then continues providing
   * real-time balance updates automatically.
   */
  const handleRefresh = async () => {
    if (isRefreshing) return;

    setIsRefreshing(true);
    setRefreshStatus('idle');

    try {
      await refreshUser();
      setRefreshStatus('success');

      // Keep the success state visible briefly.
      window.setTimeout(() => {
        setRefreshStatus('idle');
      }, 1500);
    } catch (error) {
      console.error('Failed to refresh wallet balance:', error);
      setRefreshStatus('error');

      window.setTimeout(() => {
        setRefreshStatus('idle');
      }, 2000);
    } finally {
      setIsRefreshing(false);
    }
  };

  /*
   * The backend provides these as separate wallet values:
   * - balance
   * - locked_balance
   * - available_balance
   *
   * "Available Balance" should therefore use availableBalance,
   * not the total balance field.
   */
  const availableBalance = user?.availableBalance || '₦0.00';
  const lockedBalance = user?.lockedBalance || '₦0.00';

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
        {/* Refresh Button */}
        <button
          type="button"
          onClick={handleRefresh}
          disabled={isRefreshing}
          aria-label="Refresh wallet balance"
          title={
            refreshStatus === 'success'
              ? 'Balance updated'
              : refreshStatus === 'error'
                ? 'Balance refresh failed'
                : 'Refresh balance'
          }
          className={cn(
            'absolute top-0 right-0 p-2 rounded-lg',
            'bg-white/20 hover:bg-white/30',
            'transition-all duration-200',
            'disabled:cursor-not-allowed',
            refreshStatus === 'success' && 'bg-white/30',
            refreshStatus === 'error' && 'bg-white/25'
          )}
        >
          {refreshStatus === 'success' ? (
            <Check className="w-4 h-4 text-white" />
          ) : refreshStatus === 'error' ? (
            <AlertCircle className="w-4 h-4 text-white" />
          ) : (
            <RefreshCw
              className={cn(
                'w-4 h-4 text-white',
                isRefreshing && 'animate-spin'
              )}
            />
          )}
        </button>

        {/* Available Balance Label & Toggle */}
        <div className="flex items-center gap-2 mb-2">
          <span className="text-sm text-sky-100 font-medium">
            Available Balance
          </span>

          <button
            type="button"
            onClick={handleToggle}
            aria-label={
              isBalanceVisible
                ? 'Hide balance'
                : 'Show balance'
            }
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
            {isBalanceVisible
              ? availableBalance
              : '******'}
          </span>
        </div>

        {/* Statistics Row */}
        <div className="flex flex-wrap gap-2">
          {/* Locked Balance */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/20 backdrop-blur-md rounded-full border border-white/10">
            <Lock className="w-3.5 h-3.5 text-sky-200" />

            <span className="text-[11px] font-semibold text-white">
              Locked:{' '}
              {isBalanceVisible
                ? lockedBalance
                : '******'}
            </span>
          </div>

          {/* Actual Reward Balance */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/20 backdrop-blur-md rounded-full border border-white/10">
            <Coins className="w-3.5 h-3.5 text-amber-300" />

            <span className="text-[11px] font-semibold text-white">
              {isBalanceVisible
                ? rewardBalance.toLocaleString()
                : '***'}{' '}
              BSP
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

        {/* Optional Actions */}
        {showActions && (
          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={onDeposit}
              className="flex-1 py-2.5 px-4 bg-white/20 hover:bg-white/30 text-white font-medium rounded-xl transition-colors backdrop-blur-sm"
            >
              Deposit
            </button>

            <button
              type="button"
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