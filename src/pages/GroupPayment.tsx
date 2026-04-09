import { useState, useEffect, useRef } from 'react';
import { Sidebar, Header, Toast, Loader } from '@/components/ui-custom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getRequest, postRequest, ENDPOINTS } from '@/types';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { 
  Plus, 
  Copy, 
  CheckCircle2, 
  Loader2,
  Users,
  Trash2,
  LogOut,
  ArrowLeft,
  Clock,
  UserPlus
} from 'lucide-react';

interface GroupMember {
  id: string;
  email: string;
  name: string;
  role: string;
  payment_status: string;
  locked_amount: number;
  paid_amount: number;
  joined_at: string;
}

interface Group {
  id: string;
  name: string;
  description: string;
  service_type: string;
  target_amount: number;
  current_amount: number;
  status: string;
  my_role: string;
  my_payment_status: string;
  member_count: number;
  paid_members: number;
  pending_members: number;
  join_code: string;
  created_at: string;
  members?: GroupMember[];
}

export function GroupPayment() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [groupDetails, setGroupDetails] = useState<Group | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [joining, setJoining] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const { showToast, ToastComponent } = Toast();
  const { LoaderComponent, showLoader, hideLoader } = Loader();
  const [pin, setPin] = useState({
      current_pin:['', '','',''],
    });
    
  const Pin = useRef<HTMLInputElement>(null);
 const handlePinChange = (
     type: 'current_pin',
     index: number,
     value: string
   ) => {
     if (value.length > 1) return;
     
     const newPins = { ...pin};
     newPins[type][index] = value;
     setPin(newPins);
 
     if (value.length === 1 && index < 3) {
       const input = document.getElementById(`${type}${index + 1}`) as HTMLInputElement;
       if (input) {
         input.focus();
       };
     };
   };
 
   const handleKeyDown = (
     type: 'current_pin',
     index: number,
     e: React.KeyboardEvent
   ) => {
     if (e.key === 'Backspace' && !pin[type][index] && index > 0) {
       const newPins = { ...pin};
       newPins[type][index] = '';
       setPin(newPins);
        const input = document.getElementById(`${type}${index - 1}`) as HTMLInputElement
       if (input) {
         input.focus();
       };
     };
   };
 
  
  const fetchGroups = async () => {
    try {
      const response = await getRequest(ENDPOINTS.my_groups);
      
      if (response?.groups) {
        setGroups(response.groups);
      }
    } catch (err) {
      console.log(err);
      showToast('Failed to fetch groups');
    } finally {
      setLoading(false);
    };
  };

  useEffect(() => {
    fetchGroups();
  }, );

  const fetchGroupDetails = async (groupId: string) => {

    setDetailsLoading(true);
    try {
      const response = await getRequest(ENDPOINTS.group_detail(groupId));
      if (response?.group) {
        setGroupDetails(response.group);
      }
    } catch (err) {
      console.log(err);
      showToast('Failed to fetch group details');
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleJoinGroup = async () => {
    if (!joinCode.trim()) {
      showToast('Please enter a join code');
      return;
    }
    if (pin.current_pin.join('').length !== 4) {
      showToast('Incomplete Pin');
      return;
    };
    showLoader()
    setJoining(true);
    try {
      const response = await postRequest(ENDPOINTS.join_group, {
        transaction_pin: pin.current_pin.join(''),
        join_code: joinCode.trim()
      });
      if (response?.success) {
        showToast(response.message || 'Successfully joined group!');
        setShowJoinModal(false);
        setJoinCode('');
        fetchGroups();
      } else {
        showToast(response?.error || 'Invalid join code');
      }
    } catch (err) {
      console.log(err)
      showToast('Failed to join group');
    } finally {
      hideLoader();
      setJoining(false);
    }
  };

  const copyJoinCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleLeaveGroup = async (groupId: string) => {
    try {
      const response = await postRequest(ENDPOINTS.leave_group, { group_id: groupId });
      if (response?.success) {
        showToast('Successfully left the group');
        fetchGroups();
        setSelectedGroup(null);
      } else {
        showToast(response?.error || 'Failed to leave group');
      }
    } catch (err) {
      console.log(err)
      showToast('Failed to leave group');
    }
  };

  const handleCancelGroup = async (groupId: string) => {
    if (!confirm('Are you sure you want to cancel this group payment?')) return;
    
    try {
      const response = await postRequest(ENDPOINTS.cancel_group, { group_id: groupId });
      if (response?.success) {
        showToast('Group payment canceled');
        fetchGroups();
        setSelectedGroup(null);
      } else {
        showToast(response?.error || 'Failed to cancel group');
      }
    } catch (err) {
      console.log(err);
      showToast('Failed to cancel group');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400';
      case 'partial':
        return 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'failed':
      case 'canceled':
        return 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400';
      default:
        return 'bg-sky-100 text-sky-600 dark:bg-sky-900/30 dark:text-sky-400';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'text-green-500';
      case 'locked':
        return 'text-yellow-500';
      case 'failed':
        return 'text-red-500';
      default:
        return 'text-slate-500';
    }
  };

  const formatStatus = (status: string) => {
    return status
    // return status.charAt(0).toUpperCase() + status.slice(1);
  };

  if (selectedGroup) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex">
        <div className="flex-1 flex flex-col min-w-0">
          <header className="flex items-center px-4 py-4 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
            <button 
              onClick={() => {
                setSelectedGroup(null);
                setGroupDetails(null);
              }}
              className="p-2 -ml-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
            >
              <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-400" />
            </button>
            <div className="ml-2">
              <h1 className="text-xl font-bold text-slate-800 dark:text-white">{selectedGroup.name}</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">Group Payment Details</p>
            </div>
          </header>

          <main className="flex-1 p-4 md:p-6 overflow-y-auto">
            {detailsLoading ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-sky-500" />
              </div>
            ) : groupDetails ? (
              <div className="max-w-2xl mx-auto space-y-6">
                {/* Status Card */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className={cn(
                      "px-3 py-1 text-sm font-medium rounded-full",
                      getStatusColor(selectedGroup.status)
                    )}>
                      {formatStatus(selectedGroup.status)}
                    </span>
                    <span className="text-sm text-slate-500">
                      {selectedGroup.service_type.charAt(0).toUpperCase() + selectedGroup.service_type.slice(1)}
                    </span>
                  </div>

                  {/* Progress */}
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-slate-500">Progress</span>
                      <span className="font-medium">
                        {Math.round((selectedGroup.current_amount / selectedGroup.target_amount) * 100)}%
                      </span>
                    </div>
                    <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-sky-400 to-sky-500 rounded-full"
                        style={{ width: `${Math.min((selectedGroup.current_amount / selectedGroup.target_amount) * 100, 100)}%` }}
                      />
                    </div>
                    <p className="text-center mt-2 text-slate-600 dark:text-slate-400">
                      ₦{selectedGroup.current_amount.toLocaleString()} of ₦{selectedGroup.target_amount.toLocaleString()}
                    </p>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="flex items-center gap-1 text-slate-500">
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                      {selectedGroup.paid_members} paid
                    </span>
                    <span className="flex items-center gap-1 text-slate-500">
                      <Clock className="w-4 h-4 text-yellow-500" />
                      {selectedGroup.pending_members} pending
                    </span>
                  </div>
                </div>

                {/* Members */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6">
                  <h3 className="font-semibold text-slate-800 dark:text-white mb-4">Members ({groupDetails.members?.length || 0})</h3>
                  <div className="space-y-3">
                    {groupDetails.members?.map((member) => (
                      <div 
                        key={member.id}
                        className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-xl"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-sky-100 dark:bg-sky-900/30 flex items-center justify-center">
                            <span className="font-medium text-sky-600">{member.email[0].toUpperCase()}</span>
                          </div>
                          <div>
                            <p className="font-medium text-slate-800 dark:text-white">{member.email}</p>
                            <p className="text-sm text-slate-500">{member.name}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={cn(
                            "px-2 py-1 text-xs font-medium rounded-full",
                            member.role === 'owner' ? 'bg-purple-100 text-purple-600' :
                            member.role === 'admin' ? 'bg-blue-100 text-blue-600' :
                            'bg-slate-100 text-slate-600'
                          )}>
                            {member.role}
                          </span>
                          <span className={cn(
                            "text-xs font-medium",
                            getPaymentStatusColor(member.payment_status)
                          )}>
                            {formatStatus(member.payment_status)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                  {selectedGroup.my_role === 'owner' && selectedGroup.status === 'pending' && (
                    
                  <Button 
                    onClick={() => handleCancelGroup(selectedGroup.id)}
                    className="w-full bg-red-500 hover:bg-red-600 py-6"
                  >
                    <Trash2 className="w-5 h-5 mr-2" />
                    Cancel Group Payment
                  </Button>
                )}

                {selectedGroup.my_role !== 'owner' && selectedGroup.status === 'pending' && (
                  <Button 
                    variant="outline"
                    onClick={() => handleLeaveGroup(selectedGroup.id)}
                    className="w-full text-red-500 border-red-500 hover:bg-red-50 py-6"
                  >
                    <LogOut className="w-5 h-5 mr-2" />
                    Leave Group
                  </Button>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-sky-500" />
              </div>
            )}
          </main>
        </div>
        <ToastComponent />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0">
        <Header 
          title="Group Payments" 
          subtitle="Split Bills with Friends & Family"
          onMenuClick={() => setSidebarOpen(true)} 
        />

        <main className="flex-1 p-4 md:p-6 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="w-8 h-8 animate-spin text-sky-500" />
            </div>
          ) : groups.length === 0 ? (
              <div>
               <div className="flex gap-3">
                <Button 
                  onClick={() => navigate('/services')}
                  className="flex-1 rounded-xl bg-sky-500 hover:bg-sky-600 py-4"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Create Group Payment
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => setShowJoinModal(true)}
                  className="flex-1 rounded-xl py-4 border-sky-500 text-sky-500 hover:bg-sky-50"
                >
                  <UserPlus className="w-5 h-5 mr-2" />
                  Join with Code
                  </Button>
                  <br /><br />
              </div>

              
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-12 text-center">
              
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                <Users className="w-10 h-10 text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-2">
                No Group Payments
              </h3>
              <p className="text-slate-500 dark:text-slate-400">
                Create a group payment from Airtime, Data, or Light Bills page
              </p>
            </div>
              </div>
          ) : (
            <div className="max-w-4xl mx-auto space-y-6">
              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button 
                  onClick={() => navigate('/services')}
                  className="flex-1 rounded-xl bg-sky-500 hover:bg-sky-600 py-4"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Create Group Payment
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => setShowJoinModal(true)}
                  className="flex-1 rounded-xl py-4 border-sky-500 text-sky-500 hover:bg-sky-50"
                >
                  <UserPlus className="w-5 h-5 mr-2" />
                  Join with Code
                </Button>
              </div>

              {/* Active Groups */}
              <div>
                <h3 className="font-semibold text-slate-800 dark:text-white mb-4">Your Group Payments</h3>
                <div className="grid gap-4">
                  {groups.map((group) => (
                    <div 
                      key={group.id} 
                      className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 hover:shadow-lg transition-shadow cursor-pointer"
                      onClick={() => {
                        setSelectedGroup(group);
                        fetchGroupDetails(group.id);
                      }}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h4 className="font-semibold text-slate-800 dark:text-white">{group.name}</h4>
                          <p className="text-sm text-slate-500">{group.description || 'No description'}</p>
                        </div>
                        <span className={cn(
                          "px-3 py-1 text-xs font-medium rounded-full",
                          getStatusColor(group.status)
                        )}>
                          {formatStatus(group.status)}
                        </span>
                      </div>

                      {/* Progress */}
                      <div className="mb-4">
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-slate-500">Progress</span>
                          <span className="font-medium">
                            {Math.round((group.current_amount / group.target_amount) * 100)}%
                          </span>
                        </div>
                        <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-sky-400 to-sky-500 rounded-full transition-all"
                            style={{ width: `${Math.min((group.current_amount / group.target_amount) * 100, 100)}%` }}
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex -space-x-2">
                            <div className="w-8 h-8 rounded-full border-2 border-white dark:border-slate-900 bg-sky-100 flex items-center justify-center text-xs font-medium">
                              {group.member_count}
                            </div>
                          </div>
                          <span className="text-sm text-slate-500">
                            {group.paid_members} paid, {group.pending_members} pending
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              copyJoinCode(group.join_code);
                            }}
                            className="flex items-center gap-1 text-xs text-sky-500 hover:text-sky-600"
                          >
                            <Copy className="w-3 h-3" />
                            {copiedCode === group.join_code ? 'Copied!' : group.join_code}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Join Group Modal */}
      {showJoinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md">
            <div className="p-6 space-y-4">
              <h3 className="text-lg font-semibold text-slate-800 dark:text-white">Join Group Payment</h3>
              <p className="text-sm text-slate-500">Enter the 6-character join code to join a group payment</p>
              <Input
                placeholder="Enter join code (e.g., A1B2C3)"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                maxLength={6}
                className="text-center tracking-widest"
              />
             <label className="text-sm text-center font-medium text-slate-700 dark:text-slate-300">
        Enter PIn
      </label>
      <div className="flex gap-3 justify-center">
        {[0, 1, 2, 3].map((index) => (
          <input
            key={index}
            ref={Pin}
            type="password"
            id={`current_pin${index}`}
            inputMode="numeric"
            maxLength={1}
            value={pin['current_pin'][index]}
            onChange={(e) => handlePinChange('current_pin', index, e.target.value)}
            onKeyDown={(e) => handleKeyDown('current_pin', index, e)}
            className={cn(
              'w-14 h-14 text-center text-2xl font-bold rounded-xl',
              'border-2 border-slate-200 dark:border-slate-700',
              'focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20',
              'bg-white dark:bg-slate-800 text-slate-800 dark:text-white',
              'outline-none transition-all',
              'current'
            )}
          />
        ))}
      </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowJoinModal(false);
                    setJoinCode('');
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleJoinGroup}
                  disabled={joining || joinCode.length !== 6 || pin.current_pin.join('').length !== 4}
                  className="flex-1 bg-sky-500 hover:bg-sky-600"
                >
                  {joining ? 'Joining...' : 'Join Group'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <ToastComponent />
      <LoaderComponent />
    </div>
  );
}
