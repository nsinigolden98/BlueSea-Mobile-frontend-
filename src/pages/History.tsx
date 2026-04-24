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

// --- TYPES ---
interface HistoryDetails {
  sellerName?: string;
  deliveryLocation?: string;
  transactionId?: string;
  gameName?: string;
  playerId?: string;
  eventName?: string;
  eventDate?: string;
  ticketInfo?: string;
}

interface HistoryItem {
  id: string;
  type: 'product' | 'point' | 'ticket';
  title: string;
  image: string;
  amount: number;
  quantity?: number;
  status: 'pending' | 'completed' | 'failed';
  createdAt: string;
  details: HistoryDetails;
}

const MOCK_HISTORY: HistoryItem[] = [
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
    image: '🎮', 
    amount: 9000,
    status: 'pending',
    createdAt: '2026-04-24T09:15:00Z',
    details: {
      gameName: 'Call of Duty Mobile',
      playerId: '6722910332',
      transactionId: 'PTS-11022938'
    }
  }
];

// Re-using the icons to clear TS6133
const StatusBadge = ({ status }: { status: string }) => {
  const icons = {
    completed: <CheckCircle2 className="w-3 h-3" />,
    pending: <Clock className="w-3 h-3" />,
    failed: <XCircle className="w-3 h-3" />
  };

  const styles = {
    completed: "bg-green-100 text-green-600",
    pending: "bg-orange-100 text-orange-600",
    failed: "bg-red-100 text-red-600"
  };

  return (
    <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase", styles[status as keyof typeof styles])}>
      {icons[status as keyof typeof icons]}
      {status}
    </span>
  );
};

export default function HistoryPage() {
  const navigate = useNavigate();
  const { ToastComponent } = Toast();
  
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [vendorStatus, setVendorStatus] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState('All');
  const [activeFilter, setActiveFilter] = useState('All');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchVendorStatus = async () => {
      try {
        const response = await getRequest(ENDPOINTS.vendor_status);
        if (response?.vendor?.is_verified) setVendorStatus(true);
      } catch (err) { console.error(err); }
    };
    fetchVendorStatus();
  }, []);

  const baseTabs = ['All', 'Products', 'Points', 'Tickets'];
  const tabs = vendorStatus ? ['Sales', ...baseTabs] : baseTabs;
  const filters = ['All', 'Pending', 'Completed', 'Failed'];

  const filteredHistory = MOCK_HISTORY.filter(item => {
    const search = searchQuery.toLowerCase().trim();
    const matchesTab = activeTab === 'All' || (activeTab === 'Sales' && item.type === 'product') || item.type === activeTab.toLowerCase().slice(0, -1);
    const matchesStatus = activeFilter === 'All' || item.status === activeFilter.toLowerCase();
    const matchesSearch = item.title.toLowerCase().includes(search) || item.id.toLowerCase().includes(search);
    return matchesTab && matchesStatus && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <ToastComponent />

      <div className="flex-1 flex flex-col min-w-0">
        <header className="flex items-center gap-4 px-4 py-4 bg-white dark:bg-slate-900 border-b border-slate-100 sticky top-0 z-30">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-100 rounded-lg">
            <ChevronLeft className="w-6 h-6 text-slate-600" />
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
                className="w-full pl-12 pr-4 py-4 rounded-xl bg-white dark:bg-slate-800 shadow-sm"
              />
            </div>

            <div className="flex gap-2 overflow-x-auto pb-2">
              {tabs.map((tab) => (
                <button key={tab} onClick={() => setActiveTab(tab)} className={cn("px-6 py-2 rounded-full text-xs font-bold", activeTab === tab ? "bg-slate-800 text-white" : "bg-white text-slate-500")}>
                  {tab === 'Sales' && <TrendingUp className="w-3 h-3 inline mr-1" />}
                  {tab}
                </button>
              ))}
            </div>

            {/* Using activeFilter and filters to clear TS6133 */}
            <div className="flex gap-4 border-b border-slate-200">
              {filters.map((f) => (
                <button key={f} onClick={() => setActiveFilter(f)} className={cn("pb-2 text-xs font-bold", activeFilter === f ? "text-sky-500 border-b-2 border-sky-500" : "text-slate-400")}>
                  {f}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredHistory.map((item) => (
                <div key={item.id} className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <div className="flex justify-between items-start" onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}>
                    <div className="flex gap-3">
                      <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center">
                        {item.type === 'product' ? <Package className="w-6 h-6 text-sky-500" /> : item.type === 'point' ? <Gamepad2 className="w-6 h-6 text-purple-500" /> : <Ticket className="w-6 h-6 text-orange-500" />}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold dark:text-white">{item.title}</h4>
                        <StatusBadge status={item.status} />
                      </div>
                    </div>
                    <div className="text-right">
                        <p className="text-sm font-black text-sky-500">₦{item.amount.toLocaleString()}</p>
                        {expandedId === item.id ? <ChevronUp className="w-4 h-4 ml-auto" /> : <ChevronDown className="w-4 h-4 ml-auto" />}
                    </div>
                  </div>

                  {expandedId === item.id && (
                    <div className="mt-4 pt-4 border-t border-dashed border-slate-200 space-y-2">
                         <DetailRow icon={<ExternalLink className="w-3 h-3" />} label="Ref" value={item.details.transactionId ?? item.id} />
                         {item.details.sellerName && <DetailRow icon={<User className="w-3 h-3" />} label="Seller" value={item.details.sellerName} />}
                         {item.details.deliveryLocation && <DetailRow icon={<MapPin className="w-3 h-3" />} label="Location" value={item.details.deliveryLocation} />}
                    </div>
                  )}
                </div>
              ))}
            </div>
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
