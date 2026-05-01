import { useState, useEffect, useRef, useMemo } from 'react';
import { Sidebar, Header, Loader } from '@/components/ui-custom';
import { getRequest, ENDPOINTS } from '@/types';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom'; // Added for navigation
import { 
  Gift, 
  TrendingUp, 
  Calendar, 
  Loader2, 
  ArrowRight,
  Heart,
  MessageCircle,
  Share2,
  Download,
  Smile,
  User,
  X,
  Send,
  Copy,
  CheckCircle2,
  Plus
} from 'lucide-react';
// @ts-ignore
import html2canvas from 'html2canvas';

// --- MOCK DATA SECTION ---
const MOCK_USERS = [
  { id: 'u1', name: 'Bisi Akindele', handle: '@bisi_lagos', avatar: 'B' },
  { id: 'u2', name: 'Tunde Electronics', handle: '@tunde_tech', avatar: 'T' },
  { id: 'u3', name: 'Abuja Events Hub', handle: '@abuja_vibes', avatar: 'A' }
];

const MOCK_PRODUCTS = [
  { id: 'p1', name: 'Premium Lagos Suya Pack', price: '₦5,000', link: '/marketplace/product/p1' },
  { id: 'p2', name: 'VIP Ticket: Gidi Fest 2026', price: '₦50,000', link: '/events/p2' },
  { id: 'p3', name: 'Starlink Kit (Installment)', price: '₦120,000', link: '/marketplace/product/p3' }
];

const INITIAL_MOCK_CAMPAIGNS: Campaign[] = [
  {
    id: 101,
    name: "Gidi Fest 2026 Early Bird",
    description: "Get double points when you secure your VIP tickets for the biggest beach festival in Lagos! Limited slots available.",
    campaign_type: 'multiplier',
    multiplier: '2',
    bonus_amount: 0,
    is_active: true,
    start_date: new Date().toISOString(),
    end_date: '2026-12-31'
  },
  {
    id: 102,
    name: "Abuja Tech Week Giveaway",
    description: "Refer 5 friends to the Abuja Tech Expo and earn a fixed bonus of 500 points instantly. Let's build the future!",
    campaign_type: 'fixed_bonus',
    multiplier: '1',
    bonus_amount: 500,
    is_active: true,
    start_date: new Date().toISOString(),
    end_date: '2026-06-15'
  }
];

const MOCK_COMMENTS_POOL = [
  { id: 'c1', user: 'Chidi', text: "Omo, this festival go loud! 🔥", timestamp: new Date() },
  { id: 'c2', user: 'Amina', text: "Is there a student discount for the tech week?", timestamp: new Date() },
  { id: 'c3', user: 'Obinna', text: "Lagos to the world! 🇳🇬", timestamp: new Date() }
];
// --- END MOCK DATA ---

interface Campaign {
  id: number;
  name: string;
  description: string;
  campaign_type: string;
  multiplier: string;
  bonus_amount: number;
  is_active: boolean;
  start_date: string;
  end_date: string;
}

interface Comment {
  id: string;
  user: string;
  text: string;
  timestamp: Date;
  replies?: Comment[];
}

