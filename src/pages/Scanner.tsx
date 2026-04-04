import { useState, useEffect, useRef } from 'react';
import { Sidebar, Header, Toast, Loader } from '@/components/ui-custom';
import { Button } from '@/components/ui/button';
import { QrCode, CheckCircle, XCircle, Loader2, Camera } from 'lucide-react';
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
  const [sidebarOpen, setSidebarOpen] = useState(false);
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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0">
        <Header 
          title="Ticket Scanner" 
          subtitle="Scan tickets to validate"
          onMenuClick={() => setSidebarOpen(true)} 
        />

        <main className="flex-1 p-4 md:p-6 overflow-y-auto">
          <div className="max-w-2xl mx-auto space-y-6">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-sky-500" />
              </div>
            ) : assignments.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-12 text-center">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                  <QrCode className="w-10 h-10 text-slate-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-2">
                  No Scanner Assignments
                </h3>
                <p className="text-slate-500 dark:text-slate-400">
                  You don't have any scanner assignments yet. Contact event organizers to get assigned.
                </p>
              </div>
            ) : (
              <>
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-4">
                  <h3 className="font-semibold text-slate-800 dark:text-white mb-4">Select Event</h3>
                  <div className="space-y-2">
                    {assignments.map((assignment) => (
                      <button
                        key={assignment.event_id}
                        onClick={() => setSelectedEvent(assignment)}
                        className={cn(
                          "w-full p-4 rounded-xl border-2 text-left transition-all",
                          selectedEvent?.event_id === assignment.event_id
                            ? 'border-sky-500 bg-sky-50 dark:bg-sky-900/20'
                            : 'border-slate-200 dark:border-slate-700 hover:border-sky-300'
                        )}
                      >
                        <div className="flex gap-3">
                          <div className="w-16 h-16 bg-slate-200 dark:bg-slate-700 rounded-lg overflow-hidden flex-shrink-0">
                            {assignment.event_banner ? (
                              <img src={getImageUrl(assignment.event_banner)} alt={assignment.event_title} className="w-full h-full object-cover" />
                            ) : null}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-slate-800 dark:text-white">
                              {assignment.event_title}
                            </h4>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                              {assignment.event_location}
                            </p>
                            <p className="text-xs text-slate-400 mt-1">
                              {assignment.statistics?.scanned_tickets || 0}/{assignment.statistics?.total_tickets || 0} scanned
                            </p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {!selectedEvent ? null : scanning ? (
                  <div className="bg-black rounded-2xl overflow-hidden">
                    <div className="relative">
                      <div id="qr-reader" ref={qrRef} className="w-full aspect-square"></div>
                      <div className="absolute inset-0 pointer-events-none">
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-64 h-64 border-2 border-white/50 rounded-lg"></div>
                        </div>
                      </div>
                    </div>
                    <div className="p-4 bg-black">
                      <Button 
                        onClick={stopScan}
                        variant="secondary"
                        className="w-full"
                      >
                        Stop Scan
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 text-center">
                      <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-sky-100 dark:bg-sky-900/30 flex items-center justify-center">
                        <Camera className="w-10 h-10 text-sky-500" />
                      </div>
                      <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-2">
                        Ready to Scan
                      </h3>
                      <p className="text-slate-500 dark:text-slate-400 mb-6">
                        Point your camera at a ticket QR code or enter the ticket code manually
                      </p>
                      <Button 
                        onClick={startScan}
                        className="bg-sky-500 hover:bg-sky-600 w-full"
                      >
                        <QrCode className="w-4 h-4 mr-2" />
                        Start Camera Scan
                      </Button>
                    </div>

                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-4">
                      <h4 className="font-medium text-slate-800 dark:text-white mb-3">Or enter ticket code</h4>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={manualCode}
                          onChange={(e) => setManualCode(e.target.value)}
                          placeholder="Enter ticket code"
                          className="flex-1 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                        />
                        <Button 
                          onClick={handleManualScan}
                          className="bg-sky-500 hover:bg-sky-600"
                        >
                          Verify
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </main>
      </div>

      {showModal && scanResult && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-sm">
            <div className="p-6 text-center">
              {scanResult.status === 'valid' ? (
                <>
                  <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                    <CheckCircle className="w-10 h-10 text-green-500" />
                  </div>
                  <h3 className="text-xl font-semibold text-green-600 mb-2">Valid Ticket</h3>
                </>
              ) : (
                <>
                  <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                    <XCircle className="w-10 h-10 text-red-500" />
                  </div>
                  <h3 className="text-xl font-semibold text-red-600 mb-2">
                    {scanResult.status === 'used' ? 'Already Used' : 
                     scanResult.status === 'expired' ? 'Ticket Expired' :
                     scanResult.status === 'canceled' ? 'Ticket Canceled' :
                     scanResult.status === 'transferred' ? 'Ticket Transferred' : 'Invalid'}
                  </h3>
                </>
              )}
              
              <div className="mt-4 space-y-2 text-left bg-slate-50 dark:bg-slate-800 rounded-xl p-4">
                <p className="text-sm">
                  <span className="text-slate-500 dark:text-slate-400">Ticket ID:</span>{' '}
                  <span className="font-medium">{scanResult.ticket_code}</span>
                </p>
                <p className="text-sm">
                  <span className="text-slate-500 dark:text-slate-400">Event:</span>{' '}
                  <span className="font-medium">{scanResult.event_title}</span>
                </p>
                <p className="text-sm">
                  <span className="text-slate-500 dark:text-slate-400">Buyer:</span>{' '}
                  <span className="font-medium">{scanResult.buyer_name}</span>
                </p>
                <p className="text-sm">
                  <span className="text-slate-500 dark:text-slate-400">Status:</span>{' '}
                  <span className={cn(
                    "font-medium",
                    scanResult.status === 'valid' ? 'text-green-500' : 'text-red-500'
                  )}>
                    {scanResult.status}
                  </span>
                </p>
              </div>

              <Button 
                onClick={() => {
                  setShowModal(false);
                  setScanResult(null);
                }}
                className="w-full mt-4 bg-sky-500 hover:bg-sky-600"
              >
                Scan Another
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