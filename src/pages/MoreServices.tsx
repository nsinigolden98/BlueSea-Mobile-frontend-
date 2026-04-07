import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar } from '@/components/ui-custom';
import { moreServiceCategories } from '@/data';
import { cn } from '@/lib/utils';
import { 
  Smartphone, 
  Wifi, 
  RefreshCw, 
  MessageSquare,
  Zap, 
  Droplets, 
  Tv, 
  Globe,
  Wallet,
  Users,
  Gift,
  PiggyBank,
  Coins,
  Share2,
  Award,
  Headphones,
  ChevronRight,
  ArrowLeft,
  BookOpen,
  FileText,
  GraduationCap,
  Bell,
  Settings,
  Sparkles,
  QrCode,
  Store,
} from 'lucide-react';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Smartphone,
  Wifi,
  RefreshCw,
  MessageSquare,
  Zap,
  Droplets,
  Tv,
  Globe,
  Wallet,
  Users,
  Gift,
  PiggyBank,
  Coins,
  Share2,
  Award,
  Headphones,
  BookOpen,
  FileText,
  GraduationCap,
  Bell,
  Settings,
  Sparkles,
  QrCode,
  Store,
};

export function MoreServices() {
  const [activeCategory, setActiveCategory] = useState(moreServiceCategories[0].id);
  const navigate = useNavigate();

  const currentCategory = moreServiceCategories.find(c => c.id === activeCategory);

  const handleServiceClick = (serviceId: string) => {
    // Map service IDs to routes
    const routeMap: Record<string, string> = {
      // Telecom
      't1': '/airtime',
      't2': '/data',
      't3': '/airtime-buyback',
      't4': '/auto-topup',
      // TV Subscription
      'tv1': '/tv-subscription',
      'tv2': '/tv-subscription',
      'tv3': '/tv-subscription',
      'tv4': '/tv-subscription',
      // Education
      'e1': '/waec-registration',
      'e2': '/waec-result',
      'e3': '/jamb-registration',
      // Utilities
      'u1': '/light-bills',
      // Finance
      'f1': '/wallet',
      'f2': '/group-payment',
      'f3': '/marketplace',
      // Others
      'o3': '/loyalty',
      'o4': '/rewards',
      'o6': '/support',
      'o7': '/campaigns',
      'o8': '/scanner-assignments',
    };

    const route = routeMap[serviceId];
    if (route) {
      navigate(route);
    } else {
      alert('Feature coming soon!');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex">
      {/* Sidebar */}
      <Sidebar isOpen={false} onClose={() => {}} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex items-center gap-3 px-4 py-4 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 -ml-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold text-slate-800 dark:text-white">More Services</h1>
        </div>

        <main className="flex-1 p-4 md:p-6 overflow-y-auto">
          <div className="max-w-4xl mx-auto">
            {/* Category Tabs */}
            <div className="flex flex-wrap gap-2 mb-6">
              {moreServiceCategories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={cn(
                    'px-4 py-2 rounded-full text-sm font-medium transition-all',
                    activeCategory === category.id
                      ? 'bg-sky-500 text-white shadow-md'
                      : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100'
                  )}
                >
                  {category.name}
                </button>
              ))}
            </div>

            {/* Services Grid */}
            {currentCategory && (
              <div>
                <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">
                  {currentCategory.name}
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {currentCategory.services.map((service) => {
                    const Icon = iconMap[service.icon] || Smartphone;
                    return (
                      <button
                        key={service.id}
                        onClick={() => handleServiceClick(service.id)}
                        className={cn(
                          'group relative p-5 rounded-2xl bg-white dark:bg-slate-900',
                          'border border-slate-100 dark:border-slate-800',
                          'hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200',
                          'flex flex-col items-center gap-3'
                        )}
                      >
                        <div className="w-12 h-12 rounded-xl bg-sky-100 dark:bg-sky-900/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Icon className="w-6 h-6 text-sky-500" />
                        </div>
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300 text-center">
                          {service.name}
                        </span>
                        <ChevronRight className="w-4 h-4 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quick Access */}
            <div className="mt-8">
              <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">
                Quick Access
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { name: 'Dashboard', icon: 'Smartphone', path: '/dashboard' },
                  { name: 'Wallet', icon: 'Wallet', path: '/wallet' },
                  { name: 'Rewards', icon: 'Gift', path: '/rewards' },
                  { name: 'Settings', icon: 'Settings', path: '/settings' },
                ].map((item) => {
                  const Icon = iconMap[item.icon] || Smartphone;
                  return (
                    <button
                      key={item.name}
                      onClick={() => navigate(item.path)}
                      className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:shadow-md transition-all flex items-center gap-3"
                    >
                      <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                        <Icon className="w-5 h-5 text-slate-500" />
                      </div>
                      <span className="font-medium text-slate-700 dark:text-slate-300">{item.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
