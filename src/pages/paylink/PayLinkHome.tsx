import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar, Header } from '@/components/ui-custom';
import { Button } from '@/components/ui/button';
import { paylinkService } from '@/services/paylinkService';
import type { PayLinkItem } from '@/types/paylink';
import { 
  Send, 
  Scan, 
  QrCode, 
  Link as LinkIcon, 
  Building2, 
  Package, 
  History, 
  BarChart3, 
  Plus, 
  ChevronRight,
  Sparkles
} from 'lucide-react';

export function PayLinkHome() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [links, setLinks] = useState<PayLinkItem[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    paylinkService.getPayLinks().then((data) => {
      setLinks(data);
      setLoading(false);
    });
  }, []);

  return (
    <div className="h-screen bg-slate-50 dark:bg-slate-900 flex overflow-hidden">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col h-full min-w-0 relative">
        <div className="sticky top-0 z-30 shrink-0 bg-slate-50 dark:bg-slate-900">
          <Header 
            title="BlueC PayLink" 
            subtitle="Request, receive, and collect payments effortlessly"
            onMenuClick={() => setSidebarOpen(true)} 
          />
        </div>

        <main className="flex-1 p-4 md:p-6 overflow-y-auto z-10 space-y-6 max-w-5xl mx-auto w-full">
          {/* HERO BANNER */}
          <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-sky-950 text-white rounded-3xl p-6 md:p-8 overflow-hidden shadow-xl border border-slate-800">
            <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-64 h-64 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
            
            <div className="relative z-10 max-w-xl space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/20 border border-sky-400/30 text-sky-300 text-xs font-semibold backdrop-blur-md">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Zero Transaction Creation Fees</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
                Seamless Payments & Commerce
              </h1>
              <p className="text-sm text-slate-300 leading-relaxed">
                Create instant payment requests, branded QR codes, fixed product checkouts, or custom contribution collections.
              </p>
            </div>
          </div>

          {/* PRIMARY ACTIONS GRID */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
            <button
              onClick={() => navigate('/paylink/create')}
              className="flex flex-col items-center justify-center p-4 bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md hover:border-sky-500/40 transition-all group cursor-pointer"
            >
              <div className="w-12 h-12 rounded-xl bg-sky-50 dark:bg-sky-950/50 text-sky-600 dark:text-sky-400 flex items-center justify-center mb-2.5 group-hover:scale-110 transition-transform">
                <Send className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-100">Request Payment</span>
            </button>

            <button
              onClick={() => navigate('/paylink/scan')}
              className="flex flex-col items-center justify-center p-4 bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md hover:border-sky-500/40 transition-all group cursor-pointer"
            >
              <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-2.5 group-hover:scale-110 transition-transform">
                <Scan className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-100">Scan & Pay</span>
            </button>

            <button
              onClick={() => navigate('/paylink/my-qr')}
              className="flex flex-col items-center justify-center p-4 bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md hover:border-sky-500/40 transition-all group cursor-pointer"
            >
              <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-2.5 group-hover:scale-110 transition-transform">
                <QrCode className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-100">My QR Code</span>
            </button>

            <button
              onClick={() => navigate('/paylink/open')}
              className="flex flex-col items-center justify-center p-4 bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md hover:border-sky-500/40 transition-all group cursor-pointer"
            >
              <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-2.5 group-hover:scale-110 transition-transform">
                <LinkIcon className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-100">Open PayLink</span>
            </button>
          </div>

          {/* SECONDARY MANAGEMENT HUBS */}
          <div className="bg-white dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-4 space-y-3">
            <h2 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-1">
              Management & Catalog
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <Button
                variant="ghost"
                onClick={() => navigate('/paylink/businesses')}
                className="h-12 justify-start gap-2.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <Building2 className="w-4 h-4 text-sky-500" />
                <span>Businesses</span>
              </Button>

              <Button
                variant="ghost"
                onClick={() => navigate('/paylink/products')}
                className="h-12 justify-start gap-2.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <Package className="w-4 h-4 text-emerald-500" />
                <span>Products & Services</span>
              </Button>

              <Button
                variant="ghost"
                onClick={() => navigate('/paylink/history')}
                className="h-12 justify-start gap-2.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <History className="w-4 h-4 text-purple-500" />
                <span>Link History</span>
              </Button>

              <Button
                variant="ghost"
                onClick={() => navigate('/paylink/history?tab=ANALYTICS')}
                className="h-12 justify-start gap-2.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <BarChart3 className="w-4 h-4 text-amber-500" />
                <span>Analytics</span>
              </Button>
            </div>
          </div>

          {/* ACTIVE PAYLINKS SECTION */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Active Links
              </h2>
              <Button
                variant="link"
                onClick={() => navigate('/paylink/history')}
                className="text-xs font-bold text-sky-500 hover:text-sky-600 p-0 h-auto cursor-pointer"
              >
                View All
              </Button>
            </div>

            {loading ? (
              <div className="p-8 text-center text-xs text-slate-400">Loading PayLinks...</div>
            ) : links.length === 0 ? (
              <div className="p-8 bg-white dark:bg-slate-800 rounded-2xl text-center space-y-2 border border-slate-200/60 dark:border-slate-800">
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">No active PayLinks</p>
                <p className="text-xs text-slate-400">Create your first link to start collecting payments.</p>
                <Button onClick={() => navigate('/paylink/create')} className="mt-2 text-xs bg-sky-600 hover:bg-sky-500 text-white rounded-xl cursor-pointer">
                  <Plus className="w-3.5 h-3.5 mr-1" /> Create Link
                </Button>
              </div>
            ) : (
              <div className="space-y-2.5">
                {links.map((link) => (
                  <div
                    key={link.id}
                    onClick={() => navigate(`/paylink/details/${link.id}`)}
                    className="flex items-center justify-between p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/60 dark:border-slate-800/80 shadow-xs hover:border-sky-500/30 cursor-pointer transition-all"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center shrink-0 text-slate-600 dark:text-slate-300 font-extrabold text-xs">
                        {link.type === 'PRODUCT' ? 'PROD' : link.type === 'COLLECTION' ? 'FUND' : 'LINK'}
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">{link.title}</h3>
                        <p className="text-[11px] text-slate-400 truncate">{link.id} • {link.creatorName}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right">
                        <p className="text-xs font-black text-slate-900 dark:text-white">
                          {link.amount > 0 ? `₦${link.amount.toLocaleString()}` : 'Flexible'}
                        </p>
                        <span className="inline-block px-2 py-0.5 text-[10px] font-bold rounded-md bg-emerald-500/10 text-emerald-500">
                          {link.status}
                        </span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-300" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}