import { useCallback, useEffect, useMemo, useState } from 'react';
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
const userTicketUrl = (id: number) => `${API_BASE}/support/${id}/`;

const statusOptions: TicketStatus[] = ['open', 'in_progress', 'resolved', 'closed'];
const priorityOptions: TicketPriority[] = ['low', 'medium', 'high', 'urgent'];

const authHeaders = () => {
  const token = Cookies.get('access_token') || Cookies.get('token') || '';
  return token ? { Authorization: token.startsWith('Bearer ') ? token : `Bearer ${token}` } : {};
};

const normalizeAttachment = (value: unknown): AdminAttachment | null => {
  if (typeof value === 'string') return { url: value };
  if (!value || typeof value !== 'object') return null;
  const item = value as Record<string, unknown>;
  const url = item.url ?? item.file ?? item.image ?? item.image_url;
  return typeof url === 'string' && url ? { url, name: typeof item.name === 'string' ? item.name : undefined } : null;
};

const normalizeMessage = (value: unknown, index: number): AdminMessage => {
  const item = (value && typeof value === 'object' ? value : {}) as Record<string, unknown>;
  const rawAttachments = Array.isArray(item.attachments) ? item.attachments : [];
  return {
    id: typeof item.id === 'number' ? item.id : index,
    sender_name: typeof item.sender_name === 'string' ? item.sender_name : undefined,
    message: typeof item.message === 'string' ? item.message : '',
    is_admin: item.is_admin === true,
    created_at: typeof item.created_at === 'string' ? item.created_at : '',
    attachments: rawAttachments.map(normalizeAttachment).filter((item): item is AdminAttachment => Boolean(item)),
  };
};

const normalizeTicket = (value: unknown): AdminSupportTicket | null => {
  if (!value || typeof value !== 'object') return null;
  const item = value as Record<string, unknown>;
  if (typeof item.id !== 'number' || typeof item.subject !== 'string') return null;
  const messages = Array.isArray(item.messages) ? item.messages.map(normalizeMessage) : [];
  return {
    id: item.id,
    subject: item.subject,
    description: typeof item.description === 'string' ? item.description : '',
    status: statusOptions.includes(item.status as TicketStatus) ? (item.status as TicketStatus) : 'open',
    priority: priorityOptions.includes(item.priority as TicketPriority) ? (item.priority as TicketPriority) : 'medium',
    created_at: typeof item.created_at === 'string' ? item.created_at : '',
    updated_at: typeof item.updated_at === 'string' ? item.updated_at : '',
    messages,
    user_name: typeof item.user_name === 'string' ? item.user_name : 'Customer',
    user_email: typeof item.user_email === 'string' ? item.user_email : '',
    message_count: typeof item.message_count === 'number' ? item.message_count : messages.length,
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
    }
  }
  return fallback;
};

const formatDate = (value: string) => {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
};

