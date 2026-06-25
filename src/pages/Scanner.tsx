import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header, Toast, Loader } from '@/components/ui-custom';
import { Button } from '@/components/ui/button';
import { QrCode, CheckCircle, XCircle, Loader2, Camera, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getRequest, postRequest, ENDPOINTS, API_BASE, type ScannerAssignment } from '@/types';

interface ScanResult {
  ticket_id: string;
  event_title: string;
  buyer_name: string;
  status: string;
  ticket_code: string;
}

export function Scanner() {
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState<ScannerAssignment[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<ScannerAssignment | null>(null);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const { showToast, ToastComponent } = Toast();
  const { showLoader, hideLoader, LoaderComponent } = Loader();
  const qrRef = useRef<HTMLDivElement>(null);

  const getImageUrl = (path: string | undefined | null) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    return `${API_BASE}${path}`;
  };

  useEffect(() => {
    fetchAssignments();
  }, []);

  useEffect(() => {
    if (scanning && qrRef.current) {
      initScanner();
    }
    return () => {
      cleanupScanner();
    };
  }, [scanning]);

  const fetchAssignments = async () => {
    try {
      const response = await getRequest(ENDPOINTS.marketplace_my_scanner_assignments);
      if (response?.events) {
        setAssignments(response.events);
      }
    } catch (err) {
      showToast('Failed to fetch scanner assignments');
    } finally {
      setLoading(false);
    }
  };

  let html5QrcodeScanner: any = null;

  const initScanner = async () => {
    try {
      const { Html5Qrcode } = await import('html5-qrcode');
      
      html5QrcodeScanner = new Html5Qrcode("qr-reader");
      
      await html5QrcodeScanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        onScanSuccess,
        onScanFailure
      );
    } catch (err: any) {
      showToast(err.message || 'Failed to start camera');
      setScanning(false);
    }
  };

  const cleanupScanner = async () => {
    if (html5QrcodeScanner) {
      try {
        await html5QrcodeScanner.stop();
      } catch (err) {}
    }
  };

  const onScanSuccess = async (decodedText: string) => {
    await cleanupScanner();
    setScanning(false);
    await scanTicket(decodedText);
  };

  const onScanFailure = () => {};

  const scanTicket = async (ticketCode: string) => {
    try {
      showLoader();
      const response = await postRequest(ENDPOINTS.scan_ticket, { qr_data: ticketCode });
      hideLoader();
      
      if (response?.ticket_details) {
        setScanResult({
          ticket_id: response.ticket_details.ticket_id || '',
          event_title: response.ticket_details.event?.title || '',
          buyer_name: response.ticket_details.owner_name || '',
          status: response.scan_result === 'success' ? 'valid' : response.ticket_details.status || 'invalid',
          ticket_code: ticketCode,
        });
        setShowModal(true);
      } else if (response?.error) {
        showToast(response.error);
        setScanResult({
          ticket_id: '',
          event_title: '',
          buyer_name: '',
          status: 'invalid',
          ticket_code: ticketCode,
        });
        setShowModal(true);
      } else {
        showToast('Invalid ticket');
      }
    } catch (err) {
      hideLoader();
      showToast('Failed to scan ticket');
    }
  };

  const handleManualScan = async () => {
    if (!manualCode.trim()) {
      showToast('Please enter ticket code');
      return;
    }
    await scanTicket(manualCode.trim());
  };

  const startScan = () => {
    setScanResult(null);
    setShowModal(false);
    setScanning(true);
  };

  const stopScan = async () => {
    await cleanupScanner();
    setScanning(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col w-full transition-colors duration-300">
      
      <Header 
        title="Ticket Scanner" 
        subtitle="Scan tickets to validate"
      />

      {/* Structural Back Navigation Control Anchor Row */}
      <div className="w-full border-b border-slate-200/60 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
        <div className="max-w-2xl mx-auto px-4 md:px-6 py-3 flex items-center justify-between">
          <button 
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Go Back
          </button>
          <span className="text-[10px] font-bold tracking-wider uppercase text-slate-400 dark:text-slate-500 hidden sm:inline-block">
            Validation Node Terminal
          </span>
        </div>
      </div>

      {/* Primary Workspace Centered Viewport Panel */}
      <main className="flex-1 p-4 md:p-6 overflow-y-auto w-full">
        <div className="max-w-2xl mx-auto space-y-6">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="w-8 h-8 animate-spin text-sky-500" />
            </div>
          ) : assignments.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-12 text-center shadow-sm">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                <QrCode className="w-10 h-10 text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-2">
                No Scanner Assignments
              </h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm max-w-sm mx-auto">
                You don't have any active scanner assignments yet. Contact event organizers to configure access parameters.
              </p>
            </div>
          ) : (
            <>
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-4 shadow-sm">
                <h3 className="font-semibold text-sm text-slate-800 dark:text-white mb-4 uppercase tracking-wider text-[11px] text-slate-400 dark:text-slate-500">Select Active Context Event</h3>
                <div className="space-y-2">
                  {assignments.map((assignment) => (
                    <button
                      key={assignment.event_id}
                      onClick={() => setSelectedEvent(assignment)}
                      className={cn(
                        "w-full p-4 rounded-xl border-2 text-left transition-all active:scale-[0.99]",
                        selectedEvent?.event_id === assignment.event_id
                          ? 'border-sky-500 bg-sky-50 dark:bg-sky-900/20'
                          : 'border-slate-200 dark:border-slate-800 hover:border-sky-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
                      )}
                    >
                      <div className="flex gap-4">
                        <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 rounded-xl overflow-hidden flex-shrink-0">
                          {assignment.event_banner ? (
                            <img src={getImageUrl(assignment.event_banner)} alt={assignment.event_title} className="w-full h-full object-cover" />
                          ) : null}
                        </div>
                        <div className="flex-1 min-w-0 flex flex-col justify-center">
                          <h4 className="font-semibold text-sm text-slate-800 dark:text-white truncate">
                            {assignment.event_title}
                          </h4>
                          <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                            {assignment.event_location}
                          </p>
                          <p className="text-[10px] font-bold text-slate-400 mt-1.5 uppercase tracking-wide">
                            Metrics: {assignment.statistics?.scanned_tickets || 0} / {assignment.statistics?.total_tickets || 0} processed
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {!selectedEvent ? null : scanning ? (
                <div className="bg-black rounded-3xl overflow-hidden shadow-xl max-w-md mx-auto border border-slate-800">
                  <div className="relative">
                    <div id="qr-reader" ref={qrRef} className="w-full aspect-square"></div>
                    <div className="absolute inset-0 pointer-events-none">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-64 h-64 border-2 border-dashed border-sky-500 rounded-2xl animate-pulse"></div>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 bg-slate-950 border-t border-slate-900">
                    <Button 
                      onClick={stopScan}
                      variant="secondary"
                      className="w-full bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 text-xs font-bold py-2.5 rounded-xl"
                    >
                      Stop Camera Session
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 text-center shadow-sm">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-sky-100 dark:bg-sky-900/30 flex items-center justify-center border border-sky-200/20">
                      <Camera className="w-8 h-8 text-sky-500" />
                    </div>
                    <h3 className="text-base font-semibold text-slate-800 dark:text-white mb-1">
                      Optical Diagnostics Ready
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 max-w-sm mx-auto">
                      Align the device camera target frame directly over the designated ticket QR token footprint.
                    </p>
                    <Button 
                      onClick={startScan}
                      className="bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs py-2.5 rounded-xl w-full transition-all shadow-sm shadow-sky-500/10"
                    >
                      <QrCode className="w-4 h-4 mr-2" />
                      Initialize Live Camera Feed
                    </Button>
                  </div>

                  <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-4 shadow-sm">
                    <h4 className="font-medium text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">Manual Override Input Vector</h4>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={manualCode}
                        onChange={(e) => setManualCode(e.target.value)}
                        placeholder="Enter 10-digit serial identifier"
                        className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-sky-500 transition-all placeholder:text-slate-400"
                      />
                      <Button 
                        onClick={handleManualScan}
                        className="bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold px-5 rounded-xl transition-all"
                      >
                        Verify Node
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* Verification Overlay Modal Dialog Container */}
      {showModal && scanResult && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-sm border border-slate-100 dark:border-slate-800 shadow-2xl p-6 overflow-hidden transform scale-100 transition-all">
            <div className="text-center">
              {scanResult.status === 'valid' ? (
                <>
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center border border-emerald-500/10">
                    <CheckCircle className="w-8 h-8 text-emerald-500 stroke-[2.5]" />
                  </div>
                  <h3 className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400">Authorization Validated</h3>
                </>
              ) : (
                <>
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center border border-rose-500/10">
                    <XCircle className="w-8 h-8 text-rose-500 stroke-[2.5]" />
                  </div>
                  <h3 className="text-lg font-extrabold text-rose-600 dark:text-rose-400">
                    {scanResult.status === 'used' ? 'Token Already Redeemed' : 
                     scanResult.status === 'expired' ? 'Parameter Expired' :
                     scanResult.status === 'canceled' ? 'Order Deactivated' :
                     scanResult.status === 'transferred' ? 'Ownership Migrated' : 'Invalid Signature'}
                  </h3>
                </>
              )}
              
              <div className="mt-5 space-y-2 text-left bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800 rounded-xl p-4">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider text-[10px]">Reference</span>
                  <span className="font-mono font-bold text-slate-700 dark:text-slate-300">{scanResult.ticket_code}</span>
                </div>
                <div className="flex justify-between items-center text-xs pt-2 border-t border-slate-100 dark:border-slate-900">
                  <span className="text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider text-[10px]">Event Track</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[160px]">{scanResult.event_title}</span>
                </div>
                <div className="flex justify-between items-center text-xs pt-2 border-t border-slate-100 dark:border-slate-900">
                  <span className="text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider text-[10px]">Assigned Entity</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[160px]">{scanResult.buyer_name}</span>
                </div>
                <div className="flex justify-between items-center text-xs pt-2 border-t border-slate-100 dark:border-slate-900">
                  <span className="text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider text-[10px]">State Check</span>
                  <span className={cn(
                    "font-bold uppercase text-[10px] tracking-wider px-2 py-0.5 rounded-md",
                    scanResult.status === 'valid' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'
                  )}>
                    {scanResult.status}
                  </span>
                </div>
              </div>

              <Button 
                onClick={() => {
                  setShowModal(false);
                  setScanResult(null);
                }}
                className="w-full mt-5 bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold py-2.5 rounded-xl transition-all"
              >
                Clear Matrix / Scan Next
              </Button>
            </div>
          </div>
        </div>
      )}

      <ToastComponent />
      <LoaderComponent />
    </div>
  ); 
}
