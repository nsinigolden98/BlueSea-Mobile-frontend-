import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Toast, AuthLoader } from '@/components/ui-custom';
import { paylinkService } from '@/services/paylinkService';
import type { PayLinkItem, TransactionReceipt } from '@/types/paylink';
import { ShieldCheck, CheckCircle2, AlertCircle, Building2 } from 'lucide-react';

export function PayLinkPayment() {
  const { id } = useParams<{ id: string }>();
  const [paylink, setPaylink] = useState<PayLinkItem | null>(null);
  const [customAmount, setCustomAmount] = useState('');
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [receipt, setReceipt] = useState<TransactionReceipt | null>(null);

  const navigate = useNavigate();
  const { ToastComponent, showToast } = Toast();

  useEffect(() => {
    if (id) {
      paylinkService.getPayLinkById(id).then((item) => {
        setPaylink(item);
        if (item?.amount) setSelectedAmount(item.amount);
        setLoading(false);
      });
    }
  }, [id]);

  const handlePay = async () => {
    if (!paylink) return;

    const finalAmount = paylink.isFixedAmount 
      ? paylink.amount 
      : (selectedAmount || Number(customAmount));

    if (!finalAmount || finalAmount <= 0) {
      showToast('Please specify a valid payment amount');
      return;
    }

    if (paylink.isFixedAmount && finalAmount !== paylink.amount) {
      showToast(`Exact amount required: ₦${paylink.amount.toLocaleString()}`);
      return;
    }

    setProcessing(true);
    try {
      const res = await paylinkService.processPayment(paylink.id, finalAmount);
      setReceipt(res);
      showToast('Payment successful!');
    } catch (err: any) {
      showToast(err?.message || 'Payment execution failed');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="h-screen bg-slate-50 dark:bg-slate-900 flex flex-col items-center justify-center gap-3">
        <AuthLoader />
        <p className="text-xs font-bold text-slate-400">Resolving BlueC PayLink...</p>
      </div>
    );
  }

  if (!paylink) {
    return (
      <div className="h-screen bg-slate-50 dark:bg-slate-900 flex flex-col items-center justify-center p-4 text-center">
        <AlertCircle className="w-12 h-12 text-rose-500 mb-3" />
        <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">PayLink Not Found or Expired</h2>
        <p className="text-xs text-slate-400 max-w-xs mt-1 mb-4">The payment link you are attempting to access is invalid or has been deactivated.</p>
        <Button onClick={() => navigate('/paylink')} className="text-xs bg-slate-800 text-white rounded-xl cursor-pointer">
          Return to BlueC Mobile
        </Button>
      </div>
    );
  }

  // SUCCESS STATE RECEIPT
  if (receipt) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-6 md:p-8 max-w-sm w-full space-y-6 text-center shadow-xl">
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-500 bg-emerald-500/10 px-2.5 py-1 rounded-full">
              Payment Completed
            </span>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white mt-3">
              ₦{receipt.amountPaid.toLocaleString()}
            </h2>
            <p className="text-xs text-slate-400 mt-1">{receipt.itemDescription}</p>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-2xl text-left text-xs space-y-2 border border-slate-100 dark:border-slate-800">
            <div className="flex justify-between">
              <span className="text-slate-400">Recipient</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">{receipt.recipientName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Payment ID</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">{receipt.paymentId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Date</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">{new Date(receipt.timestamp).toLocaleDateString()}</span>
            </div>
          </div>

          <Button onClick={() => navigate('/paylink')} className="w-full h-11 bg-slate-900 text-white rounded-xl text-xs font-bold cursor-pointer">
            Done
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col justify-between p-4 md:p-6">
      <div className="max-w-md mx-auto w-full space-y-6 my-auto py-8">
        {/* BRAND IDENTITY HEADER */}
        <div className="text-center space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-500/10 text-sky-500 text-[11px] font-extrabold tracking-wider uppercase">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>BlueC PayLink Secure</span>
          </div>
        </div>

        {/* PAYLINK DETAILS CARD */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 md:p-8 border border-slate-200/80 dark:border-slate-700 shadow-xl space-y-6">
          {paylink.business && (
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-700/60">
              {paylink.business.logoUrl ? (
                <img src={paylink.business.logoUrl} alt={paylink.business.name} className="w-10 h-10 rounded-xl object-cover" />
              ) : (
                <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-500 flex items-center justify-center font-bold">
                  <Building2 className="w-5 h-5" />
                </div>
              )}
              <div>
                <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100">{paylink.business.name}</h3>
                <p className="text-[10px] text-slate-400">Verified Business Profile</p>
              </div>
            </div>
          )}

          {paylink.product?.imageUrl && (
            <div className="h-44 w-full rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-900">
              <img src={paylink.product.imageUrl} alt={paylink.title} className="w-full h-full object-cover" />
            </div>
          )}

          <div className="space-y-1 text-center">
            <h1 className="text-lg font-bold text-slate-900 dark:text-white">{paylink.title}</h1>
            {paylink.description && <p className="text-xs text-slate-400">{paylink.description}</p>}
          </div>

          {/* AMOUNT SELECTION / DISPLAY */}
          <div className="p-4 bg-slate-50 dark:bg-slate-900/80 rounded-2xl border border-slate-100 dark:border-slate-800 text-center space-y-2">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              {paylink.isFixedAmount ? 'Exact Amount Required' : 'Select Contribution Amount'}
            </p>

            {paylink.isFixedAmount ? (
              <div className="text-3xl font-black text-slate-900 dark:text-white">
                ₦{paylink.amount.toLocaleString()}
              </div>
            ) : (
              <div className="space-y-3 pt-2">
                {paylink.suggestedAmounts && paylink.suggestedAmounts.length > 0 && (
                  <div className="flex flex-wrap justify-center gap-2">
                    {paylink.suggestedAmounts.map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => {
                          setSelectedAmount(amt);
                          setCustomAmount('');
                        }}
                        className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                          selectedAmount === amt
                            ? 'bg-sky-500 text-white border-sky-500'
                            : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        ₦{amt.toLocaleString()}
                      </button>
                    ))}
                  </div>
                )}

                {paylink.allowCustomAmount && (
                  <Input
                    type="number"
                    value={customAmount}
                    onChange={(e) => {
                      setCustomAmount(e.target.value);
                      setSelectedAmount(null);
                    }}
                    placeholder="Enter Custom Amount (₦)"
                    className="bg-white dark:bg-slate-800 text-center h-11 text-xs font-bold"
                  />
                )}
              </div>
            )}
          </div>

          <Button
            onClick={handlePay}
            disabled={processing}
            className="w-full h-12 bg-sky-600 hover:bg-sky-500 text-white text-xs font-extrabold rounded-2xl shadow-lg transition-all cursor-pointer disabled:opacity-50"
          >
            {processing ? 'Processing Payment...' : 'Confirm & Pay with BlueC Mobile'}
          </Button>
        </div>
      </div>

      <ToastComponent />
    </div>
  );
}