export function AdminSupport() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [tickets, setTickets] = useState<AdminSupportTicket[]>([]);
  const [selected, setSelected] = useState<AdminSupportTicket | null>(null);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | TicketStatus>('all');
  const [priorityFilter, setPriorityFilter] = useState<'all' | TicketPriority>('all');
  const [message, setMessage] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [sending, setSending] = useState(false);
  const [updating, setUpdating] = useState<'status' | 'priority' | null>(null);
  const { showToast, ToastComponent } = Toast();

  const loadTickets = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(ADMIN_TICKETS_URL, { headers: authHeaders() });
      const raw = Array.isArray(response.data) ? response.data : response.data?.tickets;
      const next = Array.isArray(raw) ? raw.map(normalizeTicket).filter((ticket): ticket is AdminSupportTicket => Boolean(ticket)) : [];
      setTickets(next);
    } catch (error) {
      showToast(errorText(error, 'Failed to load support tickets.'));
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => { void loadTickets(); }, [loadTickets]);

  const filteredTickets = useMemo(() => {
    const q = search.trim().toLowerCase();
    return tickets.filter((ticket) => {
      const matchesSearch = !q || [ticket.subject, ticket.description, ticket.user_name, ticket.user_email]
        .some((value) => value.toLowerCase().includes(q));
      return matchesSearch && (statusFilter === 'all' || ticket.status === statusFilter) && (priorityFilter === 'all' || ticket.priority === priorityFilter);
    });
  }, [tickets, search, statusFilter, priorityFilter]);

  const openTicket = async (ticket: AdminSupportTicket) => {
    setSelected(ticket);
    setDetailLoading(true);
    try {
      const response = await axios.get(adminTicketUrl(ticket.id), { headers: authHeaders() });
      const detail = normalizeTicket(response.data);
      if (detail) {
        setSelected(detail);
        setTickets((current) => current.map((item) => item.id === detail.id ? detail : item));
      }
    } catch (error) {
      showToast(errorText(error, 'Failed to load ticket conversation.'));
    } finally {
      setDetailLoading(false);
    }
  };

  const updateTicket = async (field: 'status' | 'priority', value: TicketStatus | TicketPriority) => {
    if (!selected) return;
    setUpdating(field);
    try {
      const payload = { [field]: value };
      const response = await axios.patch(adminTicketUrl(selected.id), payload, { headers: { ...authHeaders(), 'Content-Type': 'application/json' } });
      const nextStatus = field === 'status' ? response.data?.status : selected.status;
      const nextPriority = field === 'priority' ? response.data?.priority : selected.priority;
      const next = { ...selected, status: nextStatus || selected.status, priority: nextPriority || selected.priority };
      setSelected(next);
      setTickets((current) => current.map((item) => item.id === next.id ? next : item));
      showToast(`${field === 'status' ? 'Status' : 'Priority'} updated`);
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
      if (message.trim()) formData.append('message', message.trim());
      images.forEach((file) => formData.append('images', file));
      const response = await axios.post(userTicketUrl(selected.id), formData, { headers: authHeaders() });
      const created = normalizeMessage(response.data?.message ?? response.data, selected.messages.length);
      const next = { ...selected, messages: [...selected.messages, created], message_count: selected.message_count + 1, updated_at: created.created_at || new Date().toISOString() };
      setSelected(next);
      setTickets((current) => current.map((item) => item.id === next.id ? next : item));
      setMessage('');
      setImages([]);
      showToast('Message sent');
    } catch (error) {
      showToast(errorText(error, 'Failed to send message.'));
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="h-screen bg-slate-50 dark:bg-slate-900 flex overflow-hidden">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
        <div className="shrink-0 bg-slate-50 dark:bg-slate-900">
          <Header title="Support Admin" subtitle="Manage customer support conversations" onMenuClick={() => setSidebarOpen(true)} />
        </div>
        <main className="flex-1 min-h-0 p-3 sm:p-4 md:p-6 overflow-hidden">
          <div className="h-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-4 min-h-0">
            <section className={`${selected ? 'hidden lg:flex' : 'flex'} lg:col-span-5 min-h-0 flex-col rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 overflow-hidden`}>
              <div className="p-4 border-b border-slate-100 dark:border-slate-700 space-y-3">
                <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search tickets or customers" className="w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 px-3 py-2.5 text-sm outline-none focus:border-slate-400 dark:text-white" />
                <div className="grid grid-cols-2 gap-2">
                  <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as 'all' | TicketStatus)} className="rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2 text-sm dark:text-white"><option value="all">All statuses</option>{statusOptions.map((value) => <option key={value} value={value}>{value.replace('_', ' ')}</option>)}</select>
                  <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value as 'all' | TicketPriority)} className="rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2 text-sm dark:text-white"><option value="all">All priorities</option>{priorityOptions.map((value) => <option key={value} value={value}>{value}</option>)}</select>
                </div>
              </div>
              <div className="flex-1 min-h-0 overflow-y-auto">
                {loading ? <div className="p-4 space-y-3">{[1,2,3,4].map((item) => <div key={item} className="h-20 rounded-xl bg-slate-100 dark:bg-slate-700 animate-pulse" />)}</div> : filteredTickets.length === 0 ? <div className="p-8 text-center text-sm text-slate-500">No support tickets found.</div> : filteredTickets.map((ticket) => (
                  <button key={ticket.id} type="button" onClick={() => void openTicket(ticket)} className={`w-full text-left p-4 border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 ${selected?.id === ticket.id ? 'bg-slate-50 dark:bg-slate-700/60' : ''}`}>
                    <div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="font-semibold text-sm text-slate-900 dark:text-white truncate">{ticket.subject}</p><p className="text-xs text-slate-500 mt-1 truncate">{ticket.user_name} · {ticket.user_email}</p></div><span className="shrink-0 text-[11px] rounded-full px-2 py-1 bg-slate-100 dark:bg-slate-600 text-slate-600 dark:text-slate-200">{ticket.status.replace('_', ' ')}</span></div>
                    <div className="mt-2 flex justify-between text-[11px] text-slate-400"><span>{ticket.priority}</span><span>{formatDate(ticket.updated_at)}</span></div>
                  </button>
                ))}
              </div>
            </section>

            <section className={`${selected ? 'flex' : 'hidden lg:flex'} lg:col-span-7 min-h-0 flex-col rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 overflow-hidden`}>
              {!selected ? <div className="m-auto text-center p-8"><p className="font-semibold text-slate-800 dark:text-white">Select a support ticket</p><p className="text-sm text-slate-500 mt-1">Choose a conversation from the inbox to view and respond.</p></div> : <>
                <div className="p-4 border-b border-slate-100 dark:border-slate-700">
                  <button type="button" onClick={() => setSelected(null)} className="lg:hidden mb-3 text-sm font-medium text-slate-600 dark:text-slate-300">← Back to tickets</button>
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div className="min-w-0"><h2 className="text-lg font-bold text-slate-900 dark:text-white break-words">{selected.subject}</h2><p className="text-sm text-slate-500 mt-1">{selected.user_name} · {selected.user_email}</p><p className="text-xs text-slate-400 mt-1">Ticket #{selected.id} · {formatDate(selected.created_at)}</p></div>
                    <div className="grid grid-cols-2 gap-2 shrink-0"><select disabled={updating === 'status'} value={selected.status} onChange={(e) => void updateTicket('status', e.target.value as TicketStatus)} className="rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 px-2 py-2 text-xs capitalize dark:text-white">{statusOptions.map((value) => <option key={value} value={value}>{value.replace('_', ' ')}</option>)}</select><select disabled={updating === 'priority'} value={selected.priority} onChange={(e) => void updateTicket('priority', e.target.value as TicketPriority)} className="rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 px-2 py-2 text-xs capitalize dark:text-white">{priorityOptions.map((value) => <option key={value} value={value}>{value}</option>)}</select></div>
                  </div>
                </div>
                <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4">
                  <div className="rounded-xl bg-slate-50 dark:bg-slate-900/60 p-4"><p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-2">Original request</p><p className="text-sm whitespace-pre-wrap text-slate-700 dark:text-slate-200">{selected.description}</p></div>
                  {detailLoading ? <div className="space-y-3">{[1,2,3].map((item) => <div key={item} className="h-20 rounded-xl bg-slate-100 dark:bg-slate-700 animate-pulse" />)}</div> : selected.messages.map((item) => <article key={item.id} className={`max-w-[88%] rounded-2xl p-3 ${item.is_admin ? 'ml-auto bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900' : 'bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-white'}`}><div className="flex justify-between gap-3 text-xs opacity-70 mb-1"><span>{item.sender_name || (item.is_admin ? 'Admin' : selected.user_name)}</span><span>{formatDate(item.created_at)}</span></div><p className="text-sm whitespace-pre-wrap break-words">{item.message}</p>{item.attachments && item.attachments.length > 0 && <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-3">{item.attachments.map((attachment, index) => <a key={`${attachment.url}-${index}`} href={attachment.url} target="_blank" rel="noreferrer" className="block overflow-hidden rounded-lg"><img src={attachment.url} alt={attachment.name || 'Support attachment'} loading="lazy" className="w-full aspect-square object-cover" /></a>)}</div>}</article>)}
                </div>
                <div className="shrink-0 border-t border-slate-100 dark:border-slate-700 p-3 space-y-2">
                  {images.length > 0 && <div className="flex flex-wrap gap-2">{images.map((file, index) => <span key={`${file.name}-${index}`} className="text-xs rounded-lg bg-slate-100 dark:bg-slate-700 px-2 py-1 text-slate-600 dark:text-slate-200">{file.name}</span>)}</div>}
                  <div className="flex gap-2 items-end"><textarea value={message} onChange={(e) => setMessage(e.target.value)} disabled={sending} rows={2} placeholder="Reply to the customer..." className="flex-1 resize-none rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2 text-sm outline-none dark:text-white" /><label className="shrink-0 cursor-pointer rounded-xl border border-slate-200 dark:border-slate-600 px-3 py-2 text-sm text-slate-600 dark:text-slate-200">Attach<input type="file" accept="image/*" multiple className="sr-only" onChange={(e) => setImages(Array.from(e.target.files || []))} /></label><button type="button" disabled={sending || (!message.trim() && images.length === 0)} onClick={() => void sendMessage()} className="shrink-0 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50 dark:bg-white dark:text-slate-900">{sending ? 'Sending…' : 'Send'}</button></div>
                </div>
              </>}
            </section>
          </div>
        </main>
      </div>
      <ToastComponent />
    </div>
  );
}

export default AdminSupport;
