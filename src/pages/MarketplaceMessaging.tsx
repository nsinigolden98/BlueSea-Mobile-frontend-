import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { 
  Search, MoreVertical, Send, Paperclip, Check, CheckCheck, 
  Package, Clock, ShieldCheck, ChevronLeft, ShoppingBag, 
  ExternalLink, MessageSquare, DollarSign, Truck, Image as ImageIcon, 
  X, Reply, AlertCircle, Eye, Loader2
} from 'lucide-react';
import { 
  useConversations, 
  useMessages, 
  useSendMessage, 
  useMarkAsRead 
} from '@/hooks/messaging/useMessaging';
import { Message, Conversation } from '@/api/messaging.api';

const StatusBadge = ({ status }: { status: string }) => {
  const styles: Record<string, string> = {
    pending_payment: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    paid: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    shipped: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
    delivered: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    cancelled: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400',
  };
  return (
    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${styles[status] || styles.cancelled}`}>
      {status.replace('_', ' ')}
    </span>
  );
};

export function MarketplaceMessaging() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeConvId = searchParams.get('thread');

  // --- LOCAL UI STATE ---
  const [inputText, setInputText] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(!activeConvId);
  const [replyTarget, setReplyTarget] = useState<Message | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  
  // File Upload Handling
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [pendingImagePreview, setPendingImagePreview] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // --- SERVER STATE ---
  const { data: convRes, isLoading: convLoading } = useConversations();
  const { data: msgRes, isLoading: msgLoading } = useMessages(activeConvId);
  const sendMessageMutation = useSendMessage(activeConvId);
  const markAsReadMutation = useMarkAsRead();

  const conversations = convRes?.data || [];
  const currentMessages = msgRes?.data || [];
  
  const activeConv = useMemo(() => 
    conversations.find((c: Conversation) => c.id === activeConvId), 
  [activeConvId, conversations]);

  const filteredConversations = useMemo(() => {
    if (!searchQuery.trim()) return conversations;
    const q = searchQuery.toLowerCase();
    return conversations.filter((c: Conversation) => 
      c.participants[0]?.name.toLowerCase().includes(q) || 
      c.product?.name.toLowerCase().includes(q)
    );
  }, [conversations, searchQuery]);

  // --- EFFECTS ---
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [currentMessages, pendingImagePreview, replyTarget]);

  useEffect(() => {
    if (activeConvId && activeConv?.unread_count > 0) {
      markAsReadMutation.mutate(activeConvId);
    }
  }, [activeConvId, activeConv?.unread_count]);

  // --- HANDLERS ---
  const handleSendMessage = (e?: React.FormEvent) => {
    e?.preventDefault();
    if ((!inputText.trim() && !pendingFile) || !activeConvId) return;

    const formData = new FormData();
    formData.append('conversation_id', activeConvId);
    if (inputText.trim()) formData.append('message', inputText.trim());
    if (pendingFile) formData.append('attachment', pendingFile);
    if (replyTarget) formData.append('reply_to', replyTarget.id);

    sendMessageMutation.mutate(formData, {
      onSuccess: () => {
        setInputText('');
        setPendingFile(null);
        setPendingImagePreview(null);
        setReplyTarget(null);
      }
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPendingFile(file); // Store actual File for API
      const reader = new FileReader();
      reader.onloadend = () => {
        setPendingImagePreview(reader.result as string); // Store base64 just for local preview
        setShowAttachmentMenu(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const selectConversation = (id: string) => {
    setSearchParams({ thread: id });
    if(window.innerWidth < 768) setIsSidebarOpen(false);
  };

  const handleOrderAction = (action: 'buy' | 'track') => {
    if (action === 'buy' && activeConv?.product) {
      navigate('/checkout', { state: { productId: activeConv.product.id }});
    } else if (activeConv?.order) {
      navigate(`/orders/${activeConv.order.id}`);
    }
  };

  return (
    <div className="flex h-screen w-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 overflow-hidden">
      
      {/* SIDEBAR */}
      <aside className={`
        fixed md:relative z-40 h-full bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-all duration-300
        ${isSidebarOpen ? 'w-full md:w-80 lg:w-96 translate-x-0' : 'w-0 -translate-x-full md:translate-x-0'}
      `}>
        <div className="flex flex-col h-full overflow-hidden">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
            <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800">
              <ChevronLeft className="w-5 h-5 text-slate-500" />
            </button>
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-sky-500" />
              <h1 className="text-xl font-bold">BlueSea Messages</h1>
            </div>
          </div>

          {/* Search Bar */}
          <div className="p-3 border-b border-slate-100 dark:border-slate-800">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search conversations..."
                className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-xl pl-9 pr-3 py-2 text-sm focus:ring-2 focus:ring-sky-500/20 outline-none"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {convLoading ? (
               <div className="flex justify-center p-8"><Loader2 className="w-6 h-6 animate-spin text-slate-400" /></div>
            ) : filteredConversations.length === 0 ? (
               <div className="p-8 text-center text-slate-400 text-sm">No conversations found.</div>
            ) : (
              filteredConversations.map((conv: Conversation) => (
                <button 
                  key={conv.id}
                  onClick={() => selectConversation(conv.id)}
                  className={`w-full p-4 flex gap-3 border-b border-slate-50 dark:border-slate-800/40 transition-colors
                    ${activeConvId === conv.id ? 'bg-sky-50 dark:bg-sky-950/20' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'}
                  `}
                >
                  <img src={conv.product?.image || conv.participants[0]?.avatar} className="w-12 h-12 rounded-lg object-cover" />
                  <div className="flex-1 text-left min-w-0">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-sm truncate">{conv.participants[0]?.name || "User"}</span>
                      <span className="text-[10px] text-slate-400">{conv.updated_at}</span>
                    </div>
                    {conv.product && <div className="text-xs text-slate-500 truncate mt-0.5">{conv.product.name}</div>}
                    <div className="text-xs text-slate-400 truncate mt-1 italic">"{conv.last_message}"</div>
                    {conv.unread_count > 0 && (
                      <span className="inline-flex items-center justify-center px-2 py-0.5 bg-sky-500 text-white text-[10px] font-bold rounded-full mt-1">
                        {conv.unread_count} New
                      </span>
                    )}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      </aside>

      {/* MAIN CHAT */}
      <main className="flex-1 flex flex-col min-w-0 bg-white dark:bg-slate-900 relative">
        
        {!activeConvId ? (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
            <MessageSquare className="w-16 h-16 mb-4 opacity-20" />
            <p>Select a conversation to start messaging</p>
          </div>
        ) : (
          <>
            {/* HEADER */}
            <header className="p-3 md:p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-30">
              <div className="flex items-center gap-3">
                <button onClick={() => setIsSidebarOpen(true)} className="md:hidden p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full">
                  <ChevronLeft className="w-5 h-5 text-slate-500" />
                </button>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold">{activeConv?.participants[0]?.name}</span>
                    {activeConv?.participants[0]?.is_verified && <ShieldCheck className="w-4 h-4 text-sky-500" />}
                  </div>
                  {activeConv?.product && (
                    <div className="text-[11px] text-slate-400 flex gap-2">
                      <span>{activeConv.product.name}</span>
                      <span className="font-bold text-sky-500">₦{activeConv.product.price.toLocaleString()}</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {activeConv?.order && (
                  <div className="hidden sm:block"><StatusBadge status={activeConv.order.status} /></div>
                )}
                <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full"><MoreVertical className="w-5 h-5 text-slate-400" /></button>
              </div>
            </header>

            {/* THREAD CONTENT */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
              
              <div className="flex flex-col items-center gap-2 py-4">
                <div className="flex items-center gap-2 px-4 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="text-[10px] font-medium text-slate-500">
                    Secured: {activeConvId.split('-')[0].toUpperCase()}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400">Conversations are monitored for security and dispute resolution.</p>
              </div>

              {activeConv?.product && (
                <div className="mx-auto max-w-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-3 shadow-sm mb-8">
                  <div className="flex gap-3">
                    <img src={activeConv.product.image} className="w-16 h-16 rounded-xl object-cover" />
                    <div className="flex-1">
                      <h4 className="text-xs font-bold truncate">{activeConv.product.name}</h4>
                      <div className="flex items-center gap-1 mt-1">
                        <DollarSign className="w-3 h-3 text-sky-500" />
                        <p className="text-sm font-black text-sky-500">₦{activeConv.product.price.toLocaleString()}</p>
                      </div>
                      <div className="flex gap-2 mt-2">
                        {activeConv?.order ? (
                          <button onClick={() => handleOrderAction('track')} className="flex-1 py-1.5 bg-slate-100 dark:bg-slate-700 rounded-lg text-[10px] font-bold hover:bg-slate-200 transition-colors flex items-center justify-center gap-1">
                            <Truck className="w-3 h-3" /> Track Order
                          </button>
                        ) : (
                          <button onClick={() => handleOrderAction('buy')} className="flex-1 py-1.5 bg-sky-500 text-white rounded-lg text-[10px] font-bold hover:bg-sky-600 transition-colors flex items-center justify-center gap-1">
                            <ShoppingBag className="w-3 h-3" /> Buy Now
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {msgLoading ? (
                 <div className="flex justify-center p-8"><Loader2 className="w-6 h-6 animate-spin text-slate-400" /></div>
              ) : (
                currentMessages.map((msg: Message) => {
                  const isMe = msg.is_mine;
                  const isSys = msg.role === 'system';
                  const repliedMsg = msg.reply_to ? currentMessages.find((m: Message) => m.id === msg.reply_to) : null;

                  if (isSys) return (
                    <div key={msg.id} className="flex justify-center italic text-[11px] text-slate-400 gap-2">
                      <AlertCircle className="w-3 h-3" /> {msg.text}
                    </div>
                  );

                  return (
                    <div key={msg.id} className={`flex w-full ${isMe ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-1`}>
                      <div className={`max-w-[80%] md:max-w-[60%] group relative`}>
                        
                        <button 
                          onClick={() => setReplyTarget(msg)}
                          className={`absolute top-0 ${isMe ? '-left-8' : '-right-8'} p-2 opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-sky-500`}
                        >
                          <Reply className="w-4 h-4" />
                        </button>

                        <div className={`rounded-2xl p-3 shadow-sm ${isMe ? 'bg-sky-500 text-white rounded-tr-none' : 'bg-slate-100 dark:bg-slate-800 rounded-tl-none'}`}>
                          {repliedMsg && (
                            <div className={`mb-2 p-2 rounded-lg text-[11px] border-l-4 ${isMe ? 'bg-sky-600 border-sky-300' : 'bg-slate-200 dark:bg-slate-700 border-sky-500'} opacity-80`}>
                              <div className="font-bold mb-0.5">{repliedMsg.is_mine ? 'You' : activeConv?.participants[0]?.name}</div>
                              <div className="truncate">{repliedMsg.image_url ? '📷 Photo' : repliedMsg.text}</div>
                            </div>
                          )}

                          {msg.image_url && <img src={msg.image_url} className="rounded-lg mb-2 max-h-60 w-full object-cover cursor-pointer hover:opacity-90" onClick={() => window.open(msg.image_url)} />}
                          {msg.text && <p className="text-sm leading-relaxed">{msg.text}</p>}
                        </div>
                        
                        <div className={`flex items-center gap-1.5 mt-1 text-[10px] text-slate-400 ${isMe ? 'justify-end' : 'justify-start'}`}>
                          <span>{msg.timestamp}</span>
                          {isMe && (
                            msg.status === 'sending' ? <Clock className="w-2.5 h-2.5 animate-pulse" /> : 
                            msg.status === 'failed' ? <X className="w-2.5 h-2.5 text-red-500" /> :
                            msg.status === 'sent' ? <Check className="w-2.5 h-2.5" /> : 
                            <CheckCheck className={`w-2.5 h-2.5 ${msg.status === 'read' ? 'text-sky-400' : ''}`} />
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* INPUT AREA */}
            <footer className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
              <div className="max-w-4xl mx-auto space-y-3">
                
                {replyTarget && (
                  <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 p-2 rounded-t-xl border-x border-t border-slate-200 dark:border-slate-700 animate-in slide-in-from-bottom-2">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-1 bg-sky-500 h-8 rounded-full" />
                      <div className="min-w-0">
                        <span className="text-[10px] font-bold text-sky-500 uppercase">Replying to {replyTarget.is_mine ? 'yourself' : activeConv?.participants[0]?.name}</span>
                        <p className="text-xs text-slate-500 truncate">{replyTarget.image_url ? 'Photo' : replyTarget.text}</p>
                      </div>
                    </div>
                    <button onClick={() => setReplyTarget(null)} className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full"><X className="w-4 h-4" /></button>
                  </div>
                )}

                {pendingImagePreview && (
                  <div className="relative inline-block animate-in zoom-in duration-200">
                    <img src={pendingImagePreview} className="w-20 h-20 object-cover rounded-xl border-2 border-sky-500 shadow-lg" />
                    <button 
                      onClick={() => { setPendingImagePreview(null); setPendingFile(null); }}
                      className="absolute -top-2 -right-2 bg-slate-900 text-white p-1 rounded-full shadow-md"
                    ><X className="w-3 h-3" /></button>
                  </div>
                )}

                <div className="flex items-end gap-2">
                  <div className="relative">
                    <button 
                      onClick={() => setShowAttachmentMenu(!showAttachmentMenu)}
                      className={`p-3 rounded-xl transition-colors ${showAttachmentMenu ? 'bg-sky-500 text-white' : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400'}`}
                    >
                      <Paperclip className="w-5 h-5" />
                    </button>

                    {showAttachmentMenu && (
                      <div className="absolute bottom-full left-0 mb-2 w-48 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl p-2 animate-in slide-in-from-bottom-4">
                        <button onClick={() => fileInputRef.current?.click()} className="w-full flex items-center gap-3 p-2.5 hover:bg-sky-50 dark:hover:bg-sky-900/20 rounded-xl transition-colors text-sm font-medium">
                          <ImageIcon className="w-4 h-4 text-sky-500" /> Upload Image
                        </button>
                        {activeConv?.product && (
                           <button onClick={() => { navigate(`/marketplace/product/${activeConv.product!.id}`); setShowAttachmentMenu(false); }} className="w-full flex items-center gap-3 p-2.5 hover:bg-sky-50 dark:hover:bg-sky-900/20 rounded-xl transition-colors text-sm font-medium">
                             <Eye className="w-4 h-4 text-indigo-500" /> View Product
                           </button>
                        )}
            </div>
                    )}
                  </div>

                  <form onSubmit={handleSendMessage} className="flex-1 flex gap-2">
                    <input 
                      type="text"
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      placeholder="Type a message..."
                      className="flex-1 bg-slate-100 dark:bg-slate-800 border-none rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-sky-500/20 outline-none"
                    />
                    <button 
                      type="submit"
                      disabled={(!inputText.trim() && !pendingFile) || sendMessageMutation.isPending}
                      className={`p-3 rounded-2xl transition-all shadow-lg ${inputText.trim() || pendingFile ? 'bg-sky-500 text-white shadow-sky-500/30' : 'bg-slate-200 dark:bg-slate-700 text-slate-400 opacity-50'}`}
                    >
                      {sendMessageMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                    </button>
                  </form>
                </div>

                {activeConv?.product && (
                  <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
                    <button 
                      onClick={() => navigate(`/marketplace/product/${activeConv.product!.id}`)}
                      className="whitespace-nowrap flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-sky-500 transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" /> View Listing
                    </button>
                  </div>
                )}
              </div>
            </footer>
          </>
        )}
      </main>

      <input 
        type="file" 
        hidden 
        ref={fileInputRef} 
        accept="image/*" 
        onChange={handleImageUpload} 
      />
    </div>
  );
}