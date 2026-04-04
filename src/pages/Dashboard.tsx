import { useState } from 'react';
import { Sidebar, Header, BalanceCard, QuickActions, TransactionList } from '@/components/ui-custom';
import { announcements } from '@/data';
import { cn } from '@/lib/utils';
import { Megaphone, X, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function Dashboard() {

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dismissedAnnouncements, setDismissedAnnouncements] = useState<string[]>([]);
  const navigate = useNavigate();

  const activeAnnouncements = announcements.filter(
    a => !dismissedAnnouncements.includes(a.id) && a.priority === 'high'
  );

  const dismissAnnouncement = (id: string) => {
    setDismissedAnnouncements([...dismissedAnnouncements, id]);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          title="Dashboard"
          subtitle="Buy Smarter & Cheaper"
          onMenuClick={() => setSidebarOpen(true)}
        />

        <main className="flex-1 p-4 md:p-6 overflow-y-auto">
          <div className="max-w-5xl mx-auto space-y-6">
            {/* Announcement Banner */}
            {activeAnnouncements.length > 0 && (
              <div className="space-y-2">
                {activeAnnouncements.map((announcement) => (
                  <div
                    key={announcement.id}
                    className={cn(
                      'relative rounded-xl p-4 pr-10',
                      announcement.type === 'promo'
                        ? 'bg-gradient-to-r from-orange-400 to-orange-500 text-white'
                        : announcement.type === 'feature'
                          ? 'bg-gradient-to-r from-sky-400 to-sky-500 text-white'
                          : 'bg-gradient-to-r from-purple-400 to-purple-500 text-white'
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0">
                        <Megaphone className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm">{announcement.title}</h4>
                        <p className="text-xs text-white/80 mt-0.5">{announcement.content}</p>
                      </div>
                      <button
                        onClick={() => dismissAnnouncement(announcement.id)}
                        className="absolute top-2 right-2 p-1.5 hover:bg-white/20 rounded-lg transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Balance Card */}
            <BalanceCard />

            {/* Quick Actions */}
            <QuickActions />

            {/* Rewards Teaser */}
            <div
              onClick={() => navigate('/rewards')}
              className="bg-gradient-to-r from-sky-500 to-sky-600 rounded-2xl p-5 text-white cursor-pointer hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                    <span className="text-2xl">🎁</span>
                  </div>
                  <div>
                    <h3 className="font-semibold">Earn BluePoints</h3>
                    <p className="text-sm text-sky-100">Complete tasks and earn rewards</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5" />
              </div>
            </div>

            {/* Recent Transactions */}
            <TransactionList />
          </div>
        </main>
      </div>
    </div>
  );
}
