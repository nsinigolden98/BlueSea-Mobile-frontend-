import { cn } from '@/lib/utils';
import { ArrowUpRight, ArrowDownLeft, X, Copy, Check } from 'lucide-react';
import { TransactionsData } from '@/data';
import { useEffect, useState } from 'react';
import { type Transaction } from '@/types';

interface TransactionListProps {
  limit?: number;
  showViewAll?: boolean;
  className?: string;
}

export function TransactionList({
  limit = 5,
  showViewAll = true,
  className,
}: TransactionListProps) {
  const [transactionArray, setTransactionArray] = useState<Transaction[]>([]);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    const transaction = async () => {
      setTransactionArray([]);
      const array = await TransactionsData();
      setTransactionArray(array);
    };
    transaction();
  }, [showViewAll]);

  const displayData: Array<Transaction> = transactionArray;
  const transactions = displayData.slice(0, limit);
  const redirect = () => (window.location.href = '/transactions');

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

  return (
    <>
      <div
        className={cn(
          'bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden',
          className
        )}
      >
        <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-lg font-semibold text-slate-800 dark:text-white">
            Recent Transactions
          </h2>
          {showViewAll && (
            <button
              onClick={redirect}
              className="text-sm font-medium text-sky-500 hover:text-sky-600 transition-colors"
            >
              View All
            </button>
          )}
        </div>

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
              {transactions.map((transaction) => (
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
                    {transaction.created_at.slice(0, 10)}
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
                    {transaction.amount}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {transactions.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
              <span className="text-2xl">📋</span>
            </div>
            <p className="text-slate-500 dark:text-slate-400">No transactions yet</p>
          </div>
        )}
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
                  {selectedTransaction.amount}
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

              {/* Transaction Type */}
              {selectedTransaction.transaction_type && (
                <div>
                  <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">
                    Type
                  </label>
                  <p className="text-slate-800 dark:text-white mt-1">
                    {selectedTransaction.transaction_type}
                  </p>
                </div>
              )}

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

            <button
              onClick={() => setSelectedTransaction(null)}
              className="w-full mt-6 py-3 bg-sky-500 text-white rounded-xl font-medium hover:bg-sky-600"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}
