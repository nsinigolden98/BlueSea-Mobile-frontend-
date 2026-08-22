import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Sidebar, Header, Toast } from '@/components/ui-custom';
import { Button } from '@/components/ui/button';
import { paylinkService } from '@/services/paylinkService';
import type { PayLinkItem } from '@/types/paylink';
import { ArrowLeft, Copy, Share2, QrCode, Check, Shield } from 'lucide-react';

export function PayLinkDetails() {
  const { id } = useParams<{ id: string }>();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [paylink, setPaylink] = useState<PayLinkItem | null>(null);
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();
  const { ToastComponent, showToast } = Toast();

  useEffect(() => {
    if (id) {
      paylinkService.getPayLinkById(id).then(setPaylink);
    }
  }, [id]);

  const handleCopy = () => {
    if (paylink) {
      navigator.clipboard.writeText(paylink.url);
      setCopied(true);
      showToast('PayLink copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShare = async () => {
    if (paylink) {
      if (navigator.share) {
        try {
          await navigator.share({
            title: paylink.title,
            url: paylink.url,
          });
        } catch {
          // Fallback if share is canceled
        }
      } else {
        handleCopy();
      }
    }
  };

  if (!paylink) return null;

  return (
    <div className="h-screen bg-slate-50 dark:bg-slate-900 flex overflow-hidden">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col h-full min-w-0 relative">
        <div className="sticky top-0 z-30 shrink-0 bg-slate-50 dark:bg-slate-900">
          <Header 
            title="PayLink Identity Details" 
            subtitle={paylink.id}
            onMenuClick={() => setSidebarOpen(true)} 
          />
        </div>

        <main className="flex-1 p-4 md:p-6 overflow-y-auto z-10 max-w-2xl mx-auto w-full space-y-6">
          <button
            onClick={() => navigate('/paylink')}
            className="flex items-center text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Back to Dashboard
          </button>

          <div className="bg-white dark:bg-slate-800/80 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 space-y-6 shadow-sm">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <span className="flex items-center gap-1 text-[10px] font-bold text-sky-500 uppercase tracking-wider">
                  <Shield className="w-3 h-3 text-sky-500" />
                  {paylink.type} PAYLINK
                </span>
                <h1 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">{paylink.title}</h1>
              </div>
              <span className="px-2.5 py-1 text-[10px] font-extrabold rounded-md bg-emerald-500/10 text-emerald-500">
                {paylink.status}
              </span>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-2xl space-y-3 border border-slate-100 dark:border-slate-800">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Target URL</span>
                <span className="font-mono text-[11px] font-bold text-slate-700 dark:text-slate-300 truncate max-w-[200px]">{paylink.url}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Price Model</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {paylink.amount > 0 ? `₦${paylink.amount.toLocaleString()} (Exact)` : 'Flexible'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <Button onClick={handleCopy} variant="outline" className="h-11 rounded-xl text-xs font-bold gap-1.5">
                {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </Button>

              <Button onClick={handleShare} variant="outline" className="h-11 rounded-xl text-xs font-bold gap-1.5">
                <Share2 className="w-4 h-4 text-sky-500" />
                <span>Share</span>
              </Button>

              <Button onClick={() => navigate(`/paylink/pay/${paylink.id}`)} className="h-11 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold gap-1.5">
                <QrCode className="w-4 h-4" />
                <span>Preview</span>
              </Button>
            </div>
          </div>
        </main>
      </div>

      <ToastComponent />
    </div>
  );
}