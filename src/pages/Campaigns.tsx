import { useState, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import html2canvas from 'html2canvas';
import { 
  useCampaigns, 
  useEarnings, 
  useGenerateAffiliateLink,
  useCampaignComments,
  useSubmitComment
} from '@/hooks/affiliate/useAffiliate';
import { Sidebar, Header, Loader } from '@/components/ui-custom';
import { cn } from '@/lib/utils';
import { 
  TrendingUp, Calendar, Loader2, ArrowRight, Heart, MessageCircle, 
  Share2, Download, Smile, X, Send, Copy, CheckCircle2, Plus, 
  Wallet, ChevronDown, MapPin, Tag, ExternalLink 
} from 'lucide-react';
import { Campaign } from '@/api/affiliate.api';

const formatNaira = (amount: number) => {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
  }).format(amount);
};

export function Campaigns() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showEarningsDropdown, setShowEarningsDropdown] = useState(false);
  const [showToast, setShowToast] = useState({ show: false, message: '' });
  const [reactions, setReactions] = useState<Record<string, string>>({});
  const [activeCommentsId, setActiveCommentsId] = useState<string | null>(null);
  const [newComment, setNewComment] = useState("");
  const [downloadingCard, setDownloadingCard] = useState<Campaign | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // --- SERVER STATE ---
  const { data: campaignsRes, isLoading: campaignsLoading } = useCampaigns();
  const { data: earningsRes } = useEarnings();
  const { data: commentsRes } = useCampaignComments(activeCommentsId);
  
  const generateLinkMutation = useGenerateAffiliateLink();
  const submitCommentMutation = useSubmitComment();

  const campaigns = campaignsRes?.data || [];
  const earnings = earningsRes?.data || { total: 0, pending: 0, withdrawable: 0 };
  const activeComments = commentsRes?.data || [];

  const sortedCampaigns = useMemo(() => {
    return [...campaigns].sort((a, b) => b.commission_percent - a.commission_percent);
  }, [campaigns]);

  // --- HANDLERS ---
  const triggerToast = (msg: string) => {
    setShowToast({ show: true, message: msg });
    setTimeout(() => setShowToast({ show: false, message: '' }), 3000);
  };

  const handleShare = async (campaign: Campaign) => {
    try {
      // 1. Generate real backend-attributed link
      const response = await generateLinkMutation.mutateAsync(campaign.id);
      const refLink = response.data.affiliate_link;
      
      // 2. Share or Copy
      if (navigator.share) {
        await navigator.share({
          title: `Promote ${campaign.name}`,
          text: `Check out this amazing deal!`,
          url: refLink,
        });
      } else {
        await navigator.clipboard.writeText(refLink);
        triggerToast("Referral link copied! 💸");
      }
    } catch (err) {
      triggerToast("Failed to generate tracking link.");
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

  const handleSubmitComment = async () => {
    if (!newComment.trim() || !activeCommentsId) return;
    try {
      await submitCommentMutation.mutateAsync({ 
        campaignId: activeCommentsId, 
        text: newComment 
      });
      setNewComment("");
    } catch {
      triggerToast("Failed to post comment.");
    }
  };

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
                  onClick={() => navigate('/merchant/dashboard')}
                  className="bg-sky-500 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-sky-600 transition-all shadow-lg shadow-sky-500/20"
                >
                  My Storefront
                </button>
            </div>

            {campaignsLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-sky-500" />
              </div>
            ) : sortedCampaigns.length === 0 ? (
               <div className="text-center py-20 text-slate-400">
                  <p className="font-bold">No active campaigns.</p>
               </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {sortedCampaigns.map((campaign) => {
                  const estimatedEarning = (campaign.price * campaign.commission_percent) / 100;

                  return (
                    <div 
                      key={campaign.id} 
                      className="group relative bg-white dark:bg-slate-800 rounded-[2.5rem] border border-slate-100 dark:border-slate-700 overflow-hidden shadow-sm hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)] dark:hover:shadow-[0_20px_50px_rgba(0,0,0,0.3)] transition-all duration-500"
                    >
                      {/* CARD HEADER */}
                      <div className="p-5 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <img src={campaign.seller_avatar || `https://ui-avatars.com/api/?name=${campaign.seller_name}`} alt="seller" className="w-10 h-10 rounded-full border dark:border-slate-600 object-cover" />
                          <div>
                            <p className="font-black text-slate-800 dark:text-slate-100 text-sm leading-tight">{campaign.seller_name}</p>
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
                          src={campaign.image_url} 
                          alt={campaign.name}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
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
                            onClick={() => navigate(`/marketplace/product/${campaign.id}`)}
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
                             {campaign.commission_percent}% — <span className="text-sky-500">{formatNaira(estimatedEarning)}</span>
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
                              onClick={() => setActiveCommentsId(campaign.id)}
                              className="flex items-center gap-1.5 text-slate-400 hover:text-sky-500 transition-colors"
                            >
                               <MessageCircle className="w-5 h-5" />
                              <span className="text-[10px] font-black uppercase">Discuss</span>
                            </button>
                           </div>
                          <div className="flex items-center gap-2">
                             <button 
                               onClick={() => handleShare(campaign)}
                               disabled={generateLinkMutation.isPending} 
                               className="flex items-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-4 py-2 rounded-xl text-xs font-black hover:scale-105 transition-all active:scale-95 disabled:opacity-50"
                             >
                               {generateLinkMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Share2 className="w-3.5 h-3.5" />} Promote
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
                           <span className="flex items-center gap-1">Posted by {campaign.seller_name}</span>
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
      {activeCommentsId !== null && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 h-full shadow-2xl flex flex-col animate-in slide-in-from-right">
            <div className="p-6 border-b dark:border-slate-800 flex items-center justify-between">
              <h4 className="font-black text-xl dark:text-white">Discussion</h4>
              <button onClick={() => setActiveCommentsId(null)} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800">
                <X className="w-6 h-6 dark:text-white" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {activeComments.length === 0 ? (
                <div className="text-center py-20 text-slate-400">
                  <Smile className="w-12 h-12 mx-auto mb-2 opacity-20" />
                  <p className="font-bold">No questions yet.</p>
                  <p className="text-xs">Be the first to ask about this item!</p>
                </div>
              ) : (
                activeComments.map((cmt: any) => (
                  <div key={cmt.id} className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-sky-500 flex-shrink-0 flex items-center justify-center font-black text-[10px] text-white">
                      {cmt.user.name[0]}
                    </div>
                    <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-2xl rounded-tl-none max-w-[85%]">
                      <p className="text-[10px] font-black text-sky-600 uppercase mb-1">{cmt.user.name}</p>
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
                  onKeyDown={(e) => e.key === 'Enter' && handleSubmitComment()}
                />
                <button 
                  onClick={handleSubmitComment} 
                  disabled={submitCommentMutation.isPending || !newComment.trim()}
                  className="absolute right-2 top-2 p-2 bg-sky-500 text-white rounded-xl shadow-lg shadow-sky-500/30 disabled:opacity-50"
                >
                  {submitCommentMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                </button>
              </div>
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
              <div className="absolute -top-12 -right-12 w-48 h-48 bg-sky-500/20 blur-[80px]" />
              <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-blue-600/20 blur-[80px]" />
              
              <div className="relative z-10 flex flex-col h-full">
                <div className="flex justify-between items-start mb-6">
                  <div className="font-black text-xl italic tracking-tighter text-sky-400">BLUESEA</div>
                  <div className="px-3 py-1 bg-white/10 rounded-full text-[10px] font-black border border-white/10">AFFILIATE PROMO</div>
                </div>

                <div className="flex-1 rounded-[2rem] overflow-hidden border border-white/10 mb-6 shadow-2xl">
                  <img src={downloadingCard.image_url} className="w-full h-full object-cover" />
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
                onClick={async () => {
                  try {
                    const response = await generateLinkMutation.mutateAsync(downloadingCard.id);
                    await navigator.clipboard.writeText(response.data.affiliate_link);
                    triggerToast("Referral link copied!");
                  } catch (e) {
                    triggerToast("Failed to generate tracking link.");
                  }
                }}
                disabled={generateLinkMutation.isPending}
                className="bg-white text-slate-900 py-4 rounded-2xl font-black flex items-center justify-center gap-2 active:scale-95 transition-transform disabled:opacity-50"
              >
                {generateLinkMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Copy className="w-4 h-4" />} Copy Link
              </button>
            </div>
            <button onClick={() => setDownloadingCard(null)} className="w-full text-white/40 text-center text-sm font-bold py-2">Close</button>
          </div>
        </div>
      )}

    </div>
  );
}