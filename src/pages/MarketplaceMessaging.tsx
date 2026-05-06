import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Search, 
  MoreVertical, 
  Send, 
  Paperclip, 
  Check, 
  CheckCheck, 
  Package, 
  Clock, 
  ShieldCheck, 
//  ChevronLeft,
  ShoppingBag,
  ExternalLink,
  MessageSquare,
  DollarSign,
  Truck,
  Image as ImageIcon,
  X,
  Reply,
  AlertCircle,
  Eye
} from 'lucide-react';

/** --- TYPES & INTERFACES --- */

type OrderStatus = 'pending_payment' | 'paid' | 'shipped' | 'delivered' | 'cancelled';
type MessageRole = 'buyer' | 'seller' | 'system';
type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read';

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

interface Message {
  id: string;
  text?: string;
  image?: string;
  senderId: string;
  role: MessageRole;
  timestamp: string;
  status: MessageStatus;
  replyTo?: string; // ID of the message being replied to
}

interface Conversation {
  id: string;
  otherUser: {
    name: string;
    avatar: string;
    role: 'buyer' | 'seller';
    isVerified: boolean;
  };
  product: Product;
  orderStatus: OrderStatus;
  lastMessage: string;
  unreadCount: number;
  updatedAt: string;
}

/** --- MOCK DATA --- */

const MOCK_CONVERSATIONS: Conversation[] = [
  {
    id: 'conv_1',
    otherUser: { name: 'Sarah Jenkins', avatar: 'https://i.pravatar.cc/150?u=sarah', role: 'seller', isVerified: true },
    product: { id: 'BLU-PROD-1287', name: 'Vintage Leather Camera Bag', price: 125.00, quantity: 1, image: 'https://images.unsplash.com/photo-1524333892444-210373c450bb?w=100&h=100&fit=crop' },
    orderStatus: 'pending_payment',
    lastMessage: 'Perfect. Checking the shipping costs now.',
    unreadCount: 2,
    updatedAt: '10:45 AM'
  },
  {
    id: 'conv_2',
    otherUser: { name: 'Tech Store Plus', avatar: 'https://i.pravatar.cc/150?u=tech', role: 'seller', isVerified: true },
    product: { id: 'BLU-PROD-4492', name: 'Mechanical Keyboard G-80', price: 89.99, quantity: 1, image: 'https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?w=100&h=100&fit=crop' },
    orderStatus: 'shipped',
    lastMessage: 'Your package has been picked up by the courier.',
    unreadCount: 0,
    updatedAt: 'Yesterday'
  }
];

const INITIAL_MESSAGES: Record<string, Message[]> = {
  'conv_1': [
    { id: 'm1', role: 'system', text: 'Conversation started from product page', timestamp: '10:30 AM', senderId: 'sys', status: 'read' },
    { id: 'm2', role: 'buyer', text: 'Hi Sarah, I saw the listing. Is it still available?', timestamp: '10:32 AM', senderId: 'me', status: 'read' },
    { id: 'm3', role: 'seller', text: 'Yes it is! I can ship it out today if you purchase within the hour.', timestamp: '10:35 AM', senderId: 'sarah', status: 'read' },
    { id: 'm4', role: 'buyer', text: 'Perfect. Checking the shipping costs now.', timestamp: '10:45 AM', senderId: 'me', status: 'read' },
  ]
};

/** --- UTILS --- */
const generateChatId = (prodId: string, idx: string) => `${prodId}-CHAT-${idx.slice(-2)}`;

/** --- COMPONENTS --- */

