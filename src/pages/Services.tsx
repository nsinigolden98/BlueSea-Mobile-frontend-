import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar, Header } from '@/components/ui-custom';
import { services, serviceCategories } from '@/data/services';
import type { Service } from '@/data/services';
import { cn } from '@/lib/utils';
import {
  Smartphone, Wifi, Zap, Tv, RefreshCw, Wallet, Gift, Share2, Coins, 
  Store, ShoppingBag, Briefcase, Network, FileSignature, PiggyBank, 
  CreditCard, Bitcoin, Umbrella, ShieldCheck, Calculator, FileText, 
  Building, Calendar, PieChart, Users, Orbit, PlaySquare, Repeat, 
  ArrowLeftRight, Search, Clock, Star, ChevronRight
} from 'lucide-react';

// Registry of validated routes extracted from AppRoutes
const VALID_APP_ROUTES = new Set([
  '/', '/login', '/signup', '/dashboard', '/wallet', '/airtime', '/data', 
  '/marketplace', '/services', '/settings', '/profile', '/pin', '/light-bills', 
  '/transactions', '/rewards', '/transaction-history', '/campaigns', '/airtime-buyback', 
  '/group-payment', '/loyalty', '/more-services', '/notifications', '/event-manager', 
  '/scanner', '/scanner-assignments', '/my-tickets', '/vendor-verification', '/dstv', 
  '/gotv', '/startimes', '/showmax', '/waec-registration', '/waec-result', 
  '/jamb-registration', '/tv-subscription', '/auto-topup', '/support', '/checkout', 
  '/messages', '/bluesphere', '/products', '/history', '/gift-cards', '/flights', 
  '/spin-vault', '/betting', '/identity-center', '/finance', '/finance/savings', 
  '/finance/cards', '/finance/crypto', '/finance/pension', '/finance/insurance', 
  '/business', '/business/payroll', '/business/properties', '/business/appointments', 
  '/commerce/storefronts', '/commerce/freelance', '/commerce/affiliate', '/commerce/contracts', 
  '/experience/streams', '/subscriptions'
]);

// Centralized icon map to safely render string icons from the registry
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Smartphone, Wifi, Zap, Tv, RefreshCw, Wallet, Gift, Share2, Coins,
  Store, ShoppingBag, Briefcase, Network, FileSignature, PiggyBank,
  CreditCard, Bitcoin, Umbrella, ShieldCheck, Calculator, FileText,
  Building, Calendar, PieChart, Users, Orbit, PlaySquare, Repeat,
  ArrowLeftRight,
};

const Badge = ({ type }: { type: Service['badge'] }) => {
  if (!type) return null;
  const styles = {
    New: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    Popular: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400',
    Recommended: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  };
  
  return (
    <span className={cn('flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wide absolute -top-2 -right-2 border border-white dark:border-slate-900 shadow-sm z-10', styles[type])}>
      {/* Actively using the Star icon for highlight badges */}
      {(type === 'Recommended' || type === 'Popular') && <Star className="w-2.5 h-2.5 fill-current" />}
      {type}
    </span>
  );
};

