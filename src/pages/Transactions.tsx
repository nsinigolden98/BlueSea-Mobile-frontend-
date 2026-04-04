import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TransactionList, LoadingSpinner } from '@/components/ui-custom';
import { ArrowLeft } from 'lucide-react';

export function Transactions() {
  const navigate = useNavigate();
  const [loading] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-4 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
        <button 
          onClick={() => navigate(-1)}
          className="p-2 -ml-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-bold text-slate-800 dark:text-white">Transactions</h1>
      </div>

      <main className="p-4 md:p-6">
        <div className="max-w-4xl mx-auto">
          {loading ? (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-12">
              <LoadingSpinner />
            </div>
          ) : (
            <TransactionList showViewAll={false} limit={20} />
          )}
        </div>
      </main>
    </div>
  );
}
