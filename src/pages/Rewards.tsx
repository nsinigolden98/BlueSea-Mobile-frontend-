import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar, Header } from '@/components/ui-custom';
import { Button } from '@/components/ui/button';
import { bluePointHistory, tasks, streakData } from '@/data';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';
import { 
  Gift, 
  TrendingUp, 
  CheckCircle2, 
  Circle, 
  Calendar, 
  Flame, 
  Trophy,
  ArrowRight,
  Smartphone,
  Wifi,
  Share2,
  User,
  Zap,
} from 'lucide-react';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Smartphone,
  Wifi,
  Share2,
  User,
  Calendar,
  Zap,
};

export function Rewards() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'points' | 'streak' | 'tasks'>('points');
  const navigate = useNavigate();
  const { user } = useAuth();

  const totalPoints = user?.bluePoints || 250;
  const earnedPoints = bluePointHistory.filter(h => h.type === 'earned').reduce((sum, h) => sum + h.points, 0);
  const redeemedPoints = bluePointHistory.filter(h => h.type === 'redeemed').reduce((sum, h) => sum + Math.abs(h.points), 0);

  const completedTasks = tasks.filter(t => t.completed).length;
  const totalTasks = tasks.length;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header 
          title="Rewards" 
          subtitle="Earn & Redeem BluePoints"
          onMenuClick={() => setSidebarOpen(true)} 
        />

        <main className="flex-1 p-4 md:p-6 overflow-y-auto">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Points Summary Card */}
            <div className="bg-gradient-to-br from-sky-400 via-sky-500 to-sky-600 rounded-2xl p-6 text-white shadow-lg shadow-sky-500/25">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                    <Gift className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sky-100 text-sm">Total BluePoints</p>
                    <p className="text-3xl font-bold">{totalPoints.toLocaleString()}</p>
                  </div>
                </div>
                <Button 
                  variant="secondary" 
                  className="bg-white/20 hover:bg-white/30 text-white border-0"
                  onClick={() => navigate('/loyalty')}
                >
                  Redeem
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
              <div className="flex gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-sky-200" />
                  <span className="text-sky-100">Earned: {earnedPoints}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Gift className="w-4 h-4 text-sky-200" />
                  <span className="text-sky-100">Redeemed: {redeemedPoints}</span>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex bg-white dark:bg-slate-800 rounded-xl p-1 shadow-sm">
              {[
                { id: 'points', label: 'Points History', icon: TrendingUp },
                { id: 'streak', label: 'Daily Streak', icon: Flame },
                { id: 'tasks', label: 'Tasks', icon: CheckCircle2 },
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as typeof activeTab)}
                    className={cn(
                      'flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium transition-all',
                      activeTab === tab.id
                        ? 'bg-sky-500 text-white shadow-md'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Points History Tab */}
            {activeTab === 'points' && (
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">
                <div className="p-4 border-b border-slate-100 dark:border-slate-800">
                  <h3 className="font-semibold text-slate-800 dark:text-white">Points History</h3>
                </div>
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {bluePointHistory.map((item) => (
                    <div key={item.id} className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          'w-10 h-10 rounded-xl flex items-center justify-center',
                          item.type === 'earned' 
                            ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400'
                        )}>
                          {item.type === 'earned' ? <TrendingUp className="w-5 h-5" /> : <Gift className="w-5 h-5" />}
                        </div>
                        <div>
                          <p className="font-medium text-slate-800 dark:text-white">{item.source}</p>
                          <p className="text-xs text-slate-500">{item.date}</p>
                        </div>
                      </div>
                      <span className={cn(
                        'font-bold',
                        item.type === 'earned' 
                          ? 'text-green-600 dark:text-green-400'
                          : 'text-orange-600 dark:text-orange-400'
                      )}>
                        {item.type === 'earned' ? '+' : ''}{item.points}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Streak Tab */}
            {activeTab === 'streak' && (
              <div className="space-y-4">
                {/* Streak Stats */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 text-center">
                    <Flame className="w-8 h-8 text-orange-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-slate-800 dark:text-white">{streakData.currentStreak}</p>
                    <p className="text-xs text-slate-500">Current Streak</p>
                  </div>
                  <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 text-center">
                    <Trophy className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-slate-800 dark:text-white">{streakData.longestStreak}</p>
                    <p className="text-xs text-slate-500">Longest Streak</p>
                  </div>
                  <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 text-center">
                    <Gift className="w-8 h-8 text-sky-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-slate-800 dark:text-white">{streakData.nextReward}</p>
                    <p className="text-xs text-slate-500">Next Reward</p>
                  </div>
                </div>

                {/* Weekly Calendar */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800">
                  <h3 className="font-semibold text-slate-800 dark:text-white mb-4">This Week</h3>
                  <div className="flex justify-between">
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => {
                      const dayData = streakData.streakHistory[index];
                      const isClaimed = dayData?.claimed;
                      return (
                        <div key={day} className="flex flex-col items-center gap-2">
                          <div className={cn(
                            'w-10 h-10 rounded-xl flex items-center justify-center transition-all',
                            isClaimed
                              ? 'bg-gradient-to-br from-orange-400 to-orange-500 text-white shadow-lg shadow-orange-500/25'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                          )}>
                            {isClaimed ? <Flame className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
                          </div>
                          <span className="text-xs text-slate-500">{day}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Claim Daily Reward */}
                <Button className="w-full rounded-xl bg-gradient-to-r from-orange-400 to-orange-500 hover:from-orange-500 hover:to-orange-600 text-white py-6 shadow-lg shadow-orange-500/25">
                  <Flame className="w-5 h-5 mr-2" />
                  Claim Daily Reward (+2 Points)
                </Button>
              </div>
            )}

            {/* Tasks Tab */}
            {activeTab === 'tasks' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-slate-800 dark:text-white">Tasks</h3>
                  <span className="text-sm text-slate-500">{completedTasks}/{totalTasks} Completed</span>
                </div>
                
                <div className="grid gap-3">
                  {tasks.map((task) => {
                    const Icon = iconMap[task.icon] || CheckCircle2;
                    return (
                      <div 
                        key={task.id} 
                        className={cn(
                          'p-4 rounded-2xl border transition-all',
                          task.completed
                            ? 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-900/30'
                            : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800'
                        )}
                      >
                        <div className="flex items-start gap-3">
                          <div className={cn(
                            'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0',
                            task.completed
                              ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
                              : 'bg-sky-100 text-sky-600 dark:bg-sky-900/30 dark:text-sky-400'
                          )}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <h4 className={cn(
                                'font-medium',
                                task.completed && 'line-through text-slate-500'
                              )}>
                                {task.title}
                              </h4>
                              {task.completed ? (
                                <CheckCircle2 className="w-5 h-5 text-green-500" />
                              ) : (
                                <Circle className="w-5 h-5 text-slate-300" />
                              )}
                            </div>
                            <p className="text-sm text-slate-500 mb-2">{task.description}</p>
                            <div className="flex items-center gap-2">
                              <span className="inline-flex items-center px-2 py-1 bg-sky-100 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400 text-xs font-medium rounded-lg">
                                +{task.rewardPoints} Points
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
