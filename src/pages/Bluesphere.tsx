import { useState } from 'react'; // FIXED: Removed unused useEffect
import { useNavigate } from 'react-router-dom';
import { Sidebar, Toast } from '@/components/ui-custom';
import { Input } from '@/components/ui/input';
import { 
  Search, 
  Gamepad2, 
  // Trophy, 
  Users, 
  ChevronDown, 
  ChevronUp, 
  Sparkles, 
  MessageSquare, 
  PieChart, 
  Dices,
  ArrowRight,
  Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * BLUE SPHERE - COMMUNITY & ENGAGEMENT PAGE
 * Inherits Design System from BlueSea Marketplace
 */

// --- MOCK DATA ---
const ENGAGEMENT_ITEMS = [
  {
    id: 'g1',
    title: 'Pulse Rush',
    description: 'Test your reflexes in this high-speed fintech challenge.',
    fullDescription: 'Pulse Rush is our signature mini-game where you navigate through digital waves to collect BlueSea tokens. The faster you are, the higher you climb on the weekly leaderboard.',
    type: 'game',
    icon: <Zap className="w-6 h-6 text-yellow-500" />,
    stats: { plays: '12.4k', participants: '1.2k' },
    route: '/engage/pulse-rush',
    ctaText: 'Try Pulse Rush',
    rules: ['Avoid the red barriers', 'Collect 10 tokens for a streak', 'Daily reset at 12:00 AM']
  },
  {
    id: 's1',
    title: 'SpinVault',
    description: 'Spin the wheel for daily rewards and airtime bonuses.',
    fullDescription: 'The SpinVault is where luck meets rewards. Every 24 hours, you get one free spin to win transaction discounts, loyalty points, or instant top-up vouchers.',
    type: 'spin',
    icon: <Dices className="w-6 h-6 text-purple-500" />,
    stats: { plays: '45.2k', participants: '8.9k' },
    route: '/engage/spin-vault',
    ctaText: 'Enter SpinVault',
    rules: ['1 Free spin daily', 'Bonus spins on ₦5k+ transactions', 'Rewards expire in 7 days']
  },
  {
    id: 'p1',
    title: 'BlueTalk Polls',
    description: 'Vote on upcoming features and shape the platform.',
    fullDescription: 'We value your voice. Participate in our weekly polls to decide which new utility services or UI themes we should prioritize for the next update.',
    type: 'poll',
    icon: <PieChart className="w-6 h-6 text-sky-500" />,
    stats: { plays: '3.1k', participants: '3.1k' },
    route: '/engage/bluetalk',
    ctaText: 'Open BlueTalk',
    rules: ['One vote per user', 'Results hidden until poll ends', 'Earn 5 points per vote']
  },
  {
    id: 'q1',
    title: 'Daily Trivia',
    description: 'Answer 5 questions about finance and win points.',
    fullDescription: 'Sharpen your financial literacy with BlueSphere Trivia. Answer 5 quick questions correctly to earn BluePoints that can be converted to airtime.',
    type: 'question',
    icon: <MessageSquare className="w-6 h-6 text-green-500" />,
    stats: { plays: '8.7k', participants: '2.4k' },
    route: '/engage/trivia',
    ctaText: 'Start Trivia',
    rules: ['10 seconds per question', 'Perfect score doubles points', 'New trivia every morning']
  }
];

const CATEGORIES = ['All', 'Games', 'Rewards', 'Community'];

// --- SUB-COMPONENTS ---

const StatBadge = ({ icon: Icon, label }: { icon: any, label: string }) => (
  <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700">
    <Icon className="w-3 h-3 text-slate-400" />
    <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400">{label}</span>
  </div>
);

const EngagementCard = ({ item }: { item: typeof ENGAGEMENT_ITEMS[0] }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const navigate = useNavigate();

  return (
    <div 
      className={cn(
        "bg-white dark:bg-slate-900 rounded-2xl border transition-all duration-300 overflow-hidden",
        isExpanded 
          ? "border-sky-500 shadow-xl shadow-sky-500/10 ring-1 ring-sky-500/20" 
          : "border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700"
      )}
    >
      {/* Main Card Content */}
      <div 
        className="p-5 cursor-pointer" 
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="w-12 h-12 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center shadow-sm">
            {item.icon}
          </div>
          <div className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            {isExpanded ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
          </div>
        </div>

        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-1">
          {item.title}
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mb-4 leading-relaxed">
          {item.description}
        </p>

        <div className="flex items-center gap-2">
          <StatBadge icon={Gamepad2} label={`${item.stats.plays} plays`} />
          <StatBadge icon={Users} label={`${item.stats.participants} active`} />
        </div>
      </div>

      {/* Expandable Section */}
      <div 
        className={cn(
          "px-5 overflow-hidden transition-all duration-300 ease-in-out",
          isExpanded ? "max-h-[500px] pb-6 opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-4">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">How it works</h4>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {item.fullDescription}
            </p>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Rules</h4>
            <ul className="space-y-1.5">
              {item.rules.map((rule, idx) => (
                <li key={idx} className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <div className="w-1 h-1 rounded-full bg-sky-500" />
                  {rule}
                </li>
              ))}
            </ul>
          </div>

          <button 
            onClick={() => navigate(item.route)}
            className="w-full mt-2 py-3.5 rounded-xl bg-sky-500 text-white font-bold text-sm flex items-center justify-center gap-2 hover:bg-sky-600 transition-all shadow-lg shadow-sky-500/20 active:scale-[0.98]"
          >
            {item.ctaText}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

// --- MAIN PAGE COMPONENT ---

export default function BlueSphere() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const { ToastComponent } = Toast();

  const filteredItems = ENGAGEMENT_ITEMS.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (activeCategory === 'All') return matchesSearch;
    if (activeCategory === 'Games') return matchesSearch && item.type === 'game';
    if (activeCategory === 'Rewards') return matchesSearch && item.type === 'spin';
    if (activeCategory === 'Community') return matchesSearch && (item.type === 'poll' || item.type === 'question');
    return matchesSearch;
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Header - Matching Marketplace UI */}
        <header className="flex items-center justify-between px-4 py-4 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setSidebarOpen(true)} 
              className="lg:hidden p-2 -ml-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div>
              <h1 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                BlueSphere <Sparkles className="w-4 h-4 text-sky-500 fill-sky-500" />
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">Play, Engage & Earn Rewards</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-sky-50 dark:bg-sky-900/20 border border-sky-100 dark:border-sky-800">
               <Trophy className="w-4 h-4 text-sky-500" />
               <span className="text-xs font-bold text-sky-600 dark:text-sky-400">Rank: #12</span>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6 overflow-y-auto">
          <div className="max-w-5xl mx-auto space-y-6">
            
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input 
                type="text" 
                placeholder="Find a game or activity..." 
                value={searchQuery} 
                onChange={(e) => setSearchQuery(e.target.value)} 
                className="pl-12 py-6 rounded-xl border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-800 shadow-sm focus:ring-sky-500" 
              />
            </div>

            {/* Category Filter */}
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((category) => (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={cn(
                    'px-6 py-2.5 rounded-full text-sm font-bold transition-all',
                    activeCategory === category 
                      ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/30' 
                      : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-100 dark:border-slate-800'
                  )}
                >
                  {category}
                </button>
              ))}
            </div>

            {/* Content Grid */}
            {filteredItems.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {filteredItems.map((item) => (
                  <EngagementCard key={item.id} item={item} />
                ))}
              </div>
            ) : (
              /* Empty State */
              <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-16 text-center shadow-sm">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center">
                  <Gamepad2 className="w-10 h-10 text-slate-300" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Nothing here yet</h3>
                <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                  Check back soon! We're preparing new games and community challenges for you.
                </p>
                <button 
                  onClick={() => setSearchQuery('')}
                  className="mt-8 text-sky-500 font-bold text-sm hover:underline"
                >
                  Clear search filters
                </button>
              </div>
            )}
          </div>
        </main>
      </div>

      <ToastComponent />
    </div>
  );
            }
        
