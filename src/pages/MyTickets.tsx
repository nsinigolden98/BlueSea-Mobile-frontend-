import { useState, useEffect } from 'react';
import { PinModal, Toast, TransactionModal } from '@/components/ui-custom';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, Ticket, Loader2, ChevronRight, Share2, X, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getRequest, postRequest, ENDPOINTS, API_BASE, type MyTicket } from '@/types';
import QRCode from 'react-qr-code';
import { useNavigate } from 'react-router-dom';

type TicketStatus = 'all' | 'upcoming' | 'used' | 'expired' | 'transferred' | 'canceled';

export function MyTickets() {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState<MyTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<TicketStatus>('all');
  const [selectedTicket, setSelectedTicket] = useState<MyTicket | null>(null);
  const [transferEmail, setTransferEmail] = useState('');
  const [showDetailModal, setShowDetailModal] = useState(false);
  const { PinComponent, showPinModal, message } = PinModal();
  const { showToast, ToastComponent } = Toast();
  const [isOpen, setIsOpen] = useState(false);
  const [txStatus, setTxStatus] = useState<boolean | null>(null);
  const [txMessage, setTxMessage] = useState('');

  const getImageUrl = (path: string | undefined) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    return `${API_BASE}${path}`;
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  useEffect(() => {
    if (message) {
      setIsOpen(true);
      if (message?.success || message?.code === '000') {
        showToast(message?.response_description || 'Action completed successfully!');
        setTxMessage(message?.response_description || 'Action completed successfully!');
        setTxStatus(true);
        fetchTickets();
        setTransferEmail('');
      } else {
        showToast(message?.error || message?.response_description || 'Action failed');
        setTxMessage(message?.error || message?.response_description || 'Action failed');
        setTxStatus(false);
      }
    }
  }, [message]);

  const fetchTickets = async () => {
    try {
      const data = await getRequest(ENDPOINTS.marketplace_my_tickets);
      if (data) {
        setTickets(data);
      }
    } catch (err) {
      showToast('Failed to fetch tickets');
    } finally {
      setLoading(false);
    }
  };

  const filterTickets = (tickets: MyTicket[]): MyTicket[] => {
    const now = new Date();
    
    return tickets.filter(ticket => {
      const eventDate = new Date(ticket.event_date);
      
      switch (activeFilter) {
        case 'upcoming':
          return eventDate > now && ticket.status === 'valid';
        case 'used':
          return ticket.status === 'used';
        case 'expired':
          return eventDate < now && ticket.status !== 'used';
        case 'transferred':
          return ticket.status === 'transferred';
        case 'canceled':
          return ticket.status === 'canceled';
        default:
          return true;
      }
    });
  };

  const filteredTickets = filterTickets(tickets);

  const handleTransfer = (ticket: MyTicket) => {
    setSelectedTicket(ticket);
    showPinModal();
  };

  const handleCancel = async () => {
    if (!selectedTicket) return;

    try {
      const response = await postRequest(
        ENDPOINTS.marketplace_ticket_cancel(selectedTicket.id),
        {}
      );
      
      if (response?.success || response?.code === '000') {
        showToast('Ticket cancelled successfully');
        fetchTickets();
        setShowDetailModal(false);
      } else {
        showToast(response?.error || 'Failed to cancel ticket');
      }
    } catch (err) {
      showToast('Failed to cancel ticket');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const filters: { label: string; value: TicketStatus }[] = [
    { label: 'All', value: 'all' },
    { label: 'Upcoming', value: 'upcoming' },
    { label: 'Used', value: 'used' },
    { label: 'Expired', value: 'expired' },
    { label: 'Transferred', value: 'transferred' },
    { label: 'Canceled', value: 'canceled' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex">
      <div className="flex-1 flex flex-col min-w-0">
        <header className="flex items-center px-4 py-4 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
          <button 
            onClick={() => navigate('/marketplace')}
            className="p-2 -ml-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-400" />
          </button>
          <div className="ml-2">
            <h1 className="text-xl font-bold text-slate-800 dark:text-white">My Tickets</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">View and manage your tickets</p>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6 overflow-y-auto">
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex overflow-x-auto gap-2 pb-2">
              {filters.map((filter) => (
                <button
                  key={filter.value}
                  onClick={() => setActiveFilter(filter.value)}
                  className={cn(
                    "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all",
                    activeFilter === filter.value
                      ? 'bg-sky-500 text-white'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                  )}
                >
                  {filter.label}
                </button>
              ))}
            </div>

            {loading ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-sky-500" />
              </div>
            ) : filteredTickets.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-12 text-center">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                  <Ticket className="w-10 h-10 text-slate-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-2">
                  No Tickets Found
                </h3>
                <p className="text-slate-500 dark:text-slate-400">
                  {activeFilter === 'all' 
                    ? 'Purchase tickets to events to see them here'
                    : `No ${activeFilter} tickets`}
                </p>
              </div>
            ) : (
              <div className="grid gap-4">
                {filteredTickets.map((ticket) => (
                  <div 
                    key={ticket.id}
                    onClick={() => {
                      setSelectedTicket(ticket);
                      setShowDetailModal(true);
                    }}
                    className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-4 cursor-pointer hover:shadow-md transition-shadow"
                  >
                    <div className="flex gap-4">
                      <div className="w-20 h-20 bg-slate-200 dark:bg-slate-800 rounded-xl flex-shrink-0 overflow-hidden">
                        {ticket.event_banner ? (
                          <img src={getImageUrl(ticket.event_banner)} alt={ticket.event_title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Ticket className="w-8 h-8 text-sky-500" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold text-slate-800 dark:text-white mb-1 line-clamp-1">
                              {ticket.event_title}
                            </h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                              {ticket.ticket_type?.name || 'Free Entry'}
                            </p>
                            <div className="flex items-center gap-3 mt-2 text-xs text-slate-500 dark:text-slate-400">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {formatDate(ticket.event_date)}
                              </span>
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {ticket.event_location}
                              </span>
                            </div>
                          </div>
                          <ChevronRight className="w-5 h-5 text-slate-400" />
                        </div>
                        <div className="mt-2 flex items-center gap-2">
                          {(() => {
                            const eventDate = new Date(ticket.event_date);
                            const now = new Date();
                            const isExpired = eventDate < now && ticket.status === 'valid';
                            return (
                              <>
                                <span className={cn(
                                  "px-2 py-1 rounded-full text-xs font-medium",
                                  isExpired ? 'bg-red-100 dark:bg-red-900/30 text-red-600' :
                                  ticket.status === 'valid' ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' :
                                  ticket.status === 'used' ? 'bg-slate-100 dark:bg-slate-800 text-slate-500' :
                                  ticket.status === 'transferred' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600' :
                                  'bg-red-100 dark:bg-red-900/30 text-red-600'
                                )}>
                                  {isExpired ? 'expired' : ticket.status}
                                </span>
                                <span className="text-xs text-slate-400 font-mono">
                                  {ticket.qr_code}
                                </span>
                              </>
                            );
                          })()}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      {showDetailModal && selectedTicket && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-slate-900 p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-slate-800 dark:text-white">Ticket Details</h2>
              <button 
                onClick={() => setShowDetailModal(false)}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-4 space-y-4">
              <div className="bg-white dark:bg-slate-800 rounded-xl p-4 text-center">
                {selectedTicket.qr_code ? (
                  <div className="inline-block p-2 bg-white rounded-lg">
                    <QRCode 
                      value={selectedTicket.qr_code} 
                      size={160}
                      level="H"
                    />
                  </div>
                ) : (
                  <div className="w-16 h-16 mx-auto mb-2 bg-white dark:bg-slate-900 rounded-full flex items-center justify-center">
                    <Ticket className="w-8 h-8 text-sky-500" />
                  </div>
                )}
                <p className="font-mono text-sm text-slate-500 mt-2">{selectedTicket.qr_code}</p>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Event</span>
                  <span className="font-medium text-slate-800 dark:text-white">
                    {selectedTicket.event_title}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Ticket Type</span>
                  <span className="font-medium text-slate-800 dark:text-white">
                    {selectedTicket.ticket_type?.name || 'Free Entry'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Date</span>
                  <span className="font-medium text-slate-800 dark:text-white">
                    {formatDate(selectedTicket.event_date)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Location</span>
                  <span className="font-medium text-slate-800 dark:text-white">
                    {selectedTicket.event_location}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Status</span>
                  <span className={cn(
                    "font-medium",
                    selectedTicket.status === 'valid' ? 'text-green-500' :
                    selectedTicket.status === 'used' ? 'text-slate-500' :
                    'text-red-500'
                  )}>
                    {selectedTicket.status}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Purchased</span>
                  <span className="font-medium text-slate-800 dark:text-white">
                    {formatDate(selectedTicket.created_at)}
                  </span>
                </div>
              </div>

              {selectedTicket.status === 'valid' && (
                <div className="flex gap-2 pt-4">
                  <Button 
                    onClick={() => handleTransfer(selectedTicket)}
                    className="flex-1 bg-sky-500 hover:bg-sky-600"
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    Transfer
                  </Button>
                  <Button 
                    onClick={handleCancel}
                    variant="destructive"
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <PinComponent type="marketplace_transfer" value={{ ticket_id: selectedTicket?.id, recipient_email: transferEmail }} />
      <ToastComponent />
      {isOpen && (
        <TransactionModal isSuccess={txStatus} onClose={() => setIsOpen(false)} toastMessage={txMessage} />
      )}
    </div>
  );
}