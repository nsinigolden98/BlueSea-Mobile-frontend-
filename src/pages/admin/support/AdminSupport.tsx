import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { TouchEvent } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { Sidebar, Header, Toast } from '@/components/ui-custom';
import type {
  AdminAttachment,
  AdminMessage,
  AdminSupportTicket,
  TicketPriority,
  TicketStatus,
} from './supportAdminTypes';

const API_BASE = String(import.meta.env.VITE_API_BASE || '').replace(/\/$/, '');
const ADMIN_TICKETS_URL = `${API_BASE}/support/admin/tickets/`;
const adminTicketUrl = (id: number) => `${API_BASE}/support/admin/tickets/${id}/`;
const adminReplyUrl = (id: number) => `${API_BASE}/support/admin/tickets/${id}/reply/`;

const statusOptions: TicketStatus[] = ['open', 'in_progress', 'resolved', 'closed'];
const priorityOptions: TicketPriority[] = ['low', 'medium', 'high', 'urgent'];

const AUTO_REFRESH_MS = 8000;
const PULL_THRESHOLD = 72;

type InboxView = 'open' | 'urgent' | 'in_progress' | 'resolved' | 'closed';

const authHeaders = () => {
  const token = Cookies.get('access_token') || Cookies.get('token') || '';
  return token
    ? { Authorization: token.startsWith('Bearer ') ? token : `Bearer ${token}` }
    : {};
};

const normalizeAttachment = (value: unknown): AdminAttachment | null => {
  if (typeof value === 'string') return { url: value };
  if (!value || typeof value !== 'object') return null;

  const item = value as Record<string, unknown>;
  const url = item.url ?? item.file ?? item.image ?? item.image_url;

  return typeof url === 'string' && url
    ? {
        url,
        name: typeof item.name === 'string' ? item.name : undefined,
      }
    : null;
};

const normalizeMessage = (value: unknown, index: number): AdminMessage => {
  const item = (value && typeof value === 'object' ? value : {}) as Record<string, unknown>;
  const rawAttachments = Array.isArray(item.attachments) ? item.attachments : [];

  return {
    id: typeof item.id === 'number' || typeof item.id === 'string' ? Number(item.id) : index,
    sender_name: typeof item.sender_name === 'string' ? item.sender_name : undefined,
    message: typeof item.message === 'string' ? item.message : '',
    is_admin: item.is_admin === true,
    created_at: typeof item.created_at === 'string' ? item.created_at : '',
    attachments: rawAttachments
      .map(normalizeAttachment)
      .filter((item): item is AdminAttachment => Boolean(item)),
  };
};

const normalizeTicket = (value: unknown): AdminSupportTicket | null => {
  if (!value || typeof value !== 'object') return null;

  const item = value as Record<string, unknown>;
  if (typeof item.id !== 'number' || typeof item.subject !== 'string') return null;

  const messages = Array.isArray(item.messages)
    ? item.messages.map(normalizeMessage)
    : [];

  return {
    id: item.id,
    subject: item.subject,
    description: typeof item.description === 'string' ? item.description : '',
    status: statusOptions.includes(item.status as TicketStatus)
      ? (item.status as TicketStatus)
      : 'open',
    priority: priorityOptions.includes(item.priority as TicketPriority)
      ? (item.priority as TicketPriority)
      : 'medium',
    created_at: typeof item.created_at === 'string' ? item.created_at : '',
    updated_at: typeof item.updated_at === 'string' ? item.updated_at : '',
    messages,
    user_name: typeof item.user_name === 'string' ? item.user_name : 'Customer',
    user_email: typeof item.user_email === 'string' ? item.user_email : '',
    message_count:
      typeof item.message_count === 'number' ? item.message_count : messages.length,
  };
};

const errorText = (error: unknown, fallback: string) => {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data;

    if (typeof data === 'string') return data;

    if (data && typeof data === 'object') {
      const body = data as Record<string, unknown>;
      if (typeof body.detail === 'string') return body.detail;
      if (typeof body.message === 'string') return body.message;
      if (typeof body.error === 'string') return body.error;
    }
  }

  return fallback;
};

const formatDate = (value: string) => {
  if (!value) return '—';

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
};

const formatStatus = (value: TicketStatus) => value.replace('_', ' ');

