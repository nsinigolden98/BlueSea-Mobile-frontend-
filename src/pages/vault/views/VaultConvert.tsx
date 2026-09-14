// src/pages/vault/views/VaultConvert.tsx
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Repeat } from 'lucide-react';

interface VaultConvertProps {
  showToast: (msg: string) => void;
  onRequestPin: () => void;
}

type SupportedAsset = 'NGN' | 'USDT' | 'BSP' | 'BTC';

export function VaultConvert({ showToast, onRequestPin }: VaultConvertProps) {
  const [fromAsset, setFromAsset] = useState<SupportedAsset>('NGN');
  const [toAsset, setToAsset] = useState<SupportedAsset>('USDT');
  const [fromAmount, setFromAmount] = useState('');

  // Asset NGN values
  const ratesInNgn: Record<SupportedAsset, number> = {
    NGN: 1,
    BSP: 1,
    USDT: 1550,
    BTC: 100000000,
  };

  const handleSwapAssets = () => {
    const prevFrom = fromAsset;
    setFromAsset(toAsset);
    setToAsset(prevFrom);
  };

  const calculateConversion = () => {
    const numericAmount = Number(fromAmount) || 0;
    if (numericAmount <= 0) return '0.00';

    const fromInNgn = numericAmount * ratesInNgn[fromAsset];
    const convertedValue = fromInNgn / ratesInNgn[toAsset];

    return toAsset === 'BTC' ? convertedValue.toFixed(6) : convertedValue.toFixed(2);
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-5">
      <div>
        <h3 className="text-lg font-black text-slate-800 dark:text-white">Convert Asset</h3>
        <p className="text-xs text-slate-500">Instant asset conversion with zero network fee.</p>
      </div>

      {/* FROM CARD */}
      <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-2">
        <div className="flex justify-between text-xs font-bold text-slate-400">
          <span>You Pay</span>
          <span>Source Asset</span>
        </div>
        <div className="flex items-center gap-3">
          <Input 
            type="number" 
            placeholder="0.00"
            value={fromAmount}
            onChange={(e) => setFromAmount(e.target.value)}
            className="border-none bg-transparent text-xl font-bold p-0 focus:ring-0 flex-1 dark:text-white"
          />
          <select 
            value={fromAsset}
            onChange={(e) => setFromAsset(e.target.value as SupportedAsset)}
            className="font-black text-xs bg-white dark:bg-slate-900 text-slate-800 dark:text-white px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer"
          >
            <option value="NGN">NGN</option>
            <option value="USDT">USDT</option>
            <option value="BSP">BSP</option>
            <option value="BTC">BTC</option>
          </select>
        </div>
      </div>

      {/* SWAP BUTTON */}
      <div className="flex justify-center -my-2">
        <button 
          onClick={handleSwapAssets}
          className="w-10 h-10 rounded-full bg-sky-500 text-white flex items-center justify-center shadow-lg hover:bg-sky-600 transition-all cursor-pointer active:scale-95"
          title="Swap currencies"
        >
          <Repeat className="w-5 h-5" />
        </button>
      </div>

      {/* TO CARD */}
      <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-2">
        <div className="flex justify-between text-xs font-bold text-slate-400">
          <span>You Receive (Estimated)</span>
          <span>Target Asset</span>
        </div>
        <div className="flex items-center gap-3">
          <p className="text-xl font-bold flex-1 text-slate-800 dark:text-white">
            {calculateConversion()}
          </p>
          <select 
            value={toAsset}
            onChange={(e) => setToAsset(e.target.value as SupportedAsset)}
            className="font-black text-xs bg-white dark:bg-slate-900 text-slate-800 dark:text-white px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer"
          >
            <option value="USDT">USDT</option>
            <option value="NGN">NGN</option>
            <option value="BSP">BSP</option>
            <option value="BTC">BTC</option>
          </select>
        </div>
      </div>

      <Button 
        onClick={() => {
          if (!fromAmount || Number(fromAmount) <= 0) {
            showToast('Enter a valid amount to convert');
            return;
          }
          if (fromAsset === toAsset) {
            showToast('Please select two different assets');
            return;
          }
          onRequestPin();
        }}
        className="w-full bg-sky-500 hover:bg-sky-600 text-white rounded-2xl h-12 font-bold text-xs shadow-lg shadow-sky-500/20 cursor-pointer"
      >
        Preview & Convert {fromAsset} to {toAsset}
      </Button>
    </div>
  );
}
