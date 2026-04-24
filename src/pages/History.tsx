import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, 
  ChevronDown, 
  ChevronUp, 
  Package, 
  Gamepad2, 
  Ticket, 
  TrendingUp, 
  Search,
  Clock,
  CheckCircle2,
  XCircle,
  ExternalLink,
  MapPin,
  User,
  ShoppingBag
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Sidebar, Toast } from '@/components/ui-custom';
import { getRequest, ENDPOINTS } from '@/types';

// --- MOCK DATA FOR TESTING ---
const MOCK_HISTORY = [
  {
    id: 'TX-9021',
    type: 'product',
    title: 'iPhone 15 Pro Max',
    image: 'https://images.unsplash.com/photo-1696446701796-da61225697cc?w=800&q=80',
    amount: 1850000,
    quantity: 1,
    status: 'completed',
    createdAt: '2026-04-23T14:30:00Z',
    details: {
      sellerName: 'Gadget Hub',
      deliveryLocation: '123 Ewet Housing, Uyo',
      transactionId: 'REF-882910293'
    }
  },
  {
    id: 'TX-4412',
    type: 'point',
    title: 'COD Mobile - 880 CP',
    image: '🎮', // Using emoji/icon placeholder like marketplace
    amount: 9000,
    status: 'pending',
    createdAt: '2026-04-24T09:15:00Z',
    details: {
      gameName: 'Call of Duty Mobile',
      playerId: '6722910332',
      transactionId: 'PTS-11022938'
    }
  },
  {
    id: 'TX-7710',
    type: 'ticket',
    title: 'Uyo Tech Summit 2026',
    image: 'https://images.unsplash.com/photo-1540575861501-7ad05823c95b?w=800&q=80',
    amount: 5000,
    quantity: 2,
    status: 'failed',
    createdAt: '2026-04-20T18:45:00Z',
    details: {
      eventName: 'Uyo Tech Summit',
      eventDate: 'May 15, 2026',
      ticketInfo: 'Standard Pass',
      transactionId: 'TCK-009221'
    }
  }
];

// --- SUB-COMPONENTS ---

const StatusBadge = ({ status }: { status: string }) => {
  const styles = {
    completed: "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400",
    pending: "bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400",
    failed: "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400"
  };

  const icons = {
    completed: <CheckCircle2 className="w-3 h-3" />,
    pending: <Clock className="w-3 h-3" />,
    failed: <XCircle className="w-3 h-3" />
  };

  return (
    <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-tight", styles[status as keyof typeof styles])}>
      {icons[status as keyof typeof icons]}
      {status}
    </span>
  );
};

