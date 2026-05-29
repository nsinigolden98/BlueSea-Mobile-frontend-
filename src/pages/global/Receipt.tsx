import { useParams, useNavigate } from 'react-router-dom';
import { Header } from '@/components/ui-custom';
import { useBlueSeaEngine } from '@/context/BlueSeaEngine';
import { Download, CheckCircle2, Share2, Printer } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

export function Receipt() {
  const { transactionId } = useParams();
  const { transactions } = useBlueSeaEngine();

  const transaction = transactions.find(t => t.id === transactionId);

  if (!transaction) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950 flex flex-col">
        <Header title="Receipt" subtitle="Transaction details" showBackButton />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-sm text-slate-400">Transaction not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 flex flex-col">
      <Header title="Receipt" subtitle="Transaction details" showBackButton />
      <main className="flex-1 p-4 md:p-6 overflow-y-auto scrollbar-hide">
        <div className="max-w-md mx-auto">
          {/* Receipt Card */}
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/5 rounded-3xl p-6 shadow-lg">
            {/* Header */}
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-sky-500 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <CheckCircle2 className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white">Payment Successful</h3>
              <p className="text-[10px] text-slate-400 mt-1">{new Date(transaction.created_at).toLocaleDateString('en-NG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
            </div>

            {/* Amount */}
            <div className="text-center mb-6 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-2xl">
              <p className="text-3xl font-black text-slate-900 dark:text-white">₦{transaction.amount.toLocaleString()}</p>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${transaction.status === 'successful' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>{transaction.status}</span>
            </div>

            {/* Details */}
            <div className="space-y-3 mb-6">
              {[
                { label: 'Transaction ID', value: transaction.id },
                { label: 'Description', value: transaction.description },
                { label: 'Category', value: transaction.category },
                { label: 'Payment Method', value: transaction.payment_method || 'BlueSea Wallet' },
                { label: 'Type', value: transaction.transaction_type },
              ].map(item => (
                <div key={item.label} className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-white/5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{item.label}</span>
                  <span className="text-xs font-bold text-slate-800 dark:text-white text-right">{item.value}</span>
                </div>
              ))}
            </div>

            {/* QR Code */}
            <div className="text-center mb-6">
              <div className="inline-block p-4 bg-white rounded-2xl">
                <QRCodeSVG value={`https://blueseamobile.com.ng/verify/${transaction.id}`} size={120} />
              </div>
              <p className="text-[10px] text-slate-400 mt-2">Scan to verify transaction</p>
            </div>

            {/* Actions */}
            <div className="grid grid-cols-3 gap-2">
              <button onClick={() => alert('Receipt downloaded!')} className="flex flex-col items-center gap-1 p-3 bg-slate-50 dark:bg-slate-700 rounded-xl hover:bg-slate-100 transition-all">
                <Download className="w-4 h-4 text-slate-500" />
                <span className="text-[9px] font-bold text-slate-500">Download</span>
              </button>
              <button onClick={() => alert('Receipt shared!')} className="flex flex-col items-center gap-1 p-3 bg-slate-50 dark:bg-slate-700 rounded-xl hover:bg-slate-100 transition-all">
                <Share2 className="w-4 h-4 text-slate-500" />
                <span className="text-[9px] font-bold text-slate-500">Share</span>
              </button>
              <button onClick={() => alert('Printing...')} className="flex flex-col items-center gap-1 p-3 bg-slate-50 dark:bg-slate-700 rounded-xl hover:bg-slate-100 transition-all">
                <Printer className="w-4 h-4 text-slate-500" />
                <span className="text-[9px] font-bold text-slate-500">Print</span>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
