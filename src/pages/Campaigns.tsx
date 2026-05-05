import { useState, useEffect, useRef, useMemo } from 'react';
import { Sidebar, Header, Loader } from '@/components/ui-custom';
import { getRequest, ENDPOINTS } from '@/types';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { 
  TrendingUp, 
  Calendar, 
  Loader2, 
  ArrowRight,
  Heart,
  MessageCircle,
  Share2,
  Download,
  Smile,
  X,
  Send,
  Copy,
  CheckCircle2,
  Plus,
  Wallet,
  ChevronDown,
  MapPin,
  Tag,
  ExternalLink
} from 'lucide-react';
import html2canvas from 'html2canvas';

// --- MOCK DATA & HELPERS ---
const REFERRAL_CODE = "USER123"; // Simulated current user code

const formatNaira = (amount: number) => {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
  }).format(amount);
};

const MOCK_USERS = [
  { id: 'u1', name: 'Bisi Akindele', handle: '@bisi_lagos', avatar: 'B' },
  { id: 'u2', name: 'Tunde Electronics', handle: '@tunde_tech', avatar: 'T' },
  { id: 'u3', name: 'Abuja Events Hub', handle: '@abuja_vibes', avatar: 'A' }
];

const INITIAL_MOCK_CAMPAIGNS: Campaign[] = [
  {
    id: 101,
    name: "Gidi Fest 2026 VIP Experience",
    description: "The biggest beach festival in Lagos. High demand ticket with premium commissions.",
    type: 'event',
    price: 50000,
    commissionPercent: 10,
    location: "Landmark Beach, Lagos",
    sellerName: "Gidi Culture Group",
    is_active: true,
    start_date: new Date().toISOString(),
    end_date: '2026-12-31'
  },
  {
    id: 102,
    name: "Starlink Kit (Gen 3)",
    description: "Promote high-speed satellite internet kits. Fast delivery across Nigeria.",
    type: 'product',
    price: 450000,
    commissionPercent: 5,
    location: "Nationwide Delivery",
    sellerName: "TechNode Nigeria",
    is_active: true,
    start_date: new Date().toISOString(),
    end_date: '2026-06-15'
  },
  {
    id: 103,
    name: "Owanbe Special Suya Box",
    description: "Premium party packs for weekend events. Perfect for social media foodies.",
    type: 'product',
    price: 15000,
    commissionPercent: 15,
    location: "Lagos/Ibadan Only",
    sellerName: "GrillMaster B",
    is_active: true,
    start_date: new Date().toISOString(),
    end_date: '2026-12-31'
  }
];

// --- INTERFACES ---
interface Campaign {
  id: number;
  name: string;
  description: string;
  type: 'event' | 'product';
  price: number;
  commissionPercent: number;
  location: string;
  sellerName: string;
  is_active: boolean;
  start_date: string;
  end_date: string;
}

interface Comment {
  id: string;
  user: string;
  text: string;
  timestamp: Date;
}

