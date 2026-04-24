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
    image: '🎮',
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
        if (response?.vendor?.is_verified) {
          setVendorStatus(true);
          setActiveTab('Sales');
        }
      } catch (err) {
        console.error("Error fetching vendor status", err);
      }
    };
    fetchVendorStatus();
  }, []);

  const baseTabs = ['All', 'Products', 'Points', 'Tickets'];
  const tabs = vendorStatus ? ['Sales', ...baseTabs] : baseTabs;
  const filters = ['All', 'Pending', 'Completed', 'Failed'];

  const filteredHistory = MOCK_HISTORY.filter(item => {
    const matchesTab = activeTab === 'All' || item.type === activeTab.toLowerCase().slice(0, -1);
    const matchesStatus = activeFilter === 'All' || item.status === activeFilter.toLowerCase();
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         item.id.toLowerCase().includes(searchQuery.toLowerCase());
    
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
        <header className="flex items-center gap-4 px-4 py-4 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 sticky top-0 z-30">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
            <ChevronLeft className="w-6 h-6 text-slate-600 dark:text-slate-400" />
          </button>
          <h1 className="text-xl font-bold text-slate-800 dark:text-white">History</h1>
        </header>

        <main className="flex-1 p-4 md:p-6 overflow-y-auto">
          <div className="max-w-5xl mx-auto space-y-6">

            <div className="bg-sky-500 rounded-2xl p-6 text-white flex justify-between">
              <div>
                <p className="text-xs mb-1">Total Completed Spending</p>
                <h2 className="text-3xl font-black">₦{totalSpent.toLocaleString()}</h2>
              </div>
              <ShoppingBag className="w-16 h-16 opacity-20" />
            </div>

            <div className="grid gap-4">
              {filteredHistory.map((item) => (
                <div key={item.id} onClick={() => toggleExpand(item.id)} className="bg-white p-3 rounded-xl">
                  
                  {expandedId === item.id && (
                    <div className="mt-4 space-y-3">
                      {item.type === 'product' && (
                        <>
                          <DetailRow label="Seller" value={item.details.sellerName || ''} />
                          <DetailRow label="Location" value={item.details.deliveryLocation || ''} />
                        </>
                      )}

                      {item.type === 'point' && (
                        <>
                          <DetailRow label="Game" value={item.details.gameName || ''} />
                          <DetailRow label="Player ID" value={item.details.playerId || ''} />
                        </>
                      )}

                      {item.type === 'ticket' && (
                        <>
                          <DetailRow label="Event" value={item.details.eventName || ''} />
                          <DetailRow label="Date" value={item.details.eventDate || ''} />
                        </>
                      )}
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

// ✅ FIXED HERE
function DetailRow({ label, value, icon, isCopyable }: { 
  label: string, 
  value?: string, 
  icon?: React.ReactNode, 
  isCopyable?: boolean 
}) {
    return (
        <div className="flex justify-between">
            <span>{label}</span>
            <span>{value || ''}</span>
        </div>
    );
}