const StatusBadge = ({ status }: { status: OrderStatus }) => {
  const styles: Record<OrderStatus, string> = {
    pending_payment: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    paid: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    shipped: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
    delivered: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    cancelled: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400',
  };
  return (
    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${styles[status]}`}>
      {status.replace('_', ' ')}
    </span>
  );
};

export function MarketplaceMessaging() {
  // State
  const [activeConvId, setActiveConvId] = useState<string>('conv_1');
  const [conversations, setConversations] = useState(MOCK_CONVERSATIONS);
  const [allMessages, setAllMessages] = useState(INITIAL_MESSAGES);
  const [inputText, setInputText] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [replyTarget, setReplyTarget] = useState<Message | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Image Attachment State
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const [pendingImage, setPendingImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const activeConv = useMemo(() => 
    conversations.find(c => c.id === activeConvId), 
  [activeConvId, conversations]);

  const currentMessages = allMessages[activeConvId] || [];

  const filteredConversations = useMemo(() => {
    if (!searchQuery.trim()) return conversations;
    const q = searchQuery.toLowerCase();
    return conversations.filter(c => 
      c.otherUser.name.toLowerCase().includes(q) || 
      c.product.name.toLowerCase().includes(q)
    );
  }, [conversations, searchQuery]);

  // Scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [currentMessages, isTyping, pendingImage, replyTarget]);

  // Handlers
  const handleSendMessage = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputText.trim() && !pendingImage) return;

    const newMessage: Message = {
      id: `m_${Date.now()}`,
      text: inputText.trim() || undefined,
      image: pendingImage || undefined,
      senderId: 'me',
      role: 'buyer',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'sending',
      replyTo: replyTarget?.id
    };

    // Optimistic UI Update
    setAllMessages(prev => ({
      ...prev,
      [activeConvId]: [...(prev[activeConvId] || []), newMessage]
    }));

    setInputText('');
    setPendingImage(null);
    setReplyTarget(null);

    // Simulate Status Transitions
    setTimeout(() => {
      updateMessageStatus(newMessage.id, 'sent');
      setTimeout(() => updateMessageStatus(newMessage.id, 'delivered'), 1000);
      
      // Simulate Bot Reply
      if (!isTyping) {
        setTimeout(() => {
          setIsTyping(true);
          setTimeout(() => {
            setIsTyping(false);
            const botMsg: Message = {
              id: `m_${Date.now() + 1}`,
              text: "Got it! I'll check that for you right now.",
              senderId: 'seller',
              role: 'seller',
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              status: 'read'
            };
            setAllMessages(prev => ({
              ...prev,
              [activeConvId]: [...(prev[activeConvId] || []), botMsg]
            }));
          }, 2000);
        }, 1500);
      }
    }, 800);
  };

  const updateMessageStatus = (msgId: string, status: MessageStatus) => {
    setAllMessages(prev => ({
      ...prev,
      [activeConvId]: prev[activeConvId].map(m => m.id === msgId ? { ...m, status } : m)
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPendingImage(reader.result as string);
        setShowAttachmentMenu(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const markAllAsRead = () => {
    setConversations(prev => prev.map(c => ({ ...c, unreadCount: 0 })));
  };

  const handleOrderAction = (action: 'buy' | 'track') => {
    if (action === 'buy') {
      alert('Starting Checkout...');
    } else {
      alert('Tracking shipment...');
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
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-sky-500" />
              <h1 className="text-xl font-bold">BlueSea Messages</h1>
            </div>
            <button onClick={() => setIsSidebarOpen(false)} className="md:hidden p-2"><X /></button>
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
                className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-xl pl-9 pr-3 py-2 text-sm focus:ring-2 focus:ring-sky-500/20"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {filteredConversations.map(conv => (
              <button 
                key={conv.id}
                onClick={() => { setActiveConvId(conv.id); if(window.innerWidth < 768) setIsSidebarOpen(false); }}
                className={`w-full p-4 flex gap-3 border-b border-slate-50 dark:border-slate-800/40 transition-colors
                  ${activeConvId === conv.id ? 'bg-sky-50 dark:bg-sky-950/20' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'}
                `}
              >
                <img src={conv.product.image} className="w-12 h-12 rounded-lg object-cover" />
                <div className="flex-1 text-left min-w-0">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-sm truncate">{conv.otherUser.name}</span>
                    <span className="text-[10px] text-slate-400">{conv.updatedAt}</span>
                  </div>
                  <div className="text-xs text-slate-500 truncate mt-0.5">{conv.product.name}</div>
                  <div className="text-xs text-slate-400 truncate mt-1 italic">"{conv.lastMessage}"</div>
                  {conv.unreadCount > 0 && (
                    <span className="inline-flex items-center justify-center w-5 h-5 bg-sky-500 text-white text-[10px] font-bold rounded-full mt-1">
                      {conv.unreadCount}
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      </aside>

      {/* MAIN CHAT */}
      <main className="flex-1 flex flex-col min-w-0 bg-white dark:bg-slate-900 relative">
        
        {/* HEADER */}
        <header className="p-3 md:p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button onClick={toggleSidebar} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full">
              <MessageSquare className="w-5 h-5 text-sky-500" />
            </button>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold">{activeConv?.otherUser.name}</span>
                {activeConv?.otherUser.isVerified && <ShieldCheck className="w-4 h-4 text-sky-500" />}
              </div>
              <div className="text-[11px] text-slate-400 flex gap-2">
                <span>{activeConv?.product.name}</span>
                <span className="font-bold text-sky-500">${activeConv?.product.price}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden sm:block"><StatusBadge status={activeConv?.orderStatus || 'pending_payment'} /></div>
            <button onClick={markAllAsRead} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full" title="Mark all as read">
              <CheckCheck className="w-5 h-5 text-slate-400" />
            </button>
            <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full"><MoreVertical className="w-5 h-5 text-slate-400" /></button>
          </div>
        </header>

        {/* THREAD CONTENT */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
          
          {/* SECURITY STRIP */}
          <div className="flex flex-col items-center gap-2 py-4">
            <div className="flex items-center gap-2 px-4 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span className="text-[10px] font-medium text-slate-500">
                Secured: {generateChatId(activeConv?.product.id || '', activeConvId)}
              </span>
            </div>
            <p className="text-[10px] text-slate-400">Conversations are monitored for security and dispute resolution.</p>
          </div>
    {/* PRODUCT CONTEXT CARD */}
          <div className="mx-auto max-w-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-3 shadow-sm mb-8">
            <div className="flex gap-3">
              <img src={activeConv?.product.image} className="w-16 h-16 rounded-xl object-cover" />
              <div className="flex-1">
                <h4 className="text-xs font-bold truncate">{activeConv?.product.name}</h4>
                <div className="flex items-center gap-1 mt-1">
                  <DollarSign className="w-3 h-3 text-sky-500" />
                  <p className="text-sm font-black text-sky-500">${activeConv?.product.price}</p>
                </div>
                <div className="flex gap-2 mt-2">
                  <button onClick={() => handleOrderAction('track')} className="flex-1 py-1.5 bg-slate-100 dark:bg-slate-700 rounded-lg text-[10px] font-bold hover:bg-slate-200 transition-colors flex items-center justify-center gap-1">
                    <Truck className="w-3 h-3" /> Track
                  </button>
                  <button onClick={() => handleOrderAction('buy')} className="flex-1 py-1.5 bg-sky-500 text-white rounded-lg text-[10px] font-bold hover:bg-sky-600 transition-colors flex items-center justify-center gap-1">
                    <ShoppingBag className="w-3 h-3" /> Buy Now
                  </button>
                </div>
              </div>
            </div>
          </div>

          {currentMessages.map((msg) => {
            const isMe = msg.role === 'buyer';
            const isSys = msg.role === 'system';
            const repliedMsg = msg.replyTo ? currentMessages.find(m => m.id === msg.replyTo) : null;

            if (isSys) return (
              <div key={msg.id} className="flex justify-center italic text-[11px] text-slate-400 gap-2">
                <AlertCircle className="w-3 h-3" /> {msg.text}
              </div>
            );

            return (
              <div key={msg.id} className={`flex w-full ${isMe ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-1`}>
                <div className={`max-w-[80%] md:max-w-[60%] group relative`}>
                  
                  {/* REPLY ICON TRIGGER */}
                  <button 
                    onClick={() => setReplyTarget(msg)}
                    className={`absolute top-0 ${isMe ? '-left-8' : '-right-8'} p-2 opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-sky-500`}
                  >
                    <Reply className="w-4 h-4" />
                  </button>

                  <div className={`rounded-2xl p-3 shadow-sm ${isMe ? 'bg-sky-500 text-white rounded-tr-none' : 'bg-slate-100 dark:bg-slate-800 rounded-tl-none'}`}>
                    {/* Render Replied Preview */}
                    {repliedMsg && (
                      <div className={`mb-2 p-2 rounded-lg text-[11px] border-l-4 ${isMe ? 'bg-sky-600 border-sky-300' : 'bg-slate-200 dark:bg-slate-700 border-sky-500'} opacity-80`}>
                        <div className="font-bold mb-0.5">{repliedMsg.role === 'buyer' ? 'You' : activeConv?.otherUser.name}</div>
                        <div className="truncate">{repliedMsg.image ? '📷 Photo' : repliedMsg.text}</div>
                      </div>
                    )}

                    {msg.image && <img src={msg.image} className="rounded-lg mb-2 max-h-60 w-full object-cover cursor-pointer hover:opacity-90" onClick={() => window.open(msg.image)} />}
                    {msg.text && <p className="text-sm leading-relaxed">{msg.text}</p>}
                  </div>
                  
                  <div className={`flex items-center gap-1.5 mt-1 text-[10px] text-slate-400 ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <span>{msg.timestamp}</span>
                    {isMe && (
                      msg.status === 'sending' ? <Clock className="w-2.5 h-2.5 animate-pulse" /> : 
                      msg.status === 'sent' ? <Check className="w-2.5 h-2.5" /> : <CheckCheck className={`w-2.5 h-2.5 ${msg.status === 'read' ? 'text-sky-400' : ''}`} />
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-slate-100 dark:bg-slate-800 px-3 py-2 rounded-full flex gap-1 items-center">
                <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" />
                <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.4s]" />
              </div>
            </div>
          )}
        </div>

        {/* INPUT AREA */}
        <footer className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="max-w-4xl mx-auto space-y-3">
            
            {/* Reply Preview Bar */}
            {replyTarget && (
              <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 p-2 rounded-t-xl border-x border-t border-slate-200 dark:border-slate-700 animate-in slide-in-from-bottom-2">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-1 bg-sky-500 h-8 rounded-full" />
                  <div className="min-w-0">
                    <span className="text-[10px] font-bold text-sky-500 uppercase">Replying to {replyTarget.role === 'buyer' ? 'yourself' : activeConv?.otherUser.name}</span>
                    <p className="text-xs text-slate-500 truncate">{replyTarget.image ? 'Photo' : replyTarget.text}</p>
                  </div>
                </div>
                <button onClick={() => setReplyTarget(null)} className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full"><X className="w-4 h-4" /></button>
              </div>
            )}

            {/* Image Preview Card */}
            {pendingImage && (
              <div className="relative inline-block animate-in zoom-in duration-200">
                <img src={pendingImage} className="w-20 h-20 object-cover rounded-xl border-2 border-sky-500 shadow-lg" />
                <button 
                                onClick={() => setPendingImage(null)}
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

                {/* BlueSea Action Sheet */}
                {showAttachmentMenu && (
                  <div className="absolute bottom-full left-0 mb-2 w-48 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl p-2 animate-in slide-in-from-bottom-4">
                    <button onClick={() => fileInputRef.current?.click()} className="w-full flex items-center gap-3 p-2.5 hover:bg-sky-50 dark:hover:bg-sky-900/20 rounded-xl transition-colors text-sm font-medium">
                      <ImageIcon className="w-4 h-4 text-sky-500" /> Upload Image
                    </button>
                    <button onClick={() => { alert('Sharing Product...'); setShowAttachmentMenu(false); }} className="w-full flex items-center gap-3 p-2.5 hover:bg-sky-50 dark:hover:bg-sky-900/20 rounded-xl transition-colors text-sm font-medium">
                      <Eye className="w-4 h-4 text-indigo-500" /> View Product
                    </button>
                    <button onClick={() => { alert('Generating Proof...'); setShowAttachmentMenu(false); }} className="w-full flex items-center gap-3 p-2.5 hover:bg-sky-50 dark:hover:bg-sky-900/20 rounded-xl transition-colors text-sm font-medium">
                      <CheckCheck className="w-4 h-4 text-emerald-500" /> Order Proof
                    </button>
                  </div>
                )}
              </div>

              <form onSubmit={handleSendMessage} className="flex-1 flex gap-2">
                <input 
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Ask about inventory or shipping..."
                  className="flex-1 bg-slate-100 dark:bg-slate-800 border-none rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-sky-500/20"
                />
                <button 
                  type="submit"
                  disabled={!inputText.trim() && !pendingImage}
                  className={`p-3 rounded-2xl transition-all shadow-lg ${inputText.trim() || pendingImage ? 'bg-sky-500 text-white shadow-sky-500/30' : 'bg-slate-200 dark:bg-slate-700 text-slate-400 opacity-50'}`}
                >
                  <Send className="w-5 h-5" />
                </button>
              </form>
            </div>

            <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
              <button 
                onClick={() => alert('Stock is: 4 Units Available')}
                className="whitespace-nowrap flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-sky-500 transition-colors"
              >
                <Package className="w-3.5 h-3.5" /> Check Inventory
              </button>
              <button 
                onClick={() => alert('Navigating to Product BLU-PROD...')}
                className="whitespace-nowrap flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-sky-500 transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" /> View Listing
              </button>
            </div>
          </div>
        </footer>
      </main>

      {/* HIDDEN INPUT */}
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
