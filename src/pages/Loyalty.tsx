import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar, Header } from '@/components/ui-custom';
import { Button } from '@/components/ui/button';
import { loyaltyItems } from '@/data';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';
import { 
  Gift, 
  Coins, 
  Ticket, 
  Coffee, 
  Percent, 
  Smartphone,
  Wifi,
  Wallet,
  CheckCircle2,
  X
} from 'lucide-react';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  airtime: Smartphone,
  data: Wifi,
  discount: Percent,
  ticket: Ticket,
  coffee: Coffee,
  cashback: Wallet,
};

const categoryColors: Record<string, string> = {
  voucher: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
  data: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
  discount: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
  experience: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400',
  cashback: 'bg-sky-100 text-sky-600 dark:bg-sky-900/30 dark:text-sky-400',
};

export function Loyalty() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<typeof loyaltyItems[0] | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  const totalPoints = user?.bluePoints || 250;

  const handleRedeem = () => {
    if (!selectedItem) return;
    if (totalPoints < selectedItem.pointsCost) {
      alert('Insufficient points!');
      return;
    }
    setShowSuccess(true);
  };

  const categories = ['all', 'voucher', 'data', 'discount', 'experience', 'cashback'];
  const [activeCategory, setActiveCategory] = useState('all');

  const filteredItems = activeCategory === 'all' 
    ? loyaltyItems 
    : loyaltyItems.filter(item => item.category === activeCategory);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header 
          title="Loyalty Marketplace" 
          subtitle="Spend Your BluePoints"
          onMenuClick={() => setSidebarOpen(true)} 
        />

        <main className="flex-1 p-4 md:p-6 overflow-y-auto">
          <div className="max-w-5xl mx-auto space-y-6">
            {/* Points Balance */}
            <div className="bg-gradient-to-br from-sky-400 via-sky-500 to-sky-600 rounded-2xl p-6 text-white shadow-lg shadow-sky-500/25">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center">
                    <Coins className="w-7 h-7" />
                  </div>
                  <div>
                    <p className="text-sky-100 text-sm">Your BluePoints Balance</p>
                    <p className="text-4xl font-bold">{totalPoints.toLocaleString()}</p>
                  </div>
                </div>
                <Button 
                  variant="secondary" 
                  className="bg-white/20 hover:bg-white/30 text-white border-0"
                  onClick={() => navigate('/rewards')}
                >
                  Earn More
                </Button>
              </div>
            </div>

            {/* Category Filter */}
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={cn(
                    'px-4 py-2 rounded-full text-sm font-medium transition-all capitalize',
                    activeCategory === cat
                      ? 'bg-sky-500 text-white'
                      : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100'
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Items Grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredItems.map((item) => {
                const Icon = iconMap[item.image] || Gift;
                const canAfford = totalPoints >= item.pointsCost;
                
                return (
                  <div 
                    key={item.id}
                    className={cn(
                      'bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 transition-all',
                      item.available && canAfford 
                        ? 'hover:shadow-lg cursor-pointer' 
                        : 'opacity-60'
                    )}
                    onClick={() => item.available && canAfford && setSelectedItem(item)}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className={cn(
                        'w-12 h-12 rounded-xl flex items-center justify-center',
                        categoryColors[item.category]
                      )}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className={cn(
                        'px-2 py-1 text-xs font-medium rounded-lg',
                        item.available 
                          ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
                          : 'bg-slate-100 text-slate-500'
                      )}>
                        {item.available ? 'Available' : 'Out of Stock'}
                      </span>
                    </div>

                    <h4 className="font-semibold text-slate-800 dark:text-white mb-1">{item.name}</h4>
                    <p className="text-sm text-slate-500 mb-4">{item.description}</p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-sky-500">
                        <Coins className="w-4 h-4" />
                        <span className="font-bold">{item.pointsCost}</span>
                      </div>
                      {!canAfford && (
                        <span className="text-xs text-orange-500">Need {item.pointsCost - totalPoints} more</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </main>
      </div>

      {/* Redeem Modal */}
      {selectedItem && !showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className={cn(
                  'w-16 h-16 rounded-2xl flex items-center justify-center',
                  categoryColors[selectedItem.category]
                )}>
                  {(() => {
                    const Icon = iconMap[selectedItem.image] || Gift;
                    return <Icon className="w-8 h-8" />;
                  })()}
                </div>
                <button 
                  onClick={() => setSelectedItem(null)}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">{selectedItem.name}</h3>
              <p className="text-slate-500 mb-6">{selectedItem.description}</p>

              <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-slate-500">Cost</span>
                  <span className="font-bold text-sky-500">{selectedItem.pointsCost} Points</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Your Balance</span>
                  <span className="font-medium">{totalPoints} Points</span>
                </div>
                <div className="border-t border-slate-200 dark:border-slate-700 mt-2 pt-2 flex justify-between items-center">
                  <span className="text-slate-700 dark:text-slate-300 font-medium">Remaining</span>
                  <span className="font-bold">{totalPoints - selectedItem.pointsCost} Points</span>
                </div>
              </div>

              <div className="flex gap-3">
                <Button 
                  variant="outline"
                  onClick={() => setSelectedItem(null)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleRedeem}
                  className="flex-1 bg-sky-500 hover:bg-sky-600"
                >
                  Confirm Redeem
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md p-8 text-center">
            <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10 text-green-500" />
            </div>
            <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Redemption Successful!</h3>
            <p className="text-slate-500 mb-6">
              You have successfully redeemed {selectedItem?.name}. Check your email for details.
            </p>
            <Button 
              onClick={() => {
                setShowSuccess(false);
                setSelectedItem(null);
              }}
              className="w-full bg-sky-500 hover:bg-sky-600"
            >
              Continue Shopping
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
