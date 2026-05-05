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
  ChevronLeft,
  ShoppingBag,
  ExternalLink,
  MessageSquare,
  DollarSign,
  Truck
} from 'lucide-react';

/** * --- TYPES & INTERFACES --- 
 */

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
  text: string;
  senderId: string;
  role: MessageRole;
  timestamp: string;
  status: MessageStatus;
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

/** * --- MOCK DATA --- 
 */

const MOCK_CONVERSATIONS: Conversation[] = [
  {
    id: 'conv_1',
    otherUser: { name: 'Sarah Jenkins', avatar: 'https://i.pravatar.cc/150?u=sarah', role: 'seller', isVerified: true },
    product: { id: 'p1', name: 'Vintage Leather Camera Bag', price: 125.00, quantity: 1, image: 'https://images.unsplash.com/photo-1524333892444-210373c450bb?w=100&h=100&fit=crop' },
    orderStatus: 'pending_payment',
    lastMessage: 'Is the price negotiable?',
    unreadCount: 2,
    updatedAt: '10:45 AM'
  },
  {
    id: 'conv_2',
    otherUser: { name: 'Tech Store Plus', avatar: 'https://i.pravatar.cc/150?u=tech', role: 'seller', isVerified: true },
    product: { id: 'p2', name: 'Mechanical Keyboard G-80', price: 89.99, quantity: 1, image: 'https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?w=100&h=100&fit=crop' },
    orderStatus: 'shipped',
    lastMessage: 'Your package has been picked up by the courier.',
    unreadCount: 0,
    updatedAt: 'Yesterday'
  },
  {
    id: 'conv_3',
    otherUser: { name: 'Marcus Aurelius', avatar: 'https://i.pravatar.cc/150?u=marcus', role: 'buyer', isVerified: false },
    product: { id: 'p3', name: 'Handcrafted Oak Desk', price: 450.00, quantity: 1, image: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=100&h=100&fit=crop' },
    orderStatus: 'delivered',
    lastMessage: 'Thanks, the desk looks great in my office!',
    unreadCount: 0,
    updatedAt: 'Monday'
  }
];

const MOCK_MESSAGES: Record<string, Message[]> = {
  'conv_1': [
    { id: 'm1', role: 'system', text: 'Order Created: Vintage Leather Camera Bag', timestamp: '10:30 AM', senderId: 'sys', status: 'read' },
    { id: 'm2', role: 'buyer', text: 'Hi Sarah, I saw the listing. Is it still available?', timestamp: '10:32 AM', senderId: 'me', status: 'read' },
    { id: 'm3', role: 'seller', text: 'Yes it is! I can ship it out today if you purchase within the hour.', timestamp: '10:35 AM', senderId: 'sarah', status: 'read' },
    { id: 'm4', role: 'buyer', text: 'Perfect. Checking the shipping costs now.', timestamp: '10:45 AM', senderId: 'me', status: 'read' },
  ]
};

/** * --- HELPER COMPONENTS --- 
 */

const StatusBadge = ({ status }: { status: OrderStatus }) => {
  const styles: Record<OrderStatus, string> = {
    pending_payment: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    paid: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    shipped: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
    delivered: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    cancelled: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400',
  };
  
  const labels: Record<OrderStatus, string> = {
    pending_payment: 'Pending Payment',
    paid: 'Order Paid',
    shipped: 'In Transit',
    delivered: 'Delivered',
    cancelled: 'Cancelled',
  };

  return (
    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${styles[status]}`}>
      {labels[status]}
    </span>
  );
};

const MessageTicks = ({ status }: { status: MessageStatus }) => {
  if (status === 'sending') return <Clock className="w-3 h-3 text-slate-400 animate-pulse" />;
  if (status === 'sent') return <Check className="w-3 h-3 text-slate-400" />;
  if (status === 'delivered') return <CheckCheck className="w-3 h-3 text-slate-400" />;
  if (status === 'read') return <CheckCheck className="w-3 h-3 text-sky-500" />;
  return null;
};

/** * --- MAIN COMPONENT --- 
 */

export default function MarketplaceMessaging() {
  const [activeConvId, setActiveConvId] = useState<string>('conv_1');
  const [inputText, setInputText] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const activeConv = useMemo(() => 
    MOCK_CONVERSATIONS.find(c => c.id === activeConvId), 
  [activeConvId]);

  const messages = MOCK_MESSAGES[activeConvId] || [];

  // Simulate "Typing" when user enters chat
  useEffect(() => {
    setIsTyping(true);
    const timer = setTimeout(() => setIsTyping(false), 2000);
    return () => clearTimeout(timer);
  }, [activeConvId]);

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    // Logic for sending would go here
    setInputText('');
  };

  return (
    <div className="flex h-screen w-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 overflow-hidden font-sans">
      
      {/* LEFT SIDEBAR: CONVERSATION LIST */}
      <aside className={`
        ${isSidebarOpen ? 'w-full md:w-80 lg:w-96' : 'w-0'} 
        transition-all duration-300 border-r border-slate-200 dark:border-slate-800 
        bg-white dark:bg-slate-900 flex flex-col z-30
        absolute md:relative inset-0 md:inset-auto
      `}>
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h1 className="text-xl font-bold tracking-tight">Messages</h1>
          <div className="flex gap-2">
            <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
              <Search className="w-5 h-5 text-slate-500" />
            </button>
            <button className="md:hidden p-2" onClick={() => setIsSidebarOpen(false)}>
              <ChevronLeft className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {MOCK_CONVERSATIONS.map((conv) => (
            <button
              key={conv.id}
              onClick={() => {
                setActiveConvId(conv.id);
                if (window.innerWidth < 768) setIsSidebarOpen(false);
              }}
              className={`w-full p-4 flex gap-4 transition-all border-b border-slate-50 dark:border-slate-800/50
                ${activeConvId === conv.id ? 'bg-sky-50/50 dark:bg-sky-900/10 border-r-4 border-r-sky-500' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'}
              `}
            >
              <div className="relative flex-shrink-0">
                <img src={conv.product.image} className="w-12 h-12 rounded-xl object-cover shadow-sm" alt="" />
                <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 border-white dark:border-slate-900 overflow-hidden">
                  <img src={conv.otherUser.avatar} className="w-full h-full object-cover" alt="" />
                </div>
              </div>
              
              <div className="flex-1 min-w-0 text-left">
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-bold text-sm truncate pr-2">{conv.otherUser.name}</h3>
                  <span className="text-[10px] text-slate-400 whitespace-nowrap">{conv.updatedAt}</span>
                </div>
                <p className="text-xs font-medium text-slate-500 truncate mb-2">{conv.product.name}</p>
                <div className="flex items-center justify-between">
                  <StatusBadge status={conv.orderStatus} />
                  {conv.unreadCount > 0 && (
                    <span className="bg-sky-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full">
                      {conv.unreadCount}
                    </span>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col min-w-0 relative">
        
        {/* STICKY HEADER / ORDER CONTEXT BAR */}
        <header className="z-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 p-3 md:p-4 shadow-sm">
          <div className="max-w-5xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setIsSidebarOpen(true)}
                className="md:hidden p-2 -ml-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full"
              >
                <MessageSquare className="w-5 h-5 text-sky-500" />
              </button>
              
              <div className="flex items-center gap-4">
                <div className="hidden sm:block w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 overflow-hidden border border-slate-200 dark:border-slate-700">
                  <img src={activeConv?.product.image} className="w-full h-full object-cover" alt="" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h2 className="font-bold text-sm md:text-base truncate">{activeConv?.product.name}</h2>
                    {activeConv?.otherUser.isVerified && <ShieldCheck className="w-4 h-4 text-sky-500 flex-shrink-0" />}
                  </div>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="text-xs font-bold text-sky-600 dark:text-sky-400">
                      ${activeConv?.product.price.toFixed(2)}
                    </span>
                    <span className="text-[10px] text-slate-400 px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded">
                      Qty: {activeConv?.product.quantity}
                    </span>
                    <div className="hidden sm:block scale-90 origin-left">
                      <StatusBadge status={activeConv?.orderStatus || 'pending_payment'} />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* SMART ACTIONS */}
              {activeConv?.orderStatus === 'pending_payment' && (
                <button className="hidden sm:flex items-center gap-2 bg-sky-500 hover:bg-sky-600 text-white px-4 py-2 rounded-xl text-sm font-bold transition-all shadow-lg shadow-sky-500/25 active:scale-95">
                  <DollarSign className="w-4 h-4" /> Pay Now
                </button>
              )}
              {activeConv?.orderStatus === 'shipped' && (
                <button className="hidden sm:flex items-center gap-2 bg-slate-900 dark:bg-slate-100 dark:text-slate-900 text-white px-4 py-2 rounded-xl text-sm font-bold transition-all shadow-lg active:scale-95">
                  <Truck className="w-4 h-4" /> Track Order
                </button>
              )}
              <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                <MoreVertical className="w-5 h-5 text-slate-400" />
              </button>
            </div>
          </div>
        </header>

        {/* MESSAGE AREA */}
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 scroll-smooth"
        >
          <div className="flex flex-col items-center">
            <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800/50 rounded-full text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-8">
              Today
            </span>
          </div>

          {messages.map((msg) => {
            if (msg.role === 'system') {
              return (
                <div key={msg.id} className="flex justify-center animate-in fade-in zoom-in duration-300">
                  <div className="bg-slate-100 dark:bg-slate-800/50 px-4 py-1.5 rounded-full flex items-center gap-2 border border-slate-200/50 dark:border-slate-700/50">
                    <ShoppingBag className="w-3 h-3 text-sky-500" />
                    <span className="text-[11px] font-semibold text-slate-500">{msg.text}</span>
                  </div>
                </div>
              );
            }

            const isMe = msg.role === 'buyer';

            return (
              <div 
                key={msg.id} 
                className={`flex w-full ${isMe ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300`}
              >
                <div className={`max-w-[85%] md:max-w-[70%] group`}>
                  <div className={`
                    p-3 md:p-4 rounded-2xl text-sm md:text-base leading-relaxed shadow-sm transition-all
                    ${isMe 
                      ? 'bg-sky-500 text-white rounded-tr-none' 
                      : 'bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/50 rounded-tl-none'}
                  `}>
                    {msg.text}
                  </div>
                  <div className={`flex items-center gap-2 mt-1.5 ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <span className="text-[10px] text-slate-400 font-medium">{msg.timestamp}</span>
                    {isMe && <MessageTicks status={msg.status} />}
                  </div>
                </div>
              </div>
            );
          })}

          {/* TYPING INDICATOR */}
          {isTyping && (
            <div className="flex justify-start animate-in fade-in duration-200">
              <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/50 p-3 rounded-2xl rounded-tl-none flex gap-1 items-center">
                <span className="w-1.5 h-1.5 bg-slate-300 dark:bg-slate-600 rounded-full animate-bounce" />
                <span className="w-1.5 h-1.5 bg-slate-300 dark:bg-slate-600 rounded-full animate-bounce [animation-delay:0.2s]" />
                <span className="w-1.5 h-1.5 bg-slate-300 dark:bg-slate-600 rounded-full animate-bounce [animation-delay:0.4s]" />
              </div>
            </div>
          )}
        </div>

        {/* INPUT AREA */}
        <footer className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
          <div className="max-w-5xl mx-auto">
            <form 
              onSubmit={handleSendMessage}
              className="relative flex items-center gap-2 bg-slate-50 dark:bg-slate-800/50 p-2 rounded-2xl border border-slate-200 dark:border-slate-700 focus-within:ring-2 ring-sky-500/20 transition-all"
            >
              <button type="button" className="p-2 text-slate-400 hover:text-sky-500 transition-colors">
                <Paperclip className="w-5 h-5" />
              </button>
              
              <input 
                type="text" 
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Type your message about this order..."
                className="flex-1 bg-transparent border-none focus:ring-0 text-sm md:text-base py-2"
              />

              <button 
                type="submit"
                disabled={!inputText.trim()}
                className={`
                  p-2.5 rounded-xl transition-all shadow-md
                  ${inputText.trim() 
                    ? 'bg-sky-500 text-white scale-100' 
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-400 scale-95 opacity-50'}
                `}
              >
                <Send className="w-5 h-5" />
              </button>
            </form>
            
            <div className="flex gap-4 mt-3 px-2 overflow-x-auto no-scrollbar">
              <button className="whitespace-nowrap text-[11px] font-bold text-slate-400 hover:text-sky-500 uppercase tracking-wider flex items-center gap-1.5">
                <Package className="w-3 h-3" /> Check Inventory
              </button>
              <button className="whitespace-nowrap text-[11px] font-bold text-slate-400 hover:text-sky-500 uppercase tracking-wider flex items-center gap-1.5">
                <ExternalLink className="w-3 h-3" /> View Listing
              </button>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}