const formatInboxView = (value: InboxView) => {
  if (value === 'urgent') return 'Urgent';
  return formatStatus(value);
};

const isSameMessage = (left: AdminMessage, right: AdminMessage) =>
  left.id === right.id &&
  left.message === right.message &&
  left.created_at === right.created_at &&
  left.is_admin === right.is_admin &&
  (left.attachments?.length || 0) === (right.attachments?.length || 0);

const hasSameConversation = (
  left: AdminSupportTicket,
  right: AdminSupportTicket,
) => {
  if (left.message_count !== right.message_count) return false;
  if (left.messages.length !== right.messages.length) return false;

  return left.messages.every((message, index) =>
    isSameMessage(message, right.messages[index]),
  );
};

const getLastMessage = (ticket: AdminSupportTicket) =>
  ticket.messages.length > 0
    ? ticket.messages[ticket.messages.length - 1]
    : null;

export function AdminSupport() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [tickets, setTickets] = useState<AdminSupportTicket[]>([]);
  const [selected, setSelected] = useState<AdminSupportTicket | null>(null);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [conversationRefreshing, setConversationRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [inboxView, setInboxView] = useState<InboxView>('open');
  const [priorityFilter, setPriorityFilter] = useState<'all' | TicketPriority>('all');
  const [message, setMessage] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [sending, setSending] = useState(false);
  const [updating, setUpdating] = useState<'status' | 'priority' | null>(null);
  const [pullDistance, setPullDistance] = useState(0);
  const [pulling, setPulling] = useState(false);

  const conversationScrollRef = useRef<HTMLDivElement | null>(null);
  const touchStartYRef = useRef<number | null>(null);
  const touchPullingRef = useRef(false);
  const selectedIdRef = useRef<number | null>(null);

  const { showToast, ToastComponent } = Toast();

  useEffect(() => {
    selectedIdRef.current = selected?.id ?? null;
  }, [selected?.id]);

  const loadTickets = useCallback(async () => {
    setLoading(true);

    try {
      const response = await axios.get(ADMIN_TICKETS_URL, {
        headers: authHeaders(),
      });

      const raw = Array.isArray(response.data)
        ? response.data
        : response.data?.tickets;

      const next = Array.isArray(raw)
        ? raw
            .map(normalizeTicket)
            .filter(
              (ticket): ticket is AdminSupportTicket => Boolean(ticket),
            )
        : [];

      setTickets(next);

      const currentSelectedId = selectedIdRef.current;

      if (currentSelectedId !== null) {
        const updatedSelected = next.find(
          (ticket) => ticket.id === currentSelectedId,
        );

        if (updatedSelected) {
          setSelected((current) =>
            current && current.id === currentSelectedId
              ? {
                  ...current,
                  status: updatedSelected.status,
                  priority: updatedSelected.priority,
                  updated_at: updatedSelected.updated_at,
                  message_count: updatedSelected.message_count,
                }
              : current,
          );
        }
      }
    } catch (error) {
      showToast(errorText(error, 'Failed to load support tickets.'));
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    void loadTickets();
  }, [loadTickets]);

  const refreshConversation = useCallback(
    async (silent = true) => {
      const ticketId = selectedIdRef.current;
      if (ticketId === null) return;

      if (!silent) setConversationRefreshing(true);

      try {
        const response = await axios.get(adminTicketUrl(ticketId), {
          headers: authHeaders(),
        });

        const detail = normalizeTicket(response.data);
        if (!detail) return;

        setTickets((current) =>
          current.map((ticket) =>
            ticket.id === detail.id ? detail : ticket,
          ),
        );

        setSelected((current) => {
          if (!current || current.id !== detail.id) return current;

          // Do not replace the local conversation when nothing changed.
          // Most importantly, this never touches the draft message or attachments.
          if (hasSameConversation(current, detail)) {
            return {
              ...current,
              status: detail.status,
              priority: detail.priority,
              updated_at: detail.updated_at,
              message_count: detail.message_count,
            };
          }

          return detail;
        });
      } catch (error) {
        if (!silent) {
          showToast(
            errorText(error, 'Failed to refresh the support conversation.'),
          );
        }
      } finally {
        if (!silent) setConversationRefreshing(false);
      }
    },
    [showToast],
  );

  useEffect(() => {
    if (!selected) return;

    const interval = window.setInterval(() => {
      void refreshConversation(true);
    }, AUTO_REFRESH_MS);

    return () => window.clearInterval(interval);
  }, [selected?.id, refreshConversation]);

  const openTicket = async (ticket: AdminSupportTicket) => {
    setSelected(ticket);
    setDetailLoading(true);

    try {
      const response = await axios.get(adminTicketUrl(ticket.id), {
        headers: authHeaders(),
      });

      const detail = normalizeTicket(response.data);

      if (detail) {
        setSelected(detail);
        setTickets((current) =>
          current.map((item) => (item.id === detail.id ? detail : item)),
        );
      }
    } catch (error) {
      showToast(errorText(error, 'Failed to load ticket conversation.'));
    } finally {
      setDetailLoading(false);
    }
  };

  const updateTicket = async (
    field: 'status' | 'priority',
    value: TicketStatus | TicketPriority,
  ) => {
    if (!selected) return;

    setUpdating(field);

    try {
      const payload = { [field]: value };

      const response = await axios.patch(
        adminTicketUrl(selected.id),
        payload,
        {
          headers: {
            ...authHeaders(),
            'Content-Type': 'application/json',
          },
        },
      );

      const returnedStatus = response.data?.status;
      const returnedPriority = response.data?.priority;

      const nextStatus: TicketStatus =
        statusOptions.includes(returnedStatus as TicketStatus)
          ? (returnedStatus as TicketStatus)
          : selected.status;

      const nextPriority: TicketPriority =
        priorityOptions.includes(returnedPriority as TicketPriority)
          ? (returnedPriority as TicketPriority)
          : selected.priority;

      const next = {
        ...selected,
        status: nextStatus,
        priority: nextPriority,
      };

      setSelected(next);

      setTickets((current) =>
        current.map((item) =>
          item.id === next.id ? { ...item, ...next } : item,
        ),
      );

      showToast(`${field === 'status' ? 'Status' : 'Priority'} updated`);

      // Closing a ticket removes it from the active workflow immediately.
      if (field === 'status' && value === 'closed' && inboxView !== 'closed') {
        setSelected(null);
      }
    } catch (error) {
      showToast(errorText(error, `Failed to update ${field}.`));
    } finally {
      setUpdating(null);
    }
  };

  const sendMessage = async () => {
    if (!selected || (!message.trim() && images.length === 0)) return;

    setSending(true);

    try {
      const formData = new FormData();

      if (message.trim()) {
        formData.append('message', message.trim());
      }

      images.forEach((file) => {
        formData.append('images', file);
      });

      // IMPORTANT:
      // This is the admin-only endpoint from the backend contract.
      // Do not change this to /support/{id}/.
      const response = await axios.post(
        adminReplyUrl(selected.id),
        formData,
        {
          headers: authHeaders(),
        },
      );

      const rawCreated =
        response.data?.message ??
        response.data?.data ??
        response.data;

      const created = normalizeMessage(
        rawCreated,
        selected.messages.length,
      );

      const next = {
        ...selected,
        messages: [...selected.messages, created],
        message_count: Math.max(
          selected.message_count + 1,
          selected.messages.length + 1,
        ),
        updated_at:
          created.created_at || new Date().toISOString(),
      };

      setSelected(next);

      setTickets((current) =>
        current.map((item) =>
          item.id === next.id ? next : item,
        ),
      );

      setMessage('');
      setImages([]);

      showToast('Admin reply sent');

      // Re-read the backend representation after sending so the UI remains
      // aligned with the server as the source of truth.
      await refreshConversation(true);
    } catch (error) {
      showToast(errorText(error, 'Failed to send admin reply.'));
    } finally {
      setSending(false);
    }
  };

  const filteredTickets = useMemo(() => {
    const q = search.trim().toLowerCase();

    const filtered = tickets.filter((ticket) => {
      const matchesSearch =
        !q ||
        [
          ticket.subject,
          ticket.description,
          ticket.user_name,
          ticket.user_email,
          String(ticket.id),
        ].some((value) => value.toLowerCase().includes(q));

      const matchesPriority =
        priorityFilter === 'all' ||
        ticket.priority === priorityFilter;

      let matchesView = false;

      switch (inboxView) {
        case 'open':
          matchesView = ticket.status === 'open';
          break;
        case 'urgent':
          matchesView = ticket.priority === 'urgent' && ticket.status !== 'closed';
          break;
        case 'in_progress':
          matchesView = ticket.status === 'in_progress';
          break;
        case 'resolved':
          matchesView = ticket.status === 'resolved';
          break;
        case 'closed':
          matchesView = ticket.status === 'closed';
          break;
      }

      return matchesSearch && matchesPriority && matchesView;
    });

    return [...filtered].sort((a, b) => {
      const priorityRank: Record<TicketPriority, number> = {
        urgent: 0,
        high: 1,
        medium: 2,
        low: 3,
      };

      const priorityDifference =
        priorityRank[a.priority] - priorityRank[b.priority];

      if (priorityDifference !== 0) return priorityDifference;

      const aTime = new Date(a.updated_at || a.created_at).getTime();
      const bTime = new Date(b.updated_at || b.created_at).getTime();

      return bTime - aTime;
    });
  }, [tickets, search, inboxView, priorityFilter]);

  const counts = useMemo(
    () => ({
      open: tickets.filter((ticket) => ticket.status === 'open').length,
      urgent: tickets.filter(
        (ticket) =>
          ticket.priority === 'urgent' &&
          ticket.status !== 'closed',
      ).length,
      in_progress: tickets.filter(
        (ticket) => ticket.status === 'in_progress',
      ).length,
      resolved: tickets.filter(
        (ticket) => ticket.status === 'resolved',
      ).length,
      closed: tickets.filter(
        (ticket) => ticket.status === 'closed',
      ).length,
    }),
    [tickets],
  );

  const handleTouchStart = (
    event: TouchEvent<HTMLDivElement>,
  ) => {
    const container = conversationScrollRef.current;
    if (!container || container.scrollTop > 0 || conversationRefreshing) {
      touchStartYRef.current = null;
      touchPullingRef.current = false;
      return;
    }

    touchStartYRef.current = event.touches[0]?.clientY ?? null;
    touchPullingRef.current = true;
    setPulling(false);
    setPullDistance(0);
  };

  const handleTouchMove = (
    event: TouchEvent<HTMLDivElement>,
  ) => {
    if (!touchPullingRef.current || touchStartYRef.current === null) return;

    const currentY = event.touches[0]?.clientY ?? touchStartYRef.current;
    const distance = Math.max(0, currentY - touchStartYRef.current);

    if (distance <= 0) {
      setPullDistance(0);
      setPulling(false);
      return;
    }

    const dampedDistance = Math.min(distance * 0.55, 96);
    setPullDistance(dampedDistance);
    setPulling(dampedDistance >= PULL_THRESHOLD * 0.55);
  };

  const handleTouchEnd = async () => {
    if (!touchPullingRef.current) return;

    const shouldRefresh = pullDistance >= PULL_THRESHOLD * 0.55;

    touchStartYRef.current = null;
    touchPullingRef.current = false;
    setPulling(false);
    setPullDistance(0);

    if (shouldRefresh && selected) {
      await refreshConversation(false);
    }
  };

  const closeSelected = () => {
    setSelected(null);
    setDetailLoading(false);
  };

  const activeTicket = selected
    ? tickets.find((ticket) => ticket.id === selected.id)
    : null;

  const latestMessage = selected ? getLastMessage(selected) : null;

  return (
    <div className="h-screen bg-slate-50 dark:bg-slate-900 flex overflow-hidden">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
        <div className="shrink-0 bg-slate-50 dark:bg-slate-900">
          <Header
            title="Support Admin"
            subtitle="Manage customer support conversations"
            onMenuClick={() => setSidebarOpen(true)}
          />
        </div>

        <main className="flex-1 min-h-0 p-3 sm:p-4 md:p-6 overflow-hidden">
          <div className="h-full max-w-7xl mx-auto flex flex-col gap-4 min-h-0">
            <section className="shrink-0 grid grid-cols-2 md:grid-cols-5 gap-2">
              {[
                {
                  key: 'open' as const,
                  label: 'Open',
                  value: counts.open,
                },
                {
                  key: 'urgent' as const,
                  label: 'Urgent',
                  value: counts.urgent,
                },
                {
                  key: 'in_progress' as const,
                  label: 'In Progress',
                  value: counts.in_progress,
                },
                {
                  key: 'resolved' as const,
                  label: 'Resolved',
                  value: counts.resolved,
                },
                {
                  key: 'closed' as const,
                  label: 'Closed',
                  value: counts.closed,
                },
              ].map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setInboxView(item.key)}
                  className={`rounded-2xl border px-4 py-3 text-left transition ${
                    inboxView === item.key
                      ? 'border-slate-900 bg-slate-900 text-white dark:border-white dark:bg-white dark:text-slate-900'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  <p className="text-[11px] uppercase tracking-wide opacity-70">
                    {item.label}
                  </p>
                  <p className="mt-1 text-xl font-bold">
                    {item.value}
                  </p>
                </button>
              ))}
            </section>

            <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-4">
              <section
                className={`${
                  selected ? 'hidden lg:flex' : 'flex'
                } lg:col-span-5 min-h-0 flex-col rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 overflow-hidden`}
              >
                <div className="p-4 border-b border-slate-100 dark:border-slate-700 space-y-3">
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white">
                      {inboxView === 'closed'
                        ? 'Closed tickets'
                        : `${formatInboxView(inboxView)} tickets`}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {filteredTickets.length} ticket
                      {filteredTickets.length === 1 ? '' : 's'}
                    </p>
                  </div>

                  <input
                    value={search}
                    onChange={(event) =>
                      setSearch(event.target.value)
                    }
                    placeholder="Search tickets, customers or ID"
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 px-3 py-2.5 text-sm outline-none focus:border-slate-400 dark:text-white"
                  />

                  <div className="grid grid-cols-2 gap-2">
                    <select
                      value={inboxView}
                      onChange={(event) =>
                        setInboxView(
                          event.target.value as InboxView,
                        )
                      }
                      className="rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2 text-sm capitalize dark:text-white"
                    >
                      <option value="open">
                        Open
                      </option>
                      <option value="urgent">
                        Urgent
                      </option>
                      <option value="in_progress">
                        In progress
                      </option>
                      <option value="resolved">
                        Resolved
                      </option>
                      <option value="closed">
                        Closed
                      </option>
                    </select>

                    <select
                      value={priorityFilter}
                      onChange={(event) =>
                        setPriorityFilter(
                          event.target.value as
                            | 'all'
                            | TicketPriority,
                        )
                      }
                      className="rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2 text-sm capitalize dark:text-white"
                    >
                      <option value="all">
                        All priorities
                      </option>
                      {priorityOptions.map((value) => (
                        <option key={value} value={value}>
                          {value}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex-1 min-h-0 overflow-y-auto">
                  {loading ? (
                    <div className="p-4 space-y-3">
                      {[1, 2, 3, 4].map((item) => (
                        <div
                          key={item}
                          className="h-24 rounded-xl bg-slate-100 dark:bg-slate-700 animate-pulse"
                        />
                      ))}
                    </div>
                  ) : filteredTickets.length === 0 ? (
                    <div className="p-8 text-center text-sm text-slate-500">
                      No support tickets found.
                    </div>
                  ) : (
                    filteredTickets.map((ticket) => {
                      const last = getLastMessage(ticket);

                      return (
                        <button
                          key={ticket.id}
                          type="button"
                          onClick={() => void openTicket(ticket)}
                          className={`w-full text-left p-4 border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 ${
                            selected?.id === ticket.id
                              ? 'bg-slate-50 dark:bg-slate-700/60'
                              : ''
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span
                                  className={`h-2 w-2 rounded-full shrink-0 ${
                                    ticket.priority === 'urgent'
                                      ? 'bg-red-500'
                                      : ticket.priority === 'high'
                                        ? 'bg-orange-500'
                                        : ticket.priority === 'medium'
                                          ? 'bg-blue-500'
                                          : 'bg-slate-300'
                                  }`}
                                />
                                <p className="font-semibold text-sm text-slate-900 dark:text-white truncate">
                                  {ticket.subject}
                                </p>
                              </div>

                              <p className="text-xs text-slate-500 mt-1 truncate">
                                {ticket.user_name} ·{' '}
                                {ticket.user_email}
                              </p>
                            </div>

                            <span className="shrink-0 text-[11px] rounded-full px-2 py-1 bg-slate-100 dark:bg-slate-600 text-slate-600 dark:text-slate-200 capitalize">
                              {formatStatus(ticket.status)}
                            </span>
                          </div>

                          {last?.message && (
                            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 truncate">
                              {last.message}
                            </p>
                          )}

                          <div className="mt-2 flex justify-between text-[11px] text-slate-400">
                            <span>
                              {ticket.priority}
                              {ticket.message_count > 0
                                ? ` · ${ticket.message_count} message${
                                    ticket.message_count === 1
                                      ? ''
                                      : 's'
                                  }`
                                : ''}
                            </span>
                            <span>
                              {formatDate(
                                ticket.updated_at ||
                                  ticket.created_at,
                              )}
                            </span>
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>
              </section>

              <section
                className={`${
                  selected ? 'flex' : 'hidden lg:flex'
                } lg:col-span-7 min-h-0 flex-col rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 overflow-hidden`}
              >
                {!selected ? (
                  <div className="m-auto text-center p-8">
                    <p className="font-semibold text-slate-800 dark:text-white">
                      Select a support ticket
                    </p>
                    <p className="text-sm text-slate-500 mt-1">
                      Choose a conversation from the inbox to view
                      and respond.
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="shrink-0 p-4 border-b border-slate-100 dark:border-slate-700">
                      <button
                        type="button"
                        onClick={closeSelected}
                        className="lg:hidden mb-3 text-sm font-medium text-slate-600 dark:text-slate-300"
                      >
                        ← Back to tickets
                      </button>

                      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                        <div className="min-w-0">
                          <h2 className="text-lg font-bold text-slate-900 dark:text-white break-words">
                            {selected.subject}
                          </h2>

                          <p className="text-sm text-slate-500 mt-1">
                            {selected.user_name} ·{' '}
                            {selected.user_email}
                          </p>

                          <p className="text-xs text-slate-400 mt-1">
                            Ticket #{selected.id} ·{' '}
                            {formatDate(selected.created_at)}
                          </p>
                        </div>

                        <div className="grid grid-cols-2 gap-2 shrink-0">
                          <select
                            disabled={updating === 'status'}
                            value={selected.status}
                            onChange={(event) =>
                              void updateTicket(
                                'status',
                                event.target.value as TicketStatus,
                              )
                            }
                            className="rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 px-2 py-2 text-xs capitalize dark:text-white"
                          >
                            {statusOptions.map((value) => (
                              <option key={value} value={value}>
                                {formatStatus(value)}
                              </option>
                            ))}
                          </select>

                          <select
                            disabled={updating === 'priority'}
                            value={selected.priority}
                            onChange={(event) =>
                              void updateTicket(
                                'priority',
                                event.target.value as TicketPriority,
                              )
                            }
                            className="rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 px-2 py-2 text-xs capitalize dark:text-white"
                          >
                            {priorityOptions.map((value) => (
                              <option key={value} value={value}>
                                {value}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="mt-3 flex items-center justify-between gap-3 text-[11px] text-slate-400">
                        <span>
                          {conversationRefreshing
                            ? 'Checking for new messages…'
                            : 'Live conversation refresh is on'}
                        </span>

                        {activeTicket && (
                          <span>
                            Last activity:{' '}
                            {formatDate(
                              activeTicket.updated_at ||
                                activeTicket.created_at,
                            )}
                          </span>
                        )}
                      </div>
                    </div>

                    <div
                      ref={conversationScrollRef}
                      onTouchStart={handleTouchStart}
                      onTouchMove={handleTouchMove}
                      onTouchEnd={() => void handleTouchEnd()}
                      onTouchCancel={() => {
                        touchStartYRef.current = null;
                        touchPullingRef.current = false;
                        setPulling(false);
                        setPullDistance(0);
                      }}
                      className="relative flex-1 min-h-0 overflow-y-auto overscroll-y-contain p-4 space-y-4"
                    >
                      {pullDistance > 0 && (
                        <div
                          className="pointer-events-none absolute left-0 right-0 top-0 z-10 flex justify-center overflow-hidden"
                          style={{
                            height: `${Math.min(
                              pullDistance,
                              72,
                            )}px`,
                          }}
                        >
                          <div className="mt-2 rounded-full bg-white/95 dark:bg-slate-800/95 border border-slate-200 dark:border-slate-700 px-3 py-1.5 text-xs text-slate-600 dark:text-slate-200 shadow-sm">
                            {pulling
                              ? 'Release to refresh'
                              : 'Pull to refresh'}
                          </div>
                        </div>
                      )}

                      <div className="rounded-xl bg-slate-50 dark:bg-slate-900/60 p-4">
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-2">
                          Original request
                        </p>
                        <p className="text-sm whitespace-pre-wrap text-slate-700 dark:text-slate-200">
                          {selected.description || '—'}
                        </p>
                      </div>

                      {detailLoading ? (
                        <div className="space-y-3">
                          {[1, 2, 3].map((item) => (
                            <div
                              key={item}
                              className="h-20 rounded-xl bg-slate-100 dark:bg-slate-700 animate-pulse"
                            />
                          ))}
                        </div>
                      ) : selected.messages.length === 0 ? (
                        <div className="py-8 text-center text-sm text-slate-500">
                          No messages yet.
                        </div>
                      ) : (
                        selected.messages.map((item) => (
                          <article
                            key={item.id}
                            className={`max-w-[88%] rounded-2xl p-3 ${
                              item.is_admin
                                ? 'ml-auto bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                                : 'bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-white'
                            }`}
                          >
                            <div className="flex justify-between gap-3 text-xs opacity-70 mb-1">
                              <span>
                                {item.sender_name ||
                                  (item.is_admin
                                    ? 'Admin'
                                    : selected.user_name)}
                              </span>
                              <span>
                                {formatDate(item.created_at)}
                              </span>
                            </div>

                            <p className="text-sm whitespace-pre-wrap break-words">
                              {item.message}
                            </p>

                            {item.attachments &&
                              item.attachments.length > 0 && (
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-3">
                                  {item.attachments.map(
                                    (attachment, index) => (
                                      <a
                                        key={`${attachment.url}-${index}`}
                                        href={attachment.url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="block overflow-hidden rounded-lg"
                                      >
                                        <img
                                          src={attachment.url}
                                          alt={
                                            attachment.name ||
                                            'Support attachment'
                                          }
                                          loading="lazy"
                                          className="w-full aspect-square object-cover"
                                        />
                                      </a>
                                    ),
                                  )}
                                </div>
                              )}
                          </article>
                        ))
                      )}

                      {latestMessage && conversationRefreshing && (
                        <div className="text-center text-[11px] text-slate-400">
                          Syncing conversation…
                        </div>
                      )}
                    </div>

                    <div className="shrink-0 border-t border-slate-100 dark:border-slate-700 p-3 space-y-2">
                      {images.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {images.map((file, index) => (
                            <span
                              key={`${file.name}-${index}`}
                              className="text-xs rounded-lg bg-slate-100 dark:bg-slate-700 px-2 py-1 text-slate-600 dark:text-slate-200"
                            >
                              {file.name}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="flex gap-2 items-end">
                        <textarea
                          value={message}
                          onChange={(event) =>
                            setMessage(event.target.value)
                          }
                          disabled={sending}
                          rows={2}
                          placeholder="Reply to the customer..."
                          className="flex-1 resize-none rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2 text-sm outline-none dark:text-white"
                        />

                        <label className="shrink-0 cursor-pointer rounded-xl border border-slate-200 dark:border-slate-600 px-3 py-2 text-sm text-slate-600 dark:text-slate-200">
                          Attach
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            className="sr-only"
                            onChange={(event) =>
                              setImages(
                                Array.from(
                                  event.target.files || [],
                                ),
                              )
                            }
                          />
                        </label>

                        <button
                          type="button"
                          disabled={
                            sending ||
                            (!message.trim() &&
                              images.length === 0)
                          }
                          onClick={() => void sendMessage()}
                          className="shrink-0 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50 dark:bg-white dark:text-slate-900"
                        >
                          {sending ? 'Sending…' : 'Send'}
                        </button>
                      </div>

                      <p className="text-[10px] text-slate-400">
                        Replies from this composer are sent through
                        the admin support endpoint.
                      </p>
                    </div>
                  </>
                )}
              </section>
            </div>
          </div>
        </main>
      </div>

      <ToastComponent />
    </div>
  );
}

export default AdminSupport;