export function Campaigns() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const { LoaderComponent, showLoader, hideLoader } = Loader();

  const [viewMode, setViewMode] = useState<'explore' | 'legacy'>('explore');
  const [points, setPoints] = useState(0);
  const [showToast, setShowToast] = useState({ show: false, message: '' });
  const [reactions, setReactions] = useState<Record<number, string>>({});
  const [activeComments, setActiveComments] = useState<number | null>(null);
  const [commentsData, setCommentsData] = useState<Record<number, Comment[]>>({});
  const [newComment, setNewComment] = useState("");
  const [downloadingCard, setDownloadingCard] = useState<Campaign | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  // New states for Simulation
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [createData, setCreateData] = useState({ name: '', desc: '', product: '' });

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      showLoader();
      
      const response = await getRequest(ENDPOINTS.bonus_campaigns);
      // Append Mock data to API data or use Mock if API is empty
      const apiData = (response && response.success && response.data) ? response.data : [];
      setCampaigns([...apiData, ...INITIAL_MOCK_CAMPAIGNS]);
      
      // Seed initial comments
      const initialComments: Record<number, Comment[]> = {};
      [...apiData, ...INITIAL_MOCK_CAMPAIGNS].forEach(c => {
        initialComments[c.id] = [MOCK_COMMENTS_POOL[Math.floor(Math.random() * MOCK_COMMENTS_POOL.length)]];
      });
      setCommentsData(initialComments);

    } catch (error) {
      console.error('Failed to load campaigns:', error);
      setCampaigns(INITIAL_MOCK_CAMPAIGNS);
    } finally {
      hideLoader();
      setLoading(false);
    }
  };

  // Performance Optimization
  const memoizedCampaigns = useMemo(() => campaigns, [campaigns]);

  const triggerToast = (msg: string) => {
    setShowToast({ show: true, message: msg });
    setTimeout(() => setShowToast({ show: false, message: '' }), 3000);
  };

  const addPoints = (amount: number, reason: string) => {
    setPoints(prev => prev + amount);
    triggerToast(`+${amount} pts earned for ${reason}`);
  };

  const handleReaction = (id: number, emoji: string) => {
    if (reactions[id]) {
      triggerToast("Already reacted to this campaign!");
      return;
    }
    setReactions(prev => ({ ...prev, [id]: emoji }));
    addPoints(0.1, "reacting");
  };

  const handleShare = async (campaign: Campaign) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: campaign.name,
          text: campaign.description,
          url: 'https://blueseamobile.com.ng',
        });
        addPoints(1, "sharing");
      } catch (err) {
        console.log("Share cancelled");
      }
    } else {
      navigator.clipboard.writeText(`https://blueseamobile.com.ng/explore/${campaign.id}`);
      triggerToast("Link copied to clipboard!");
      addPoints(1, "sharing");
    }
  };

  const downloadAsImage = async () => {
    if (cardRef.current && typeof html2canvas !== 'undefined') {
      const canvas = await html2canvas(cardRef.current, {
        useCORS: true,
        backgroundColor: null,
      });
      const link = document.createElement('a');
      link.download = `${downloadingCard?.name || 'explore'}-card.png`;
      link.href = canvas.toDataURL();
      link.click();
      addPoints(0.5, "downloading card");
      setDownloadingCard(null);
    }
  };

  const submitComment = (id: number) => {
    if (!newComment.trim()) return;
    const commentObj: Comment = {
      id: Math.random().toString(36),
      user: "You",
      text: newComment,
      timestamp: new Date()
    };
    setCommentsData(prev => ({
      ...prev,
      [id]: [commentObj, ...(prev[id] || [])]
    }));
    setNewComment("");
    addPoints(0.3, "commenting");
  };

  const handleCreateCampaign = () => {
    if (!createData.name || !createData.desc) return;
    const newCamp: Campaign = {
      id: Date.now(),
      name: createData.name,
      description: createData.desc,
      campaign_type: 'fixed_bonus',
      multiplier: '1',
      bonus_amount: 100,
      is_active: true,
      start_date: new Date().toISOString(),
      end_date: '2026-12-31'
    };
    setCampaigns([newCamp, ...campaigns]);
    setIsModalOpen(false);
    setCreateData({ name: '', desc: '', product: '' });
    triggerToast("New Campaign Created! 🚀");
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const isCampaignActive = (campaign: Campaign) => {
    const now = new Date();
    const start = new Date(campaign.start_date);
    const end = new Date(campaign.end_date);
    return now >= start && now <= end && campaign.is_active;
  };

  const getCampaignTypeLabel = (type: string) => {
    switch (type) {
      case 'multiplier': return 'Points Multiplier';
      case 'fixed_bonus': return 'Fixed Bonus';
      case 'percentage_bonus': return 'Percentage Bonus';
      default: return type;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex transition-colors duration-300">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0">
        <Header 
          title={viewMode === 'explore' ? "Explore" : "Campaigns"} 
          subtitle={viewMode === 'explore' ? "Discover events, products & trending campaigns" : "Active bonus campaigns"}
          onMenuClick={() => setSidebarOpen(true)} 
        />

        <div className="fixed top-20 right-4 z-40 bg-sky-500 text-white px-4 py-2 rounded-full shadow-lg font-bold flex items-center gap-2 animate-bounce">
          <TrendingUp className="w-4 h-4" />
          {points.toFixed(1)} Pts
        </div>

        {showToast.show && (
          <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 bg-slate-800 text-white px-6 py-3 rounded-2xl shadow-2xl border border-sky-400 animate-in fade-in slide-in-from-bottom-4">
            {showToast.message}
          </div>
        )}

        <main className="flex-1 p-4 md:p-6 overflow-y-auto">
          <div className="max-w-3xl mx-auto space-y-8">
            
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex bg-slate-200 dark:bg-slate-800 p-1 rounded-xl w-fit">
                <button 
                  onClick={() => setViewMode('explore')}
                  className={cn("px-6 py-2 rounded-lg text-sm font-medium transition-all", viewMode === 'explore' ? "bg-white dark:bg-slate-700 shadow text-sky-600" : "text-slate-500")}
                >
                  Explore Feed
                </button>
                <button 
                  onClick={() => setViewMode('legacy')}
                  className={cn("px-6 py-2 rounded-lg text-sm font-medium transition-all", viewMode === 'legacy' ? "bg-white dark:bg-slate-700 shadow text-sky-600" : "text-slate-500")}
                >
                  Legacy View
                </button>
              </div>

              <div className="flex items-center gap-3">
                <p className="text-xs font-medium text-slate-500 italic">فاعل to earn points 🎁</p>
                <button 
                  onClick={() => setIsModalOpen(true)}
                  className="flex items-center gap-2 bg-sky-500 hover:bg-sky-600 text-white px-4 py-2 rounded-full text-sm font-bold shadow-md transition-all active:scale-95"
                >
                  <Plus className="w-4 h-4" /> Create Campaign
                </button>
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-sky-500" />
              </div>
            ) : viewMode === 'explore' ? (
              <div className="space-y-8">
                {memoizedCampaigns.length === 0 ? (
                   <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-3xl border border-dashed border-slate-300">
                     <Gift className="w-12 h-12 mx-auto text-slate-300 mb-4" />
                     <p className="text-slate-500 font-bold">No campaigns found.</p>
                     <p className="text-xs text-slate-400">Be the first to create one!</p>
                   </div>
                ) : (
                  memoizedCampaigns.map((campaign, idx) => {
                    const mockUser = MOCK_USERS[idx % MOCK_USERS.length];
                    const mockProd = MOCK_PRODUCTS[idx % MOCK_PRODUCTS.length];
                    
                    return (
                      <div 
                        key={campaign.id} 
                        className="group relative bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 overflow-hidden shadow-sm hover:shadow-[0_0_20px_rgba(14,165,233,0.15)] hover:border-sky-400 transition-all duration-300 hover:scale-[1.01]"
                      >
                        <div className="p-4 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-sky-400 to-blue-600 flex items-center justify-center text-white font-bold">
                              {mockUser.avatar}
                            </div>
                            <div>
                              <p className="font-bold text-slate-800 dark:text-slate-100 text-sm">{mockUser.name}</p>
                              <p className="text-[10px] text-sky-500 font-medium uppercase tracking-widest">{mockUser.handle}</p>
                            </div>
                          </div>
                          <button 
                            onClick={() => navigate(mockProd.link)}
                            className="text-[10px] bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded-md font-bold text-slate-500 hover:text-sky-500"
                          >
                            VIEW PRODUCT
                          </button>
                        </div>

                        <div className="relative aspect-video bg-slate-100 dark:bg-slate-900 overflow-hidden cursor-pointer" onClick={() => navigate(mockProd.link)}>
                          <img 
                            src={`https://picsum.photos/seed/${campaign.id}/800/450`} 
                            alt={campaign.name}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                            loading="lazy"
                          />
                          <div className="absolute top-4 right-4 bg-black/40 backdrop-blur-md px-3 py-1 rounded-full text-white text-xs font-bold border border-white/20">
                            {campaign.campaign_type === 'multiplier' ? `${campaign.multiplier}x Multiplier` : `${campaign.bonus_amount} Pts Bonus`}
                          </div>
                        </div>

                        <div className="p-5">
                          <h3 className="text-xl font-black text-slate-800 dark:text-white mb-2">{campaign.name}</h3>
                          <p className="text-slate-600 dark:text-slate-400 text-sm line-clamp-2 mb-4 leading-relaxed">
                            {campaign.description}
                          </p>
                          
                          <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-700 pt-4">
                            <div className="flex items-center gap-4">
                              <div className="relative group/react">
                                <button className="flex items-center gap-1.5 text-slate-500 hover:text-sky-500 transition-colors">
                                  {reactions[campaign.id] ? (
                                    <span className="text-xl animate-bounce">{reactions[campaign.id]}</span>
                                  ) : (
                                    <Heart className="w-5 h-5" />
                                  )}
                                  <span className="text-xs font-semibold">React</span>
                                </button>
                                <div className="absolute bottom-full left-0 mb-2 hidden group-hover/react:flex items-center gap-2 bg-white dark:bg-slate-700 p-2 rounded-full shadow-2xl border border-slate-200 dark:border-slate-600 animate-in slide-in-from-bottom-2">
                                  {['👍', '❤️', '🔥', '😂', '😮'].map(emoji => (
                                    <button 
                                      key={emoji}
                                      onClick={() => handleReaction(campaign.id, emoji)}
                                      className="hover:scale-150 transition-transform px-1"
                                    >
                                      {emoji}
                                    </button>
                                  ))}
                                </div>
                              </div>
                              <button 
                                onClick={() => setActiveComments(campaign.id)}
                                className="flex items-center gap-1.5 text-slate-500 hover:text-sky-500 transition-colors"
                              >
                                <MessageCircle className="w-5 h-5" />
                                <span className="text-xs font-semibold">{commentsData[campaign.id]?.length || 0}</span>
                              </button>
                            </div>
                            <div className="flex items-center gap-2">
                               <button onClick={() => handleShare(campaign)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors">
                                <Share2 className="w-5 h-5 text-slate-500" />
                              </button>
                               <button onClick={() => setDownloadingCard(campaign)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors">
                                <Download className="w-5 h-5 text-slate-500" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
                  ) : (
              <div className="space-y-4">
                {memoizedCampaigns.length === 0 ? (
                  <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-12 text-center">
                    <Gift className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600 mb-4" />
                    <p className="text-slate-500 dark:text-slate-400">No active campaigns</p>
                  </div>
                ) : (
                  memoizedCampaigns.map((campaign) => {
                    const active = isCampaignActive(campaign);
                    return (
                      <div
                        key={campaign.id}
                        className={cn(
                          'bg-white dark:bg-slate-900 rounded-2xl border p-6 cursor-pointer',
                          active ? 'border-sky-200 dark:border-sky-800' : 'border-slate-100 dark:border-slate-800 opacity-60'
                        )}
                        onClick={() => navigate('/events/' + campaign.id)}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="text-lg font-semibold dark:text-white">{campaign.name}</h3>
                              {active && <span className="px-2 py-0.5 bg-green-100 text-green-600 text-xs rounded-full">Active</span>}
                            </div>
                            <p className="text-slate-600 dark:text-slate-300 text-sm mb-4">{campaign.description}</p>
                            <div className="flex flex-wrap gap-4 text-sm">
                              <div className="flex items-center gap-1 text-slate-500">
                                <TrendingUp className="w-4 h-4" />
                                <span>{getCampaignTypeLabel(campaign.campaign_type)}</span>
                              </div>
                              <div className="flex items-center gap-1 text-slate-500">
                                <Calendar className="w-4 h-4" />
                                <span>{formatDate(campaign.start_date)} - {formatDate(campaign.end_date)}</span>
                              </div>
                            </div>
                          </div>
                          {active && (
                            <div className="w-10 h-10 rounded-full bg-sky-100 flex items-center justify-center">
                              <ArrowRight className="w-5 h-5 text-sky-500" />
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Side Comment Modal */}
      {activeComments !== null && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 h-full shadow-2xl flex flex-col animate-in slide-in-from-right">
            <div className="p-4 border-b dark:border-slate-800 flex items-center justify-between">
              <h4 className="font-bold text-lg dark:text-white">Comments</h4>
              <button onClick={() => setActiveComments(null)} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800">
                <X className="w-6 h-6 dark:text-white" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              {(commentsData[activeComments] || []).length === 0 ? (
                <div className="text-center py-20 text-slate-400"><Smile className="w-12 h-12 mx-auto mb-2 opacity-20" /><p>Be the first to comment!</p></div>
              ) : (
                commentsData[activeComments].map(cmt => (
                  <div key={cmt.id} className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-sky-100 dark:bg-sky-900 flex-shrink-0 flex items-center justify-center font-bold text-[10px] text-sky-600">
                      {cmt.user[0]}
                    </div>
                    <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded-2xl max-w-[80%]">
                      <p className="text-xs font-bold text-sky-600">{cmt.user}</p>
                      <p className="text-sm dark:text-slate-300">{cmt.text}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="p-4 border-t dark:border-slate-800">
              <div className="relative">
                <input 
                  type="text"
                  placeholder="Add a comment..."
                  className="w-full bg-slate-100 dark:bg-slate-800 rounded-full py-3 px-5 pr-12 text-sm dark:text-white focus:ring-2 ring-sky-500 outline-none"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && submitComment(activeComments)}
                />
                <button onClick={() => submitComment(activeComments)} className="absolute right-2 top-1.5 p-1.5 bg-sky-500 text-white rounded-full"><Send className="w-4 h-4" /></button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Campaign Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[2rem] p-6 shadow-2xl animate-in zoom-in-95">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-black dark:text-white">Create Campaign</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full"><X className="w-5 h-5 dark:text-white"/></button>
            </div>
            
            <div className="space-y-5">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase ml-2">Campaign Name</label>
                <input 
                  className="w-full mt-1 bg-slate-50 dark:bg-slate-800 border-none p-4 rounded-2xl dark:text-white focus:ring-2 ring-sky-500"
                  placeholder="e.g. Lagos Suya Festival Promo"
                  value={createData.name}
                  onChange={e => setCreateData({...createData, name: e.target.value})}
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 uppercase ml-2">Select Linked Product/Event</label>
                <select 
                  className="w-full mt-1 bg-slate-50 dark:bg-slate-800 border-none p-4 rounded-2xl dark:text-white focus:ring-2 ring-sky-500"
                  onChange={e => setCreateData({...createData, product: e.target.value})}
                >
                  <option value="">Select an item...</option>
                  {MOCK_PRODUCTS.map(p => <option key={p.id} value={p.id}>{p.name} ({p.price})</option>)}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 uppercase ml-2">Description</label>
                <textarea 
                  className="w-full mt-1 bg-slate-50 dark:bg-slate-800 border-none p-4 rounded-2xl dark:text-white h-24 focus:ring-2 ring-sky-500"
                  placeholder="What is this campaign about?"
                  value={createData.desc}
                  onChange={e => setCreateData({...createData, desc: e.target.value})}
                />
              </div>

              <button 
                onClick={handleCreateCampaign}
                className="w-full bg-sky-500 hover:bg-sky-600 text-white py-4 rounded-2xl font-black shadow-lg shadow-sky-500/20 transition-all active:scale-95"
              >
                Launch Campaign 🚀
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Download Modal */}
      {downloadingCard && (
        <div className="fixed inset-0 z-[60] bg-black/80 flex items-center justify-center p-4">
          <div className="max-w-sm w-full space-y-6">
            <div ref={cardRef} className="w-full aspect-[4/5] bg-gradient-to-br from-blue-600 via-sky-500 to-blue-800 rounded-[2.5rem] p-8 text-white relative overflow-hidden">
              <CheckCircle2 className="absolute -top-4 -right-4 w-24 h-24 text-white/10" />
              <div className="relative z-10 flex flex-col h-full">
                <div className="font-black text-xl mb-6 italic tracking-tighter">BLUESEA</div>
                <div className="flex-1 rounded-2xl overflow-hidden border-2 border-white/20 mb-4">
                  <img src={`https://picsum.photos/seed/${downloadingCard.id}/400/400`} className="w-full h-full object-cover" />
                </div>
                <h2 className="text-2xl font-black mb-1">{downloadingCard.name}</h2>
                <p className="text-sm font-bold mt-auto">blueseamobile.com.ng</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={downloadAsImage} className="bg-white text-slate-900 py-3 rounded-xl font-bold flex items-center justify-center gap-2">
                <Download className="w-4 h-4" /> Save
              </button>
              <button 
                onClick={() => {
                  navigator.clipboard.writeText("https://blueseamobile.com.ng");
                  triggerToast("Link copied!");
                }}
                className="bg-slate-800 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2"
              >
                <Copy className="w-4 h-4" /> Copy Link
              </button>
            </div>
            <button onClick={() => setDownloadingCard(null)} className="w-full text-white/50 text-center text-sm py-2">Cancel</button>
          </div>
        </div>
      )}

      <LoaderComponent />
    </div>
  );
}