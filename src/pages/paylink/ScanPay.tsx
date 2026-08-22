import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Toast } from '@/components/ui-custom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Scan, X, AlertCircle, Keyboard, Upload, RefreshCw, ShieldCheck } from 'lucide-react';

export function ScanPay() {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [showManualInput, setShowManualInput] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const [loadingCamera, setLoadingCamera] = useState(true);
  
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  const navigate = useNavigate();
  const { ToastComponent, showToast } = Toast();

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  const startCamera = async () => {
    setLoadingCamera(true);
    stopCamera();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setHasPermission(true);
    } catch (err) {
      setHasPermission(false);
    } finally {
      setLoadingCamera(false);
    }
  };

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, []);

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCode.trim()) {
      showToast('Please enter a valid PayLink ID or Code');
      return;
    }
    const cleanId = manualCode.trim().split('/').pop();
    stopCamera();
    navigate(`/paylink/pay/${cleanId}`);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      showToast('Processing QR image...');
      // Simulated QR parsing fallback
      setTimeout(() => {
        stopCamera();
        navigate('/paylink/pay/PL-DEMO-99');
      }, 1200);
    }
  };

  return (
    <div className="h-screen bg-slate-950 text-white flex flex-col justify-between overflow-hidden relative">
      {/* HEADER */}
      <div className="p-4 flex items-center justify-between border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md z-20">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-sky-500/10 text-sky-400">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold tracking-wide">Scan & Pay (BlueC PayLink)</span>
        </div>
        <button 
          onClick={() => {
            stopCamera();
            navigate('/paylink');
          }} 
          className="p-2 text-slate-400 hover:text-white rounded-xl bg-slate-900 border border-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* VIEWFINDER & CAMERA FEED */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 relative">
        {hasPermission === false ? (
          <div className="text-center space-y-4 max-w-xs z-10 bg-slate-900/90 border border-slate-800 p-6 rounded-3xl backdrop-blur-sm">
            <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
            <div>
              <h3 className="text-xs font-bold text-slate-200">Camera Access Denied</h3>
              <p className="text-[11px] text-slate-400 mt-1">Please allow camera access in your browser settings or enter the code manually below.</p>
            </div>
            <Button onClick={startCamera} className="w-full text-xs bg-sky-600 hover:bg-sky-500 text-white rounded-xl cursor-pointer">
              <RefreshCw className="w-3.5 h-3.5 mr-1.5" /> Try Again
            </Button>
          </div>
        ) : (
          <div className="relative w-72 h-72 rounded-3xl overflow-hidden flex items-center justify-center border border-slate-800 shadow-[0_0_60px_rgba(14,165,233,0.15)] bg-slate-900">
            {/* LIVE CAMERA STREAM */}
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              muted 
              className="absolute inset-0 w-full h-full object-cover" 
            />

            {/* SCANNER OVERLAY FRAME */}
            <div className="absolute inset-0 pointer-events-none border-2 border-sky-400/80 rounded-3xl">
              <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-sky-400 rounded-tl-2xl" />
              <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-sky-400 rounded-tr-2xl" />
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-sky-400 rounded-bl-2xl" />
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-sky-400 rounded-br-2xl" />
            </div>

            {/* LASER ANIMATION LINE */}
            <div className="absolute left-4 right-4 h-0.5 bg-gradient-to-r from-transparent via-sky-400 to-transparent animate-pulse" />

            {loadingCamera ? (
              <div className="absolute inset-0 bg-slate-950/80 flex flex-col items-center justify-center gap-2">
                <RefreshCw className="w-6 h-6 text-sky-400 animate-spin" />
                <span className="text-[10px] font-bold text-slate-400">Initializing Camera...</span>
              </div>
            ) : (
              <div className="absolute bottom-4 px-3 py-1 bg-slate-950/80 backdrop-blur-md rounded-full border border-slate-800/80 text-[10px] font-extrabold text-sky-400 tracking-wider uppercase flex items-center gap-1.5">
                <Scan className="w-3 h-3 animate-pulse" />
                <span>Align QR inside frame</span>
              </div>
            )}
          </div>
        )}

        {/* MANUAL INPUT DRAWER / OVERLAY */}
        {showManualInput && (
          <div className="absolute inset-x-4 bottom-4 z-30 bg-slate-900/95 border border-slate-800 p-5 rounded-3xl backdrop-blur-md shadow-2xl space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-slate-200">Enter PayLink Code</span>
              <button onClick={() => setShowManualInput(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleManualSubmit} className="space-y-2">
              <Input
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                placeholder="e.g. PL-893021 or full link"
                className="bg-slate-950 border-slate-800 text-white text-xs h-11"
              />
              <Button type="submit" className="w-full h-10 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold rounded-xl cursor-pointer">
                Proceed to Payment
              </Button>
            </form>
          </div>
        )}
      </div>

      {/* BOTTOM ACTION BAR */}
      <div className="p-4 bg-slate-950/90 border-t border-slate-800/80 backdrop-blur-md z-20 flex items-center justify-center gap-4">
        <label className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-850 rounded-2xl border border-slate-800 text-slate-300 text-xs font-bold cursor-pointer transition-all">
          <Upload className="w-4 h-4 text-sky-400" />
          <span>Upload Image</span>
          <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
        </label>

        <button
          onClick={() => setShowManualInput(!showManualInput)}
          className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-850 rounded-2xl border border-slate-800 text-slate-300 text-xs font-bold cursor-pointer transition-all"
        >
          <Keyboard className="w-4 h-4 text-emerald-400" />
          <span>Enter Code</span>
        </button>
      </div>

      <ToastComponent />
    </div>
  );
}