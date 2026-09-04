import { useState, useEffect, useCallback } from 'react';
import { 
  Calendar, 
  MapPin, 
  X, 
  Ticket, 
  TrendingUp, 
  QrCode, 
  Download, 
  Wallet, 
  Share2, 
  Check, 
  BadgePercent, 
  Edit3, 
  Info,
  RefreshCw,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import type { MarketplaceEvent } from '@/types';
import { ENDPOINTS, TOKEN } from '@/types';
import { PinModal, Toast } from '@/components/ui-custom';

export interface EventWithdrawalItem {
  id?: string;
  amount?: number | string;
  gross_amount?: number | string;
  fee?: number | string;
  platform_fee?: number | string;
  net_amount?: number | string;
  amount_credited?: number | string;
  status?: string;
  created_at?: string;
  date?: string;
}

export interface EventWithdrawalSummary {
  available_balance?: number | string;
  available_amount?: number | string;
  withdrawable_amount?: number | string;
  total_available?: number | string;
  remaining_balance?: number | string;
  balance?: number | string;
  total_withdrawn?: number | string;
  withdrawn_amount?: number | string;
  total_gross_revenue?: number | string;
}

export interface EventWithdrawalResponse {
  summary?: EventWithdrawalSummary;
  totals?: EventWithdrawalSummary;
  available_balance?: number | string;
  available_amount?: number | string;
  withdrawable_amount?: number | string;
  total_available?: number | string;
  remaining_balance?: number | string;
  balance?: number | string;
  total_withdrawn?: number | string;
  withdrawn_amount?: number | string;
  withdrawals?: EventWithdrawalItem[];
  results?: EventWithdrawalItem[];
  data?: EventWithdrawalItem[];
}

interface EventDashboardProps {
  event: MarketplaceEvent | null;
  onClose: () => void;
}

function extractAvailableBalance(data: EventWithdrawalResponse): number {
  const summary = data.summary || data.totals;
  const candidate = 
    summary?.available_balance ??
    summary?.available_amount ??
    summary?.withdrawable_amount ??
    summary?.total_available ??
    summary?.remaining_balance ??
    summary?.balance ??
    data.available_balance ??
    data.available_amount ??
    data.withdrawable_amount ??
    data.total_available ??
    data.remaining_balance ??
    data.balance;

  if (typeof candidate === 'number') {
    return isNaN(candidate) ? 0 : candidate;
  }
  if (typeof candidate === 'string') {
    const parsed = parseFloat(candidate);
    return isNaN(parsed) ? 0 : parsed;
  }
  return 0;
}

function extractTotalWithdrawn(data: EventWithdrawalResponse | null): number {
  if (!data) return 0;
  const summary = data.summary || data.totals;
  const candidate = 
    summary?.total_withdrawn ??
    summary?.withdrawn_amount ??
    data.total_withdrawn ??
    data.withdrawn_amount;

  if (typeof candidate === 'number') {
    return isNaN(candidate) ? 0 : candidate;
  }
  if (typeof candidate === 'string') {
    const parsed = parseFloat(candidate);
    return isNaN(parsed) ? 0 : parsed;
  }
  return 0;
}

function extractWithdrawalsList(data: EventWithdrawalResponse | null): EventWithdrawalItem[] {
  if (!data) return [];
  if (Array.isArray(data.withdrawals)) return data.withdrawals;
  if (Array.isArray(data.results)) return data.results;
  if (Array.isArray(data.data)) return data.data;
  return [];
}

export function EventDashboard({ event, onClose }: EventDashboardProps) {
  const [exporting, setExporting] = useState(false);
  const [showScannerModal, setShowScannerModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [scannerEmail, setScannerEmail] = useState('');
  const [addingScanner, setAddingScanner] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);
  
  // Withdrawal Backend State
  const [availableBalance, setAvailableBalance] = useState<number | null>(null);
  const [withdrawalData, setWithdrawalData] = useState<EventWithdrawalResponse | null>(null);
  const [isLoadingWithdrawal, setIsLoadingWithdrawal] = useState<boolean>(false);
  const [withdrawalError, setWithdrawalError] = useState<string | null>(null);

  // Affiliate States
  const [affiliateEnabled, setAffiliateEnabled] = useState(false);
  const [commissionRate, setCommissionRate] = useState(5);

  const { showPinModal, PinComponent } = PinModal();
  const { ToastComponent, showToast } = Toast();

  const loadWithdrawalData = useCallback(async () => {
    if (!event?.id) return;
    setIsLoadingWithdrawal(true);
    setWithdrawalError(null);
    try {
      const url = `${ENDPOINTS.event_withdraw}?event_id=${encodeURIComponent(event.id)}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${TOKEN}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        let errorMsg = `Failed to load withdrawal data (${response.status})`;
        try {
          const errorJson = await response.json();
          if (errorJson.detail) errorMsg = errorJson.detail;
          else if (errorJson.message) errorMsg = errorJson.message;
          else if (errorJson.error) errorMsg = errorJson.error;
        } catch {
          if (response.status === 403) {
            errorMsg = 'You are not authorized to view withdrawal data for this event.';
          } else if (response.status === 404) {
            errorMsg = 'Withdrawal data not found for this event.';
          }
        }
        throw new Error(errorMsg);
      }

      const data: EventWithdrawalResponse = await response.json();
      setWithdrawalData(data);
      const extractedBalance = extractAvailableBalance(data);
      setAvailableBalance(extractedBalance);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Network failure loading withdrawal info.';
      setWithdrawalError(message);
    } finally {
      setIsLoadingWithdrawal(false);
    }
  }, [event?.id]);

  useEffect(() => {
    if (event?.id) {
      loadWithdrawalData();
    } else {
      setAvailableBalance(null);
      setWithdrawalData(null);
      setWithdrawalError(null);
      setIsLoadingWithdrawal(false);
    }
  }, [event?.id, loadWithdrawalData]);

  const handleShareEvent = () => {
    if (!event) return;
    const shareUrl = `${window.location.origin}/event/${event.id}`;
    navigator.clipboard.writeText(shareUrl);
    setShareCopied(true);
    showToast('Event link copied to clipboard!');
    setTimeout(() => setShareCopied(false), 2000);
  };

  const handleExportAttendees = async () => {
    if (!event) return;
    setExporting(true);
    try {
      const response = await fetch(ENDPOINTS.export_attendees(event.id), {
        headers: {
          'Authorization': `Bearer ${TOKEN}`,
        },
      });
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `attendees_${event.event_title}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Export failed:', error);
      showToast('Export failed. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  const handleConfirmAddScanner = () => {
    if (!event || !scannerEmail) return;
    setAddingScanner(true);
    showPinModal();
  };

  const handleScannerSuccess = () => {
    setAddingScanner(false);
    setShowScannerModal(false);
    setScannerEmail('');
    showToast('Scanner added successfully.');
  };

  const handleScannerError = (error?: { message?: string } | Error | unknown) => {
    setAddingScanner(false);
    let msg = 'Failed to add scanner. Please try again.';
    if (error && typeof error === 'object' && 'message' in error && typeof error.message === 'string') {
      msg = error.message;
    }
    showToast(msg);
  };

  const handleConfirmWithdraw = () => {
    if (!event || availableBalance === null || availableBalance <= 0) return;
    setWithdrawing(true);
    showPinModal();
  };

  const handleWithdrawSuccess = (response?: { message?: string }) => {
    setWithdrawing(false);
    setShowWithdrawModal(false);
    showToast(response?.message || 'Withdrawal successful. Your earnings have been credited to your wallet.');
    loadWithdrawalData();
  };

  const handleWithdrawError = (error?: { message?: string } | Error | unknown) => {
    setWithdrawing(false);
    let msg = 'Withdrawal failed. Please try again.';
    if (error && typeof error === 'object' && 'message' in error && typeof error.message === 'string') {
      msg = error.message;
    }
    showToast(msg);
  };

  if (!event) return null;

  const calculateProfit = (evt: MarketplaceEvent) => {
    let total = 0;
    if (evt.ticket_types && evt.ticket_types.length > 0) {
      evt.ticket_types.forEach(tt => {
        const available = Number(tt.quantity_available);
        const sold = Number(tt.initial_quantity) - available;
        total += sold * Number(tt.price);
      });
    }
    return total;
  };

  const profit = calculateProfit(event);
  const soldPercent = event.total_tickets > 0 
    ? (event.tickets_sold / event.total_tickets * 100).toFixed(1) 
    : '0';

  const totalWithdrawn = extractTotalWithdrawn(withdrawalData);
  const withdrawalList = extractWithdrawalsList(withdrawalData);

  // Affiliate Preview Logic
  const baseTicketPrice = event.ticket_types?.[0] ? Number(event.ticket_types[0].price) : 0;
  const promoterEarnings = (baseTicketPrice * commissionRate) / 100;

  const isWithdrawDisabled = 
    isLoadingWithdrawal || 
    withdrawalError !== null || 
    availableBalance === null || 
    availableBalance <= 0 || 
    withdrawing;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-slate-800 dark:text-white">Event Dashboard</h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* 1. Event Title & Meta */}
        <div className="mb-6">
          <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-2 leading-tight">
            {event.event_title}
          </h3>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-500">
            <span className="flex items-center gap-1.5 font-medium">
              <Calendar className="w-4 h-4 text-sky-500" />
              {new Date(event.event_date).toLocaleDateString('en-US', { 
                weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' 
              })}
            </span>
            <span className="flex items-center gap-1.5 font-medium">
              <MapPin className="w-4 h-4 text-sky-500" />
              {event.event_location}
            </span>
          </div>
        </div>

        {/* 2. Platform Fee Notice */}
        <div className="bg-blue-50/50 dark:bg-sky-900/10 border border-blue-100 dark:border-sky-900/30 p-4 rounded-xl mb-6">
          <div className="flex gap-3">
            <div className="p-2 bg-white dark:bg-slate-800 rounded-lg shadow-sm h-fit">
              <BadgePercent className="w-5 h-5 text-sky-600 dark:text-sky-400" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800 dark:text-slate-200">BlueSea Platform Fee: 10%</p>
              <p className="text-[12px] text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                BlueSea charges a fixed 10% fee on ticket sales, automatically deducted during withdrawal. Affiliate commissions are separate and funded by you.
              </p>
            </div>
          </div>
        </div>

        {/* 3. Ticket Stats & Gross Revenue */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Ticket className="w-4 h-4 text-sky-500" />
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Tickets Sold</span>
            </div>
            <p className="text-2xl font-bold text-slate-800 dark:text-white">
              {event.tickets_sold}
            </p>
            <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full mt-2 overflow-hidden">
              <div 
                className="bg-sky-500 h-full rounded-full" 
                style={{ width: `${Math.min(Number(soldPercent), 100)}%` }}
              />
            </div>
            <p className="text-[10px] text-slate-500 mt-2">
              {event.total_tickets - event.tickets_sold} remaining
            </p>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-green-500" />
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Gross Sales</span>
            </div>
            <p className="text-2xl font-bold text-slate-800 dark:text-white">
              ₦{profit.toLocaleString()}
            </p>
            <p className="text-[10px] text-green-600 dark:text-green-400 mt-2 font-medium">
              {soldPercent}% capacity reached
            </p>
          </div>
        </div>

        {/* 4. Authoritative Withdrawable Balance Card */}
        <div className="bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/40 p-4 rounded-xl mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-100 dark:bg-emerald-900/40 rounded-lg">
                <Wallet className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Available to Withdraw
                </p>
                {isLoadingWithdrawal ? (
                  <div className="flex items-center gap-2 mt-1">
                    <Loader2 className="w-4 h-4 animate-spin text-emerald-600 dark:text-emerald-400" />
                    <span className="text-xs text-slate-400">Fetching balance...</span>
                  </div>
                ) : withdrawalError ? (
                  <p className="text-xs text-red-500 font-medium mt-1">Failed to load balance</p>
                ) : (
                  <p className="text-2xl font-black text-slate-800 dark:text-white mt-0.5">
                    ₦{(availableBalance ?? 0).toLocaleString()}
                  </p>
                )}
              </div>
            </div>

            {withdrawalError ? (
              <Button
                size="sm"
                variant="outline"
                onClick={loadWithdrawalData}
                className="h-8 text-xs border-red-200 dark:border-red-800 text-red-600 hover:bg-red-50"
              >
                <RefreshCw className="w-3 h-3 mr-1" /> Retry
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={() => setShowWithdrawModal(true)}
                disabled={isWithdrawDisabled}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs h-9 px-4 shadow-sm disabled:opacity-50"
              >
                Withdraw
              </Button>
            )}
          </div>

          {withdrawalError && (
            <p className="text-[11px] text-red-500 mt-2">
              {withdrawalError} Balance cannot be verified; withdrawal is temporarily disabled.
            </p>
          )}

          {totalWithdrawn > 0 && !isLoadingWithdrawal && (
            <div className="mt-3 pt-2 border-t border-emerald-200/40 dark:border-emerald-900/30 flex justify-between items-center text-xs text-slate-500 dark:text-slate-400">
              <span>Total previously withdrawn:</span>
              <span className="font-semibold text-slate-700 dark:text-slate-300">₦{totalWithdrawn.toLocaleString()}</span>
            </div>
          )}
        </div>

        {/* 5. Ticket Types */}
        {event.ticket_types && event.ticket_types.length > 0 && (
          <div className="mb-6">
            <h4 className="text-sm font-bold text-slate-800 dark:text-white mb-3 flex items-center gap-2">
              Ticket Types
              <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-[10px] text-slate-500 font-normal">
                {event.ticket_types.length} total
              </span>
            </h4>
            <div className="space-y-2">
              {event.ticket_types.map((tt, idx) => {
                const not_sold = Number(tt.quantity_available);
                const typeProfit = (Number(tt.initial_quantity) - not_sold) * Number(tt.price);
                return (
                  <div key={idx} className="flex items-center justify-between p-3 border border-slate-100 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                    <div>
                      <p className="font-semibold text-sm text-slate-800 dark:text-white">{tt.name}</p>
                      <p className="text-[11px] text-slate-500">₦{Number(tt.price).toLocaleString()} / ticket</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-medium text-slate-700 dark:text-slate-300">{not_sold} available</p>
                      <p className="text-[11px] font-bold text-green-600">₦{typeProfit.toLocaleString()}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 6. Withdrawal History (If records are returned by backend) */}
        {withdrawalList.length > 0 && (
          <div className="mb-6">
            <h4 className="text-sm font-bold text-slate-800 dark:text-white mb-3 flex items-center justify-between">
              <span>Withdrawal History</span>
              <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-500 px-2 py-0.5 rounded font-normal">
                {withdrawalList.length} total
              </span>
            </h4>
            <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
              {withdrawalList.map((item, idx) => {
                const amount = Number(item.amount ?? item.net_amount ?? item.amount_credited ?? 0);
                const fee = item.fee ?? item.platform_fee;
                const dateStr = item.created_at || item.date;
                return (
                  <div key={item.id || idx} className="p-2.5 border border-slate-100 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-semibold text-slate-700 dark:text-slate-200">
                        ₦{amount.toLocaleString()} credited
                      </p>
                      {dateStr && (
                        <p className="text-[10px] text-slate-400">
                          {new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      {item.status && (
                        <span className="px-2 py-0.5 text-[9px] rounded-full font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                          {item.status}
                        </span>
                      )}
                      {fee !== undefined && (
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          Fee: ₦{Number(fee).toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 7. Affiliate Promotion Section */}
        <div className="mb-8 p-5 bg-indigo-50/30 dark:bg-indigo-900/10 border border-indigo-100/50 dark:border-indigo-900/30 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <h4 className="font-bold text-slate-800 dark:text-white tracking-tight">Affiliate Promotion</h4>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={affiliateEnabled}
                onChange={(e) => setAffiliateEnabled(e.target.checked)}
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none dark:bg-slate-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>

          {!affiliateEnabled ? (
            <p className="text-xs text-slate-500 leading-relaxed">
              Enable promoters to advertise your event in exchange for a small commission on every sale they generate.
            </p>
          ) : (
            <div className="space-y-4 animate-in fade-in slide-in-from-top-1 duration-300">
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                  Commission Percentage
                </Label>
                <div className="flex flex-wrap gap-2">
                  {[3, 5, 7, 10, 12, 15].map((rate) => (
                    <button
                      key={rate}
                      onClick={() => setCommissionRate(rate)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        commissionRate === rate 
                        ? 'bg-indigo-600 text-white' 
                        : 'bg-white dark:bg-slate-800 text-slate-600 border border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {rate}%
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-3 bg-white dark:bg-slate-900 border border-indigo-100 dark:border-indigo-900/50 rounded-xl shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">Promoters earn:</span>
                  <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">₦{promoterEarnings.toLocaleString()} per sale</span>
                </div>
              </div>

              <div className="flex gap-1.5">
                <Info className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                <p className="text-[10px] text-slate-500 italic">
                  This commission is paid from your earnings, not from BlueSea’s platform fee.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* 8. Action Buttons */}
        <div className="space-y-3">
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handleExportAttendees}
              disabled={exporting}
              className="flex-1 h-11 border-slate-200 dark:border-slate-800"
            >
              <Download className="w-4 h-4 mr-2" />
              {exporting ? 'Exporting...' : 'Attendees'}
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowScannerModal(true)}
              className="flex-1 h-11 border-slate-200 dark:border-slate-800"
            >
              <QrCode className="w-4 h-4 mr-2" />
              Add Scanner
            </Button>
          </div>

          <Button
            onClick={() => setShowWithdrawModal(true)}
            disabled={isWithdrawDisabled}
            className="w-full h-12 bg-green-600 hover:bg-green-700 text-white font-bold shadow-lg shadow-green-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Wallet className="w-4 h-4 mr-2" />
            {withdrawing 
              ? 'Processing...' 
              : isLoadingWithdrawal 
              ? 'Loading Balance...' 
              : availableBalance !== null && availableBalance > 0 
              ? `Withdraw ₦${availableBalance.toLocaleString()}` 
              : 'No Earnings Available to Withdraw'}
          </Button>

          {event.is_approved && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleShareEvent}
                className="flex-[2] h-11 border-slate-200 dark:border-slate-800"
              >
                {shareCopied ? <Check className="w-4 h-4 mr-2 text-green-500" /> : <Share2 className="w-4 h-4 mr-2 text-sky-500" />}
                {shareCopied ? 'Link Copied!' : 'Copy Event Link'}
              </Button>
              <Button
                variant="outline"
                className="flex-1 h-11 border-slate-200 dark:border-slate-800 text-slate-500"
              >
                <Edit3 className="w-4 h-4 mr-2" />
                Edit
              </Button>
            </div>
          )}
        </div>

        {/* Add Scanner Modal */}
        {showScannerModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 w-full max-w-md">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-800 dark:text-white">Add Scanner</h3>
                <button onClick={() => setShowScannerModal(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-slate-700 dark:text-slate-300">Scanner Email</Label>
                  <Input
                    type="email"
                    placeholder="Enter scanner email"
                    value={scannerEmail}
                    onChange={(e) => setScannerEmail(e.target.value)}
                  />
                </div>
                <Button
                  onClick={handleConfirmAddScanner}
                  disabled={addingScanner || !scannerEmail}
                  className="w-full bg-sky-500 hover:bg-sky-600"
                >
                  {addingScanner ? 'Adding...' : 'Confirm Add Scanner'}
                </Button>
              </div>
            </div>
            <PinComponent 
              type="add-scanner" 
              value={{ event_id: event.id, user_email: scannerEmail }} 
              onSuccess={handleScannerSuccess}
              onError={handleScannerError}
              onFailure={handleScannerError}
            />
            <ToastComponent />
          </div>
        )}

        {/* Withdraw Modal */}
        {showWithdrawModal && availableBalance !== null && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 w-full max-w-md shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-800 dark:text-white">Withdraw Funds</h3>
                <button 
                  onClick={() => !withdrawing && setShowWithdrawModal(false)} 
                  disabled={withdrawing}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg disabled:opacity-50"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-4">
                <div className="p-4 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-xl space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Available to Withdraw</span>
                    <span className="font-bold text-slate-800 dark:text-white text-base">₦{availableBalance.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs text-slate-500">
                    <span>Gross Sales Revenue</span>
                    <span>₦{profit.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-medium text-slate-500 dark:text-slate-400">BlueSea Platform Fee</span>
                      <span className="px-1.5 py-0.5 bg-slate-200 dark:bg-slate-700 rounded text-[9px]">10%</span>
                    </div>
                    <span className="font-bold text-red-500">-₦{(availableBalance * 0.1).toLocaleString()}</span>
                  </div>
                  <div className="border-t border-slate-200 dark:border-slate-700 pt-3 flex justify-between items-center">
                    <span className="text-sm font-bold text-slate-800 dark:text-white">Estimated Payout</span>
                    <span className="font-black text-green-600 text-xl">₦{(availableBalance * 0.9).toLocaleString()}</span>
                  </div>
                </div>
                <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-100 dark:border-amber-900/50 flex gap-2">
                  <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-800 dark:text-amber-400 leading-tight">
                    Enter your PIN to withdraw available earnings directly to your wallet.
                  </p>
                </div>
                <Button
                  onClick={handleConfirmWithdraw}
                  disabled={withdrawing || availableBalance <= 0}
                  className="w-full bg-green-600 hover:bg-green-700 h-12 font-bold disabled:opacity-50"
                >
                  {withdrawing ? 'Processing...' : 'Withdraw All to Wallet'}
                </Button>
              </div>
            </div>
            <PinComponent 
              type="event-withdraw" 
              value={{ event_id: event.id }} 
              onSuccess={handleWithdrawSuccess}
              onError={handleWithdrawError}
              onFailure={handleWithdrawError}
            />
            <ToastComponent />
          </div>
        )}
      </div>
    </div>
  );
}