import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar, Toast } from '@/components/ui-custom';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { 
  ChevronLeft, ChevronDown, X, Copy, Check, Printer, Share2, 
  ArrowUpRight, ArrowDownLeft, FileText, Image as ImageIcon, User, Zap, ShieldCheck
} from 'lucide-react';
import { type Transaction, ENDPOINTS, postRequest } from '@/types';
import { cn } from '@/lib/utils';
import { TransactionsData } from '@/data';
import { parseTransactionInfo, type ParsedTransaction } from '@/utils/transactionParser';

type DateFilter = 'this_month' | 'last_month' | 'last_3_months' | 'last_6_months' | 'last_year' | 'custom' | 'all';

const getBillerSlug = (provider: string = '') => {
  const p = provider.toLowerCase();
  if (p.includes('ikeja') || p.includes('ikedc')) return 'ikeja-electric';
  if (p.includes('eko') || p.includes('ekedc')) return 'eko-electric';
  if (p.includes('kano') || p.includes('kedco')) return 'kano-electric';
  if (p.includes('port') || p.includes('phed')) return 'portharcourt-electric';
  if (p.includes('jos') || p.includes('jed')) return 'jos-electric';
  if (p.includes('ibadan') || p.includes('ibedc')) return 'ibadan-electric';
  if (p.includes('kaduna') || p.includes('kaedco')) return 'kaduna-electric';
  if (p.includes('abuja') || p.includes('aedc')) return 'abuja-electric';
  if (p.includes('enugu') || p.includes('eedc')) return 'enugu-electric';
  if (p.includes('benin') || p.includes('bedc')) return 'benin-electric';
  if (p.includes('aba')) return 'aba-electric';
  if (p.includes('yola') || p.includes('yedc')) return 'yola-electric';
  return provider;
};

