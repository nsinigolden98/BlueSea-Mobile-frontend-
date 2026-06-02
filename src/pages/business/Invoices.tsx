import { useState } from 'react';
import { Header, Toast } from '@/components/ui-custom';
import { useBlueSeaEngine } from '@/context/BlueSeaEngine';
import { Receipt, Plus, X, FileText, CheckCircle2, Clock, AlertCircle, Send, Download, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

// Declared internal structural interfaces to replace loose schemas
export type InvoiceStatus = 'draft' | 'sent' | 'viewed' | 'paid' | 'overdue' | 'cancelled';

export interface InvoiceLineItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

export interface Invoice {
  id: string;
  clientName: string;
  clientEmail: string;
  lineItems: InvoiceLineItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  status: InvoiceStatus;
  dueDate: string;
  template: string;
  notes: string;
  paidAt?: string;
}

const STATUS_CONFIG: Record<InvoiceStatus, { label: string; color: string; bg: string; icon: any }> = {
  draft: { label: 'Draft', color: 'text-slate-500', bg: 'bg-slate-500/10', icon: FileText },
  sent: { label: 'Sent', color: 'text-sky-500', bg: 'bg-sky-500/10', icon: Send },
  viewed: { label: 'Viewed', color: 'text-violet-500', bg: 'bg-violet-500/10', icon: Clock },
  paid: { label: 'Paid', color: 'text-emerald-500', bg: 'bg-emerald-500/10', icon: CheckCircle2 },
  overdue: { label: 'Overdue', color: 'text-red-500', bg: 'bg-red-500/10', icon: AlertCircle },
  cancelled: { label: 'Cancelled', color: 'text-slate-400', bg: 'bg-slate-400/10', icon: X },
};

export function Invoices() {
  const { invoices, addInvoice, updateInvoice } = useBlueSeaEngine();
  const { ToastComponent, showToast } = Toast();
  const [showCreate, setShowCreate] = useState(false);
  const [filter, setFilter] = useState<InvoiceStatus | 'all'>('all');
  const [form, setForm] = useState({ clientName: '', clientEmail: '', description: '', amount: '', dueDate: '' });

  // Async wrapper prepared for backend database syncs
  const handleCreate = async () => {
    if (!form.clientName || !form.amount) { 
      showToast('Please fill all required fields', 3000); 
      return; 
    }
    
    try {
      const subtotal = Number(form.amount);
      const tax = subtotal * 0.075;
      
      const payload = {
        clientName: form.clientName,
        clientEmail: form.clientEmail,
        lineItems: [{ id: `li-${Date.now()}`, description: form.description || 'Service', quantity: 1, rate: subtotal, amount: subtotal }],
        subtotal,
        tax,
        discount: 0,
        total: subtotal + tax,
        status: 'draft' as InvoiceStatus,
        dueDate: form.dueDate || new Date(Date.now() + 14 * 86400000).toISOString(),
        template: 'default',
        notes: '',
      };

      // BACKEND INTEGRATION POINT:
      // const response = await fetch('/api/v1/invoices', { method: 'POST', body: JSON.stringify(payload) });
      
      addInvoice(payload);
      showToast('Invoice created successfully!');
      setShowCreate(false);
      setForm({ clientName: '', clientEmail: '', description: '', amount: '', dueDate: '' });
    } catch (err) {
      showToast('Error parsing pipeline submission parameters', 3000);
    }
  };

  const handleSend = async (id: string) => {
    try {
      // BACKEND INTEGRATION POINT: await fetch(`/api/v1/invoices/${id}/dispatch`, { method: 'POST' });
      updateInvoice(id, { status: 'sent' });
      showToast('Invoice sent to client!');
    } catch (err) {
      showToast('Dispatch sequence error', 3000);
    }
  };

  const handleMarkPaid = async (id: string) => {
    try {
      // BACKEND INTEGRATION POINT: await fetch(`/api/v1/invoices/${id}/settle`, { method: 'PATCH' });
      updateInvoice(id, { status: 'paid', paidAt: new Date().toISOString() });
      showToast('Invoice marked as paid!');
    } catch (err) {
      showToast('Failed to update payment registry', 3000);
    }
  };

  // New action handler using the requested Download icon
  const handleDownloadPDF = async (invoice: Invoice) => {
    try {
      showToast(`Generating document for ${invoice.clientName}...`);
      // BACKEND INTEGRATION POINT: Window redirect or file stream fetch download implementation
      // window.open(`/api/v1/invoices/${invoice.id}/pdf-stream`, '_blank');
    } catch (err) {
      showToast('Failed to download invoice statement', 3000);
    }
  };

  const filtered = filter === 'all' ? invoices : invoices.filter((i: Invoice) => i.status === filter);
  const totalRevenue = invoices.filter((i: Invoice) => i.status === 'paid').reduce((s: number, i: Invoice) => s + i.total, 0);
  const outstanding = invoices.filter((i: Invoice) => i.status === 'sent' || i.status === 'viewed').reduce((s: number, i: Invoice) => s + i.total, 0);

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 flex flex-col">
      <Header title="Invoices" subtitle="Create and manage invoices" showBackButton />
      <main className="flex-1 p-4 md:p-6 overflow-y-auto scrollbar-hide">
        <div className="max-w-4xl mx-auto space-y-6">
          
          {/* Summary Cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-4">
              <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider">Revenue</p>
              <p className="text-xl font-black text-slate-800 dark:text-white mt-1">₦{totalRevenue.toLocaleString()}</p>
            </div>
            <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-4">
              <p className="text-[10px] font-bold text-amber-500 uppercase tracking-wider">Outstanding</p>
              <p className="text-xl font-black text-slate-800 dark:text-white mt-1">₦{outstanding.toLocaleString()}</p>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            {(['all', 'draft', 'sent', 'paid', 'overdue'] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${filter === f ? 'bg-sky-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                {f.charAt(0).toUpperCase() + f.slice(1)} {f !== 'all' && `(${invoices.filter((i: Invoice) => i.status === f).length})`}
              </button>
            ))}
          </div>

          {/* Invoice List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-[11px] font-bold uppercase tracking-[0.15em] text-slate-400 dark:text-slate-500">Invoices</h3>
              <button onClick={() => setShowCreate(true)} className="flex items-center gap-1 px-3 py-1.5 bg-sky-500/10 text-sky-500 rounded-lg text-[10px] font-bold hover:bg-sky-500 hover:text-white transition-all">
                <Plus className="w-3 h-3" /> New
              </button>
            </div>

            {filtered.length === 0 ? (
              <div className="text-center py-12 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-dashed border-slate-200 dark:border-white/5">
                <Receipt className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p className="text-sm text-slate-400 font-bold">No invoices discovered</p>
              </div>
            ) : (
              filtered.map((inv: Invoice) => {
                const cfg = STATUS_CONFIG[inv.status] || STATUS_CONFIG['draft'];
                return (
                  <div key={inv.id} className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-2xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 ${cfg.bg} rounded-xl flex items-center justify-center`}>
                          <cfg.icon className={`w-5 h-5 ${cfg.color}`} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-800 dark:text-white">{inv.clientName}</p>
                          <p className="text-[10px] text-slate-400">Due: {new Date(inv.dueDate).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="text-right flex flex-col items-end gap-1">
                        <p className="text-sm font-black text-slate-800 dark:text-white">₦{inv.total.toLocaleString()}</p>
                        <span className={`text-[9px] font-bold ${cfg.color} ${cfg.bg} px-2 py-0.5 rounded`}>{cfg.label}</span>
                      </div>
                    </div>
                    
                    {/* Actions Panel offering functional button support alongside Download */}
                    <div className="flex gap-2 mt-2">
                      {inv.status === 'draft' && (
                        <>
                          <button onClick={() => handleSend(inv.id)} className="flex-1 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-xl text-[10px] font-bold transition-all active:scale-95">Send Invoice</button>
                          <button onClick={() => { updateInvoice(inv.id, { status: 'cancelled' }); showToast('Invoice cancelled'); }} className="px-3 py-2 bg-rose-500/10 text-rose-500 rounded-xl text-[10px] font-bold transition-all hover:bg-rose-500 hover:text-white">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                      {inv.status === 'sent' && (
                        <button onClick={() => handleMarkPaid(inv.id)} className="flex-1 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-[10px] font-bold transition-all active:scale-95">Mark as Paid</button>
                      )}
                      
                      {/* Integrated Download handler element built with local primitive Button style sheets */}
                      <Button 
                        variant="outline" 
                        size="icon" 
                        onClick={() => handleDownloadPDF(inv)}
                        className="h-8 w-9 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-none hover:text-sky-500 shrink-0"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </main>

      {/* Create Invoice Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 backdrop-blur-xl bg-slate-950/40">
          <div className="absolute inset-0" onClick={() => setShowCreate(false)} />
          <div className="relative bg-white dark:bg-slate-900 sm:rounded-[2rem] rounded-t-[2rem] p-6 w-full max-w-lg shadow-2xl border-t sm:border border-slate-200 dark:border-white/10">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-black text-slate-900 dark:text-white">Create Invoice</h3>
              <button onClick={() => setShowCreate(false)} className="p-2 hover:bg-slate-100 rounded-xl"><X className="w-4 h-4" /></button>
            </div>
            <div className="space-y-4">
              <Input value={form.clientName} onChange={e => setForm({ ...form, clientName: e.target.value })} placeholder="Client Name *" className="bg-slate-50 dark:bg-slate-800 rounded-2xl h-12" />
              <Input value={form.clientEmail} onChange={e => setForm({ ...form, clientEmail: e.target.value })} placeholder="Client Email" className="bg-slate-50 dark:bg-slate-800 rounded-2xl h-12" />
              <Input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Service Description" className="bg-slate-50 dark:bg-slate-800 rounded-2xl h-12" />
              <Input value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value.replace(/\D/g, '') })} placeholder="Amount (₦) *" className="bg-slate-50 dark:bg-slate-800 rounded-2xl h-12 font-black" />
              <Input type="date" value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })} className="bg-slate-50 dark:bg-slate-800 rounded-2xl h-12" />
              <Button onClick={handleCreate} disabled={!form.clientName || !form.amount} className="w-full bg-sky-500 hover:bg-sky-600 text-white h-14 rounded-2xl text-sm font-black shadow-xl disabled:opacity-50 active:scale-95">Create Invoice</Button>
            </div>
          </div>
        </div>
      )}
      
      {typeof ToastComponent === 'function' ? ToastComponent() : ToastComponent}
    </div>
  );
}
