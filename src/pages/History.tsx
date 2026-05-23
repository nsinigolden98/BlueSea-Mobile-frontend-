// src/pages/history/History.tsx

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, ChevronDown, ChevronUp, Package, Gamepad2, 
  Ticket, Search, Clock, CheckCircle2, 
  XCircle, ExternalLink, MapPin, User, ShoppingBag, MessageSquare, Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Sidebar } from '@/components/ui-custom';
import { useHistory } from '@/hooks/history/useHistory';
import type { HistoryItem } from '@/types';

const StatusBadge = ({ status }: { status: string }) => {
  const icons = {
    completed: <CheckCircle2 className="w-3 h-3" />,
    pending: <Clock className="w-3 h-3" />,
    failed: <XCircle className="w-3 h-3" />
  };
  const styles = {
    completed: "bg-green-100 text-green-600 dark:bg-green-900/20",
    pending: "bg-orange-100 text-orange-600 dark:bg-orange-900/20",
    failed: "bg-red-100 text-red-600 dark:bg-red-900/20"
  };
  return (
    <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase", styles[status as keyof typeof styles])}>
      {icons[status as keyof typeof icons] || <Clock className="w-3 h-3" />}
      {status}
    </span>
  );
};

export default function HistoryPage() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('All');
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // --- SERVER STATE ---
  const { data: historyRes, isLoading } = useHistory({
    type: activeTab === 'All' ? undefined : activeTab.toLowerCase().slice(0, -1),
    status: activeFilter === 'All' ? undefined : activeFilter.toLowerCase(),
    search: searchQuery
  });

  const history = (historyRes as any)?.data || [];

  const handleChatWithSeller = (item: HistoryItem) => {
    navigate(`/messages?thread=${item.id}`, {
      state: { source: 'history', historyId: item.id, sellerName: item.details?.sellerName }
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0">
        <header className="flex items-center gap-4 px-4 py-4 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 sticky top-0 z-30">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
            <ChevronLeft className="w-6 h-6 text-slate-600 dark:text-slate-400" />
          </button>
          <h1 className="text-xl font-bold text-slate-800 dark:text-white">History</h1>
          <ShoppingBag className="w-5 h-5 ml-auto text-slate-400" />
        </header>

        <main className="flex-1 p-4 md:p-6 overflow-y-auto">
          <div className="max-w-5xl mx-auto space-y-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search history..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm outline-none focus:ring-2 ring-sky-500"
              />
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2">
              {['All', 'Products', 'Points', 'Tickets'].map((tab) => (
                <button 
                  key={tab} 
                  onClick={() => setActiveTab(tab)} 
                  className={cn("px-6 py-2 rounded-full text-xs font-bold transition-all", activeTab === tab ? "bg-slate-800 text-white dark:bg-sky-500" : "bg-white dark:bg-slate-800 text-slate-500")}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="flex gap-4 border-b border-slate-200 dark:border-slate-700">
              {['All', 'Pending', 'Completed', 'Failed'].map((f) => (
                <button 
                  key={f} 
                  onClick={() => setActiveFilter(f)} 
                  className={cn("pb-2 text-xs font-bold transition-colors", activeFilter === f ? "text-sky-500 border-b-2 border-sky-500" : "text-slate-400")}
                >
                  {f}
                </button>
              ))}
            </div>

            {isLoading ? (
               <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-sky-500" /></div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {history.map((item: HistoryItem) => (
                  <div key={item.id} className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700">
                    <div className="flex justify-between items-start cursor-pointer" onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}>
                      <div className="flex gap-3">
                        <div className="w-12 h-12 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                          {item.type === 'product' ? <Package className="w-6 h-6 text-sky-500" /> : item.type === 'point' ? <Gamepad2 className="w-6 h-6 text-purple-500" /> : <Ticket className="w-6 h-6 text-orange-500" />}
                        </div>
                        <div>
                          <h4 className="text-sm font-bold dark:text-white">{item.title}</h4>
                          <StatusBadge status={item.status} />
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-black text-sky-500">₦{item.amount.toLocaleString()}</p>
                        {expandedId === item.id ? <ChevronUp className="w-4 h-4 ml-auto text-slate-400" /> : <ChevronDown className="w-4 h-4 ml-auto text-slate-400" />}
                      </div>
                    </div>

                    {expandedId === item.id && (
                      <div className="mt-4 space-y-3 rounded-2xl border border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 p-4">
                        <DetailRow icon={<ExternalLink className="w-3 h-3" />} label="Ref" value={item.details?.transactionId ?? item.id} />
                        {item.details?.sellerName && <DetailRow icon={<User className="w-3 h-3" />} label="Seller" value={item.details.sellerName} />}
                        {item.details?.deliveryLocation && <DetailRow icon={<MapPin className="w-3 h-3" />} label="Location" value={item.details.deliveryLocation} />}
                        
                        {item.type === 'product' && item.status === 'pending' && (
                          <button
                            onClick={() => handleChatWithSeller(item)}
                            className="mt-3 w-full flex items-center justify-center gap-2 rounded-2xl border border-sky-200 bg-white dark:bg-slate-800 px-4 py-3 text-sm font-bold text-sky-600 hover:bg-sky-50 transition-colors"
                          >
                            <MessageSquare className="w-4 h-4" />
                            Chat with Seller
                          </button>
                        )}
                      </div>
                    )}
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

function DetailRow({ label, value, icon }: { label: string, value: string, icon: React.ReactNode }) {
  return (
    <div className="flex justify-between items-center py-1">
      <span className="text-[11px] text-slate-400 flex items-center gap-1">{icon} {label}</span>
      <span className="text-[11px] font-bold dark:text-slate-200">{value}</span>
    </div>
  );
}
