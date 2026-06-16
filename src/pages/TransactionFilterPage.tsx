import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar, Toast } from '@/components/ui-custom';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { 
  ChevronLeft, ChevronDown, X, Copy, Check, Printer, Share2, 
  DownloadCloud, ArrowUpRight, ArrowDownLeft 
} from 'lucide-react';
import { type Transaction } from '@/types';
import { cn } from '@/lib/utils';
import { TransactionsData } from '@/data';
import { parseTransactionInfo, type ParsedTransaction } from '@/utils/transactionParser';

type DateFilter = 'this_month' | 'last_month' | 'last_3_months' | 'last_6_months' | 'last_year' | 'custom' | 'all';

export function TransactionFilterPage() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [transactions, setTransactions] = useState<ParsedTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTransaction, setSelectedTransaction] = useState<ParsedTransaction | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const { showToast, ToastComponent } = Toast();
  
  const [dateFilter, setDateFilter] = useState<DateFilter>('this_month');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        const rawTransactions = await TransactionsData();
        // Pass through intelligence layer
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

  const handleShare = async (tx: ParsedTransaction) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `BlueSea Mobile Receipt`,
          text: `Transaction Receipt\nAmount: ₦${tx.amount.toLocaleString()}\nRef: ${tx.reference || tx.id}\nDate: ${formatDate(tx.created_at)}`,
        });
      } catch (err) {
        console.error('Share failed', err);
      }
    } else {
      showToast('Sharing not supported on this device');
    }
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
                  const Icon = tx.parsed.icon;
                  const isCredit = tx.transaction_type === 'CREDIT';
                  
                  return (
                    <div
                      key={tx.id}
                      onClick={() => setSelectedTransaction(tx)}
                      className="group flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer transition-all active:scale-[0.99]"
                    >
                      <div className="flex items-center gap-4 overflow-hidden">
                        {/* Intelligent Icon Wrapper */}
                        <div className={cn(
                          "flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center transition-colors",
                          isCredit ? "bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" 
                                   : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 group-hover:bg-blue-50 dark:group-hover:bg-blue-500/10 group-hover:text-blue-600 dark:group-hover:text-blue-400"
                        )}>
                          <Icon className="w-5 h-5" strokeWidth={2.5} />
                        </div>

                        <div className="flex flex-col truncate">
                          <span className="font-semibold text-slate-900 dark:text-slate-100 truncate text-sm md:text-base">
                            {tx.parsed.title}
                          </span>
                          <span className="text-xs md:text-sm text-slate-500 dark:text-slate-400 truncate mt-0.5">
                            {tx.parsed.recipientNumber || tx.parsed.recipientName || (tx.parsed.category === 'UNKNOWN' ? tx.description : tx.parsed.category.replace('_', ' '))}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col items-end flex-shrink-0 ml-4">
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

      {/* RECEIPT MODAL - BOTTOM SHEET ON MOBILE, CENTERED ON DESKTOP */}
      {selectedTransaction && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center sm:p-4 print:hidden">
          <div className="absolute inset-0 bg-slate-900/60 dark:bg-[#050810]/80 backdrop-blur-sm transition-opacity" onClick={() => setSelectedTransaction(null)} />
          
          <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-t-[2rem] md:rounded-[2rem] shadow-2xl dark:shadow-blue-900/5 max-h-[90vh] overflow-hidden flex flex-col animate-in slide-in-from-bottom-10 md:zoom-in-95 duration-200 border border-slate-200/50 dark:border-slate-800">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-inner">
                  <selectedTransaction.parsed.icon className="w-5 h-5 text-white" />
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

            {/* Modal Body - Two Column on Desktop */}
            <div className="p-6 overflow-y-auto" id="printable-receipt">
              
              {/* Massive Amount Display */}
              <div className="text-center pb-8">
                <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-2">Total Amount</span>
                <div className={cn(
                  "text-4xl md:text-5xl font-black tracking-tighter",
                  selectedTransaction.transaction_type === 'CREDIT' ? 'text-emerald-500' : 'text-slate-900 dark:text-white'
                )}>
                  {selectedTransaction.transaction_type === 'CREDIT' ? '+' : '-'}₦{Number(selectedTransaction.amount).toLocaleString()}
                </div>
                
                <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <div className={cn("w-2 h-2 rounded-full", selectedTransaction.status.toLowerCase() === 'successful' || selectedTransaction.status.toLowerCase() === 'completed' ? "bg-emerald-500" : "bg-amber-500")} />
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 capitalize">{selectedTransaction.status || 'Completed'}</span>
                </div>
              </div>

              {/* DEDICATED TOKEN HIGHLIGHT (Crucial for Electricity) */}
              {selectedTransaction.parsed.token && (
                <div className="mb-8 p-5 bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 rounded-2xl relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-blue-500" />
                  <Label className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-1 block">Electricity Token</Label>
                  <div className="flex items-center justify-between gap-4">
                    <p className="text-xl md:text-2xl font-mono font-bold text-slate-900 dark:text-blue-50 tracking-[0.2em]">
                      {selectedTransaction.parsed.token.match(/.{1,4}/g)?.join('-') || selectedTransaction.parsed.token}
                    </p>
                    <button 
                      onClick={() => copyToClipboard(selectedTransaction.parsed.token!, `token-${selectedTransaction.id}`)}
                      className="p-3 bg-white dark:bg-slate-800 rounded-xl shadow-sm hover:scale-105 active:scale-95 transition-all text-blue-600 dark:text-blue-400"
                    >
                      {copiedId === `token-${selectedTransaction.id}` ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                    </button>
                  </div>
                  <p className="text-xs text-blue-600/70 dark:text-blue-400/70 mt-2 font-medium">Input this 20-digit pin into your meter.</p>
                </div>
              )}

              {/* Two Column Grid Architecture */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                
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
                  {/* Conditionally rendered extracted data */}
                  {selectedTransaction.parsed.recipientNumber && (
                     <div>
                       <Label className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-1">Target Phone</Label>
                       <p className="text-sm font-semibold text-slate-900 dark:text-slate-200 font-mono">{selectedTransaction.parsed.recipientNumber}</p>
                     </div>
                  )}

                  {selectedTransaction.parsed.recipientName && (
                     <div>
                       <Label className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-1">Recipient Name</Label>
                       <p className="text-sm font-semibold text-slate-900 dark:text-slate-200">{selectedTransaction.parsed.recipientName}</p>
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
                      <button onClick={() => copyToClipboard(selectedTransaction.reference || String(selectedTransaction.id), 'ref')} className="p-1.5 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 bg-slate-50 dark:bg-slate-800 rounded-lg">
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
                onClick={() => handleShare(selectedTransaction)}
                className="w-full py-6 rounded-2xl border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold"
              >
                <Share2 className="w-4 h-4 mr-2" /> Share
              </Button>
              <Button 
                onClick={handlePrint}
                className="w-full py-6 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-lg shadow-blue-500/20"
              >
                <DownloadCloud className="w-4 h-4 mr-2" /> Save PDF
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Global Print Styles (Injects safely) */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #printable-receipt, #printable-receipt * { visibility: visible; }
          #printable-receipt { position: absolute; left: 0; top: 0; width: 100%; padding: 20px; }
          #printable-receipt .bg-blue-50 { background-color: #f0f9ff !important; border: 1px solid #e0f2fe !important; }
        }
      `}</style>

      <ToastComponent />
    </div>
  );
}