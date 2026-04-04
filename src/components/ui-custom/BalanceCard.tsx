import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Eye, EyeOff, Lock } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface BalanceCardProps {
  showActions?: boolean;
  onDeposit?: () => void;
  onWithdraw?: () => void;
  className?: string;
}

export function BalanceCard({ 
  showActions = false, 
  onDeposit, 
  onWithdraw,
  className 
}: BalanceCardProps) {
  const [showBalance, setShowBalance] = useState(false);
  const { user } = useAuth();
  
  const lockedBalance = user?.lockedBalance || '₦0.00';
  const availableBalance = user?.availableBalance || '₦0.00';

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

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sky-100 font-medium">Available Balance</span>
          <button 
            onClick={() => setShowBalance(!showBalance)}
            className="p-1.5 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
          >
            {showBalance ? (
              <EyeOff className="w-4 h-4 text-white" />
            ) : (
              <Eye className="w-4 h-4 text-white" />
            )}
          </button>
        </div>

        <div className="mb-6">
          <span className="text-3xl md:text-4xl font-bold text-white">
            {showBalance ? `${availableBalance.toLocaleString()}` : '******'}
          </span>
        </div>

        {/* Locked Balance Display */}
        {user?.lockedBalance && user.lockedBalance !== '₦0.00' && (
          <div className="flex items-center gap-2 mb-4 p-3 bg-white/10 rounded-xl backdrop-blur-sm">
            <Lock className="w-4 h-4 text-sky-200" />
            <span className="text-sm text-sky-100">Locked:</span>
            <span className="text-sm font-medium text-white">
              {showBalance ? lockedBalance : '******'}
            </span>
          </div>
        )}

        {showActions && (
          <div className="flex gap-3">
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
