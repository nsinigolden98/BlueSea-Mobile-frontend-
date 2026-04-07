import { useState, useEffect } from 'react';
import { Sidebar, Header, Loader } from '@/components/ui-custom';
import { getRequest, ENDPOINTS } from '@/types';
import { cn } from '@/lib/utils';
import { 
  Gift, 
  TrendingUp, 
  Calendar,
  Loader2,
  ArrowRight,
} from 'lucide-react';

interface Campaign {
  id: number;
  name: string;
  description: string;
  campaign_type: string;
  multiplier: string;
  bonus_amount: number;
  is_active: boolean;
  start_date: string;
  end_date: string;
}

export function Campaigns() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const { LoaderComponent, showLoader, hideLoader } = Loader();

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      showLoader();
      
      const response = await getRequest(ENDPOINTS.bonus_campaigns);
      if (response && response.success && response.data) {
        setCampaigns(response.data);
      }
    } catch (error) {
      console.error('Failed to load campaigns:', error);
    } finally {
      hideLoader();
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const isCampaignActive = (campaign: Campaign) => {
    const now = new Date();
    const start = new Date(campaign.start_date);
    const end = new Date(campaign.end_date);
    return now >= start && now <= end && campaign.is_active;
  };

  const getCampaignTypeLabel = (type: string) => {
    switch (type) {
      case 'multiplier':
        return 'Points Multiplier';
      case 'fixed_bonus':
        return 'Fixed Bonus';
      case 'percentage_bonus':
        return 'Percentage Bonus';
      default:
        return type;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0">
        <Header 
          title="Campaigns" 
          subtitle="Active bonus campaigns"
          onMenuClick={() => setSidebarOpen(true)} 
        />

        <main className="flex-1 p-4 md:p-6 overflow-y-auto">
          <div className="max-w-3xl mx-auto space-y-4">
            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-sky-500" />
              </div>
            ) : campaigns.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-12 text-center">
                <Gift className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600 mb-4" />
                <p className="text-slate-500 dark:text-slate-400">No active campaigns</p>
                <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">Check back later for new promotions</p>
              </div>
            ) : (
              campaigns.map((campaign) => {
                const active = isCampaignActive(campaign);
                return (
                  <div
                    key={campaign.id}
                    className={cn(
                      'bg-white dark:bg-slate-900 rounded-2xl border p-6',
                      active
                        ? 'border-sky-200 dark:border-sky-800'
                        : 'border-slate-100 dark:border-slate-800 opacity-60'
                    )}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-semibold text-slate-800 dark:text-white">
                            {campaign.name}
                          </h3>
                          {active && (
                            <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-xs font-medium rounded-full">
                              Active
                            </span>
                          )}
                        </div>
                        <p className="text-slate-600 dark:text-slate-300 text-sm mb-4">
                          {campaign.description}
                        </p>
                        <div className="flex flex-wrap gap-4 text-sm">
                          <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                            <TrendingUp className="w-4 h-4" />
                            <span>{getCampaignTypeLabel(campaign.campaign_type)}</span>
                            {campaign.campaign_type === 'multiplier' && (
                              <span className="font-medium text-sky-500">
                                {' '}({campaign.multiplier}x)
                              </span>
                            )}
                            {campaign.campaign_type === 'fixed_bonus' && (
                              <span className="font-medium text-green-500">
                                {' +'}{campaign.bonus_amount} pts
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                            <Calendar className="w-4 h-4" />
                            <span>
                              {formatDate(campaign.start_date)} - {formatDate(campaign.end_date)}
                            </span>
                          </div>
                        </div>
                      </div>
                      {active && (
                        <div className="w-10 h-10 rounded-full bg-sky-100 dark:bg-sky-900/30 flex items-center justify-center">
                          <ArrowRight className="w-5 h-5 text-sky-500" />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </main>
      </div>

      <LoaderComponent />
    </div>
  );
}