export function Campaigns() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const { LoaderComponent, showLoader, hideLoader } = Loader();

  // Floating Earnings State
  const [showEarningsDropdown, setShowEarningsDropdown] = useState(false);
  const [earnings] = useState({
    total: 12500,
    pending: 4500,
    withdrawable: 8000
  });

  const [showToast, setShowToast] = useState({ show: false, message: '' });
  const [reactions, setReactions] = useState<Record<number, string>>({});
  const [activeComments, setActiveComments] = useState<number | null>(null);
  const [commentsData, setCommentsData] = useState<Record<number, Comment[]>>({});
  const [newComment, setNewComment] = useState("");
  const [downloadingCard, setDownloadingCard] = useState<Campaign | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  // Seller simulation
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      showLoader();
      const response = await getRequest(ENDPOINTS.bonus_campaigns);
      const apiData = (response && response.success && response.data) ? response.data : [];
      // Note: Mapping legacy API data to the new Affiliate structure for consistency
      const formattedApi = apiData.map((c: any) => ({
        ...c,
        type: 'event',
        price: 10000,
        commissionPercent: 10,
        location: 'Lagos, NG',
        sellerName: 'BlueSea Verified'
      }));
      setCampaigns([...formattedApi, ...INITIAL_MOCK_CAMPAIGNS]);
    } catch (error) {
      setCampaigns(INITIAL_MOCK_CAMPAIGNS);
    } finally {
      hideLoader();
      setLoading(false);
    }
  };

  const triggerToast = (msg: string) => {
    setShowToast({ show: true, message: msg });
    setTimeout(() => setShowToast({ show: false, message: '' }), 3000);
  };

  const handleShare = async (campaign: Campaign) => {
    const refLink = `https://blueseamobile.com.ng/${campaign.type === 'event' ? 'events' : 'marketplace/product'}/${campaign.id}?ref=${REFERRAL_CODE}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Promote ${campaign.name}`,
          text: `Earn ${campaign.commissionPercent}% commission on every sale!`,
          url: refLink,
        });
        addPoints(1, "sharing");
      } catch (err) {
        console.log(err);
        console.log("Share cancelled");
      }
    } else {
      navigator.clipboard.writeText(refLink);
      triggerToast("Referral link copied! 💸");
    }
  };

  const downloadAsImage = async () => {
    if (cardRef.current && typeof html2canvas !== 'undefined') {
      const canvas = await html2canvas(cardRef.current, {
        useCORS: true,
        scale: 2,
        backgroundColor: "#0f172a",
      });
      const link = document.createElement('a');
      link.download = `BlueSea-Promo-${downloadingCard?.name}.png`;
      link.href = canvas.toDataURL();
      link.click();
      setDownloadingCard(null);
      triggerToast("Flyer ready for sharing! 📲");
    }
  };

  const submitComment = (id: number) => {
    if (!newComment.trim()) return;
    const commentObj: Comment = { id: Math.random().toString(36), user: "You", text: newComment, timestamp: new Date() };
    setCommentsData(prev => ({ ...prev, [id]: [commentObj, ...(prev[id] || [])] }));
    setNewComment("");
  };

  // Memoized sorted campaigns by commission (highest first)
  const sortedCampaigns = useMemo(() => {
    return [...campaigns].sort((a, b) => b.commissionPercent - a.commissionPercent);
  }, [campaigns]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex transition-colors duration-300">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0">
        <Header 
          title="Discover & Earn" 
          subtitle="Promote events and products. Earn commissions from every successful referral."
          onMenuClick={() => setSidebarOpen(true)} 
        />

        {/* TOP FLOATING EARNINGS BOX */}
        <div className="fixed top-20 right-4 z-40">
          <button 
            onClick={() => setShowEarningsDropdown(!showEarningsDropdown)}
            className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-1.5 pl-4 pr-2 rounded-full shadow-xl flex items-center gap-3 transition-transform active:scale-95 group"
          >
            <div className="flex flex-col items-end">
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-tighter">Your Earnings</span>
              <span className="text-sm font-black text-sky-500">{formatNaira(earnings.total)}</span>
            </div>
            <div className="w-8 h-8 bg-sky-500 rounded-full flex items-center justify-center text-white shadow-lg shadow-sky-500/20">
              <Wallet className="w-4 h-4" />
            </div>
            <ChevronDown className={cn("w-4 h-4 text-slate-400 transition-transform", showEarningsDropdown && "rotate-180")} />
          </button>

          {showEarningsDropdown && (
            <div className="absolute top-full right-0 mt-2 w-64 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-700 p-4 animate-in fade-in zoom-in-95 origin-top-right">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-500">Pending</span>
                  <span className="text-sm font-bold dark:text-white">{formatNaira(earnings.pending)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-500">Withdrawable</span>
                  <span className="text-sm font-bold text-green-500">{formatNaira(earnings.withdrawable)}</span>
                </div>
                <div className="h-px bg-slate-100 dark:bg-slate-700 my-2" />
                <button 
                  onClick={() => triggerToast("Withdrawal request sent to wallet! ✅")}
                  className="w-full bg-sky-500 hover:bg-sky-600 text-white py-2.5 rounded-xl text-xs font-black transition-colors"
                >
                  Withdraw to Wallet
                </button>
              </div>
            </div>
          )}
        </div>

        {showToast.show && (
          <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white px-6 py-3 rounded-2xl shadow-2xl border border-sky-500/50 animate-in fade-in slide-in-from-bottom-4">
            <p className="text-sm font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-sky-400" /> {showToast.message}
            </p>
          </div>
        )}

        <main className="flex-1 p-4 md:p-6 overflow-y-auto">
          <div className="max-w-3xl mx-auto space-y-6">
            
            <div className="flex items-center justify-between gap-4 bg-sky-50 dark:bg-sky-500/10 p-4 rounded-2xl border border-sky-100 dark:border-sky-500/20">
               <div>
                  <p className="text-sm font-black text-sky-700 dark:text-sky-400">Want to sell something?</p>
                  <p className="text-xs text-sky-600/70 dark:text-sky-400/60">Sellers can turn their items into affiliate campaigns.</p>
               </div>
               <button 
                  onClick={() => setIsModalOpen(true)}
                  className="bg-sky-500 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-sky-600 transition-all shadow-lg shadow-sky-500/20"
                >
                  My Storefront
                </button>
            </div>

            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-sky-500" />
              </div>
            ) : (
<div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {sortedCampaigns.map((campaign, idx) => {
                  const mockUser = MOCK_USERS[idx % MOCK_USERS.length];
                  const estimatedEarning = (campaign.price * campaign.commissionPercent) / 100;

                  return (
                    <div 
                      key={campaign.id} 
                      className="group relative bg-white dark:bg-slate-800 rounded-[2.5rem] border border-slate-100 dark:border-slate-700 overflow-hidden shadow-sm hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)] dark:hover:shadow-[0_20px_50px_rgba(0,0,0,0.3)] transition-all duration-500"
                    >
                      {/* CARD HEADER */}
                      <div className="p-5 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-500 font-bold border dark:border-slate-600">
                            {campaign.sellerName[0]}
                          </div>
                          <div>
                            <p className="font-black text-slate-800 dark:text-slate-100 text-sm leading-tight">{campaign.sellerName}</p>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Verified Seller</p>
                          </div>
                        </div>
                        <div className="px-3 py-1 bg-slate-100 dark:bg-slate-700 rounded-full text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase">
                          {campaign.type}
                        </div>
                      </div>

                      {/* PROMOTIONAL IMAGE SECTION */}
                      <div className="relative aspect-[16/10] mx-2 overflow-hidden rounded-[2rem] bg-slate-100 dark:bg-slate-900 group-hover:mx-0 transition-all duration-500">
                        <img 
                          src={`https://picsum.photos/seed/${campaign.id}/800/500`} 
                          alt={campaign.name}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                        {/* IMAGE OVERLAYS */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                        
                        <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between text-white">
                          <div className="space-y-1">
                            <h3 className="text-xl font-black leading-tight drop-shadow-lg">{campaign.name}</h3>
                            <div className="flex items-center gap-3 text-[10px] font-bold opacity-90">
                              <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {campaign.location}</span>
                              <span className="flex items-center gap-1"><Tag className="w-3 h-3" /> {formatNaira(campaign.price)}</span>
                            </div>
                          </div>
                          <button 
                            onClick={() => navigate(`/events/${campaign.id}`)}
                            className="p-3 bg-white/10 backdrop-blur-md rounded-full border border-white/20 hover:bg-white hover:text-slate-900 transition-all"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* SMART EARNING SYSTEM BLOCK */}
                      <div className="mx-5 mt-5 p-4 bg-sky-500/5 dark:bg-sky-500/10 border border-sky-100 dark:border-sky-500/20 rounded-2xl flex items-center justify-between">
                        <div>
                          <p className="text-[10px] font-black text-sky-600 dark:text-sky-400 uppercase tracking-widest mb-0.5">Your Commission</p>
                          <p className="text-lg font-black text-slate-800 dark:text-white">
                            {campaign.commissionPercent}% — <span className="text-sky-500">{formatNaira(estimatedEarning)}</span>
                            <span className="text-xs font-medium text-slate-400 ml-1">per sale</span>
                          </p>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-sky-500 flex items-center justify-center text-white">
                          <TrendingUp className="w-5 h-5" />
                        </div>
                      </div>

                      <div className="p-5 pt-4">
                        <p className="text-slate-500 dark:text-slate-400 text-xs mb-6 line-clamp-2">
                          {campaign.description}
                        </p>
                        
                        <div className="flex items-center justify-between border-t border-slate-50 dark:border-slate-700/50 pt-4">
                          <div className="flex items-center gap-4">
                            <button 
                              onClick={() => setReactions(prev => ({ ...prev, [campaign.id]: prev[campaign.id] === 'liked' ? '' : 'liked' }))}
                              className={cn("flex items-center gap-1.5 transition-colors", reactions[campaign.id] === 'liked' ? 'text-red-500' : 'text-slate-400 hover:text-red-500')}
                            >
                              <Heart className={cn("w-5 h-5", reactions[campaign.id] === 'liked' && "fill-current")} />
                              <span className="text-[10px] font-black uppercase">Like</span>
                            </button>
                            <button 
                              onClick={() => setActiveComments(campaign.id)}
                              className="flex items-center gap-1.5 text-slate-400 hover:text-sky-500 transition-colors"
                            >
                              <MessageCircle className="w-5 h-5" />
                              <span className="text-[10px] font-black uppercase">Discuss</span>
                            </button>
                          </div>
                          <div className="flex items-center gap-2">
                             <button 
                              onClick={() => handleShare(campaign)} 
                              className="flex items-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-4 py-2 rounded-xl text-xs font-black hover:scale-105 transition-all active:scale-95"
                             >
                              <Share2 className="w-3.5 h-3.5" /> Promote
                            </button>
                             <button 
                              onClick={() => setDownloadingCard(campaign)} 
                              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors text-slate-400"
                             >
                              <Download className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* SELLER INFO FOOTER */}
                      <div className="px-5 pb-4 pt-0 flex items-center justify-between text-[10px] text-slate-400 border-t border-slate-50 dark:border-slate-700/50 mt-2">
                        <div className="flex items-center gap-2">
                          <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> Ends {new Date(campaign.end_date).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="flex items-center gap-1">Posted by {mockUser.name}</span>
                          <ArrowRight className="w-3 h-3" />
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* --- MODALS --- */}

      {/* Side Comment Modal */}
      {activeComments !== null && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 h-full shadow-2xl flex flex-col animate-in slide-in-from-right">
            <div className="p-6 border-b dark:border-slate-800 flex items-center justify-between">
              <h4 className="font-black text-xl dark:text-white">Discussion</h4>
              <button onClick={() => setActiveComments(null)} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800">
                <X className="w-6 h-6 dark:text-white" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {(commentsData[activeComments] || []).length === 0 ? (
                <div className="text-center py-20 text-slate-400">
                                  <Smile className="w-12 h-12 mx-auto mb-2 opacity-20" />
                  <p className="font-bold">No questions yet.</p>
                  <p className="text-xs">Be the first to ask about this item!</p>
                </div>
              ) : (
                commentsData[activeComments].map(cmt => (
                  <div key={cmt.id} className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-sky-500 flex-shrink-0 flex items-center justify-center font-black text-[10px] text-white">
                      {cmt.user[0]}
                    </div>
                    <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-2xl rounded-tl-none max-w-[85%]">
                      <p className="text-[10px] font-black text-sky-600 uppercase mb-1">{cmt.user}</p>
                      <p className="text-sm dark:text-slate-300 leading-relaxed">{cmt.text}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="p-6 border-t dark:border-slate-800">
              <div className="relative">
                <input 
                  type="text"
                  placeholder="Ask a question..."
                  className="w-full bg-slate-100 dark:bg-slate-800 rounded-2xl py-4 px-5 pr-14 text-sm dark:text-white focus:ring-2 ring-sky-500 outline-none transition-all"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && submitComment(activeComments)}
                />
                <button onClick={() => submitComment(activeComments)} className="absolute right-2 top-2 p-2 bg-sky-500 text-white rounded-xl shadow-lg shadow-sky-500/30">
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Seller Simulation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in-95">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-2xl font-black dark:text-white">Your Items</h2>
                <p className="text-sm text-slate-500">Pick an item to create a campaign.</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full"><X className="w-5 h-5 dark:text-white"/></button>
            </div>
            
            <div className="space-y-3">
               {[1, 2].map(i => (
                 <div key={i} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-slate-200 dark:bg-slate-700 rounded-xl" />
                      <div>
                        <p className="font-black text-sm dark:text-white">My Product #{i}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">₦25,000</p>
                      </div>
                    </div>
                    <button className="text-[10px] font-black bg-sky-500 text-white px-4 py-2 rounded-lg">SETUP EARNINGS</button>
                 </div>
               ))}
               <button 
                  onClick={() => navigate('/create-event')}
                  className="w-full mt-4 flex items-center justify-center gap-2 border-2 border-dashed border-slate-200 dark:border-slate-700 py-6 rounded-2xl text-slate-400 hover:border-sky-500 hover:text-sky-500 transition-all"
               >
                 <Plus className="w-5 h-5" /> <span>Add New Item</span>
               </button>
            </div>
          </div>
        </div>
      )}

      {/* PREMIUM DOWNLOAD FLYER */}
      {downloadingCard && (
        <div className="fixed inset-0 z-[60] bg-black/90 flex items-center justify-center p-4">
          <div className="max-w-sm w-full space-y-6">
            <div 
              ref={cardRef} 
              className="w-full aspect-[4/5] bg-slate-900 rounded-[3rem] p-8 text-white relative overflow-hidden flex flex-col"
            >
              {/* Decorative elements */}
              <div className="absolute -top-12 -right-12 w-48 h-48 bg-sky-500/20 blur-[80px]" />
              <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-blue-600/20 blur-[80px]" />
              
              <div className="relative z-10 flex flex-col h-full">
                <div className="flex justify-between items-start mb-6">
                  <div className="font-black text-xl italic tracking-tighter text-sky-400">BLUESEA</div>
                  <div className="px-3 py-1 bg-white/10 rounded-full text-[10px] font-black border border-white/10">AFFILIATE PROMO</div>
                </div>

                <div className="flex-1 rounded-[2rem] overflow-hidden border border-white/10 mb-6 shadow-2xl">
                  <img src={`https://picsum.photos/seed/${downloadingCard.id}/500/500`} className="w-full h-full object-cover" />
                </div>

                <div className="space-y-1 mb-6">
                  <h2 className="text-2xl font-black leading-tight">{downloadingCard.name}</h2>
                  <p className="text-xs font-bold text-slate-400 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-sky-500" /> {downloadingCard.location}
                  </p>
                </div>

                <div className="mt-auto flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10">
                  <div>
                    <p className="text-[10px] font-black text-sky-400 uppercase tracking-widest">Buy Now For</p>
                    <p className="text-xl font-black">{formatNaira(downloadingCard.price)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-slate-400 uppercase">Referral Link</p>
                    <p className="text-[10px] font-bold text-sky-400">blueseamobile.ng/ref...</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button onClick={downloadAsImage} className="bg-sky-500 text-white py-4 rounded-2xl font-black flex items-center justify-center gap-2 shadow-lg shadow-sky-500/20 active:scale-95 transition-transform">
                <Download className="w-4 h-4" /> Save Flyer
              </button>
              <button 
                onClick={() => {
                  const refLink = `https://blueseamobile.com.ng/events/${downloadingCard.id}?ref=${REFERRAL_CODE}`;
                  navigator.clipboard.writeText(refLink);
                  triggerToast("Referral link copied!");
                }}
                className="bg-white text-slate-900 py-4 rounded-2xl font-black flex items-center justify-center gap-2 active:scale-95 transition-transform"
              >
                <Copy className="w-4 h-4" /> Copy Link
              </button>
            </div>
            <button onClick={() => setDownloadingCard(null)} className="w-full text-white/40 text-center text-sm font-bold py-2">Close</button>
          </div>
        </div>
      )}

      <LoaderComponent />
    </div>
  );
}
