import { useState, useEffect } from 'react';
import { Sidebar, Header, Toast, Loader } from '@/components/ui-custom';
import { postRequest, getRequest, ENDPOINTS } from '@/types';
import type { SupportTicket, CreateTicketPayload, SupportMessage } from '@/components/support/types';
import {
  SupportHero,
  //SupportAssistant,
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
  const [isLoadingConversation, setIsLoadingConversation] = useState(false);
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
    } catch {
      showToast('Failed to fetch support tickets');
    } finally {
      setLoading(false);
    }
  };

  const fetchTicketDetail = async (ticketId: number) => {
    setIsLoadingConversation(true);
    const localTicket = tickets.find((t) => t.id === ticketId);
    if (localTicket) {
      setSelectedTicket(localTicket);
    }

    try {
      const response = await getRequest(ENDPOINTS.support_ticket_detail(String(ticketId)));
      if (response) {
        setSelectedTicket(response);
      }
    } catch {
      showToast('Failed to fetch conversation details');
    } finally {
      setIsLoadingConversation(false);
    }
  };

  const handleCreateTicket = async (payload: CreateTicketPayload) => {
    setIsSubmittingTicket(true);
    try {
      const response = await postRequest(ENDPOINTS.support_tickets, {
        subject: payload.subject,
        description: payload.description,
        priority: payload.priority,
      });

      if (response && response.success) {
        showToast('Support conversation started successfully');
        setShowNewTicket(false);
        setInitialSubject('');
        await fetchTickets();

        if (response.ticket && response.ticket.id) {
          fetchTicketDetail(response.ticket.id);
        } else if (response.id) {
          fetchTicketDetail(response.id);
        }
      } else {
        showToast(response?.error || 'Failed to create support ticket');
      }
    } catch {
      showToast('Error connecting to support backend');
    } finally {
      setIsSubmittingTicket(false);
    }
  };

  const handleSendMessage = async (messageText: string, images?: File[]): Promise<boolean> => {
    if (!selectedTicket || (!messageText.trim() && (!images || images.length === 0))) return false;

    setIsSendingMessage(true);
    try {
      let response: any;

      if (!images || images.length === 0) {
        // CASE A: NO ATTACHMENTS -> USE EXISTING JSON POSTREQUEST PATH EXACTLY
        response = await postRequest(
          ENDPOINTS.support_ticket_detail(String(selectedTicket.id)),
          { message: messageText.trim() }
        );
      } else {
        // CASE C: ATTACHMENTS PRESENT -> MULTIPART FORM DATA FOR THIS REQUEST ONLY
        const formData = new FormData();
        formData.append('message', messageText.trim());
        images.forEach((file) => {
          formData.append('images', file);
        });

        const token =
          localStorage.getItem('token') ||
          localStorage.getItem('access_token') ||
          localStorage.getItem('jwt') ||
          '';

        const headers: Record<string, string> = {};
        if (token) {
          headers['Authorization'] = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
        }

        const res = await fetch(ENDPOINTS.support_ticket_detail(String(selectedTicket.id)), {
          method: 'POST',
          headers,
          body: formData,
        });

        response = await res.json();
      }

      if (response && response.success && response.message) {
        const newMsg: SupportMessage = response.message;

        setSelectedTicket((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            messages: [...(prev.messages || []), newMsg],
          };
        });

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
    } catch {
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

  const hasActiveConversation = Boolean(selectedTicket || isLoadingConversation);

  return (
    <div className="h-screen bg-slate-50 dark:bg-slate-900 flex overflow-hidden">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col h-full min-w-0 relative overflow-hidden">
        <div className="sticky top-0 z-30 shrink-0 bg-slate-50 dark:bg-slate-900">
          <Header
            title="Support Center"
            subtitle="Get help with your account & services"
            onMenuClick={() => setSidebarOpen(true)}
          />
        </div>

        <main className="flex-1 p-4 md:p-6 overflow-hidden z-10 flex flex-col min-h-0">
          <div className="max-w-6xl mx-auto w-full h-full flex flex-col min-h-0">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-0">
              <div
                className={
                  hasActiveConversation
                    ? 'hidden lg:flex lg:col-span-5 flex-col h-full min-h-0 overflow-y-auto pr-1'
                    : 'col-span-1 lg:col-span-12 flex flex-col h-full min-h-0 overflow-y-auto pr-1'
                }
              >
                {!showNewTicket && (
                  <>
                    <SupportHero onStartConversation={() => setShowNewTicket(true)} />
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

              <div
                className={
                  hasActiveConversation
                    ? 'col-span-1 lg:col-span-7 h-full flex flex-col min-h-0'
                    : 'hidden'
                }
              >
                <TicketConversation
                  ticket={selectedTicket}
                  isLoading={isLoadingConversation}
                  isSending={isSendingMessage}
                  onSendMessage={handleSendMessage}
                  onBack={() => setSelectedTicket(null)}
                  showBackButton={true}
                  onStartNewTicket={() => {
                    setSelectedTicket(null);
                    setShowNewTicket(true);
                  }}
                />
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
