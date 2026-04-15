import { useState, useEffect } from 'react';
import { Sidebar, Header, Toast, Loader } from '@/components/ui-custom';
import { postRequest, getRequest, ENDPOINTS } from '@/types';
import { cn } from '@/lib/utils';
import { Headphones, Send } from 'lucide-react';

interface Ticket {
  id: number;
  subject: string;
  description: string;
  status: string;
  priority: string;
  created_at: string;
  updated_at: string;
  messages?: Message[];
}

interface Message {
  id: number;
  sender_name: string;
  message: string;
  is_admin: boolean;
  created_at: string;
}

export function Support() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewTicket, setShowNewTicket] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [newMessage, setNewMessage] = useState('');
  
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  
  const { showToast, ToastComponent } = Toast();
  const { LoaderComponent, showLoader, hideLoader } = Loader();

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const response = await getRequest(ENDPOINTS.support_tickets);
      if (response && response.tickets) {
        setTickets(response.tickets);
      }
    } catch (error) {
      showToast('Failed to fetch tickets');
    } finally {
      setLoading(false);
    }
  };

  const createTicket = async () => {
    if (!subject.trim() || !description.trim()) {
      showToast('Please fill in all fields');
      return;
    }

    showLoader();
    try {
      const response = await postRequest(ENDPOINTS.support_tickets, {
        subject,
        description,
        priority,
      });

      if (response && response.success) {
        showToast('Ticket created successfully');
        setShowNewTicket(false);
        setSubject('');
        setDescription('');
        setPriority('medium');
        fetchTickets();
      } else {
        showToast(response?.error || 'Failed to create ticket');
      }
    } catch (error) {
      showToast('Failed to create ticket');
    } finally {
      hideLoader();
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedTicket) return;

    showLoader();
    try {
      const response = await postRequest(
        ENDPOINTS.support_ticket_detail(String(selectedTicket.id)),
        { message: newMessage }
      );

      if (response && response.success) {
        setNewMessage('');
        fetchTicketDetail(selectedTicket.id);
        showToast('Message sent');
      } else {
        showToast(response?.error || 'Failed to send message');
      }
    } catch (error) {
      showToast('Failed to send message');
    } finally {
      hideLoader();
    }
  };

  const fetchTicketDetail = async (ticketId: number) => {
    try {
      const response = await getRequest(ENDPOINTS.support_ticket_detail(String(ticketId)));
      if (response) {
        setSelectedTicket(response);
      }
    } catch (error) {
      showToast('Failed to fetch ticket details');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'resolved':
        return 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400';
      case 'closed':
        return 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400';
      default:
        return 'bg-slate-100 text-slate-600';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'text-red-500';
      case 'high':
        return 'text-orange-500';
      case 'medium':
        return 'text-yellow-500';
      case 'low':
        return 'text-green-500';
      default:
        return 'text-slate-500';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (selectedTicket) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="flex-1 flex flex-col min-w-0">
          <Header
            title="Support Ticket"
            subtitle={`#${selectedTicket.id} - ${selectedTicket.subject}`}
            showBackButton={true}
            onMenuClick={() => setSidebarOpen(true)}
          />
          <main className="flex-1 p-4 md:p-6 overflow-y-auto">
            <div className="max-w-3xl mx-auto">
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-4 mb-4">
                <div className="flex items-center justify-between mb-4">
                  <span className={cn('px-3 py-1 rounded-full text-xs font-medium', getStatusColor(selectedTicket.status))}>
                    {selectedTicket.status.replace('_', ' ').toUpperCase()}
                  </span>
                  <span className={cn('text-xs font-medium', getPriorityColor(selectedTicket.priority))}>
                    {selectedTicket.priority.toUpperCase()}
                  </span>
                </div>
                <p className="text-slate-600 dark:text-slate-300">{selectedTicket.description}</p>
                <p className="text-xs text-slate-400 mt-2">Created: {formatDate(selectedTicket.created_at)}</p>
              </div>

              <div className="space-y-4 mb-4">
                {selectedTicket.messages?.map((msg) => (
                  <div
                    key={msg.id}
                    className={cn(
                      'p-4 rounded-2xl',
                      msg.is_admin
                        ? 'bg-slate-100 dark:bg-slate-800 ml-8'
                        : 'bg-sky-50 dark:bg-sky-900/20 mr-8'
                    )}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-slate-800 dark:text-white">
                        {msg.sender_name}
                      </span>
                      <span className="text-xs text-slate-400">{formatDate(msg.created_at)}</span>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-300">{msg.message}</p>
                  </div>
                ))}
              </div>

              {selectedTicket.status !== 'closed' && (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  />
                  <button
                    onClick={sendMessage}
                    className="px-4 py-2 bg-sky-500 text-white rounded-xl hover:bg-sky-600"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>
          </main>
        </div>
        <ToastComponent />
        <LoaderComponent />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          title="Support"
          subtitle="Get help with your account"
          onMenuClick={() => setSidebarOpen(true)}
        />
        <main className="flex-1 p-4 md:p-6 overflow-y-auto">
          <div className="max-w-3xl mx-auto">
            <button
              onClick={() => setShowNewTicket(!showNewTicket)}
              className="w-full py-4 bg-sky-500 text-white rounded-xl font-medium hover:bg-sky-600 mb-6"
            >
              {showNewTicket ? 'Cancel' : 'Create New Ticket'}
            </button>

            {showNewTicket && (
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 mb-6">
                <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">New Support Ticket</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Subject</label>
                    <input
                      type="text"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="Describe your issue"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Priority</label>
                    <select
                      value={priority}
                      onChange={(e) => setPriority(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Description</label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Please describe your issue in detail..."
                      rows={4}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                    />
                  </div>
                  <button
                    onClick={createTicket}
                    className="w-full py-3 bg-sky-500 text-white rounded-xl font-medium hover:bg-sky-600"
                  >
                    Submit Ticket
                  </button>
                </div>
              </div>
            )}

            <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">Your Tickets</h3>
            
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : tickets.length === 0 ? (
              <div className="text-center py-12">
                <Headphones className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600 mb-4" />
                <p className="text-slate-500 dark:text-slate-400">No support tickets yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {tickets.map((ticket) => (
                  <button
                    key={ticket.id}
                    onClick={() => fetchTicketDetail(ticket.id)}
                    className="w-full text-left p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:border-sky-300 dark:hover:border-sky-600 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-medium text-slate-800 dark:text-white">{ticket.subject}</h4>
                        <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2">{ticket.description}</p>
                        <p className="text-xs text-slate-400 mt-2">{formatDate(ticket.created_at)}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium', getStatusColor(ticket.status))}>
                          {ticket.status.replace('_', ' ')}
                        </span>
                        <span className={cn('text-xs font-medium', getPriorityColor(ticket.priority))}>
                          {ticket.priority}
                        </span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
      <ToastComponent />
      <LoaderComponent />
    </div>
  );
}
