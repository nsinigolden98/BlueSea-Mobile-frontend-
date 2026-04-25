import { useState, useEffect, useMemo } from 'react';
import { Sidebar, Header, Toast } from '@/components/ui-custom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowUpRight, ArrowDownLeft, X, Copy, Check, Printer, ChevronDown} from 'lucide-react';
import {type Transaction } from '@/types';
import { cn } from '@/lib/utils';
import { TransactionsData } from '@/data';

type DateFilter = 'this_month' | 'last_month' | 'last_3_months' | 'last_6_months' | 'last_year' | 'custom' | 'all';

export function TransactionFilterPage() {
  // const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const { showToast, ToastComponent } = Toast();
  
  // Filter states
  const [dateFilter, setDateFilter] = useState<DateFilter>('this_month');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  // const [showDatePicker, setShowDatePicker] = useState(false);

  // Fetch all transactions
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        setTransactions([])
         const allTransactions = await TransactionsData();
        setTransactions(allTransactions);
      } catch (error) {
        console.error('Failed to fetch transactions:', error);
        showToast('Failed to load transactions');
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [showToast]);

  // Calculate date range based on filter
  const getDateRange = () => {
    // const now = new Date();
    const start = new Date();
    const end = new Date();

    switch (dateFilter) {
      case 'this_month':
        start.setDate(1);
        start.setHours(0, 0, 0, 0);
        break;
      case 'last_month':
        start.setMonth(start.getMonth() - 1);
        start.setDate(1);
        start.setHours(0, 0, 0, 0);
        end.setDate(0);
        end.setHours(23, 59, 59, 999);
        break;
      case 'last_3_months':
        start.setMonth(start.getMonth() - 3);
        start.setHours(0, 0, 0, 0);
        break;
      case 'last_6_months':
        start.setMonth(start.getMonth() - 6);
        start.setHours(0, 0, 0, 0);
        break;
      case 'last_year':
        start.setFullYear(start.getFullYear() - 1);
        start.setHours(0, 0, 0, 0);
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
        start.setFullYear(2000);
        end.setFullYear(2100);
        break;
    }

    return { start, end };
  };

  // Filter transactions based on date range
  const filteredTransactions = useMemo(() => {
    const { start, end } = getDateRange();
    
    return transactions.filter(tx => {
      const txDate = new Date(tx.created_at);
      return txDate >= start && txDate <= end;
    });
  }, [transactions, dateFilter, customStartDate, customEndDate]);

  // Calculate totals
  const totals = useMemo(() => {
    const credits = filteredTransactions
      .filter(tx => tx.transaction_type === 'CREDIT')
      .reduce((sum, tx) => sum + Number(tx.amount), 0);
    
    const debits = filteredTransactions
      .filter(tx => tx.transaction_type === 'DEBIT')
      .reduce((sum, tx) => sum + Number(tx.amount), 0);
    
    return { credits, debits };
  }, [filteredTransactions]);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const handlePrint = (transaction: Transaction) => {
    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Transaction Receipt - ${transaction.id}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          .header { text-align: center; margin-bottom: 20px; }
          .amount { font-size: 32px; font-weight: bold; text-align: center; margin: 20px 0; }
          .detail { margin: 10px 0; }
          .label { font-weight: bold; color: #666; }
          .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #999; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>BlueSea Mobile</h1>
          <p>Transaction Receipt</p>
        </div>
        <div class="amount" style="color: ${transaction.transaction_type === 'CREDIT' ? 'green' : 'red'}">
          ${transaction.transaction_type === 'CREDIT' ? '+' : '-'}₦${Number(transaction.amount).toLocaleString()}
        </div>
        <div class="detail"><span class="label">Description:</span> ${transaction.description}</div>
        <div class="detail"><span class="label">Type:</span> ${transaction.transaction_type}</div>
        <div class="detail"><span class="label">Date:</span> ${formatDate(transaction.created_at)}</div>
        <div class="detail"><span class="label">Time:</span> ${formatTime(transaction.created_at)}</div>
        <div class="detail"><span class="label">Reference:</span> ${transaction.reference || 'N/A'}</div>
        <div class="detail"><span class="label">Status:</span> ${transaction.status || 'Completed'}</div>
        <div class="detail"><span class="label">Transaction ID:</span> ${transaction.id}</div>
        <div class="footer">
          <p>This is a computer-generated receipt.</p>
          <p>Thank you for using BlueSea Mobile!</p>
        </div>
      </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.print();
    }
  };

  // const getFilterLabel = () => {
  //   switch (dateFilter) {
  //     case 'this_month': return 'This Month';
  //     case 'last_month': return 'Last Month';
  //     case 'last_3_months': return 'Last 3 Months';
  //     case 'last_6_months': return 'Last 6 Months';
  //     case 'last_year': return 'Last Year';
  //     case 'custom': return 'Custom Range';
  //     case 'all': return 'All Time';
  //     default: return 'Filter';
  //   }
  // };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="flex-1 flex flex-col min-w-0">
        <Header 
          title="Transaction History" 
          subtitle="Filter and view your transactions"
          onMenuClick={() => setSidebarOpen(true)} 
        />

        <main className="flex-1 p-4 md:p-6 overflow-y-auto">
          <div className="max-w-4xl mx-auto space-y-4">
            {/* Filters */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-100 dark:border-slate-700">
              <div className="flex flex-wrap gap-3 items-end">
                <div className="flex-1 min-w-[200px]">
                  <Label className="text-sm font-medium text-slate-600 dark:text-slate-300 mb-2 block">
                    Filter by Date
                  </Label>
                  <div className="relative">
                    <select
                      value={dateFilter}
                      onChange={(e) => setDateFilter(e.target.value as DateFilter)}
                      className="w-full p-3 pr-10 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl appearance-none cursor-pointer"
                    >
                      <option value="this_month">This Month</option>
                      <option value="last_month">Last Month</option>
                      <option value="last_3_months">Last 3 Months</option>
                      <option value="last_6_months">Last 6 Months</option>
                      <option value="last_year">Last Year</option>
                      <option value="custom">Custom Range</option>
                      <option value="all">All Time</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  </div>
                </div>

                {dateFilter === 'custom' && (
                  <>
                    <div className="flex-1 min-w-[150px]">
                      <Label className="text-sm font-medium text-slate-600 dark:text-slate-300 mb-2 block">
                        Start Date
                      </Label>
                      <Input
                        type="date"
                        value={customStartDate}
                        onChange={(e) => setCustomStartDate(e.target.value)}
                        className="bg-slate-50 dark:bg-slate-900"
                      />
                    </div>
                    <div className="flex-1 min-w-[150px]">
                      <Label className="text-sm font-medium text-slate-600 dark:text-slate-300 mb-2 block">
                        End Date
                      </Label>
                      <Input
                        type="date"
                        value={customEndDate}
                        onChange={(e) => setCustomEndDate(e.target.value)}
                        className="bg-slate-50 dark:bg-slate-900"
                      />
                    </div>
                  </>
                )}
              </div>

              {/* Summary Cards */}
              <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
                <div className="text-center p-3 bg-slate-50 dark:bg-slate-900 rounded-xl">
                  <p className="text-xs text-slate-500 dark:text-slate-400">Transactions</p>
                  <p className="text-xl font-bold text-slate-800 dark:text-white">{filteredTransactions.length}</p>
                </div>
                <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-xl">
                  <p className="text-xs text-green-600 dark:text-green-400">Total Credits</p>
                  <p className="text-xl font-bold text-green-600 dark:text-green-400">₦{totals.credits.toLocaleString()}</p>
                </div>
                <div className="text-center p-3 bg-red-50 dark:bg-red-900/20 rounded-xl">
                  <p className="text-xs text-red-600 dark:text-red-400">Total Debits</p>
                  <p className="text-xl font-bold text-red-600 dark:text-red-400">₦{totals.debits.toLocaleString()}</p>
                </div>
              </div>
            </div>

            {/* Transaction List */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 dark:bg-slate-800/50">
                    <tr>
                      <th className="text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider px-4 py-3">
                        Description
                      </th>
                      <th className="text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider px-4 py-3">
                        Date
                      </th>
                      <th className="text-right text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider px-4 py-3">
                        Amount
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {filteredTransactions.length === 0 || loading ? (
                      <tr>
                        <td colSpan={3} className="px-4 py-12 text-center text-slate-500 dark:text-slate-400">
                          No transactions found for the selected period
                        </td>
                      </tr>
                    ) : (
                      filteredTransactions.map((transaction) => (
                        <tr
                          key={transaction.id}
                          onClick={() => setSelectedTransaction(transaction)}
                          className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
                        >
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-3">
                              <div
                                className={cn(
                                  'w-8 h-8 rounded-full flex items-center justify-center',
                                  transaction.transaction_type === 'CREDIT'
                                    ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
                                    : 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
                                )}
                              >
                                {transaction.transaction_type === 'CREDIT' ? (
                                  <ArrowDownLeft className="w-4 h-4" />
                                ) : (
                                  <ArrowUpRight className="w-4 h-4" />
                                )}
                              </div>
                              <span className="font-medium text-slate-700 dark:text-slate-200">
                                {transaction.description}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-4 text-sm text-slate-500 dark:text-slate-400">
                            {new Date(transaction.created_at).toLocaleDateString()}
                          </td>
                          <td
                            className={cn(
                              'px-4 py-4 text-right font-medium',
                              transaction.transaction_type === 'CREDIT'
                                ? 'text-green-600 dark:text-green-400'
                                : 'text-red-600 dark:text-red-400'
                            )}
                          >
                            {transaction.transaction_type === 'CREDIT' ? '+' : '-'}₦
                            {Number(transaction.amount).toLocaleString()}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Transaction Detail Modal */}
      {selectedTransaction && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-lg font-semibold text-slate-800 dark:text-white">
                Transaction Details
              </h3>
              <button
                onClick={() => setSelectedTransaction(null)}
                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Amount */}
              <div className="text-center py-4 border-b border-slate-100 dark:border-slate-800">
                <div
                  className={cn(
                    'text-3xl font-bold',
                    selectedTransaction.transaction_type === 'CREDIT'
                      ? 'text-green-500'
                      : 'text-red-500'
                  )}
                >
                  {selectedTransaction.transaction_type === 'CREDIT' ? '+' : '-'}₦
                  {Number(selectedTransaction.amount).toLocaleString()}
                </div>
                <div
                  className={cn(
                    'inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium mt-2',
                    selectedTransaction.transaction_type === 'CREDIT'
                      ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
                      : 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
                  )}
                >
                  {selectedTransaction.transaction_type === 'CREDIT' ? (
                    <ArrowDownLeft className="w-4 h-4" />
                  ) : (
                    <ArrowUpRight className="w-4 h-4" />
                  )}
                  {selectedTransaction.transaction_type === 'CREDIT' ? 'Credit' : 'Debit'}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">
                  Description
                </label>
                <p className="text-slate-800 dark:text-white font-medium mt-1">
                  {selectedTransaction.description}
                </p>
              </div>

              {/* Date */}
              <div>
                <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">
                  Date
                </label>
                <p className="text-slate-800 dark:text-white mt-1">
                  {formatDate(selectedTransaction.created_at)}
                </p>
              </div>

              {/* Time */}
              <div>
                <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">
                  Time
                </label>
                <p className="text-slate-800 dark:text-white mt-1">
                  {formatTime(selectedTransaction.created_at)}
                </p>
              </div>

              {/* Reference */}
              {selectedTransaction.reference && (
                <div>
                  <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">
                    Reference
                  </label>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-slate-800 dark:text-white font-mono text-sm">
                      {selectedTransaction.reference}
                    </p>
                    <button
                      onClick={() =>
                        copyToClipboard(selectedTransaction.reference || '', String(selectedTransaction.id))
                      }
                      className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded"
                    >
                      {copiedId === String(selectedTransaction.id) ? (
                        <Check className="w-4 h-4 text-green-500" />
                      ) : (
                        <Copy className="w-4 h-4 text-slate-400" />
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Status */}
              {selectedTransaction.status && (
                <div>
                  <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">
                    Status
                  </label>
                  <p className="text-slate-800 dark:text-white mt-1">
                    {selectedTransaction.status}
                  </p>
                </div>
              )}

              {/* ID */}
              <div>
                <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">
                  Transaction ID
                </label>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-slate-800 dark:text-white font-mono text-sm">
                    {selectedTransaction.id}
                  </p>
                  <button
                    onClick={() => copyToClipboard(String(selectedTransaction.id), `id-${selectedTransaction.id}`)}
                    className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded"
                  >
                    {copiedId === `id-${selectedTransaction.id}` ? (
                      <Check className="w-4 h-4 text-green-500" />
                    ) : (
                      <Copy className="w-4 h-4 text-slate-400" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Print Button */}
            <Button
              onClick={() => handlePrint(selectedTransaction)}
              className="w-full mt-6 py-3 bg-slate-800 dark:bg-slate-700 text-white rounded-xl font-medium hover:bg-slate-900 dark:hover:bg-slate-600 flex items-center justify-center gap-2"
            >
              <Printer className="w-4 h-4" />
              Print / Save as PDF
            </Button>

            <button
              onClick={() => setSelectedTransaction(null)}
              className="w-full mt-3 py-3 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-xl font-medium hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              Close
            </button>
          </div>
        </div>
      )}

      <ToastComponent />
    </div>
  );
}
