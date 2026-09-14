import { useState, useEffect, useCallback } from 'react';
import { PinModal, Toast, TransactionModal } from '@/components/ui-custom';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, Ticket, Loader2, ChevronRight, Share2, X, ArrowLeft, Copy, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getRequest, ENDPOINTS, type MyTicket } from '@/types';
import QRCode from 'react-qr-code';
import { useNavigate } from 'react-router-dom';

type TicketStatus = 'all' | 'upcoming' | 'used' | 'expired' | 'transferred';

export function MyTickets() {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState<MyTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<TicketStatus>('all');
  const [selectedTicket, setSelectedTicket] = useState<MyTicket | null>(null);
  const [transferEmail, setTransferEmail] = useState('');
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  const { PinComponent, showPinModal, message } = PinModal();
  const { showToast, ToastComponent } = Toast();
  const [isOpen, setIsOpen] = useState(false);
  const [txStatus, setTxStatus] = useState<boolean | null>(null);
  const [txMessage, setTxMessage] = useState('');

  const fetchTickets = useCallback(async () => {
    try {
      const data = await getRequest(ENDPOINTS.marketplace_my_tickets);
      if (data && Array.isArray(data)) {
        setTickets(data);
      } else if (data && Array.isArray(data.results)) {
        setTickets(data.results);
      }
    } catch {
      showToast('Failed to fetch tickets');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  useEffect(() => {
    if (message) {
      setIsOpen(true);
      if (message?.success || message?.code === '000') {
        const successMsg = message?.response_description || 'Ticket transferred successfully!';
        showToast(successMsg);
        setTxMessage(successMsg);
        setTxStatus(true);
        setShowTransferModal(false);
        setShowDetailModal(false);
        setTransferEmail('');
        fetchTickets();
      } else {
        const errorMsg = message?.error || message?.response_description || 'Transfer failed';
        showToast(errorMsg);
        setTxMessage(errorMsg);
        setTxStatus(false);
      }
    }
  }, [message, fetchTickets, showToast]);

  const getTicketStatusInfo = (ticket: MyTicket) => {
    if (ticket.status === 'transferred') {
      return {
        label: 'Transferred',
        badgeClass: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
        textClass: 'text-blue-500',
        isTransferable: false,
      };
    }
    if (ticket.status === 'used') {
      return {
        label: 'Used',
        badgeClass: 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400',
        textClass: 'text-slate-500',
        isTransferable: false,
      };
    }
    const eventTime = new Date(ticket.event_date).getTime();
    const now = new Date().getTime();
    if (eventTime < now) {
      return {
        label: 'Expired',
        badgeClass: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400',
        textClass: 'text-red-500',
        isTransferable: false,
      };
    }
    return {
      label: 'Upcoming',
      badgeClass: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
      textClass: 'text-green-500',
      isTransferable: true,
    };
  };

  const filterTickets = (ticketsList: MyTicket[]): MyTicket[] => {
    const now = new Date().getTime();
    
    return ticketsList.filter(ticket => {
      const eventTime = new Date(ticket.event_date).getTime();
      const isExpired = eventTime < now && ticket.status !== 'used' && ticket.status !== 'transferred';

      switch (activeFilter) {
        case 'upcoming':
          return ticket.status !== 'transferred' && ticket.status !== 'used' && !isExpired;
        case 'used':
          return ticket.status === 'used';
        case 'expired':
          return isExpired;
        case 'transferred':
          return ticket.status === 'transferred';
        default:
          return true;
      }
    });
  };

  const filteredTickets = filterTickets(tickets);

  const handleCopyId = async (id: string) => {
    try {
      await navigator.clipboard.writeText(id);
      setCopied(true);
      showToast('Ticket ID copied');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      showToast('Failed to copy Ticket ID');
    }
  };

  const handleOpenTransferModal = (ticket: MyTicket) => {
    setSelectedTicket(ticket);
    setTransferEmail('');
    setShowTransferModal(true);
  };

  const handleProceedTransfer = () => {
    if (!transferEmail || !/^\S+@\S+\.\S+$/.test(transferEmail.trim())) {
      showToast('Please enter a valid recipient email address');
      return;
    }
    showPinModal();
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
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
  ];

  const getTicketImage = (ticket: any): string | null => {
    return ticket.event_image || ticket.event_banner || ticket.image || ticket.banner || ticket.event?.banner || ticket.event?.image || null;
  };

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

        <main className="flex-1 p-4 md:p-6 overflow-y-auto max-md:[scrollbar-width:none] max-md:[-ms-overflow-style:none] max-md:[&::-webkit-scrollbar]:hidden">
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex overflow-x-auto gap-2 pb-2 max-md:[scrollbar-width:none] max-md:[-ms-overflow-style:none] max-md:[&::-webkit-scrollbar]:hidden">
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
                {filteredTickets.map((ticket) => {
                  const statusInfo = getTicketStatusInfo(ticket);
                  const imageUrl = getTicketImage(ticket);

                  return (
                    <div 
                      key={ticket.id}
                      onClick={() => {
                        setSelectedTicket(ticket);
                        setShowDetailModal(true);
                      }}
                      className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-4 cursor-pointer hover:shadow-md transition-shadow"
                    >
                      <div className="flex gap-4">
                        <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-xl flex-shrink-0 overflow-hidden relative">
                          {imageUrl && !imageErrors[ticket.id] ? (
                            <img
                              src={imageUrl}
                              alt={ticket.event_title}
                              className="w-full h-full object-cover"
                              onError={() => setImageErrors(prev => ({ ...prev, [ticket.id]: true }))}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-400">
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
                                {ticket.ticket_type?.name || 'Standard Entry'}
                              </p>
                              <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-slate-500 dark:text-slate-400">
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  {formatDate(ticket.event_date)}
                                </span>
                                {ticket.event_location && (
                                  <span className="flex items-center gap-1">
                                    <MapPin className="w-3 h-3" />
                                    {ticket.event_location}
                                  </span>
                                )}
                              </div>
                            </div>
                            <ChevronRight className="w-5 h-5 text-slate-400" />
                          </div>
                          <div className="mt-2 flex items-center gap-2">
                            <span className={cn("px-2.5 py-0.5 rounded-full text-xs font-medium", statusInfo.badgeClass)}>
                              {statusInfo.label}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* TICKET DETAIL MODAL */}
      {showDetailModal && selectedTicket && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto max-md:[scrollbar-width:none] max-md:[-ms-overflow-style:none] max-md:[&::-webkit-scrollbar]:hidden">
            <div className="sticky top-0 bg-white dark:bg-slate-900 p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-slate-800 dark:text-white">Ticket Details</h2>
              <button 
                onClick={() => setShowDetailModal(false)}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-4 space-y-5">
              {/* Image & QR Banner */}
              <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-4 text-center border border-slate-100 dark:border-slate-800">
                {selectedTicket.qr_code ? (
                  <div className="inline-block p-3 bg-white rounded-xl shadow-sm">
                    <QRCode 
                      value={selectedTicket.qr_code} 
                      size={160}
                      level="H"
                    />
                  </div>
                ) : (
                  <div className="w-16 h-16 mx-auto mb-2 bg-sky-100 dark:bg-sky-900/30 rounded-full flex items-center justify-center">
                    <Ticket className="w-8 h-8 text-sky-500" />
                  </div>
                )}
                <p className="text-xs text-slate-400 mt-2">Scan QR code at event entrance</p>
              </div>

              {/* Unique Ticket ID with Copy */}
              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-slate-400 font-medium">Ticket ID</p>
                  <p className="font-mono text-sm font-semibold text-slate-800 dark:text-white truncate">
                    {selectedTicket.id}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleCopyId(selectedTicket.id)}
                  className="flex items-center gap-1.5 text-xs h-8 px-2.5 shrink-0"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </Button>
              </div>

              {/* Details List */}
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center py-1 border-b border-slate-100 dark:border-slate-800/50">
                  <span className="text-slate-500 dark:text-slate-400">Event</span>
                  <span className="font-medium text-slate-800 dark:text-white text-right max-w-[60%] truncate">
                    {selectedTicket.event_title}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-100 dark:border-slate-800/50">
                  <span className="text-slate-500 dark:text-slate-400">Ticket Type</span>
                  <span className="font-medium text-slate-800 dark:text-white">
                    {selectedTicket.ticket_type?.name || 'Standard Entry'}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-100 dark:border-slate-800/50">
                  <span className="text-slate-500 dark:text-slate-400">Date</span>
                  <span className="font-medium text-slate-800 dark:text-white">
                    {formatDate(selectedTicket.event_date)}
                  </span>
                </div>
                {selectedTicket.event_location && (
                  <div className="flex justify-between items-center py-1 border-b border-slate-100 dark:border-slate-800/50">
                    <span className="text-slate-500 dark:text-slate-400">Location</span>
                    <span className="font-medium text-slate-800 dark:text-white text-right max-w-[60%] truncate">
                      {selectedTicket.event_location}
                    </span>
                  </div>
                )}
                <div className="flex justify-between items-center py-1 border-b border-slate-100 dark:border-slate-800/50">
                  <span className="text-slate-500 dark:text-slate-400">Status</span>
                  <span className={cn("font-medium", getTicketStatusInfo(selectedTicket).textClass)}>
                    {getTicketStatusInfo(selectedTicket).label}
                  </span>
                </div>
                {selectedTicket.created_at && (
                  <div className="flex justify-between items-center py-1">
                    <span className="text-slate-500 dark:text-slate-400">Purchased On</span>
                    <span className="font-medium text-slate-800 dark:text-white">
                      {formatDate(selectedTicket.created_at)}
                    </span>
                  </div>
                )}
              </div>

              {/* Actions */}
              {getTicketStatusInfo(selectedTicket).isTransferable && (
                <div className="pt-2">
                  <Button 
                    onClick={() => handleOpenTransferModal(selectedTicket)}
                    className="w-full bg-sky-500 hover:bg-sky-600 text-white font-medium py-2.5 rounded-xl flex items-center justify-center gap-2"
                  >
                    <Share2 className="w-4 h-4" />
                    Transfer Ticket
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TRANSFER TICKET MODAL */}
      {showTransferModal && selectedTicket && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-lg font-semibold text-slate-800 dark:text-white">Transfer Ticket</h3>
              <button 
                onClick={() => setShowTransferModal(false)}
                className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-xl space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Event:</span>
                <span className="font-medium text-slate-700 dark:text-slate-200 truncate max-w-[200px]">
                  {selectedTicket.event_title}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Ticket Type:</span>
                <span className="font-medium text-slate-700 dark:text-slate-200">
                  {selectedTicket.ticket_type?.name || 'Standard Entry'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Ticket ID:</span>
                <span className="font-mono font-medium text-slate-700 dark:text-slate-200 truncate max-w-[180px]">
                  {selectedTicket.id}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                Recipient's BlueSimo Email
              </label>
              <input 
                type="email"
                value={transferEmail}
                onChange={(e) => setTransferEmail(e.target.value)}
                placeholder="Enter member email"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
              <p className="text-xs text-slate-400">
                Enter the email address of the BlueSimo member you want to transfer this ticket to.
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => setShowTransferModal(false)}
                className="flex-1 rounded-xl"
              >
                Cancel
              </Button>
              <Button
                onClick={handleProceedTransfer}
                className="flex-1 bg-sky-500 hover:bg-sky-600 text-white rounded-xl"
              >
                Continue
              </Button>
            </div>
          </div>
        </div>
      )}

      <PinComponent 
        type="marketplace_transfer" 
        value={{ ticket_id: selectedTicket?.id, recipient_email: transferEmail }} 
      />
      <ToastComponent />
      {isOpen && (
        <TransactionModal 
          isSuccess={txStatus} 
          onClose={() => setIsOpen(false)} 
          toastMessage={txMessage} 
        />
      )}
    </div>
  );
}