export const TransactionFilterPage: React.FC = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [transactions, setTransactions] = useState<ParsedTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTransaction, setSelectedTransaction] = useState<ParsedTransaction | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  
  const [liveMeterData, setLiveMeterData] = useState<any>(null);
  const [loadingMeterData, setLoadingMeterData] = useState(false);
  
  const { showToast, ToastComponent } = Toast();
  
  const [dateFilter, setDateFilter] = useState<DateFilter>('this_month');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  const bodyDivRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    const fetchLiveDetails = async () => {
      if (!selectedTransaction) return;

      const category = selectedTransaction.parsed?.category || '';
      const desc = (selectedTransaction.description || '').toUpperCase();
      const isElectricity = category === 'ELECTRICITY' || desc.includes('LIGHT') || desc.includes('ELECTRIC') || desc.includes('METER');
      
      if (!isElectricity) {
        setLiveMeterData(null);
        return;
      }

      const txAny = selectedTransaction as any;
      const meterNum = txAny.billerCode || 
                       txAny.metadata?.meter_number || 
                       txAny.metadata?.billerCode || 
                       txAny.parsed?.meterNumber ||
                       txAny.recipient_number;

      const rawBiller = txAny.biller_name || 
                        txAny.metadata?.biller_name || 
                        txAny.metadata?.plan ||
                        txAny.parsed?.serviceProvider || 
                        '';

      const rawType = txAny.meter_type || 
                      txAny.metadata?.meter_type || 
                      txAny.metadata?.plan_type || 
                      (txAny.parsed?.token ? 'prepaid' : 'postpaid');

      const billerSlug = getBillerSlug(rawBiller);
      const meterTypeFormatted = String(rawType).toLowerCase().includes('post') ? 'postpaid' : 'prepaid';
      
      if (!meterNum || !billerSlug) {
        return;
      }

      setLoadingMeterData(true);
      try {
        const data = {
          meter_number: Number(meterNum),
          meter_type: meterTypeFormatted,
          biller: billerSlug
        };
        
        const response = await postRequest(ENDPOINTS.electricity_user, data);
        if (response?.success) {
          setLiveMeterData(response.response || response.data || {});
        }
      } catch (error) {
        console.error("Live user payload processing failed:", error);
      } finally {
        setLoadingMeterData(false);
      }
    };

    fetchLiveDetails();
  }, [selectedTransaction]);

  // Opacity masking alignment when a modal is active
  useEffect(() => {
    if (selectedTransaction || shareModalOpen) {
      if (bodyDivRef.current) bodyDivRef.current.style.opacity = '0.5';
    } else {
      if (bodyDivRef.current) bodyDivRef.current.style.opacity = '1';
    }
  }, [selectedTransaction, shareModalOpen]);

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
    <div className="relative">
      <div className="h-screen bg-slate-50 dark:bg-slate-900 flex font-sans overflow-hidden" ref={bodyDivRef}>
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        
        {/* Main Viewport Content Context Area */}
        <div className="flex-1 flex flex-col h-full min-w-0 relative">
          
          {/* FIXED APP HEADER LAYER */}
          <header className="sticky top-0 z-30 bg-slate-50 dark:bg-slate-900 border-b border-slate-200/60 dark:border-slate-800/60 px-4 py-5 flex items-center gap-4 shrink-0 transition-colors">
            <button 
              onClick={() => navigate(-1)} 
              className="p-2 rounded-full hover:bg-slate-200/60 dark:hover:bg-slate-800/60 text-slate-600 dark:text-slate-400 transition-all"
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

          {/* ISOLATED SCROLLABLE CONTENT AREA */}
          <main className="flex-1 p-4 md:p-6 overflow-y-auto scrollbar-hide z-10 w-full max-w-5xl mx-auto space-y-6">
            
            {/* CONTROL CENTER */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/50 dark:border-slate-800 shadow-sm">
              <div className="flex flex-col md:flex-row gap-4 items-end">
                <div className="w-full md:flex-1">
                  <Label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 block">
                    Timeframe
                  </Label>
                  <div className="relative">
                    <select
                      value={dateFilter}
                      onChange={(e) => setDateFilter(e.target.value as DateFilter)}
                      className="w-full pl-4 pr-10 py-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl appearance-none cursor-pointer text-sm font-medium focus:ring-2 focus:ring-blue-500/20 dark:text-slate-200 transition-all"
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
                      <Input type="date" value={customStartDate} onChange={(e) => setCustomStartDate(e.target.value)} className="bg-slate-50 dark:bg-slate-800 rounded-2xl py-3.5 border-slate-200 dark:border-slate-700" />
                    </div>
                    <div className="flex-1">
                      <Label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 block">End</Label>
                      <Input type="date" value={customEndDate} onChange={(e) => setCustomEndDate(e.target.value)} className="bg-slate-50 dark:bg-slate-800 rounded-2xl py-3.5 border-slate-200 dark:border-slate-700" />
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-5 pt-5 border-t border-slate-100 dark:border-slate-800">
                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl flex flex-col justify-center hidden md:flex">
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

            {/* TRANSACTION LIST */}
            <div className="space-y-3">
              {loading ? (
                 <div className="p-10 text-center text-slate-400 animate-pulse font-medium">Loading ledger...</div>
              ) : filteredTransactions.length === 0 ? (
                 <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 border-dashed">
                   <p className="text-slate-500 dark:text-slate-400 font-medium">No transactions found for this period.</p>
                 </div>
              ) : (
                <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/50 dark:border-slate-800 overflow-hidden shadow-sm divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredTransactions.map((tx) => {
                    const category = tx.parsed?.category || '';
                    const descUpper = (tx.description || '').toUpperCase();
                    const isElectricity = category === 'ELECTRICITY' || descUpper.includes('LIGHT') || descUpper.includes('ELECTRIC') || descUpper.includes('METER');
                    
                    const Icon = isElectricity ? Zap : tx.parsed.icon;
                    const isCredit = tx.transaction_type === 'CREDIT';
                    
                    return (
                      <div
                        key={tx.id}
                        onClick={() => setSelectedTransaction(tx)}
                        className="group flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer transition-all active:scale-[0.99]"
                      >
                        <div className="flex items-center gap-4 overflow-hidden min-w-0">
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
                              {isElectricity ? 'Light Bill Purchase' : tx.parsed.title}
                            </span>
                            <span className="text-xs md:text-sm text-slate-500 dark:text-slate-400 truncate mt-0.5">
                              {tx.receiver_name || tx.sender_name || tx.parsed.recipientNumber || tx.parsed.recipientName || tx.description}
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-col items-end shrink-0 ml-4">
                          <span className={cn(
                            "font-bold text-sm md:text-base tracking-tight",
                            isCredit ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
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
      </div>

      {/* RECEIPT MODAL */}
      {selectedTransaction && (() => {
        const dynamicTx = selectedTransaction as any;
        const category = dynamicTx.parsed?.category || '';
        const descUpper = (dynamicTx.description || '').toUpperCase();
        const isElectricity = category === 'ELECTRICITY' || descUpper.includes('LIGHT') || descUpper.includes('ELECTRIC') || descUpper.includes('METER');
        
        const matchedMeterNumber = dynamicTx.billerCode || dynamicTx.metadata?.meter_number || dynamicTx.metadata?.billerCode || dynamicTx.parsed?.meterNumber || dynamicTx.recipient_number || '-';
        const matchedToken = dynamicTx.metadata?.token || dynamicTx.parsed?.token || dynamicTx.token;

        return (
          <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center sm:p-4 print:hidden">
            <div className="absolute inset-0 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm" onClick={() => setSelectedTransaction(null)} />
            
            <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-t-[2rem] md:rounded-[2rem] shadow-2xl max-h-[90vh] overflow-hidden flex flex-col animate-in slide-in-from-bottom-10 md:zoom-in-95 duration-200 border border-slate-200/50 dark:border-slate-800">
              
              <div className="flex justify-between items-center p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center shadow-inner transition-all shrink-0 aspect-square",
                    isElectricity ? "bg-amber-500 text-white" : "bg-blue-600 text-white"
                  )}>
                    {isElectricity ? <Zap className="w-5 h-5 fill-current" /> : <dynamicTx.parsed.icon className="w-5 h-5" />}
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

              <div className="p-6 overflow-y-auto relative" id="printable-receipt">
                <div className="text-center pb-6">
                  <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-2">Total Cost</span>
                  <div className={cn(
                    "text-4xl md:text-5xl font-black tracking-tighter",
                    dynamicTx.transaction_type === 'CREDIT' ? 'text-emerald-500' : 'text-rose-500'
                  )}>
                    {dynamicTx.transaction_type === 'CREDIT' ? '+' : '-'}₦{Number(dynamicTx.amount).toLocaleString()}
                  </div>
                  
                  <div className="mt-4 flex flex-wrap items-center justify-center gap-2.5">
                    <div className={cn("inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700")}>
                      <div className={cn("w-2 h-2 rounded-full", dynamicTx.status?.toLowerCase() === 'successful' || dynamicTx.status?.toLowerCase() === 'completed' ? "bg-emerald-500" : "bg-amber-500")} />
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 capitalize">{dynamicTx.status || 'Completed'}</span>
                    </div>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-500/5 dark:bg-blue-500/10 border border-blue-500/10 text-blue-600 dark:text-blue-400 font-medium">
                      <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
                      <span className="text-xs font-bold tracking-tight">Verified Secure Ledger</span>
                    </div>
                  </div>
                </div>

                {isElectricity && (
                  <div className="mb-6 space-y-6 bg-slate-50/50 dark:bg-slate-800/20 border border-slate-100 dark:border-slate-800 p-5 rounded-2xl relative overflow-hidden">
                    <Zap className="absolute -right-6 -bottom-6 w-32 h-32 text-amber-500/[0.04] dark:text-amber-400/[0.03] pointer-events-none transform rotate-12 shrink-0 aspect-square" />

                    <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800 relative z-10">
                      <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase">Meter Variant Mode</span>
                      <span className={cn(
                        "px-2.5 py-1 rounded-full text-[10px] font-black tracking-widest",
                        matchedToken ? "bg-sky-500/10 text-sky-500" : "bg-amber-500/10 text-amber-500"
                      )}>
                        {matchedToken ? 'PREPAID' : 'POSTPAID'}
                      </span>
                    </div>

                    {matchedToken && (
                      <div className="p-4 bg-sky-500/5 dark:bg-sky-500/10 border border-sky-500/20 rounded-xl space-y-1 relative z-10">
                        <Label className="text-[10px] font-bold text-sky-600 dark:text-sky-400 uppercase tracking-widest block">Token Number</Label>
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-lg font-mono font-black text-slate-900 dark:text-sky-100 tracking-wider">
                            {String(matchedToken).match(/.{1,4}/g)?.join('-') || matchedToken}
                          </p>
                          <button 
                            onClick={() => copyToClipboard(String(matchedToken), 'token')}
                            className="p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sky-500 shrink-0"
                          >
                            {copiedId === 'token' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-xs pt-1 relative z-10">
                      <div className="flex gap-2">
                        <User className="w-4 h-4 text-slate-400 dark:text-slate-500 shrink-0 mt-0.5" />
                        <div>
                          <span className="text-slate-400 block mb-0.5">Customer Name</span>
                          <span className="font-bold text-slate-900 dark:text-slate-200 uppercase">
                            {loadingMeterData ? (
                              <span className="animate-pulse text-blue-500 font-semibold">Fetching...</span>
                            ) : (
                              liveMeterData?.Customer_Name || dynamicTx.parsed?.customerName || dynamicTx.metadata?.customerName || '-'
                            )}
                          </span>
                        </div>
                      </div>
                      <div>
                        <span className="text-slate-400 block mb-0.5">Customer Address</span>
                        <span className="font-bold text-slate-900 dark:text-slate-200 uppercase line-clamp-2">
                          {loadingMeterData ? (
                            <span className="animate-pulse text-blue-500 font-semibold">Fetching...</span>
                          ) : (
                            liveMeterData?.Address || dynamicTx.parsed?.customerAddress || dynamicTx.metadata?.customerAddress || '-'
                          )}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block mb-0.5">Customer Phone / Number</span>
                        <span className="font-bold text-slate-900 dark:text-slate-200 font-mono">
                          {loadingMeterData ? (
                            <span className="animate-pulse text-blue-500 font-semibold">Fetching...</span>
                          ) : (
                            liveMeterData?.Customer_Number || dynamicTx.metadata?.customerNumber || matchedMeterNumber
                          )}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block mb-0.5">Token Units</span>
                        <span className="font-bold text-slate-900 dark:text-slate-200 text-sm">
                          {dynamicTx.amount ? `${Math.floor(Number(dynamicTx.amount) / 70)} kWh` : '-'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 relative z-10">
                  <div className="space-y-5">
                    <div>
                      <Label className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-1">Service Type</Label>
                      <p className="text-sm font-semibold text-slate-900 dark:text-slate-200">{isElectricity ? 'Electricity Bill' : dynamicTx.parsed.title}</p>
                    </div>
                    <div>
                      <Label className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-1">Date & Time</Label>
                      <p className="text-sm font-semibold text-slate-900 dark:text-slate-200">{formatDate(dynamicTx.created_at)}</p>
                    </div>
                    <div>
                      <Label className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-1">Activity Log Description</Label>
                      <p className="text-sm font-medium text-slate-600 dark:text-slate-400 leading-relaxed bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                        {dynamicTx.description}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-5">
                    {!isElectricity && dynamicTx.parsed.recipientNumber && (
                       <div>
                         <Label className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-1">Target Account/Phone</Label>
                         <p className="text-sm font-semibold text-slate-900 dark:text-slate-200 font-mono">{dynamicTx.parsed.recipientNumber}</p>
                       </div>
                    )}

                    <div className="pt-4 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-slate-800">
                      <Label className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-1">Transaction Ref</Label>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-slate-900 dark:text-slate-200 font-mono truncate">
                          {dynamicTx.reference || dynamicTx.id}
                        </p>
                        <button onClick={() => copyToClipboard(dynamicTx.reference || String(dynamicTx.id), 'ref')} className="p-1.5 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 bg-slate-50 dark:bg-slate-800 rounded-lg shrink-0">
                          {copiedId === 'ref' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <Label className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-1">System Audit ID</Label>
                      <p className="text-xs font-medium text-slate-500 dark:text-slate-500 font-mono">{dynamicTx.id}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 md:p-6 bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-3">
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
        );
      })()}

      {/* SHARE SHEET */}
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