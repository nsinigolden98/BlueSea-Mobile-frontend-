import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar, Header, Toast } from '@/components/ui-custom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Link as LinkIcon, ArrowRight, ArrowLeft } from 'lucide-react';

export function OpenPayLink() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [inputUrl, setInputUrl] = useState('');
  const navigate = useNavigate();
  const { ToastComponent, showToast } = Toast();

  const handleOpen = () => {
    if (!inputUrl.trim()) {
      showToast('Please paste a valid BlueC PayLink URL');
      return;
    }

    // Extract ID or check valid structure
    const match = inputUrl.match(/BCL-[A-Z0-9]+/i);
    if (match) {
      navigate(`/paylink/pay/${match[0]}`);
    } else {
      showToast('Invalid PayLink structure. Expected domain com.blueseamobile.app');
    }
  };

  return (
    <div className="h-screen bg-slate-50 dark:bg-slate-900 flex overflow-hidden">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col h-full min-w-0 relative">
        <div className="sticky top-0 z-30 shrink-0 bg-slate-50 dark:bg-slate-900">
          <Header 
            title="Open BlueC PayLink" 
            subtitle="Manual Payment Identifier Resolution"
            onMenuClick={() => setSidebarOpen(true)} 
          />
        </div>

        <main className="flex-1 p-4 md:p-6 overflow-y-auto z-10 max-w-md mx-auto w-full space-y-6">
          <button
            onClick={() => navigate('/paylink')}
            className="flex items-center text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Back
          </button>

          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5">
                <LinkIcon className="w-4 h-4 text-sky-500" />
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">Paste PayLink URL or ID</h2>
              </div>
              <p className="text-xs text-slate-400">Enter a public BlueC PayLink address (e.g., BCL-82H7K29X).</p>
            </div>

            <Input
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              placeholder="https://com.blueseamobile.app/paylink/BCL-82H7K29X"
              className="bg-slate-50 dark:bg-slate-900 h-12 text-xs font-semibold"
            />

            <Button onClick={handleOpen} className="w-full h-12 bg-sky-600 hover:bg-sky-500 text-white rounded-2xl text-xs font-bold gap-2">
              <span>Resolve & Continue</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </main>
      </div>

      <ToastComponent />
    </div>
  );
}