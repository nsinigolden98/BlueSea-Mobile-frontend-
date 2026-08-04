// src/pages/vault/views/VaultSend.tsx
import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { QrCode, Camera, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VaultSendProps {
  showToast: (msg: string) => void;
  onRequestPin: () => void;
}

export function VaultSend({ showToast, onRequestPin }: VaultSendProps) {
  const [method, setMethod] = useState<'address' | 'username'>('address');
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Initialize Camera Stream for QR Scanner
  useEffect(() => {
    let stream: MediaStream | null = null;
    if (isScanning) {
      navigator.mediaDevices?.getUserMedia({ video: { facingMode: 'environment' } })
        .then((s) => {
          stream = s;
          if (videoRef.current) {
            videoRef.current.srcObject = s;
          }
        })
        .catch(() => {
          showToast('Camera access denied or unavailable');
          setIsScanning(false);
        });
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isScanning, showToast]);

  const handleSimulatedScanResult = () => {
    const scannedAddress = 'TYD4k9A1zL2mN3pQ4rS5tU6vW7xY8z9012';
    setRecipient(scannedAddress);
    setIsScanning(false);
    showToast('QR Code address captured successfully!');
  };

  const handleSend = () => {
    if (!recipient || !amount || Number(amount) <= 0) {
      showToast('Please fill out all transaction fields');
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

      {/* METHOD TOGGLE */}
      <div className="flex gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl">
        <button
          onClick={() => setMethod('address')}
          className={cn("flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer", method === 'address' ? "bg-sky-500 text-white shadow-xs" : "text-slate-500")}
        >
          External Address
        </button>
        <button
          onClick={() => setMethod('username')}
          className={cn("flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer", method === 'username' ? "bg-sky-500 text-white shadow-xs" : "text-slate-500")}
        >
          BlueSea Username
        </button>
      </div>

      {/* RECIPIENT INPUT */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <Label className="text-xs font-bold uppercase tracking-wider text-slate-400">
            {method === 'address' ? 'Recipient Wallet Address' : 'BlueSea Username'}
          </Label>
          {method === 'address' && (
            <button 
              onClick={() => setIsScanning(true)} 
              className="text-xs font-bold text-sky-500 flex items-center gap-1 hover:underline cursor-pointer"
            >
              <QrCode className="w-3.5 h-3.5" /> Scan Camera QR
            </button>
          )}
        </div>
        <Input 
          placeholder={method === 'address' ? 'Enter TRC20/BEP20 address' : 'Enter @username'}
          value={recipient}
          onChange={(e) => setRecipient(e.target.value)}
          className="rounded-2xl h-12 bg-slate-50 dark:bg-slate-800 text-xs font-bold dark:text-white"
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
          className="rounded-2xl h-12 bg-slate-50 dark:bg-slate-800 text-sm font-bold dark:text-white"
        />
      </div>

      <Button onClick={handleSend} className="w-full bg-sky-500 hover:bg-sky-600 text-white rounded-2xl h-12 font-bold text-xs shadow-lg shadow-sky-500/20 cursor-pointer">
        Continue to PIN Verification
      </Button>

      {/* CAMERA SCANNER MODAL */}
      {isScanning && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center p-4">
          <div className="bg-slate-900 p-4 rounded-3xl border border-slate-800 w-full max-w-sm space-y-4 text-center">
            <div className="flex justify-between items-center text-white">
              <span className="font-bold text-xs flex items-center gap-2">
                <Camera className="w-4 h-4 text-sky-400" /> Scanning QR Code...
              </span>
              <button onClick={() => setIsScanning(false)} className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="relative w-full aspect-square bg-slate-950 rounded-2xl overflow-hidden border border-sky-500/30 flex items-center justify-center">
              <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
              <div className="absolute inset-8 border-2 border-sky-500 border-dashed rounded-xl pointer-events-none animate-pulse" />
            </div>

            <Button onClick={handleSimulatedScanResult} className="w-full bg-sky-500 text-white rounded-xl text-xs font-bold">
              Capture Scanned Address
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
