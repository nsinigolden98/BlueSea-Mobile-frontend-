import { useState, useEffect } from 'react';
import { Sidebar, Header, Toast, Loader } from '@/components/ui-custom';
import { Button } from '@/components/ui/button';
import { getRequest, postRequest, ENDPOINTS } from '@/types';
import { cn } from '@/lib/utils';
import { 
  Gift, 
  Coins, 
  CheckCircle2,
  X,
  Loader2,
  RefreshCw
} from 'lucide-react';

interface Reward {
  id: string;
  title: string;
  description: string;
  image_url: string | null;
  points_cost: number;
  category: string | null;
  inventory: number | null;
  fulfilment_type: string;
}

export function Loyalty() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<Reward | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [redeeming, setRedeeming] = useState(false);
  const [userPoints, setUserPoints] = useState(0);
  const { showToast, ToastComponent } = Toast();
  const { LoaderComponent, showLoader, hideLoader } = Loader();

  const totalPoints = userPoints;

  useEffect(() => {
    fetchRewards();
    fetchUserPoints();
  }, []);

  const fetchRewards = async () => {
    try {
      setLoading(true);
      const response = await getRequest(ENDPOINTS.loyalty_rewards);
      if (response && response.rewards) {
        setRewards(response.rewards);
      }
    } catch (error) {
      showToast('Failed to load rewards');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserPoints = async () => {
    try {
      const response = await getRequest(ENDPOINTS.bonus_summary);
      if (response && response.data && response.data.current_points !== undefined) {
        setUserPoints(response.data.current_points);
      }
    } catch (error) {
      console.error('Failed to fetch user points:', error);
    }
  };

  const handleRedeem = async () => {
    if (!selectedItem) return;
    
    setRedeeming(true);
    showLoader();
    
    try {
      const response = await postRequest(
        ENDPOINTS.loyalty_redeem(selectedItem.id),
        {}
      );
      
      if (response && response.success) {
        setShowSuccess(true);
        showToast('Reward redeemed successfully!');
      } else {
        showToast(response?.error || 'Failed to redeem reward');
      }
    } catch (error) {
      showToast('Failed to redeem reward');
    } finally {
      hideLoader();
      setRedeeming(false);
    }
  };

  const categories = ['all', 'voucher', 'data', 'discount', 'experience', 'cashback'];
  const [activeCategory, setActiveCategory] = useState('all');

  const filteredItems = activeCategory === 'all' 
    ? rewards 
    : rewards.filter(item => item.category === activeCategory);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

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
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                    <Coins className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sky-100 text-sm">Your BluePoints</p>
                    <p className="text-3xl font-bold">{totalPoints.toLocaleString()}</p>
                  </div>
                </div>
                <button
                  onClick={fetchRewards}
                  className="p-2 bg-white/20 rounded-lg hover:bg-white/30"
                >
                  <RefreshCw className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Category Filter */}
            <div className="flex gap-2 overflow-x-auto pb-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={cn(
                    'px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors',
                    activeCategory === cat
                      ? 'bg-sky-500 text-white'
                      : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                  )}
                >
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </button>
              ))}
            </div>

            {/* Rewards Grid */}
            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-sky-500" />
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="text-center py-12">
                <Gift className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600 mb-4" />
                <p className="text-slate-500 dark:text-slate-400">No rewards available</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredItems.map((reward) => {
                  const isAvailable = !reward.inventory || reward.inventory > 0;
                  const canAfford = totalPoints >= reward.points_cost;
                  
                  return (
                    <button
                      key={reward.id}
                      onClick={() => isAvailable && canAfford && setSelectedItem(reward)}
                      disabled={!isAvailable || !canAfford}
                      className={cn(
                        'relative p-4 rounded-2xl bg-white dark:bg-slate-900 border transition-all',
                        isAvailable && canAfford
                          ? 'border-slate-100 dark:border-slate-800 hover:border-sky-300 dark:hover:border-sky-600 hover:shadow-lg'
                          : 'border-slate-100 dark:border-slate-800 opacity-60 cursor-not-allowed'
                      )}
                    >
                      {reward.image_url && (
                        <img src={reward.image_url} alt={reward.title} className="w-full h-24 object-cover rounded-lg mb-3" />
                      )}
                      <div className="w-10 h-10 rounded-xl bg-sky-100 dark:bg-sky-900/30 flex items-center justify-center mb-2">
                        <Gift className="w-5 h-5 text-sky-500" />
                      </div>
                      <h3 className="font-medium text-slate-800 dark:text-white text-sm mb-1 line-clamp-2">
                        {reward.title}
                      </h3>
                      <p className="text-lg font-bold text-sky-500">
                        {reward.points_cost} pts
                      </p>
                      {!isAvailable && (
                        <span className="absolute top-2 right-2 px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">
                          Out of stock
                        </span>
                      )}
                      {isAvailable && !canAfford && (
                        <span className="absolute top-2 right-2 px-2 py-0.5 bg-slate-800 text-white text-xs rounded-full">
                          Need more points
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Redeem Modal */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-md w-full">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold text-slate-800 dark:text-white">
                Redeem Reward
              </h3>
              <button onClick={() => setSelectedItem(null)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            
            <div className="mb-4">
              <h4 className="font-medium text-slate-800 dark:text-white mb-2">
                {selectedItem.title}
              </h4>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {selectedItem.description}
              </p>
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-xl mb-4">
              <span className="text-slate-600 dark:text-slate-300">Cost</span>
              <span className="text-xl font-bold text-sky-500">
                {selectedItem.points_cost} pts
              </span>
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-xl mb-4">
              <span className="text-slate-600 dark:text-slate-300">Your Balance</span>
              <span className="text-xl font-bold text-slate-800 dark:text-white">
                {totalPoints} pts
              </span>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setSelectedItem(null)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-sky-500 hover:bg-sky-600"
                onClick={handleRedeem}
                disabled={redeeming}
              >
                {redeeming ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Redeem'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccess && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-md w-full text-center">
            <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-green-500" />
            </div>
            <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-2">
              Redemption Successful!
            </h3>
            <p className="text-slate-500 dark:text-slate-400 mb-4">
              Your reward has been redeemed. Check your rewards history for delivery details.
            </p>
            <Button
              className="w-full bg-sky-500 hover:bg-sky-600"
              onClick={() => {
                setShowSuccess(false);
                setSelectedItem(null);
              }}
            >
              Done
            </Button>
          </div>
        </div>
      )}

      <ToastComponent />
      <LoaderComponent />
    </div>
  );
}
