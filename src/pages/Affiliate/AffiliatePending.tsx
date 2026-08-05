import { useNavigate } from 'react-router-dom';
import { Clock, CheckCircle2, ArrowLeft } from 'lucide-react';
import { setAffiliateStatus } from '@/utils/affiliateStorage';

export function AffiliatePending() {
  const navigate = useNavigate();

  const handleSimulateApproval = () => {
    setAffiliateStatus('verified');
    navigate('/affiliate/dashboard');
  };

  return (
    <div className="max-w-md mx-auto p-6 my-12 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 text-center space-y-6 shadow-xl">
      <div className="w-16 h-16 mx-auto rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center">
        <Clock className="w-8 h-8" />
      </div>

      <div className="space-y-2">
        <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-900/30 text-amber-600 uppercase tracking-wider">
          Pending Review
        </span>
        <h2 className="text-2xl font-black text-slate-800 dark:text-white">
          Application Submitted
        </h2>
        <p className="text-xs text-slate-500 leading-relaxed">
          Our team is reviewing your affiliate marketing application. You will receive an alert as soon as your account is approved.
        </p>
      </div>

      {/* Dev Mode Simulator Button */}
      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-2">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Demo / Testing Helper</p>
        <button 
          onClick={handleSimulateApproval}
          className="w-full py-2.5 rounded-xl bg-sky-500 text-white font-bold text-xs flex items-center justify-center gap-1.5"
        >
          <CheckCircle2 className="w-4 h-4" /> Simulate Instant Approval
        </button>
      </div>

      <button 
        onClick={() => navigate('/marketplace')}
        className="w-full py-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center justify-center gap-2"
      >
        <ArrowLeft className="w-4 h-4" /> Return to Marketplace
      </button>
    </div>
  );
}