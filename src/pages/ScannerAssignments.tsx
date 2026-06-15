import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar, Header, Loader } from '@/components/ui-custom';
import { getRequest, postRequest, ENDPOINTS, API_BASE } from '@/types';
import { cn } from '@/lib/utils';
// FIX: Added missing Button import
import { Button } from '@/components/ui/button'; 
import { 
  QrCode, 
  MapPin, 
  Calendar,
  Loader2,
  Scan,
  Check,
  X,
  Clock
} from 'lucide-react';

interface ScannerAssignment {
  event_id: string;
  event_title: string;
  event_date: string;
  event_location: string;
  event_banner: string | null;
  vendor: string;
  role: 'scanner' | 'vendor';
  status?: 'pending' | 'accepted' | 'rejected' | 'active' | 'completed' | 'expired' | string;
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
      console.log("Scanner Assignments Response:", response);
      
      if (response) {
        const rawAssignments = response.events || response.assignments || response.data || response.results || [];
        
        const mappedData: ScannerAssignment[] = Array.isArray(rawAssignments) 
          ? rawAssignments.map((api: any) => ({
              event_id: api.event_id || api.id || '',
              event_title: api.event_title || api.title || api.event_name || 'Untitled Event',
              event_date: api.event_date || api.date || api.start_date || '',
              event_location: api.event_location || api.location || api.venue || 'No Location Provided',
              event_banner: api.event_banner || api.banner || api.image || null,
              vendor: api.vendor || api.organizer || api.host || 'Unknown Vendor',
              role: api.role || 'scanner',
              status: api.status || undefined,
              statistics: {
                total_tickets: api.statistics?.total_tickets ?? api.total_tickets ?? 0,
                scanned_tickets: api.statistics?.scanned_tickets ?? api.scanned_tickets ?? 0,
                remaining: api.statistics?.remaining ?? api.remaining ?? 0,
              },
              assigned_at: api.assigned_at || api.created_at || '',
            }))
          : [];

        setAssignments(mappedData);
      }
    } catch (error) {
      console.error('Failed to load scanner assignments:', error);
    } finally {
      hideLoader();
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (eventId: string, action: 'accept' | 'reject') => {
    try {
      showLoader();
      let endpoint = '';
      
      // FIX: Cast ENDPOINTS to any here to stop TypeScript from failing the build 
      // over keys not explicitly declared in your config.
      const anyEndpoints = ENDPOINTS as any;

      if (action === 'accept') {
        endpoint = typeof anyEndpoints.marketplace_accept_assignment === 'function'
          ? anyEndpoints.marketplace_accept_assignment(eventId)
          : `/api/v1/marketplace/assignments/${eventId}/accept`;
      } else {
        endpoint = typeof anyEndpoints.marketplace_reject_assignment === 'function'
          ? anyEndpoints.marketplace_reject_assignment(eventId)
          : `/api/v1/marketplace/assignments/${eventId}/reject`;
      }

      const response = await postRequest(endpoint, {});
      if (response && (response.success || response.status === 'success')) {
        await fetchAssignments();
      }
    } catch (error) {
      console.error(`Failed to ${action} scanner assignment:`, error);
    } finally {
      hideLoader();
    }
  };

  const getImageUrl = (path: string | undefined | null) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    return `${API_BASE || ''}${path}`;
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Date TBD';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch (e) {
      return dateString;
    }
  };

  const goToScanner = (eventId: string) => {
    navigate(`/scanner?event=${eventId}`);
  };

  const hasStatusSupport = assignments.some(a => a.status !== undefined);
  const activeAssignments = hasStatusSupport 
    ? assignments.filter(a => a.status === 'active' || a.status === 'accepted' || a.status === 'pending')
    : assignments;
  const completedAssignments = hasStatusSupport ? assignments.filter(a => a.status === 'completed') : [];
  const pastAssignments = hasStatusSupport ? assignments.filter(a => a.status === 'expired' || a.status === 'rejected') : [];

  const renderAssignmentCard = (assignment: ScannerAssignment) => (
    <div
      key={assignment.event_id}
      className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden flex flex-col justify-between"
    >
      <div>
        {assignment.event_banner && (
          <div className="h-32 bg-slate-200 dark:bg-slate-800 relative">
            <img 
              src={getImageUrl(assignment.event_banner)} 
              alt={assignment.event_title}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          </div>
        )}
        
        <div className="p-5">
          <div className="flex items-start justify-between gap-3 mb-4">
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h3 className="text-lg font-semibold text-slate-800 dark:text-white truncate">
                  {assignment.event_title}
                </h3>
                <span className={cn(
                  'px-2 py-0.5 text-xs font-medium rounded-full shrink-0',
                  assignment.role === 'vendor'
                    ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400'
                    : 'bg-sky-100 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400'
                )}>
                  {assignment.role === 'vendor' ? 'Organizer' : 'Scanner'}
                </span>
                
                {assignment.status && (
                  <span className={cn(
                    'px-2 py-0.5 text-xs font-medium rounded-full flex items-center gap-1 shrink-0',
                    assignment.status === 'pending' && 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400',
                    assignment.status === 'accepted' && 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400',
                    assignment.status === 'active' && 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
                    assignment.status === 'completed' && 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400',
                    assignment.status === 'rejected' && 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400',
                    assignment.status === 'expired' && 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                  )}>
                    {assignment.status === 'pending' && <Clock className="w-3 h-3" />}
                    {assignment.status}
                  </span>
                )}
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 truncate">
                by {assignment.vendor}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 text-sm mb-4">
            <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
              <Calendar className="w-4 h-4 shrink-0" />
              <span className="truncate">{formatDate(assignment.event_date)}</span>
            </div>
            <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
              <MapPin className="w-4 h-4 shrink-0" />
              <span className="truncate">{assignment.event_location}</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-3 text-center">
              <p className="text-xl font-bold text-slate-800 dark:text-white">
                {assignment.statistics?.total_tickets ?? 0}
              </p>
              <p className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400">Total</p>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-3 text-center">
              <p className="text-xl font-bold text-green-500">
                {assignment.statistics?.scanned_tickets ?? 0}
              </p>
              <p className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400">Scanned</p>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-3 text-center">
              <p className="text-xl font-bold text-sky-500">
                {assignment.statistics?.remaining ?? 0}
              </p>
              <p className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400">Remaining</p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-5 pt-0 mt-auto border-t border-slate-50 dark:border-slate-800/50">
        <div className="pt-4">
          {assignment.status === 'pending' ? (
            <div className="flex gap-2">
              <Button 
                onClick={() => handleUpdateStatus(assignment.event_id, 'reject')}
                variant="outline" 
                className="flex-1 border-red-200 hover:bg-red-50 text-red-600 dark:border-red-900/30 dark:hover:bg-red-950/20"
              >
                <X className="w-4 h-4 mr-2" /> Reject
              </Button>
              <Button 
                onClick={() => handleUpdateStatus(assignment.event_id, 'accept')}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                <Check className="w-4 h-4 mr-2" /> Accept
              </Button>
            </div>
          ) : assignment.status === 'rejected' ? (
            <div className="w-full text-center text-sm font-medium text-red-500 bg-red-50 dark:bg-red-950/20 py-2.5 rounded-xl">
              Assignment Rejected
            </div>
          ) : (
            <Button
              onClick={() => goToScanner(assignment.event_id)}
              className="w-full bg-sky-500 hover:bg-sky-600 text-white shadow-sm font-medium rounded-xl"
            >
              <Scan className="w-4 h-4 mr-2" /> Open Scanner
            </Button>
          )}
        </div>
      </div>
    </div>
  );

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
          <div className="max-w-6xl mx-auto space-y-8">
            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-sky-500" />
              </div>
            ) : assignments.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-12 text-center max-w-3xl mx-auto">
                <QrCode className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600 mb-4" />
                <p className="text-slate-500 dark:text-slate-400">No scanner assignments</p>
                <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">
                  Contact event organizers to get scanner access
                </p>
              </div>
            ) : (
              <>
                {activeAssignments.length > 0 && (
                  <div className="space-y-4">
                    {hasStatusSupport && <h2 className="text-base font-semibold text-slate-700 dark:text-slate-300 px-1">Active Assignments</h2>}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {activeAssignments.map(renderAssignmentCard)}
                    </div>
                  </div>
                )}

                {completedAssignments.length > 0 && (
                  <div className="space-y-4 pt-4">
                    <h2 className="text-base font-semibold text-slate-700 dark:text-slate-300 px-1">Completed Assignments</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 opacity-75">
                      {completedAssignments.map(renderAssignmentCard)}
                    </div>
                  </div>
                )}

                {pastAssignments.length > 0 && (
                  <div className="space-y-4 pt-4">
                    <h2 className="text-base font-semibold text-slate-700 dark:text-slate-300 px-1">Past & Rejected Assignments</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 opacity-60">
                      {pastAssignments.map(renderAssignmentCard)}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </main>
      </div>

      <LoaderComponent />
    </div>
  );
}
