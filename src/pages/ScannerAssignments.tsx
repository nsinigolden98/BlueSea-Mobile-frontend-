import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar, Header, Loader } from '@/components/ui-custom';
import { getRequest, postRequest, ENDPOINTS, API_BASE } from '@/types';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button'; 
import { 
  QrCode, 
  MapPin, 
  Calendar,
  Loader2,
  Scan,
  Check,
  X,
  Clock,
  ChevronRight,
  Ticket,
  CheckCircle2,
  AlertCircle
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

        const deduplicatedData = mappedData.filter((item, index, self) =>
          index === self.findIndex((t) => t.event_id === item.event_id)
        );

        setAssignments(deduplicatedData);
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

  const currentAssignments = assignments.filter(
    a => !a.status || ['active', 'accepted', 'pending'].includes(a.status)
  );
  
  const historyAssignments = assignments.filter(
    a => a.status && ['completed', 'expired', 'rejected'].includes(a.status)
  );

  const renderAssignmentCard = (assignment: ScannerAssignment) => {
    const hasBanner = !!assignment.event_banner;
    
    return (
      <div
        key={assignment.event_id}
        className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800/80 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col justify-between group"
      >
        <div>
          <div className="h-44 relative w-full bg-slate-900 overflow-hidden flex flex-col justify-end p-4">
            ={hasBanner ? (
              <img 
                src={getImageUrl(assignment.event_banner)} 
                alt={assignment.event_title}
                className="w-full h-full object-cover absolute inset-0 transition-transform duration-500 group-hover:scale-105"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 opacity-90" />
            )}
            
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-black/20" />

            <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5">
              {assignment.status ? (
                <span className={cn(
                  'px-2.5 py-1 text-[11px] font-semibold tracking-wide uppercase rounded-md shadow-sm flex items-center gap-1 backdrop-blur-md border',
                  assignment.status === 'pending' && 'bg-amber-500/20 text-amber-400 border-amber-500/30',
                  assignment.status === 'accepted' && 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
                  assignment.status === 'active' && 'bg-blue-500/20 text-blue-400 border-blue-500/30 animate-pulse',
                  assignment.status === 'completed' && 'bg-slate-500/20 text-slate-300 border-slate-500/30',
                  assignment.status === 'rejected' && 'bg-rose-500/20 text-rose-400 border-rose-500/30',
                  assignment.status === 'expired' && 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30'
                )}>
                  {assignment.status === 'pending' && <Clock className="w-3 h-3" />}
                  {assignment.status}
                </span>
              ) : (
                <span className="px-2.5 py-1 text-[11px] font-semibold tracking-wide uppercase rounded-md shadow-sm bg-blue-500/20 text-blue-400 border border-blue-500/30 backdrop-blur-md">
                  Assigned
                </span>
              )}
            </div>

            <div className="absolute top-3 left-3 z-10">
              <span className={cn(
                'px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded border backdrop-blur-md',
                assignment.role === 'vendor'
                  ? 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                  : 'bg-sky-500/20 text-sky-300 border-sky-500/30'
              )}>
                {assignment.role === 'vendor' ? 'Organizer' : 'Scanner'}
              </span>
            </div>

            <div className="relative z-10 space-y-1">
              <h3 className="text-base font-bold text-white line-clamp-1 drop-shadow-sm">
                {assignment.event_title}
              </h3>
              <p className="text-xs text-slate-300 line-clamp-1 font-medium opacity-90">
                by {assignment.vendor}
              </p>
            </div>
          </div>
          
          <div className="p-4 border-b border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900/40 grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 min-w-0">
              <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate font-medium">{formatDate(assignment.event_date)}</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 min-w-0 justify-end">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate font-medium">{assignment.event_location}</span>
            </div>
          </div>

          <div className="p-4 bg-white dark:bg-slate-900">
            <div className="grid grid-cols-3 gap-2.5">
              
              {/* Total Tickets KPI */}
              <div className="bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 rounded-xl p-2.5 flex flex-col justify-between transition-colors hover:bg-slate-100/50 dark:hover:bg-slate-800/70">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Total</span>
                  <Ticket className="w-3 h-3 text-slate-400" />
                </div>
                <p className="text-lg font-extrabold text-slate-800 dark:text-slate-100 tabular-nums leading-none">
                  {assignment.statistics?.total_tickets ?? 0}
                </p>
              </div>

              {/* Scanned Tickets KPI */}
              <div className="bg-emerald-50/30 dark:bg-emerald-950/10 border border-emerald-100/50 dark:border-emerald-900/20 rounded-xl p-2.5 flex flex-col justify-between transition-colors hover:bg-emerald-50/60 dark:hover:bg-emerald-950/20">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold text-emerald-600/80 dark:text-emerald-400/80 uppercase tracking-wider">Scanned</span>
                  <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                </div>
                <p className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400 tabular-nums leading-none">
                  {assignment.statistics?.scanned_tickets ?? 0}
                </p>
              </div>

              {/* Remaining Tickets KPI */}
              <div className="bg-sky-50/30 dark:bg-sky-950/10 border border-sky-100/50 dark:border-sky-900/20 rounded-xl p-2.5 flex flex-col justify-between transition-colors hover:bg-sky-50/60 dark:hover:bg-sky-950/20">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold text-sky-600/80 dark:text-sky-400/80 uppercase tracking-wider">Left</span>
                  <AlertCircle className="w-3 h-3 text-sky-500" />
                </div>
                <p className="text-lg font-extrabold text-sky-600 dark:text-sky-400 tabular-nums leading-none">
                  {assignment.statistics?.remaining ?? 0}
                </p>
              </div>

            </div>
          </div>
        </div>

        <div className="p-4 pt-0 bg-white dark:bg-slate-900">
          {assignment.status === 'pending' ? (
            <div className="flex gap-2">
              <Button 
                onClick={() => handleUpdateStatus(assignment.event_id, 'reject')}
                variant="outline" 
                className="flex-1 h-10 border-slate-200 text-slate-700 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-rose-950/20 dark:hover:text-rose-400 text-xs font-semibold rounded-xl transition-all"
              >
                <X className="w-3.5 h-3.5 mr-1.5" /> Reject
              </Button>
              <Button 
                onClick={() => handleUpdateStatus(assignment.event_id, 'accept')}
                className="flex-1 h-10 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-all"
              >
                <Check className="w-3.5 h-3.5 mr-1.5" /> Accept
              </Button>
            </div>
          ) : assignment.status === 'rejected' ? (
            <div className="w-full text-center text-xs font-semibold text-rose-500 bg-rose-50/50 dark:bg-rose-950/10 border border-rose-100/30 py-2.5 rounded-xl">
              Assignment Cancelled / Declined
            </div>
          ) : (
            <Button
              onClick={() => goToScanner(assignment.event_id)}
              className="w-full h-10 bg-slate-900 hover:bg-slate-800 dark:bg-sky-600 dark:hover:bg-sky-500 text-white shadow-sm text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition-all group-hover:bg-sky-600 dark:group-hover:bg-sky-500"
            >
              <Scan className="w-3.5 h-3.5 transition-transform group-hover:rotate-12" /> Open Operations Scanner
            </Button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="h-screen bg-slate-50 dark:bg-slate-900 flex overflow-hidden">
      {/* Sidebar Panel Overlay */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Viewport Content Context Area */}
      <div className="flex-1 flex flex-col h-full min-w-0 relative">
        
        {/* FIXED APP HEADER LAYER */}
        <div className="sticky top-0 z-30 shrink-0 bg-slate-50 dark:bg-slate-900">
          <Header 
            title="Operations Center" 
            subtitle="Manage validation pipelines and scanner assignments"
            onMenuClick={() => setSidebarOpen(true)} 
          />
        </div>

        {/* ISOLATED SCROLLABLE CONTENT AREA */}
        <main className="flex-1 p-4 md:p-6 overflow-y-auto scrollbar-hide z-10 space-y-6">
          
          {/* Breadcrumb Header Block */}
          <div className="max-w-[1600px] mx-auto border-b border-slate-200/60 dark:border-slate-800 pb-4 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
              <span className="hover:text-slate-700 dark:hover:text-slate-300 cursor-pointer transition-colors" onClick={() => navigate('/marketplace')}>Marketplace</span>
              <ChevronRight className="w-3 h-3 text-slate-300" />
              <span className="text-slate-900 dark:text-slate-200 font-semibold">Scanner Assignments</span>
            </div>
          </div>

          <div className="max-w-[1600px] mx-auto space-y-10">
            {loading ? (
              <div className="flex justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-sky-500" />
              </div>
            ) : assignments.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800/80 p-16 text-center max-w-xl mx-auto shadow-sm">
                <div className="w-14 h-14 mx-auto bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                  <QrCode className="w-6 h-6 text-slate-400 dark:text-slate-500" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">No Assignments Found</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
                  Your profile is currently not bound to an active scanner pipeline. Please contact your administrator.
                </p>
              </div>
            ) : (
              <>
                {/* Current Assignments Layout Block */}
                {currentAssignments.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 px-1">
                      <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                        Current Assignments
                      </h2>
                      <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                        {currentAssignments.length}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {currentAssignments.map(renderAssignmentCard)}
                    </div>
                  </div>
                )}

                {/* History Layout Block */}
                {historyAssignments.length > 0 && (
                  <div className="space-y-4 pt-4 border-t border-slate-200/60 dark:border-slate-800">
                    <div className="flex items-center gap-2 px-1">
                      <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                        History
                      </h2>
                      <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                        {historyAssignments.length}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 opacity-75">
                      {historyAssignments.map(renderAssignmentCard)}
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