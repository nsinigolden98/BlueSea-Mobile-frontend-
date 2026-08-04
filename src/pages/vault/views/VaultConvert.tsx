// src/pages/vault/views/VaultConvert.tsx
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Repeat } from 'lucide-react';

interface VaultConvertProps {
  showToast: (msg: string) => void;
  onRequestPin: () => void;
}

export function VaultConvert({ showToast, onRequestPin }: VaultConvertProps) {
  const [amount, setAmount] = useState('');
  const rate = 1550; // 1 USDT = ₦1550

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-5">
      <div>
        <h3 className="text-lg font-black text-slate-800 dark:text-white">Convert Asset</h3>
        <p className="text-xs text-slate-500">Instant asset conversion with zero network fee.</p>
      </div>

      <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-2">
        <div className="flex justify-between text-xs font-bold text-slate-400">
          <span>You Pay</span>
          <span>Source: NGN Wallet</span>
        </div>
        <div className="flex items-center gap-3">
          <Input 
            type="number" 
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="border-none bg-transparent text-xl font-bold p-0 focus:ring-0 flex-1"
          />
          <span className="font-black text-xs bg-white dark:bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700">NGN</span>
        </div>
      </div>

      <div className="flex justify-center -my-2">
        <div className="w-8 h-8 rounded-full bg-sky-500 text-white flex items-center justify-center shadow-md">
          <Repeat className="w-4 h-4" />
        </div>
      </div>

      <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-2">
        <div className="flex justify-between text-xs font-bold text-slate-400">
          <span>You Receive (Estimated)</span>
          <span>Rate: 1 USDT = ₦{rate}</span>
        </div>
        <div className="flex items-center gap-3">
          <p className="text-xl font-bold flex-1 text-slate-800 dark:text-white">
            {amount ? (Number(amount) / rate).toFixed(2) : '0.00'}
          </p>
          <span className="font-black text-xs bg-white dark:bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700">USDT</span>
        </div>
      </div>

      <Button 
        onClick={() => {
          if (!amount || Number(amount) <= 0) {
            showToast('Enter valid conversion amount');
            return;
          }
          onRequestPin();
        }}
        className="w-full bg-sky-500 hover:bg-sky-600 text-white rounded-2xl h-12 font-bold text-xs shadow-lg shadow-sky-500/20"
      >
        Preview & Convert
      </Button>
    </div>
  );
}