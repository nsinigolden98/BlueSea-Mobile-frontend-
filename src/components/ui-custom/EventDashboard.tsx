import { useState } from 'react';
import { Calendar, MapPin, X, Ticket, TrendingUp, QrCode, Download, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { MarketplaceEvent } from '@/types';
import { ENDPOINTS, postRequest,TOKEN } from '@/types';
import { PinModal,Toast } from '@/components/ui-custom';
import { NIGERIAN_BANKS } from '@/data'
interface EventDashboardProps {
  event: MarketplaceEvent | null;
  onClose: () => void;
}

export function EventDashboard({ event, onClose }: EventDashboardProps) {
  const [exporting, setExporting] = useState(false);
  const [showScannerModal, setShowScannerModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [scannerEmail, setScannerEmail] = useState('');
  const [addingScanner, setAddingScanner] = useState(false);
  const [selectedBank, setSelectedBank] = useState('');
  const [bankSearch, setBankSearch] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [verifyingAccount, setVerifyingAccount] = useState(false);
  const [accountVerified, setAccountVerified] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);
  const { showPinModal, PinComponent } = PinModal();
  const { ToastComponent, showToast} = Toast();

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

  const handleVerifyAccount = async () => {
    if (!selectedBank || !accountNumber || accountNumber.length !== 10) return;
    setVerifyingAccount(true);
    setAccountName('');
    setAccountVerified(false);
    try {
      const payload =  {
          account_number: accountNumber,
          bank_code: selectedBank,
        }
      const response = await postRequest(ENDPOINTS.verify_account_name, payload);
      
      if (response.success) {
        setAccountName(response.account_name);
        setAccountVerified(true);
      } else {
        showToast(response.message || 'Failed to verify account');
      }
    } catch (error) {
      console.error('Verify failed:', error);
    } finally {
      setVerifyingAccount(false);
    }
  };

  const handleConfirmWithdraw = () => {
    if (!event || !accountVerified || !withdrawAmount) return;
    setWithdrawing(true);
    showPinModal();
  };

  if (!event) return null;

  const calculateProfit = (evt: MarketplaceEvent) => {
    let total = 0;
    if (evt.ticket_types && evt.ticket_types.length > 0) {
      evt.ticket_types.forEach(tt => {
        const available = Number(tt.quantity_available);
        const sold = Number(tt.initial_quantity) - available
        total += sold * Number(tt.price);
      });
    }
    return total;
  };

  const profit = calculateProfit(event);
  const soldPercent = event.total_tickets > 0 
  ? (event.tickets_sold / event.total_tickets * 100).toFixed(1) 
  : '0';

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-slate-800 dark:text-white">Event Dashboard</h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mb-6">
          <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">
            {event.event_title}
          </h3>
          <div className="flex items-center gap-4 text-sm text-slate-500">
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {new Date(event.event_date).toLocaleDateString('en-US', { 
                weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' 
              })}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              {event.event_location}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-sky-50 dark:bg-sky-900/20 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Ticket className="w-5 h-5 text-sky-500" />
              <span className="text-sm text-slate-500">Tickets Sold</span>
            </div>
            <p className="text-2xl font-bold text-sky-600 dark:text-sky-400">
              {event.tickets_sold}
            </p>
            <p className="text-xs text-slate-500">
              of {event.total_tickets} available
            </p>
          </div>

          <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-green-500" />
              <span className="text-sm text-slate-500"> Profit</span>
            </div>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              ₦{profit.toLocaleString()}
            </p>
            <p className="text-xs text-slate-500">
              {soldPercent}% sold
            </p>
          </div>
        </div>

        {event.ticket_types && event.ticket_types.length > 0 && (
          <div className="mb-6">
            <h4 className="font-semibold text-slate-800 dark:text-white mb-3">Ticket Types</h4>
            <div className="space-y-3">
              {event.ticket_types.map((tt, idx) => {
                const not_sold = Number(tt.quantity_available) ;
                const profit = (Number(tt.initial_quantity) - not_sold) * Number(tt.price);
                return (
                  <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                    <div>
                      <p className="font-medium text-slate-800 dark:text-white">{tt.name}</p>
                      <p className="text-sm text-slate-500">₦{Number(tt.price).toLocaleString()} each</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-slate-800 dark:text-white">{not_sold} ticket(s) available</p>
                      <p className="text-sm text-green-600">+₦{profit.toLocaleString()}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={handleExportAttendees}
            disabled={exporting}
            className="flex-1"
          >
            <Download className="w-4 h-4 mr-2" />
            {exporting ? 'Exporting...' : 'Export Attendees'}
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowScannerModal(true)}
            className="flex-1"
          >
            <QrCode className="w-4 h-4 mr-2" />
            Add Scanner
          </Button>
        </div>
        <Button
          variant="outline"
          onClick={() => setShowWithdrawModal(true)}
          disabled={profit <= 0}
          className="w-full mt-3"
        >
          <Wallet className="w-4 h-4 mr-2" />
          Withdraw
        </Button>

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
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 w-full max-w-md">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-800 dark:text-white">Withdraw Funds</h3>
                <button onClick={() => setShowWithdrawModal(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-slate-700 dark:text-slate-300">Account Number</Label>
                  <Input
                    type="text"
                    placeholder="Enter account number"
                    value={accountNumber}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                      setAccountNumber(val);
                      setAccountVerified(false);
                      setAccountName('');
                    }}
                    maxLength={10}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-700 dark:text-slate-300">Select Bank</Label>
                  <Input
                    type="text"
                    placeholder="Search bank name..."
                    value={bankSearch}
                    onChange={(e) => setBankSearch(e.target.value)}
                    className="mb-2"
                  />
                  <select
                    value={selectedBank}
                    onChange={(e) => {
                      setSelectedBank(e.target.value);
                      setAccountVerified(false);
                      setAccountName('');
                      setBankSearch('');
                    }}
                    className="w-full p-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700"
                  >
                    <option value="">Select bank</option>
                    {NIGERIAN_BANKS.filter(b => 
                      bankSearch === '' || b.name.toLowerCase().includes(bankSearch.toLowerCase())
                    ).map((bank) => (
                      <option key={bank.code} value={bank.code}>
                        {bank.name}
                      </option>
                    ))}
                  </select>
                </div>
                {selectedBank && accountNumber.length === 10 && (
                  <Button
                    onClick={handleVerifyAccount}
                    disabled={verifyingAccount}
                    variant="outline"
                    className="w-full"
                  >
                    {verifyingAccount ? 'Verifying...' : 'Verify Account'}
                  </Button>
                )}
                {accountVerified && (
                  <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <p className="text-sm text-green-600 dark:text-green-400">{accountName}</p>
                  </div>
                )}
                <div className="space-y-2">
                  <Label className="text-slate-700 dark:text-slate-300">Amount (₦)</Label>
                  <Input
                    type="number"
                    placeholder="Enter amount"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                  />
                  <p className="text-xs text-slate-500">Available: ₦{profit.toLocaleString()}</p>
                </div>
                <Button
                  onClick={handleConfirmWithdraw}
                  disabled={withdrawing || !accountVerified || !withdrawAmount || Number(withdrawAmount) > profit}
                  className="w-full bg-green-500 hover:bg-green-600"
                >
                  {withdrawing ? 'Processing...' : 'Confirm Withdrawal'}
                </Button>
              </div>
            </div>
            <ToastComponent />
              <PinComponent type="event-withdraw" value={  {
        event_id: event.id,
        account_name: accountName,
        account_number: accountNumber,
        bank_code: selectedBank,
        bank_name: NIGERIAN_BANKS.find(b => b.code === selectedBank)?.name || '',
        amount: withdrawAmount,
      }} />

          </div>
        )}

      </div>
    </div>
  );
}