export function Services() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [recentServiceIds, setRecentServiceIds] = useState<string[]>([]);
  const navigate = useNavigate();

  // Load recently used from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('@bluesea_recent_services');
    if (saved) setRecentServiceIds(JSON.parse(saved));
  }, []);

  const handleNavigation = (service: Service) => {
    // Keep a maximum of 3 unique recent services, drop the oldest
    const newRecents = [service.id, ...recentServiceIds.filter(id => id !== service.id)].slice(0, 3);
    setRecentServiceIds(newRecents);
    localStorage.setItem('@bluesea_recent_services', JSON.stringify(newRecents));
    
    navigate(service.route);
  };

  // Memoized search filtering
  const filteredCategories = useMemo(() => {
    if (!searchQuery) return null;
    const query = searchQuery.toLowerCase();
    return services.filter(
      s => s.name.toLowerCase().includes(query) || 
           s.description.toLowerCase().includes(query) || 
           s.category.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  const renderServiceCard = (service: Service) => {
    const Icon = iconMap[service.icon] || Wallet; // Fallback icon
    const isRouteValid = VALID_APP_ROUTES.has(service.route);

    return (
      <button
        key={service.id}
        onClick={() => {
          if (!isRouteValid) {
            console.warn(`[BlueSea Route Guard] Blocked navigation. Route "${service.route}" for service "${service.name}" does not exist in App Routes.`);
            return;
          }
          handleNavigation(service);
        }}
        disabled={!isRouteValid}
        className={cn(
          'group relative text-left bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800',
          'hover:shadow-md hover:border-sky-300 dark:hover:border-sky-700 transition-all duration-200 ease-out focus:outline-none focus:ring-2 focus:ring-sky-500',
          'p-3 sm:p-4 flex items-center gap-3',
          !isRouteValid && 'opacity-40 grayscale cursor-not-allowed hover:shadow-none hover:border-slate-200 dark:hover:border-slate-800'
        )}
      >
        <Badge type={service.badge} />
        
        <div className={cn(
          'rounded-lg bg-sky-50 dark:bg-sky-950/50 flex items-center justify-center group-hover:scale-105 transition-transform duration-200 shrink-0',
          'w-9 h-9 sm:w-10 sm:h-10'
        )}>
          <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-sky-600 dark:text-sky-400" />
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm sm:text-base text-slate-900 dark:text-white truncate">
            {service.name}
          </h3>
        </div>

        {/* Actively using the ChevronRight icon as a clean interaction indicator */}
        <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-sky-500 transition-colors shrink-0" />
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex font-sans">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0">
        <Header 
          title="Super App Hub" 
          subtitle="Explore the BlueSea Ecosystem"
          onMenuClick={() => setSidebarOpen(true)} 
        />

        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto custom-scrollbar">
          <div className="max-w-7xl mx-auto space-y-8">
            
            {/* Search Section */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search services, bills, commerce..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 sm:py-4 rounded-xl sm:rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 shadow-sm transition-shadow text-sm sm:text-base"
              />
            </div>

            {/* Render Search Results */}
            {filteredCategories ? (
              <div className="space-y-4">
                <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
                  Search Results ({filteredCategories.length})
                </h2>
                {filteredCategories.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
                    {filteredCategories.map(service => renderServiceCard(service))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-slate-500">
                    No services found matching "{searchQuery}"
                  </div>
                )}
              </div>
            ) : (
              <>
                {/* Recently Used (Max 3 Items) */}
                {recentServiceIds.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-slate-900 dark:text-white">
                      <Clock className="w-4 h-4 text-sky-500" />
                      <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Recently Used</h2>
                    </div>
                    {/* Compact 3-column layout on all devices */}
                    <div className="grid grid-cols-3 md:flex md:flex-row gap-3">
                      {recentServiceIds
                        .map(id => services.find(s => s.id === id)!)
                        .filter(Boolean)
                        .map(service => (
                           <div key={service.id} className="md:w-64">
                             {renderServiceCard(service)}
                           </div>
                        ))}
                    </div>
                  </div>
                )}

                <div className="h-px w-full bg-slate-200 dark:bg-slate-800/60" />

                {/* Ecosystem Categories */}
                <div className="space-y-10">
                  {serviceCategories.map((category) => {
                    const categoryServices = services.filter(s => s.category === category);
                    if (categoryServices.length === 0) return null;

                    return (
                      <section key={category} className="space-y-4">
                        <div className="flex items-center gap-3">
                          <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                            {category}
                          </h2>
                          <span className="text-xs font-semibold text-slate-500 bg-slate-100 dark:bg-slate-800/80 px-2 py-0.5 rounded-full">
                            {categoryServices.length}
                          </span>
                        </div>
                        
                        {/* High-density grid tailored for fast scanning */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
                          {categoryServices.map((service) => renderServiceCard(service))}
                        </div>
                      </section>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
