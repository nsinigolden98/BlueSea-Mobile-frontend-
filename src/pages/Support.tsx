import { useState, useEffect } from 'react';
import { Sidebar, Header, Toast, Loader } from '@/components/ui-custom';
import { postRequest, getRequest, ENDPOINTS } from '@/types';
import type { SupportTicket, CreateTicketPayload, SupportMessage } from '@/components/support/types';
import {
  SupportHero,
  SupportAssistant,
  SupportQuickActions,
  TicketList,
  TicketForm,
  TicketConversation,
} from '@/components/support';

export function Support() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewTicket, setShowNewTicket] = useState(false);
  const [initialSubject, setInitialSubject] = useState('');
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [isSubmittingTicket, setIsSubmittingTicket] = useState(false);
  const [isSendingMessage, setIsSendingMessage] = useState(false);

  const { showToast, ToastComponent } = Toast();
  const { LoaderComponent } = Loader();

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
      showToast('Failed to fetch support tickets');
    } finally {
      setLoading(false);
    }
  };

  const fetchTicketDetail = async (ticketId: number) => {
    try {
      const response = await getRequest(ENDPOINTS.support_ticket_detail(String(ticketId)));
      if (response) {
        setSelectedTicket(response);
      }
    } catch (error) {
      showToast('Failed to fetch conversation details');
    }
  };

  const handleCreateTicket = async (payload: CreateTicketPayload) => {
    setIsSubmittingTicket(true);
    try {
      const response = await postRequest(ENDPOINTS.support_tickets, payload);
      if (response && response.success) {
        showToast('Support conversation started successfully');
        setShowNewTicket(false);
        setInitialSubject('');
        await fetchTickets();
        
        // If created ticket object or ID returned, open directly
        if (response.ticket && response.ticket.id) {
          fetchTicketDetail(response.ticket.id);
        } else if (response.id) {
          fetchTicketDetail(response.id);
        }
      } else {
        showToast(response?.error || 'Failed to create support ticket');
      }
    } catch (error) {
      showToast('Error connecting to support backend');
    } finally {
      setIsSubmittingTicket(false);
    }
  };

  const handleSendMessage = async (messageText: string): Promise<boolean> => {
    if (!selectedTicket || !messageText.trim()) return false;

    setIsSendingMessage(true);
    try {
      const response = await postRequest(
        ENDPOINTS.support_ticket_detail(String(selectedTicket.id)),
        { message: messageText.trim() }
      );

      if (response && response.success && response.message) {
        const newMsg: SupportMessage = response.message;
        
        // Append backend-returned message object immediately
        setSelectedTicket((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            messages: [...(prev.messages || []), newMsg],
          };
        });

        // Also update latest timestamp/preview in parent ticket list
        setTickets((prevTickets) =>
          prevTickets.map((t) =>
            t.id === selectedTicket.id
              ? { ...t, updated_at: newMsg.created_at, messages: [...(t.messages || []), newMsg] }
              : t
          )
        );

        showToast('Message sent');
        return true;
      } else {
        showToast(response?.error || 'Failed to send message');
        return false;
      }
    } catch (error) {
      showToast('Failed to send message. Please check connection.');
      return false;
    } finally {
      setIsSendingMessage(false);
    }
  };

  const handleQuickCategorySelect = (categoryLabel: string) => {
    setInitialSubject(`${categoryLabel}: `);
    setShowNewTicket(true);
  };

  return (
    <div className="h-screen bg-slate-50 dark:bg-slate-900 flex overflow-hidden">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col h-full min-w-0 relative">
        <div className="sticky top-0 z-30 shrink-0 bg-slate-50 dark:bg-slate-900">
          <Header
            title="Support Center"
            subtitle="Get help with your account & services"
            onMenuClick={() => setSidebarOpen(true)}
          />
        </div>

        <main className="flex-1 p-4 md:p-6 overflow-y-auto scrollbar-hide z-10">
          <div className="max-w-6xl mx-auto h-full flex flex-col">
            
            {/* DESKTOP TWO-PANE / RESPONSIVE VIEW ENGINE */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-0">
              
              {/* LEFT COLUMN: List / Forms / Intro */}
              <div
                className={
                  selectedTicket
                    ? 'hidden lg:block lg:col-span-5 flex flex-col h-full overflow-y-auto pr-1'
                    : 'col-span-1 lg:col-span-5 flex flex-col h-full overflow-y-auto pr-1'
                }
              >
                {!showNewTicket && (
                  <>
                    <SupportHero onStartConversation={() => setShowNewTicket(true)} />
                    <SupportAssistant />
                    <SupportQuickActions onSelectCategory={handleQuickCategorySelect} />
                  </>
                )}

                {showNewTicket && (
                  <TicketForm
                    initialSubject={initialSubject}
                    isSubmitting={isSubmittingTicket}
                    onSubmit={handleCreateTicket}
                    onCancel={() => {
                      setShowNewTicket(false);
                      setInitialSubject('');
                    }}
                  />
                )}

                <div className="flex-1">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-bold text-slate-800 dark:text-white">
                      Your Conversations
                    </h3>
                    <span className="text-xs text-slate-400">
                      {tickets.length} {tickets.length === 1 ? 'ticket' : 'tickets'}
                    </span>
                  </div>

                  <TicketList
                    tickets={tickets}
                    loading={loading}
                    selectedTicketId={selectedTicket?.id}
                    onSelectTicket={fetchTicketDetail}
                    onStartConversation={() => setShowNewTicket(true)}
                  />
                </div>
              </div>

              {/* RIGHT COLUMN: Active Conversation Workspace */}
              <div
                className={
                  selectedTicket
                    ? 'col-span-1 lg:col-span-7 h-full flex flex-col'
                    : 'hidden lg:flex lg:col-span-7 h-full items-center justify-center border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-8 bg-white/50 dark:bg-slate-800/20'
                }
              >
                {selectedTicket ? (
                  <TicketConversation
                    ticket={selectedTicket}
                    isSending={isSendingMessage}
                    onSendMessage={handleSendMessage}
                    onBack={() => setSelectedTicket(null)}
                    showBackButton={true}
                    onStartNewTicket={() => {
                      setSelectedTicket(null);
                      setShowNewTicket(true);
                    }}
                  />
                ) : (
                  <div className="text-center text-slate-400 dark:text-slate-500">
                    <p className="text-sm font-medium">Select a conversation to view messages</p>
                    <p className="text-xs mt-1">Or start a new request to reach BlueSea Support.</p>
                  </div>
                )}
              </div>

            </div>
          </div>
        </main>
      </div>

      <ToastComponent />
      <LoaderComponent />
    </div>
  );
}
