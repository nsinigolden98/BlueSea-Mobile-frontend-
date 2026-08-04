// src/pages/vault/views/VaultSend.tsx
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface VaultSendProps {
  showToast: (msg: string) => void;
  onRequestPin: () => void;
}

export function VaultSend({ showToast, onRequestPin }: VaultSendProps) {
  const [method, setMethod] = useState<'address' | 'username'>('address');
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');

  const handleSend = () => {
    if (!recipient || !amount) {
      showToast('Please fill all transaction fields');
      return;
    }
    onRequestPin();
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-5">
      <div>
        <h3 className="text-lg font-black text-slate-800 dark:text-white">Send Asset</h3>
        <p className="text-xs text-slate-500">Transfer funds to external crypto addresses or BlueSea members.</p>
      </div>

      {/* TRANSFER METHOD TOGGLE */}
      <div className="flex gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl">
        <button
          onClick={() => setMethod('address')}
          className={cn("flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer", method === 'address' ? "bg-sky-500 text-white shadow-xs" : "text-slate-500")}
        >
          External Wallet Address
        </button>
        <button
          onClick={() => setMethod('username')}
          className={cn("flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer", method === 'username' ? "bg-sky-500 text-white shadow-xs" : "text-slate-500")}
        >
          BlueSea User Transfer
        </button>
      </div>

      {/* RECIPIENT INPUT */}
      <div className="space-y-2">
        <Label className="text-xs font-bold uppercase tracking-wider text-slate-400">
          {method === 'address' ? 'Recipient Wallet Address' : 'BlueSea Username or Phone'}
        </Label>
        <Input 
          placeholder={method === 'address' ? 'Enter TRC20/BEP20 address' : 'Enter @username'}
          value={recipient}
          onChange={(e) => setRecipient(e.target.value)}
          className="rounded-2xl h-12 bg-slate-50 dark:bg-slate-800 text-xs font-bold"
        />
      </div>

      {/* AMOUNT INPUT */}
      <div className="space-y-2">
        <Label className="text-xs font-bold uppercase tracking-wider text-slate-400">Amount (USDT)</Label>
        <Input 
          type="number"
          placeholder="0.00"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="rounded-2xl h-12 bg-slate-50 dark:bg-slate-800 text-sm font-bold"
        />
      </div>

      <Button onClick={handleSend} className="w-full bg-sky-500 hover:bg-sky-600 text-white rounded-2xl h-12 font-bold text-xs shadow-lg shadow-sky-500/20 active:scale-95 transition-all mt-4">
        Continue to PIN Verification
      </Button>
    </div>
  );
}