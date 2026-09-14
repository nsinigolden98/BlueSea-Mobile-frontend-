import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar, Header } from '@/components/ui-custom';
import { Button } from '@/components/ui/button';
import { QrCode, Share2, Copy, ArrowLeft } from 'lucide-react';

export function MyQR() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="h-screen bg-slate-50 dark:bg-slate-900 flex overflow-hidden">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col h-full min-w-0 relative">
        <div className="sticky top-0 z-30 shrink-0 bg-slate-50 dark:bg-slate-900">
          <Header 
            title="My Personal BlueC QR" 
            subtitle="Permanent Payment Receiving QR"
            onMenuClick={() => setSidebarOpen(true)} 
          />
        </div>

        <main className="flex-1 p-4 md:p-6 overflow-y-auto z-10 max-w-md mx-auto w-full space-y-6 text-center">
          <button
            onClick={() => navigate('/paylink')}
            className="flex items-center text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Back
          </button>

          <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 border border-slate-200/80 dark:border-slate-800 shadow-xl space-y-6">
            <div className="w-48 h-48 mx-auto bg-slate-900 rounded-2xl p-4 flex items-center justify-center border-2 border-sky-500/30">
              <QrCode className="w-36 h-36 text-sky-400" />
            </div>

            <div>
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white">Lucid</h2>
              <p className="text-xs text-slate-400">https://com.blueseamobile.app/paylink/lucid</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" className="h-11 rounded-xl text-xs font-bold flex items-center justify-center">
                <Copy className="w-4 h-4 mr-2" />
                Copy Link
              </Button>
              <Button className="h-11 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold flex items-center justify-center">
                <Share2 className="w-4 h-4 mr-2" />
                Share QR
              </Button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}