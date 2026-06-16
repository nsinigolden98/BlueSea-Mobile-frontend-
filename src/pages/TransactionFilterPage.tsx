import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar, Toast } from '@/components/ui-custom';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { 
  ChevronLeft, ChevronDown, X, Copy, Check, Printer, Share2, 
  ArrowUpRight, ArrowDownLeft, FileText, Image as ImageIcon, User, Zap, ShieldCheck
} from 'lucide-react';
import { type Transaction } from '@/types';
import { cn } from '@/lib/utils';
import { TransactionsData } from '@/data';
import { parseTransactionInfo, type ParsedTransaction } from '@/utils/transactionParser';

type DateFilter = 'this_month' | 'last_month' | 'last_3_months' | 'last_6_months' | 'last_year' | 'custom' | 'all';

export const TransactionFilterPage: React.FC = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [transactions, setTransactions] = useState<ParsedTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTransaction, setSelectedTransaction] = useState<ParsedTransaction | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const { showToast, ToastComponent } = Toast();
  
  const [dateFilter, setDateFilter] = useState<DateFilter>('this_month');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        const rawTransactions: Transaction[] = await TransactionsData();
        const parsedData = rawTransactions.map(tx => ({
          ...tx,
          parsed: parseTransactionInfo(tx)
        }));
        setTransactions(parsedData);
      } catch (error) {
        console.error('Failed to fetch transactions:', error);
        showToast('Failed to load transactions');
      } finally {
        setLoading(false);
      }
    };
    fetchTransactions();
  }, [showToast]);

  const filteredTransactions = useMemo(() => {
    const start = new Date();
    const end = new Date();
    
    switch (dateFilter) {
      case 'this_month':
        start.setDate(1); start.setHours(0, 0, 0, 0);
        break;
      case 'last_month':
        start.setMonth(start.getMonth() - 1); start.setDate(1); start.setHours(0, 0, 0, 0);
        end.setDate(0); end.setHours(23, 59, 59, 999);
        break;
      case 'last_3_months':
        start.setMonth(start.getMonth() - 3); start.setHours(0, 0, 0, 0);
        break;
      case 'last_6_months':
        start.setMonth(start.getMonth() - 6); start.setHours(0, 0, 0, 0);
        break;
      case 'last_year':
        start.setFullYear(start.getFullYear() - 1); start.setHours(0, 0, 0, 0);
        break;
      case 'custom':
        if (customStartDate) start.setTime(new Date(customStartDate).getTime());
        if (customEndDate) {
          end.setTime(new Date(customEndDate).getTime());
          end.setHours(23, 59, 59, 999);
        }
        break;
      case 'all':
      default:
        start.setFullYear(2000); end.setFullYear(2100);
        break;
    }

    return transactions.filter(tx => {
      const txDate = new Date(tx.created_at);
      return txDate >= start && txDate <= end;
    });
  }, [transactions, dateFilter, customStartDate, customEndDate]);

  const totals = useMemo(() => {
    let credits = 0;
    let debits = 0;
    for (const tx of filteredTransactions) {
      if (tx.transaction_type === 'CREDIT') credits += Number(tx.amount);
      if (tx.transaction_type === 'DEBIT') debits += Number(tx.amount);
    }
    return { credits, debits };
  }, [filteredTransactions]);

  const copyToClipboard = useCallback((text: string, id: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    showToast('Copied to clipboard');
    setTimeout(() => setCopiedId(null), 2000);
  }, [showToast]);

  const formatDate = (dateString: string) => new Intl.DateTimeFormat('en-NG', { 
    dateStyle: 'medium', timeStyle: 'short' 
  }).format(new Date(dateString));

  const executeShare = (type: 'PDF' | 'IMAGE') => {
    if (!selectedTransaction) return;
    showToast(`Preparing receipt sharing as ${type}...`);
    if (navigator.share) {
      navigator.share({
        title: `BlueSea Mobile Receipt`,
        text: `Transaction Receipt (${type})\nAmount: ₦${selectedTransaction.amount.toLocaleString()}\nRef: ${selectedTransaction.reference || selectedTransaction.id}`,
      }).catch(err => console.log('Share canceled', err));
    }
    setShareModalOpen(false);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B1120] flex font-sans">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="flex-1 flex flex-col min-w-0">
        {/* PREMIUM HEADER */}
        <header className="sticky top-0 z-30 bg-white/80 dark:bg-[#0B1120]/80 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-800/50 px-4 py-5 flex items-center gap-4 transition-colors">
          <button 
            onClick={() => navigate(-1)} 
            className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800/50 text-slate-600 dark:text-slate-400 transition-all"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Transaction History</h1>
            <p className="text-xs text-blue-600 dark:text-blue-400 font-semibold uppercase tracking-wider mt-0.5">
              BlueSea Financial Data
            </p>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6 overflow-y-auto w-full max-w-5xl mx-auto space-y-6">
          
          {/* CONTROL CENTER */}
          <div className="bg-white dark:bg-slate-900/50 rounded-3xl p-5 border border-slate-200/50 dark:border-slate-800 shadow-sm dark:shadow-none">
            <div className="flex flex-col md:flex-row gap-4 items-end">
              <div className="w-full md:flex-1">
                <Label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 block">
                  Timeframe
                </Label>
                <div className="relative">
                  <select
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value as DateFilter)}
                    className="w-full pl-4 pr-10 py-3.5 bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 rounded-2xl appearance-none cursor-pointer text-sm font-medium focus:ring-2 focus:ring-blue-500/20 dark:text-slate-200 transition-all"
                  >
                    <option value="this_month">This Month</option>
                    <option value="last_month">Last Month</option>
                    <option value="last_3_months">Last 3 Months</option>
                    <option value="last_6_months">Last 6 Months</option>
                    <option value="last_year">Last Year</option>
                    <option value="custom">Custom Range</option>
                    <option value="all">All Time</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
              </div>

              {dateFilter === 'custom' && (
                <div className="w-full md:flex-1 flex gap-3">
                  <div className="flex-1">
                    <Label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 block">Start</Label>
                    <Input type="date" value={customStartDate} onChange={(e) => setCustomStartDate(e.target.value)} className="bg-slate-50 dark:bg-[#0B1120] rounded-2xl py-3.5 border-slate-200 dark:border-slate-800" />
                  </div>
                  <div className="flex-1">
                    <Label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 block">End</Label>
                    <Input type="date" value={customEndDate} onChange={(e) => setCustomEndDate(e.target.value)} className="bg-slate-50 dark:bg-[#0B1120] rounded-2xl py-3.5 border-slate-200 dark:border-slate-800" />
                  </div>
                </div>
              )}
            </div>

            {/* FINANCIAL SUMMARY PELLETS */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-5 pt-5 border-t border-slate-100 dark:border-slate-800/50">
              <div className="p-4 bg-slate-50 dark:bg-slate-800/30 rounded-2xl flex flex-col justify-center hidden md:flex">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Volume</span>
                <span className="text-xl font-bold text-slate-900 dark:text-white mt-1">{filteredTransactions.length} <span className="text-sm font-medium text-slate-400">Txns</span></span>
              </div>
              <div className="p-4 bg-emerald-50 dark:bg-emerald-500/5 rounded-2xl border border-emerald-100 dark:border-emerald-500/10">
                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1"><ArrowDownLeft className="w-3 h-3"/> Inflow</span>
                <span className="text-lg md:text-xl font-bold text-emerald-700 dark:text-emerald-400 mt-1">₦{totals.credits.toLocaleString()}</span>
              </div>
              <div className="p-4 bg-rose-50 dark:bg-rose-500/5 rounded-2xl border border-rose-100 dark:border-rose-500/10">
                <span className="text-xs font-semibold text-rose-600 dark:text-rose-400 uppercase tracking-wider flex items-center gap-1"><ArrowUpRight className="w-3 h-3"/> Outflow</span>
                <span className="text-lg md:text-xl font-bold text-rose-700 dark:text-rose-400 mt-1">₦{totals.debits.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* SMART TRANSACTION LIST */}
          <div className="space-y-3">
            {loading ? (
               <div className="p-10 text-center text-slate-400 animate-pulse font-medium">Loading ledger...</div>
            ) : filteredTransactions.length === 0 ? (
               <div className="p-12 text-center bg-white dark:bg-slate-900/30 rounded-3xl border border-slate-200/50 dark:border-slate-800 border-dashed">
                 <p className="text-slate-500 dark:text-slate-400 font-medium">No transactions found for this period.</p>
               </div>
            ) : (
              <div className="bg-white dark:bg-slate-900/30 rounded-3xl border border-slate-200/50 dark:border-slate-800 overflow-hidden shadow-sm dark:shadow-none divide-y divide-slate-100 dark:divide-slate-800/50">
                {filteredTransactions.map((tx) => {
                  const isElectricity = tx.parsed.category === 'ELECTRICITY';
                  const Icon = isElectricity ? Zap : tx.parsed.icon;
                  const isCredit = tx.transaction_type === 'CREDIT';
                  
                  return (
                    <div
                      key={tx.id}
                      onClick={() => setSelectedTransaction(tx)}
                      className="group flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer transition-all active:scale-[0.99]"
                    >
                      <div className="flex items-center gap-4 overflow-hidden min-w-0">
                        {/* Anti-pixelation layout structure protection wrapper */}
                        <div className={cn(
                          "w-12 h-12 shrink-0 aspect-square rounded-full flex items-center justify-center transition-colors transform-gpu",
                          isCredit ? "bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" 
                                   : isElectricity ? "bg-amber-500/10 text-amber-500 dark:text-amber-400"
                                                   : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 group-hover:bg-blue-50 dark:group-hover:bg-blue-500/10 group-hover:text-blue-600 dark:group-hover:text-blue-400"
                        )}>
                          <Icon className={cn("w-5 h-5 shrink-0 aspect-square object-contain", isElectricity && "fill-current")} strokeWidth={2.5} />
                        </div>

                        <div className="flex flex-col truncate min-w-0">
                          <span className="font-semibold text-slate-900 dark:text-slate-100 truncate text-sm md:text-base tracking-tight">
                            {tx.parsed.title}
                          </span>
                          <span className="text-xs md:text-sm text-slate-500 dark:text-slate-400 truncate mt-0.5">
                            {tx.receiver_name || tx.sender_name || tx.parsed.recipientNumber || tx.parsed.recipientName || (tx.parsed.category === 'UNKNOWN' ? tx.description : tx.parsed.category.replace('_', ' '))}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col items-end shrink-0 ml-4">
                        <span className={cn(
                          "font-bold text-sm md:text-base tracking-tight",
                          isCredit ? "text-emerald-600 dark:text-emerald-400" : "text-slate-900 dark:text-white"
                        )}>
                          {isCredit ? '+' : '-'}₦{Number(tx.amount).toLocaleString()}
                        </span>
                        <span className="text-[10px] md:text-xs text-slate-400 dark:text-slate-500 font-medium mt-0.5">
                          {new Date(tx.created_at).toLocaleDateString('en-NG', { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* RECEIPT MODAL */}
      {selectedTransaction && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center sm:p-4 print:hidden">
          <div className="absolute inset-0 bg-slate-900/60 dark:bg-[#050810]/80 backdrop-blur-sm transition-opacity" onClick={() => setSelectedTransaction(null)} />
          
          <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-t-[2rem] md:rounded-[2rem] shadow-2xl dark:shadow-blue-900/5 max-h-[90vh] overflow-hidden flex flex-col animate-in slide-in-from-bottom-10 md:zoom-in-95 duration-200 border border-slate-200/50 dark:border-slate-800">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/50">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center shadow-inner transition-all shrink-0 aspect-square",
                  selectedTransaction.parsed.category === 'ELECTRICITY' ? "bg-amber-500 text-white animate-pulse" : "bg-blue-600 text-white"
                )}>
                  {selectedTransaction.parsed.category === 'ELECTRICITY' ? (
                    <Zap className="w-5 h-5 fill-current" />
                  ) : (
                    <selectedTransaction.parsed.icon className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white">Transaction Receipt</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">BlueSea Mobile Platform</p>
                </div>
              </div>
              <button onClick={() => setSelectedTransaction(null)} className="p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-full transition-colors">
                <X className="w-5 h-5 text-slate-500 dark:text-slate-300" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto relative" id="printable-receipt">
              
              {/* Massive Amount Display */}
              <div className="text-center pb-6">
                <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-2">Total Cost</span>
                <div className={cn(
                  "text-4xl md:text-5xl font-black tracking-tighter",
                  selectedTransaction.transaction_type === 'CREDIT' ? 'text-emerald-500' : 'text-slate-900 dark:text-white'
                )}>
                  {selectedTransaction.transaction_type === 'CREDIT' ? '+' : '-'}₦{Number(selectedTransaction.amount).toLocaleString()}
                </div>
                
                <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <div className={cn("w-2 h-2 rounded-full", selectedTransaction.status?.toLowerCase() === 'successful' || selectedTransaction.status?.toLowerCase() === 'completed' ? "bg-emerald-500" : "bg-amber-500")} />
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 capitalize">{selectedTransaction.status || 'Completed'}</span>
                </div>
              </div>

              {/* INTEGRATED IDENTITY BANNER */}
              {(selectedTransaction.receiver_name || selectedTransaction.sender_name) && (
                <div className="mb-6 p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl flex items-center gap-3 border border-slate-100 dark:border-slate-800/60">
                  <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black text-sm shrink-0 aspect-square">
                    <User className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">Party Detail</p>
                    <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                      {selectedTransaction.transaction_type === 'DEBIT' 
                        ? `To: ${selectedTransaction.receiver_name || 'BlueSea User'}`
                        : `From: ${selectedTransaction.sender_name || 'BlueSea User'}`
                      }
                    </p>
                  </div>
                  <ShieldCheck className="w-4 h-4 text-emerald-500 ml-auto shrink-0" />
                </div>
              )}

  {/* DEDICATED ELECTRICITY METER CONFIGURATIONS */}
              {selectedTransaction.parsed.category === 'ELECTRICITY' && (
                <div className="mb-6 space-y-6 bg-slate-50/50 dark:bg-slate-800/20 border border-slate-100 dark:border-slate-800 p-5 rounded-2xl relative overflow-hidden">
                  
                  {/* Luxury Background Ambient Zap Watermark Accent */}
                  <Zap className="absolute -right-6 -bottom-6 w-32 h-32 text-amber-500/[0.04] dark:text-amber-400/[0.03] pointer-events-none transform rotate-12 shrink-0 aspect-square" />

                  <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800 relative z-10">
                    <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase">Meter Mode Variant</span>
                    <span className={cn(
                      "px-2.5 py-1 rounded-full text-[10px] font-black tracking-widest",
                      selectedTransaction.parsed.token ? "bg-sky-500/10 text-sky-500" : "bg-amber-500/10 text-amber-500"
                    )}>
                      {selectedTransaction.parsed.token ? 'PREPAID' : 'POSTPAID'}
                    </span>
                  </div>

                  {selectedTransaction.parsed.token && (
                    <div className="p-4 bg-sky-500/5 dark:bg-sky-500/10 border border-sky-500/20 rounded-xl space-y-1 relative z-10">
                      <Label className="text-[10px] font-bold text-sky-600 dark:text-sky-400 uppercase tracking-widest block">Token Number</Label>
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-lg font-mono font-black text-slate-900 dark:text-sky-100 tracking-wider">
                          {selectedTransaction.parsed.token.match(/.{1,4}/g)?.join('-') || selectedTransaction.parsed.token}
                        </p>
                        <button 
                          onClick={() => copyToClipboard(selectedTransaction.parsed.token!, 'token')}
                          className="p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sky-500 shrink-0"
                        >
                          {copiedId === 'token' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-xs pt-1 relative z-10">
                    <div>
                      <span className="text-slate-400 block mb-0.5">Customer Name</span>
                      <span className="font-bold text-slate-900 dark:text-slate-200">NSINI EFIONG AKPAN</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block mb-0.5">Customer Address</span>
                      <span className="font-bold text-slate-900 dark:text-slate-200 line-clamp-1">1 GOLDEN CLS OPP SHELL MKT ()</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block mb-0.5">Token Units</span>
                      <span className="font-bold text-slate-900 dark:text-slate-200">0.8 kWh</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block mb-0.5">Tariff / Rate</span>
                      <span className="font-bold text-slate-900 dark:text-slate-200 truncate block">209.5,SDUTY:NO N/kWh</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block mb-0.5">VAT Charged</span>
                      <span className="font-bold text-slate-900 dark:text-slate-200">₦13.95</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block mb-0.5">Commission Paid</span>
                      <span className="font-bold text-slate-900 dark:text-slate-200">₦2.20</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Two Column Grid Architecture */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 relative z-10">
                {/* Column 1: Core Details */}
                <div className="space-y-5">
                  <div>
                    <Label className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-1">Service Type</Label>
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-200">{selectedTransaction.parsed.title}</p>
                  </div>
                  
                  <div>
                    <Label className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-1">Date & Time</Label>
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-200">{formatDate(selectedTransaction.created_at)}</p>
                  </div>

                  <div>
                    <Label className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-1">Full Description</Label>
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400 leading-relaxed bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                      {selectedTransaction.description}
                    </p>
                  </div>
                </div>

                {/* Column 2: Extracted Metadata & References */}
                <div className="space-y-5">
                  {selectedTransaction.parsed.recipientNumber && (
                     <div>
                       <Label className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-1">Target Phone</Label>
                       <p className="text-sm font-semibold text-slate-900 dark:text-slate-200 font-mono">{selectedTransaction.parsed.recipientNumber}</p>
                     </div>
                  )}

                  {selectedTransaction.parsed.meterNumber && (
                     <div>
                       <Label className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-1">Meter Number</Label>
                       <p className="text-sm font-semibold text-slate-900 dark:text-slate-200 font-mono">{selectedTransaction.parsed.meterNumber}</p>
                     </div>
                  )}

                  <div className="pt-4 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-slate-800">
                    <Label className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-1">Transaction Ref</Label>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-slate-900 dark:text-slate-200 font-mono truncate">
                        {selectedTransaction.reference || selectedTransaction.id}
                      </p>
                      <button onClick={() => copyToClipboard(selectedTransaction.reference || String(selectedTransaction.id), 'ref')} className="p-1.5 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 bg-slate-50 dark:bg-slate-800 rounded-lg shrink-0">
                        {copiedId === 'ref' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-1">System ID</Label>
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-500 font-mono">{selectedTransaction.id}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Footer */}
            <div className="p-4 md:p-6 bg-slate-50 dark:bg-slate-900/80 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-3">
              <Button 
                variant="outline" 
                onClick={() => setShareModalOpen(true)}
                className="w-full py-6 rounded-2xl border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold"
              >
                <Share2 className="w-4 h-4 mr-2" /> Share Receipt
              </Button>
              <Button 
                onClick={handlePrint}
                className="w-full py-6 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-lg shadow-blue-500/20"
              >
                <Printer className="w-4 h-4 mr-2" /> Print Receipt
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* SHARE FORMAT ACTION SHEET MODAL */}
      {shareModalOpen && selectedTransaction && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center backdrop-blur-md bg-slate-950/40 p-4">
          <div className="absolute inset-0" onClick={() => setShareModalOpen(false)} />
          <div className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-[2rem] p-6 border border-slate-200 dark:border-slate-800 shadow-2xl animate-in slide-in-from-bottom-5 duration-200">
            <div className="flex justify-between items-center mb-5">
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white tracking-tight">Share Receipt</h3>
                <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mt-0.5">Select Document Format</p>
              </div>
              <button onClick={() => setShareModalOpen(false)} className="p-1.5 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-400">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => executeShare('PDF')}
                className="flex flex-col items-center justify-center p-4 bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 rounded-2xl gap-2 hover:border-blue-500/30 transition-all active:scale-95 group"
              >
                <div className="p-3 bg-rose-500/10 text-rose-500 rounded-xl group-hover:bg-rose-500 group-hover:text-white transition-all">
                  <FileText className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Share PDF</span>
              </button>

              <button 
                onClick={() => executeShare('IMAGE')}
                className="flex flex-col items-center justify-center p-4 bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 rounded-2xl gap-2 hover:border-blue-500/30 transition-all active:scale-95 group"
              >
                <div className="p-3 bg-sky-500/10 text-sky-500 rounded-xl group-hover:bg-sky-500 group-hover:text-white transition-all">
                  <ImageIcon className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Share Image</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Global Print Layouts Injection */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #printable-receipt, #printable-receipt * { visibility: visible; }
          #printable-receipt { position: absolute; left: 0; top: 0; width: 100%; padding: 20px; }
        }
      `}</style>

      <ToastComponent />
    </div>
  );
};