export default function HistoryPage() {
  const navigate = useNavigate();
  const { showToast, ToastComponent } = Toast();
  
  // State
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [vendorStatus, setVendorStatus] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState('All');
  const [activeFilter, setActiveFilter] = useState('All');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch Vendor Status (Consistent with Marketplace Logic)
  useEffect(() => {
    const fetchVendorStatus = async () => {
      try {
        const response = await getRequest(ENDPOINTS.vendor_status);
        if (response?.vendor?.is_verified) {
          setVendorStatus(true);
          setActiveTab('Sales'); // Default to Sales if verified
        }
      } catch (err) {
        console.error("Error fetching vendor status", err);
      }
    };
    fetchVendorStatus();
  }, []);

  // Tabs logic
  const baseTabs = ['All', 'Products', 'Points', 'Tickets'];
  const tabs = vendorStatus ? ['Sales', ...baseTabs] : baseTabs;
  const filters = ['All', 'Pending', 'Completed', 'Failed'];

  // Filter Logic
  const filteredHistory = MOCK_HISTORY.filter(item => {
    const matchesTab = activeTab === 'All' || item.type === activeTab.toLowerCase().slice(0, -1);
    const matchesStatus = activeFilter === 'All' || item.status === activeFilter.toLowerCase();
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         item.id.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Note: In a real app, 'Sales' tab would hit a different endpoint or filter by sellerId
    if (activeTab === 'Sales') return item.type === 'product' && matchesStatus && matchesSearch;
    
    return matchesTab && matchesStatus && matchesSearch;
  });

  const totalSpent = MOCK_HISTORY
    .filter(i => i.status === 'completed')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <ToastComponent />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="flex items-center gap-4 px-4 py-4 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 sticky top-0 z-30">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-6 h-6 text-slate-600 dark:text-slate-400" />
          </button>
          <h1 className="text-xl font-bold text-slate-800 dark:text-white">History</h1>
        </header>

        <main className="flex-1 p-4 md:p-6 overflow-y-auto">
          <div className="max-w-5xl mx-auto space-y-6">
            
            {/* Summary Card */}
            <div className="bg-sky-500 rounded-2xl p-6 text-white shadow-lg shadow-sky-500/20 flex justify-between items-center relative overflow-hidden">
                <div className="relative z-10">
                    <p className="text-sky-100 text-xs font-medium uppercase tracking-wider mb-1">Total Completed Spending</p>
                    <h2 className="text-3xl font-black">₦{totalSpent.toLocaleString()}</h2>
                    <p className="text-sky-100 text-[10px] mt-2 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> {MOCK_HISTORY.length} Total Transactions
                    </p>
                </div>
                <ShoppingBag className="w-20 h-20 text-white/10 absolute -right-4 -bottom-4 rotate-12" />
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search transaction ID or item..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-xl border-none bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-sky-500 transition-all shadow-sm"
              />
            </div>

            {/* Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => { setActiveTab(tab); setExpandedId(null); }}
                  className={cn(
                    "px-6 py-2.5 rounded-full text-xs font-bold whitespace-nowrap transition-all",
                    activeTab === tab 
                      ? "bg-slate-800 text-white dark:bg-white dark:text-slate-900 shadow-md" 
                      : "bg-white dark:bg-slate-800 text-slate-500 hover:bg-slate-100"
                  )}
                >
                  {tab === 'Sales' && <TrendingUp className="w-3 h-3 inline mr-1.5" />}
                  {tab}
                </button>
              ))}
            </div>

            {/* Sub-Filters */}
            <div className="flex gap-4 border-b border-slate-200 dark:border-slate-800">
              {filters.map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={cn(
                    "pb-3 text-xs font-bold transition-all relative",
                    activeFilter === filter 
                      ? "text-sky-500" 
                      : "text-slate-400 hover:text-slate-600"
                  )}
                >
                  {filter}
                  {activeFilter === filter && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-sky-500 rounded-full animate-in fade-in zoom-in duration-300" />
                  )}
                </button>
              ))}
            </div>
   {/* History List - 2 Column Grid */}
            {filteredHistory.length === 0 ? (
              <div className="py-20 text-center">
                <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Clock className="w-8 h-8 text-slate-300" />
                </div>
                <h3 className="text-slate-800 dark:text-white font-bold">No transactions yet</h3>
                <p className="text-slate-500 text-sm">Your activity will appear here.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                {filteredHistory.map((item) => (
                  <div 
                    key={item.id}
                    className={cn(
                        "bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden transition-all duration-300 h-fit",
                        expandedId === item.id ? "col-span-2 shadow-xl ring-2 ring-sky-500/20" : "hover:shadow-md cursor-pointer"
                    )}
                    onClick={() => toggleExpand(item.id)}
                  >
                    {/* Card Preview */}
                    <div className="p-3">
                        <div className="aspect-square rounded-xl bg-slate-100 dark:bg-slate-800 mb-3 overflow-hidden relative">
                            {item.type === 'point' ? (
                                <div className="w-full h-full flex items-center justify-center text-3xl bg-slate-800">
                                    {item.image}
                                </div>
                            ) : (
                                <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                            )}
                            <div className="absolute top-2 right-2">
                                <StatusBadge status={item.status} />
                            </div>
                        </div>
                        
                        <div className="space-y-1">
                            <div className="flex items-center gap-1.5">
                                {item.type === 'product' && <Package className="w-3 h-3 text-sky-500" />}
                                {item.type === 'point' && <Gamepad2 className="w-3 h-3 text-purple-500" />}
                                {item.type === 'ticket' && <Ticket className="w-3 h-3 text-orange-500" />}
                                <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">{item.type}</span>
                            </div>
                            <h4 className="font-bold text-slate-800 dark:text-white text-xs md:text-sm line-clamp-1">{item.title}</h4>
                            <div className="flex justify-between items-end pt-1">
                                <span className="text-sky-500 font-black text-sm">₦{item.amount.toLocaleString()}</span>
                                <button className="text-slate-300">
                                    {expandedId === item.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Expanded Content */}
                    {expandedId === item.id && (
                      <div className="border-t border-slate-100 dark:border-slate-800 p-4 bg-slate-50/50 dark:bg-slate-800/30 animate-in slide-in-from-top-2 duration-300">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Detailed Info */}
                            <div className="space-y-4">
                                <div>
                                    <h5 className="text-[10px] font-bold text-slate-400 uppercase mb-2">Transaction Details</h5>
                                    <div className="space-y-3">
                                        {item.type === 'product' && (
                                            <>
                                                <DetailRow label="Seller" value={item.details.sellerName} icon={<User className="w-3 h-3" />} />
                                                <DetailRow label="Quantity" value={item.quantity?.toString() || '1'} icon={<Package className="w-3 h-3" />} />
                                                <DetailRow label="Location" value={item.details.deliveryLocation || ''} icon={<MapPin className="w-3 h-3" />} />
                                            </>
                                        )}
                                        {item.type === 'point' && (
                                            <>
                                                <DetailRow label="Game" value={item.details.gameName || ''} icon={<Gamepad2 className="w-3 h-3" />} />
                                                <DetailRow label="Player ID" value={item.details.playerId || ''} isCopyable />
                                            </>
                                        )}
                                        {item.type === 'ticket' && (
                                            <>
                                                <DetailRow label="Event" value={item.details.eventName || ''} icon={<Ticket className="w-3 h-3" />} />
                                                <DetailRow label="Date" value={item.details.eventDate || ''} />
                                                <DetailRow label="Info" value={item.details.ticketInfo || ''} />
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Metadata */}
                            <div className="space-y-4">
                                <div>
                                    <h5 className="text-[10px] font-bold text-slate-400 uppercase mb-2">Metadata</h5>
                                    <div className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 space-y-2">
                                        <div className="flex justify-between text-[11px]">
                                            <span className="text-slate-400">Ref ID:</span>
                                            <span className="font-mono text-slate-600 dark:text-slate-300">{item.details.transactionId}</span>
                                        </div>
                                        <div className="flex justify-between text-[11px]">
                                            <span className="text-slate-400">Date:</span>
                                            <span className="text-slate-600 dark:text-slate-300">{new Date(item.createdAt).toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>
                                <button 
                                    onClick={(e) => { e.stopPropagation(); showToast("Report submitted for review"); }}
                                    className="w-full py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-500 flex items-center justify-center gap-2 hover:bg-white transition-colors"
                                >
                                    Report an Issue
                                </button>
                            </div>
                        </div>
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

// --- HELPER COMPONENT ---

function DetailRow({ label, value, icon, isCopyable }: { label: string, value: string, icon?: React.ReactNode, isCopyable?: boolean }) {
    return (
        <div className="flex items-center justify-between group">
            <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-white dark:bg-slate-800 flex items-center justify-center text-slate-400 shadow-sm border border-slate-100 dark:border-slate-700">
                    {icon || <ExternalLink className="w-3 h-3" />}
                </div>
                <span className="text-xs text-slate-500">{label}</span>
            </div>
            <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-800 dark:text-white">{value}</span>
                {isCopyable && (
                    <button 
                        onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(value); }} 
                        className="text-sky-500 text-[10px] font-bold hover:underline"
                    >
                        COPY
                    </button>
                )}
            </div>
        </div>
    );
                    }
