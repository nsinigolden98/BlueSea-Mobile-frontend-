// src/pages/Services.tsx
import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar, Header } from '@/components/ui-custom';
import { services, serviceCategories, featuredServiceIds, Service } from '@/data/services';
import { cn } from '@/lib/utils';
import {
  Smartphone, Wifi, Zap, Tv, RefreshCw, Wallet, Gift, Share2, Coins, 
  Store, ShoppingBag, Briefcase, Network, FileSignature, PiggyBank, 
  CreditCard, Bitcoin, Umbrella, ShieldCheck, Calculator, FileText, 
  Building, Calendar, PieChart, Users, Orbit, PlaySquare, Repeat, 
  ArrowLeftRight, Search, Clock, Star, ChevronRight
} from 'lucide-react';

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
    <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide absolute top-3 right-3', styles[type])}>
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
    // Save to recently used (keep last 4 unique)
    const newRecents = [service.id, ...recentServiceIds.filter(id => id !== service.id)].slice(0, 4);
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

  const renderServiceCard = (service: Service, compact = false) => {
    const Icon = iconMap[service.icon] || Wallet; // Fallback icon

    return (
      <button
        key={service.id}
        onClick={() => handleNavigation(service)}
        className={cn(
          'group relative text-left bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800',
          'hover:shadow-lg hover:border-sky-200 dark:hover:border-sky-800 transition-all duration-300 ease-out focus:outline-none focus:ring-2 focus:ring-sky-500',
          compact ? 'p-4 flex items-center gap-4' : 'p-5 flex flex-col items-start gap-4'
        )}
      >
        {!compact && <Badge type={service.badge} />}
        
        <div className={cn(
          'rounded-xl bg-sky-50 dark:bg-sky-950/50 flex items-center justify-center group-hover:scale-110 group-active:scale-95 transition-transform duration-300',
          compact ? 'w-10 h-10 shrink-0' : 'w-12 h-12'
        )}>
          <Icon className="w-5 h-5 text-sky-600 dark:text-sky-400" />
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-slate-900 dark:text-white truncate">
            {service.name}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5">
            {service.description}
          </p>
        </div>

        {compact && <ChevronRight className="w-4 h-4 text-slate-400 ml-auto" />}
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

        <main className="flex-1 p-4 md:p-8 overflow-y-auto custom-scrollbar">
          <div className="max-w-6xl mx-auto space-y-10">
            
            {/* Search Section */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search services, bills, commerce..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 shadow-sm transition-shadow"
              />
            </div>

            {/* Render Search Results if searching */}
            {filteredCategories ? (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Search Results ({filteredCategories.length})
                </h2>
                {filteredCategories.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
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
                {/* Featured & Recently Used (Only show when not searching) */}
                <div className="grid lg:grid-cols-12 gap-8">
                  {/* Featured Services */}
                  <div className="lg:col-span-8 space-y-4">
                    <div className="flex items-center gap-2 text-slate-900 dark:text-white mb-4">
                      <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                      <h2 className="text-lg font-semibold">Featured Services</h2>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {featuredServiceIds
                        .map(id => services.find(s => s.id === id)!)
                        .filter(Boolean)
                        .map(service => renderServiceCard(service))}
                    </div>
                  </div>

                  {/* Recently Used */}
                  {recentServiceIds.length > 0 && (
                    <div className="lg:col-span-4 space-y-4">
                      <div className="flex items-center gap-2 text-slate-900 dark:text-white mb-4">
                        <Clock className="w-5 h-5 text-sky-500" />
                        <h2 className="text-lg font-semibold">Recently Used</h2>
                      </div>
                      <div className="flex flex-col gap-3">
                        {recentServiceIds
                          .map(id => services.find(s => s.id === id)!)
                          .filter(Boolean)
                          .map(service => renderServiceCard(service, true))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="h-px w-full bg-slate-200 dark:bg-slate-800" />

                {/* All Ecosystem Categories */}
                <div className="space-y-12">
                  {serviceCategories.map((category) => {
                    const categoryServices = services.filter(s => s.category === category);
                    if (categoryServices.length === 0) return null;

                    return (
                      <section key={category} className="space-y-5">
                        <div className="flex items-baseline justify-between">
                          <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                            {category}
                          </h2>
                          <span className="text-sm font-medium text-slate-500 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
                            {categoryServices.length}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
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
