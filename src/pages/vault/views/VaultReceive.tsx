// src/pages/vault/views/VaultReceive.tsx
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { QrCode, Copy, Download, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VaultReceiveProps {
  showToast: (msg: string) => void;
}

export function VaultReceive({ showToast }: VaultReceiveProps) {
  const [network, setNetwork] = useState<'TRC20' | 'BEP20' | 'ERC20' | 'Polygon'>('TRC20');

  const addresses = {
    TRC20: 'TYD4k9A1zL2mN3pQ4rS5tU6vW7xY8z9012',
    BEP20: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
    ERC20: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
    Polygon: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
  };

  const currentAddress = addresses[network];

  const handleCopy = () => {
    navigator.clipboard.writeText(currentAddress);
    showToast(`${network} Deposit address copied!`);
  };

  // Generate & Download Canvas Image
  const handleSaveImage = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 600;
    canvas.height = 750;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      showToast('Could not create image export');
      return;
    }

    // Background Gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, 750);
    gradient.addColorStop(0, '#0f172a');
    gradient.addColorStop(1, '#0284c7');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 600, 750);

    // Card Container
    ctx.fillStyle = '#ffffff';
    ctx.roundRect(40, 50, 520, 650, 30);
    ctx.fill();

    // Text Header
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 28px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('BlueSea Vault Deposit', 300, 110);

    ctx.fillStyle = '#0284c7';
    ctx.font = 'bold 20px sans-serif';
    ctx.fillText(`Asset: USDT (${network})`, 300, 145);

    // Simulated QR Code Frame
    ctx.fillStyle = '#f8fafc';
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 2;
    ctx.roundRect(160, 180, 280, 280, 20);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 16px monospace';
    ctx.fillText('[ QR CODE ]', 300, 325);

    // Wallet Address Text
    ctx.fillStyle = '#64748b';
    ctx.font = 'bold 14px sans-serif';
    ctx.fillText('Deposit Address:', 300, 500);

    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 13px monospace';
    ctx.fillText(currentAddress.slice(0, 22), 300, 530);
    ctx.fillText(currentAddress.slice(22), 300, 555);

    // Footer Warning
    ctx.fillStyle = '#ef4444';
    ctx.font = 'bold 13px sans-serif';
    ctx.fillText(`Send ONLY USDT on ${network} Network`, 300, 640);

    // Download Image
    const link = document.createElement('a');
    link.download = `USDT_${network}_Deposit_Address.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    showToast('Deposit card image saved to gallery!');
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-6">
      <div>
        <h3 className="text-lg font-black text-slate-800 dark:text-white">Receive Digital Assets</h3>
        <p className="text-xs text-slate-500">Choose network to view deposit wallet details.</p>
      </div>

      {/* NETWORK PICKER */}
      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Select Network</label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {(['TRC20', 'BEP20', 'ERC20', 'Polygon'] as const).map((net) => (
            <button
              key={net}
              onClick={() => setNetwork(net)}
              className={cn(
                "py-2.5 px-3 rounded-2xl text-xs font-bold border transition-all cursor-pointer",
                network === net 
                  ? "bg-sky-500 text-white border-sky-500 shadow-md shadow-sky-500/20" 
                  : "bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700"
              )}
            >
              {net}
            </button>
          ))}
        </div>
      </div>

      {/* QR CARD */}
      <div className="p-6 bg-slate-50 dark:bg-slate-800/60 rounded-3xl border border-slate-200 dark:border-slate-700 flex flex-col items-center text-center space-y-4">
        <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <QrCode className="w-36 h-36 text-slate-800 dark:text-white" />
        </div>

        <div className="w-full space-y-1">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Your {network} Wallet Address</p>
          <p className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200 break-all bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
            {currentAddress}
          </p>
        </div>

        <div className="flex gap-3 w-full">
          <Button onClick={handleCopy} className="flex-1 bg-sky-500 hover:bg-sky-600 text-white rounded-2xl h-11 text-xs font-bold cursor-pointer">
            <Copy className="w-4 h-4 mr-2" /> Copy Address
          </Button>
          <Button onClick={handleSaveImage} variant="outline" className="flex-1 rounded-2xl h-11 text-xs font-bold cursor-pointer border-slate-300 dark:border-slate-700">
            <Download className="w-4 h-4 mr-2 text-sky-500" /> Save Image
          </Button>
        </div>
      </div>

      {/* NOTICE BOX */}
      <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex gap-3 text-amber-600 dark:text-amber-400 text-xs">
        <Info className="w-5 h-5 shrink-0 mt-0.5" />
        <div>
          <p className="font-bold">Important Network Requirement</p>
          <p className="text-[11px] opacity-90 mt-0.5">
            Send only USDT using the selected <b>{network}</b> network. Incorrect transfers cannot be refunded.
          </p>
        </div>
      </div>
    </div>
  );
}
