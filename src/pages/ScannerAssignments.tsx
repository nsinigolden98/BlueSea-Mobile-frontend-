import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar, Header, Loader } from '@/components/ui-custom';
import { getRequest, ENDPOINTS } from '@/types';
import { cn } from '@/lib/utils';
import { 
  QrCode, 
  MapPin, 
  Calendar,
  Loader2,
  Scan,
} from 'lucide-react';

interface ScannerAssignment {
  event_id: string;
  event_title: string;
  event_date: string;
  event_location: string;
  event_banner: string | null;
  vendor: string;
  role: 'scanner' | 'vendor';
  statistics: {
    total_tickets: number;
    scanned_tickets: number;
    remaining: number;
  };
  assigned_at: string;
}

export function ScannerAssignments() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [assignments, setAssignments] = useState<ScannerAssignment[]>([]);
  const navigate = useNavigate();
  const { LoaderComponent, showLoader, hideLoader } = Loader();

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      showLoader();
      
      const response = await getRequest(ENDPOINTS.marketplace_my_scanner_assignments);
      if (response && response.success) {
        setAssignments(response.assignments || []);
      }
    } catch (error) {
      console.error('Failed to load scanner assignments:', error);
    } finally {
      hideLoader();
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const goToScanner = (eventId: string) => {
    navigate(`/scanner?event=${eventId}`);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0">
        <Header 
          title="Scanner Assignments" 
          subtitle="Events you're assigned to scan"
          onMenuClick={() => setSidebarOpen(true)} 
        />

        <main className="flex-1 p-4 md:p-6 overflow-y-auto">
          <div className="max-w-3xl mx-auto space-y-4">
            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-sky-500" />
              </div>
            ) : assignments.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-12 text-center">
                <QrCode className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600 mb-4" />
                <p className="text-slate-500 dark:text-slate-400">No scanner assignments</p>
                <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">
                  Contact event organizers to get scanner access
                </p>
              </div>
            ) : (
              assignments.map((assignment) => (
                <div
                  key={assignment.event_id}
                  className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden"
                >
                  {assignment.event_banner && (
                    <div className="h-32 bg-slate-200 dark:bg-slate-800 relative">
                      <img 
                        src={assignment.event_banner} 
                        alt={assignment.event_title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    </div>
                  )}
                  
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg font-semibold text-slate-800 dark:text-white">
                            {assignment.event_title}
                          </h3>
                          <span className={cn(
                            'px-2 py-0.5 text-xs font-medium rounded-full',
                            assignment.role === 'vendor'
                              ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400'
                              : 'bg-sky-100 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400'
                          )}>
                            {assignment.role === 'vendor' ? 'Organizer' : 'Scanner'}
                          </span>
                        </div>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          by {assignment.vendor}
                        </p>
                      </div>
                      <button
                        onClick={() => goToScanner(assignment.event_id)}
                        className="p-3 bg-sky-500 hover:bg-sky-600 rounded-xl text-white transition-colors"
                      >
                        <Scan className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-4 text-sm mb-4">
                      <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(assignment.event_date)}</span>
                      </div>
                      <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                        <MapPin className="w-4 h-4" />
                        <span>{assignment.event_location}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-3 text-center">
                        <p className="text-2xl font-bold text-slate-800 dark:text-white">
                          {assignment.statistics.total_tickets}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Total</p>
                      </div>
                      <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-3 text-center">
                        <p className="text-2xl font-bold text-green-500">
                          {assignment.statistics.scanned_tickets}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Scanned</p>
                      </div>
                      <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-3 text-center">
                        <p className="text-2xl font-bold text-sky-500">
                          {assignment.statistics.remaining}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Remaining</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </main>
      </div>

      <LoaderComponent />
    </div>
  );
}