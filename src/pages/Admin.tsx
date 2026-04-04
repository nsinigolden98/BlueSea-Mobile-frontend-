import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { announcements } from '@/data';
import { cn } from '@/lib/utils';
import { 
  Shield, 
  Lock, 
  Megaphone, 
  Calendar, 
  Ticket, 
  Gift, 
  ArrowLeft,
  Plus,
  Edit2,
  Trash2,
  X
} from 'lucide-react';

type AdminTab = 'announcements' | 'events' | 'tickets' | 'rewards';

export function Admin() {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState<AdminTab>('announcements');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = () => {
    if (password === 'admin123') {
      setIsAuthenticated(true);
    } else {
      alert('Invalid password');
    }
  };

  const handleCreateAnnouncement = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setShowCreateModal(false);
      alert('Announcement created successfully!');
    }, 1000);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-slate-500 hover:text-slate-700 mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>

          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-8 text-center">
            <div className="w-20 h-20 bg-sky-100 dark:bg-sky-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
              <Shield className="w-10 h-10 text-sky-500" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Admin Access</h2>
            <p className="text-slate-500 mb-6">Enter your admin password to continue</p>

            <div className="space-y-4">
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  type="password"
                  placeholder="Enter admin password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                />
              </div>
              <Button 
                onClick={handleLogin}
                className="w-full bg-sky-500 hover:bg-sky-600"
              >
                Access Dashboard
              </Button>
            </div>

            <p className="text-xs text-slate-400 mt-4">Default: admin123</p>
          </div>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'announcements', label: 'Announcements', icon: Megaphone },
    { id: 'events', label: 'Events', icon: Calendar },
    { id: 'tickets', label: 'Tickets', icon: Ticket },
    { id: 'rewards', label: 'Rewards', icon: Gift },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700">
        <div className="flex items-center justify-between px-4 md:px-6 py-4">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate(-1)}
              className="p-2 -ml-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-sky-500 rounded-lg flex items-center justify-center">
                <Shield className="w-4 h-4 text-white" />
              </div>
              <h1 className="text-xl font-bold text-slate-800 dark:text-white">Admin Dashboard</h1>
            </div>
          </div>
          <Button 
            variant="outline" 
            onClick={() => setIsAuthenticated(false)}
            className="text-red-500 hover:bg-red-50"
          >
            Logout
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex px-4 md:px-6 gap-1 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as AdminTab)}
                className={cn(
                  'flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap',
                  activeTab === tab.id
                    ? 'border-sky-500 text-sky-500'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                )}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <main className="p-4 md:p-6">
        <div className="max-w-5xl mx-auto">
          {/* Announcements Tab */}
          {activeTab === 'announcements' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-800 dark:text-white">Announcements</h2>
                <Button 
                  onClick={() => setShowCreateModal(true)}
                  className="bg-sky-500 hover:bg-sky-600"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  New Announcement
                </Button>
              </div>

              <div className="grid gap-4">
                {announcements.map((announcement) => (
                  <div 
                    key={announcement.id}
                    className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-5"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className={cn(
                            'px-2 py-0.5 text-xs font-medium rounded-full',
                            announcement.priority === 'high' 
                              ? 'bg-red-100 text-red-600'
                              : announcement.priority === 'medium'
                              ? 'bg-yellow-100 text-yellow-600'
                              : 'bg-green-100 text-green-600'
                          )}>
                            {announcement.priority}
                          </span>
                          <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-slate-100 text-slate-600">
                            {announcement.type}
                          </span>
                        </div>
                        <h3 className="font-semibold text-slate-800 dark:text-white">{announcement.title}</h3>
                      </div>
                      <div className="flex gap-1">
                        <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">
                          <Edit2 className="w-4 h-4 text-slate-400" />
                        </button>
                        <button className="p-2 hover:bg-red-50 rounded-lg">
                          <Trash2 className="w-4 h-4 text-red-400" />
                        </button>
                      </div>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 text-sm mb-3">{announcement.content}</p>
                    <p className="text-xs text-slate-400">Posted on {announcement.date}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Events Tab */}
          {activeTab === 'events' && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-2">Events Management</h3>
              <p className="text-slate-500 mb-4">Create and manage events for the Blue Vault marketplace</p>
              <Button className="bg-sky-500 hover:bg-sky-600">
                <Plus className="w-4 h-4 mr-2" />
                Create Event
              </Button>
            </div>
          )}

          {/* Tickets Tab */}
          {activeTab === 'tickets' && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <Ticket className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-2">Ticket Management</h3>
              <p className="text-slate-500 mb-4">Manage tickets for events and experiences</p>
              <Button className="bg-sky-500 hover:bg-sky-600">
                <Plus className="w-4 h-4 mr-2" />
                Create Ticket
              </Button>
            </div>
          )}

          {/* Rewards Tab */}
          {activeTab === 'rewards' && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <Gift className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-2">Rewards Management</h3>
              <p className="text-slate-500 mb-4">Manage BluePoints rewards and loyalty items</p>
              <Button className="bg-sky-500 hover:bg-sky-600">
                <Plus className="w-4 h-4 mr-2" />
                Add Reward
              </Button>
            </div>
          )}
        </div>
      </main>

      {/* Create Announcement Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-lg">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="font-semibold text-slate-800 dark:text-white">New Announcement</h3>
              <button 
                onClick={() => setShowCreateModal(false)}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input placeholder="Announcement title" />
              </div>
              
              <div className="space-y-2">
                <Label>Content</Label>
                <Textarea placeholder="Announcement content..." rows={4} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Type</Label>
                  <select className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                    <option value="general">General</option>
                    <option value="feature">Feature</option>
                    <option value="promo">Promotion</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Priority</Label>
                  <select className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>

              <Button 
                onClick={handleCreateAnnouncement}
                className="w-full bg-sky-500 hover:bg-sky-600"
                disabled={loading}
              >
                {loading ? 'Creating...' : 'Create Announcement'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
