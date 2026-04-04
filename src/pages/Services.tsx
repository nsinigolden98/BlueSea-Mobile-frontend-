import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar, Header } from '@/components/ui-custom';
import { services } from '@/data';
import { cn } from '@/lib/utils';
import {
  Vault,
  Users,
  RefreshCw,
  Smartphone,
  Wifi,
  Zap,
  Tv,
  Wallet,
  Gift,
  Share2,
  Coins,
  Grid3X3,
  ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Vault,
  Users,
  RefreshCw,
  Smartphone,
  Wifi,
  Zap,
  Tv,
  Wallet,
  Gift,
  Share2,
  Coins,
};

const serviceCategories = [
  'Special Features',
  'Airtime & Data',
  'Bills & Utilities',
  'Wallet',
  'Value Added',
];

export function Services() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const getServicesByCategory = (category: string) => {
    return services.filter(service => service.category === category);
  };

  const handleServiceClick = (serviceId: string, comingSoon?: boolean) => {
    if (comingSoon) {
      alert('This feature is coming soon!');
      return;
    }

    switch (serviceId) {
      case '4': // Airtime
        navigate('/airtime');
        break;
      case '5': // Data
        navigate('/data');
        break;
      case '6': // Light Bills
        navigate('/light-bills');
        break;
      case '7': // TV Subscription
        navigate('/tv-subscription');
        break;
      case '8': // Wallet
        navigate('/wallet');
        break;
      case '1': // BlueVault
        navigate('/marketplace');
        break;
      case '2': // Group Payment
        navigate('/group-payment');
        break;
      case '10': // Referral/Reward
      case '11': // Blue Point
        navigate('/rewards');
        break;
      case '12': // Airtime Buyback
        navigate('/airtime-buyback');
        break;
      default:
        alert('Feature coming soon!');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header 
          title="BlueSea Services" 
          subtitle="Quick access to recharge, bills, and more"
          onMenuClick={() => setSidebarOpen(true)} 
        />

        <main className="flex-1 p-4 md:p-6 overflow-y-auto">
          <div className="max-w-5xl mx-auto space-y-8">
            {serviceCategories.map((category) => {
              const categoryServices = getServicesByCategory(category);
              if (categoryServices.length === 0) return null;

              return (
                <div key={category}>
                  <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">
                    {category}
                  </h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {categoryServices.map((service) => {
                      const Icon = iconMap[service.icon] || Vault;
                      return (
                        <button
                          key={service.id}
                          onClick={() => handleServiceClick(service.id, service.comingSoon)}
                          className={cn(
                            'group relative p-6 rounded-2xl bg-white dark:bg-slate-900',
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
                          
                          {service.comingSoon && (
                            <span className="absolute -top-2 -right-2 px-2 py-0.5 bg-slate-800 text-white text-[10px] rounded-full">
                              Coming soon
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            {/* More Services Button */}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
              <Button 
                onClick={() => navigate('/more-services')}
                className="w-full rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 py-6"
              >
                <Grid3X3 className="w-5 h-5 mr-2" />
                More Services
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
