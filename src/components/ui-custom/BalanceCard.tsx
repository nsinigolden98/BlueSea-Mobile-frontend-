import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Eye, EyeOff, Lock, Coins, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
// 1. Import the API utilities used in the Rewards page
import { getRequest, ENDPOINTS } from '@/types'; 

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
  const { user } = useAuth();

  // Visibility state (persisted)
  const [showBalance, setShowBalance] = useState(() => {
    const savedState = localStorage.getItem('dashboard_showBalance');
    return savedState === 'true';
  });

  // 2. State to hold the live BSP points. 
  // We initialize it with the context value so it doesn't show 0 while loading.
  const [bspPoints, setBspPoints] = useState<number>(user?.bspBalance || 0);

  // Save visibility toggle to localStorage
  useEffect(() => {
    localStorage.setItem('dashboard_showBalance', String(showBalance));
  }, [showBalance]);

  // 3. Fetch the live BSP points just like the Rewards page does
  useEffect(() => {
    let isMounted = true;

    const fetchLiveBsp = async () => {
      try {
        const res = await getRequest(ENDPOINTS.bonus_summary);
        // If the request succeeds and we get current_points, update the state
        if (isMounted && res?.data?.current_points !== undefined) {
          setBspPoints(res.data.current_points);
        }
      } catch (error) {
        console.error("Failed to sync live BSP points:", error);
      }
    };

    fetchLiveBsp();

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
        {/* Available Balance Label & Toggle */}
        <div className="flex items-center justify-between mb-2">  
          <span className="text-sm text-sky-100 font-medium">Available Balance</span>  
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

        {/* Large Balance Amount */}
        <div className="mb-6">  
          <span className="text-3xl md:text-4xl font-bold text-white tracking-tight">  
            {showBalance ? `${availableBalance.toLocaleString()}` : '******'}  
          </span>  
        </div>  

        {/* Statistics Row */}
        <div className="flex flex-wrap gap-2">  
          {/* Locked Balance */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/20 backdrop-blur-md rounded-full border border-white/10">  
            <Lock className="w-3.5 h-3.5 text-sky-200" />  
            <span className="text-[11px] font-semibold text-white">
              Locked: {showBalance ? lockedBalance : '******'}
            </span>  
          </div>

          {/* 4. Live BSP Points with Toggle */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/20 backdrop-blur-md rounded-full border border-white/10">  
            <Coins className="w-3.5 h-3.5 text-amber-300" />  
            <span className="text-[11px] font-semibold text-white">
              {showBalance ? bspPoints.toLocaleString() : '***'} BSP
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
