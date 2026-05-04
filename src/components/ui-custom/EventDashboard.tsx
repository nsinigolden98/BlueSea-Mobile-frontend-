import { useState } from 'react';
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
  AlertTriangle, 
  Edit3, 
  Info,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import type { MarketplaceEvent } from '@/types';
import { ENDPOINTS, TOKEN } from '@/types';
import { PinModal, Toast } from '@/components/ui-custom';

interface EventDashboardProps {
  event: MarketplaceEvent | null;
  onClose: () => void;
}

export function EventDashboard({ event, onClose }: EventDashboardProps) {
  const [exporting, setExporting] = useState(false);
  const [showScannerModal, setShowScannerModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [scannerEmail, setScannerEmail] = useState('');
  const [addingScanner, setAddingScanner] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);
  
  // Affiliate States
  const [affiliateEnabled, setAffiliateEnabled] = useState(false);
  const [commissionRate, setCommissionRate] = useState(5);
  const [cancelReason, setCancelReason] = useState('');

  const { showPinModal, PinComponent } = PinModal();
  const { ToastComponent, showToast } = Toast();

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
      const response = await fetch(ENDPOINTS.export_attendees(event!.id), {
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
    } finally {
      setExporting(false);
    }
  };

  const handleConfirmAddScanner = () => {
    if (!event || !scannerEmail) return;
    setAddingScanner(true);
    showPinModal();
  };

  const handleConfirmWithdraw = () => {
    if (!event || profit <= 0) return;
    setWithdrawing(true);
    showPinModal();
  };

  const handleRequestCancellation = () => {
    showToast('Cancellation request sent successfully.');
    setShowCancelModal(false);
    setCancelReason('');
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

  // Affiliate Preview Logic
  const baseTicketPrice = event.ticket_types?.[0] ? Number(event.ticket_types[0].price) : 0;
  const promoterEarnings = (baseTicketPrice * commissionRate) / 100;

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

        {/* 3. Ticket Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
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
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Revenue</span>
            </div>
            <p className="text-2xl font-bold text-slate-800 dark:text-white">
              ₦{profit.toLocaleString()}
            </p>
            <p className="text-[10px] text-green-600 dark:text-green-400 mt-2 font-medium">
              {soldPercent}% of capacity reached
            </p>
          </div>
        </div>

        {/* 4. Ticket Types */}
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
{/* 5. Affiliate Promotion Section */}
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

        {/* 6. Action Buttons */}
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
            disabled={profit <= 0}
            className="w-full h-12 bg-green-600 hover:bg-green-700 text-white font-bold shadow-lg shadow-green-500/20"
          >
            <Wallet className="w-4 h-4 mr-2" />
            Withdraw Earnings
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

        {/* 7. Cancellation Request Area */}
        <div className="mt-10 pt-6 border-t border-slate-100 dark:border-slate-800 text-center">
          <button 
            onClick={() => setShowCancelModal(true)}
            className="text-[11px] font-medium text-slate-400 hover:text-red-500 flex items-center justify-center gap-1.5 mx-auto transition-colors group"
          >
            <AlertTriangle className="w-3.5 h-3.5 opacity-50 group-hover:opacity-100" />
            Request Event Cancellation
          </button>
        </div>

        {/* Cancellation Modal */}
        {showCancelModal && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] p-4 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 w-full max-w-md shadow-2xl border border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-red-600">
                  <AlertTriangle className="w-5 h-5" />
                  <h3 className="text-lg font-bold">Cancel Event</h3>
                </div>
                <button onClick={() => setShowCancelModal(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-4">
                <p className="text-sm text-slate-500 leading-relaxed">
                  Cancellation requests are reviewed before approval. Please tell us why you want to cancel this event.
                </p>
                <div className="space-y-2">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Reason for Cancellation</Label>
                  <textarea
                    className="w-full h-24 p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 ring-sky-500 outline-none transition-all dark:text-white"
                    placeholder="e.g. Schedule change, venue issues..."
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                  />
                </div>
                <Button
                  onClick={handleRequestCancellation}
                  disabled={!cancelReason}
                  className="w-full bg-red-500 hover:bg-red-600 text-white font-bold h-11"
                >
                  Send Cancellation Request
                </Button>
              </div>
            </div>
          </div>
        )}

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
            <PinComponent type="add-scanner" value={ { event_id: event.id, user_email: scannerEmail }} />
          </div>
        )}

        {/* Withdraw Modal */}
        {showWithdrawModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 w-full max-w-md shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-800 dark:text-white">Withdraw Funds</h3>
                <button onClick={() => setShowWithdrawModal(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-4">
                <div className="p-4 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-xl space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Gross Revenue</span>
                    <span className="font-bold text-slate-800 dark:text-white">₦{profit.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-medium text-slate-500 dark:text-slate-400">BlueSea Fee</span>
                      <span className="px-1.5 py-0.5 bg-slate-200 dark:bg-slate-700 rounded text-[9px]">10%</span>
                    </div>
                    <span className="font-bold text-red-500">-₦{(profit * 0.1).toLocaleString()}</span>
                  </div>
                  <div className="border-t border-slate-200 dark:border-slate-700 pt-3 flex justify-between items-center">
                    <span className="text-sm font-bold text-slate-800 dark:text-white">Final Payout</span>
                    <span className="font-black text-green-600 text-xl">₦{(profit * 0.9).toLocaleString()}</span>
                  </div>
                </div>
                <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-100 dark:border-amber-900/50 flex gap-2">
                  <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-800 dark:text-amber-400 leading-tight">
                    Enter your pin to withdraw all available funds to your wallet.
                  </p>
                </div>
                <Button
                  onClick={handleConfirmWithdraw}
                  disabled={withdrawing || profit <= 0}
                  className="w-full bg-green-600 hover:bg-green-700 h-12 font-bold"
                >
                  {withdrawing ? 'Processing...' : 'Withdraw All to Wallet'}
                </Button>
              </div>
            </div>
            <PinComponent type={'event-withdraw'} value={{
              event_id: event.id
            }}  />
            <ToastComponent />
          </div>
        )}
      </div>
    </div>
  );
}