import { useState } from 'react';
import { Header, Toast } from '@/components/ui-custom';
import { useBlueSeaEngine } from '@/context/BlueSeaEngine';
import { Radio, Eye, Users, Ticket, Play, Lock, Globe, Clock, X, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

const DEMO_STREAMS = [
  { id: 'st1', title: 'Crypto Investment Masterclass', description: 'Learn the fundamentals of crypto investing from industry experts', hostName: 'BlueSea Academy', type: 'ticketed' as const, ticketPrice: 5000, scheduledFor: '2026-06-10T18:00:00', status: 'scheduled' as const, viewerCount: 0, maxViewers: 1000, chatEnabled: true },
  { id: 'st2', title: 'Afrobeats Summer Fest - LIVE', description: 'Livestream of the biggest music festival', hostName: 'LiveNation NG', type: 'ticketed' as const, ticketPrice: 2500, scheduledFor: '2026-07-20T19:00:00', status: 'scheduled' as const, viewerCount: 0, maxViewers: 5000, chatEnabled: true },
  { id: 'st3', title: 'Business Growth Webinar', description: 'Strategies for scaling your business in Nigeria', hostName: 'BlueSea Business', type: 'free' as const, scheduledFor: '2026-06-05T15:00:00', status: 'scheduled' as const, viewerCount: 0, chatEnabled: true },
];

export function Streams() {
  const { addTransaction, addNotification } = useBlueSeaEngine();
  const { ToastComponent, showToast } = Toast();
  const [showAccess, setShowAccess] = useState<string | null>(null);
  const [accessGranted, setAccessGranted] = useState<Record<string, boolean>>({});

  const handleGetAccess = (streamId: string) => {
    const stream = DEMO_STREAMS.find(s => s.id === streamId);
    if (!stream) return;
    if (stream.type === 'ticketed' && stream.ticketPrice) {
      addTransaction({ transaction_type: 'DEBIT', amount: stream.ticketPrice, description: `Stream Access - ${stream.title}`, status: 'successful', category: 'event_ticket', payment_method: 'Wallet' });
    }
    addNotification({ title: 'Stream Access Granted', subtitle: `You can now watch "${stream.title}"`, category: 'streaming', read: false });
    setAccessGranted({ ...accessGranted, [streamId]: true });
    showToast(`Access granted for "${stream.title}"!`);
    setShowAccess(null);
  };

  const getTimeUntil = (dateStr: string) => {
    const diff = new Date(dateStr).getTime() - Date.now();
    if (diff <= 0) return 'Starting now';
    const days = Math.floor(diff / 86400000);
    const hours = Math.floor((diff % 86400000) / 3600000);
    return `${days}d ${hours}h until start`;
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 flex flex-col">
      <Header title="BlueSea Live" subtitle="Live streaming & events" showBackButton />
      <main className="flex-1 p-4 md:p-6 overflow-y-auto scrollbar-hide">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div className="bg-slate-900 dark:bg-slate-800 rounded-3xl p-6 text-white shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Radio className="w-5 h-5 text-red-500" />
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Live Streaming</span>
                </div>
                <p className="text-2xl font-black">BlueSea Live</p>
                <p className="text-xs text-slate-400 mt-1">Premium ticketed streams & educational content</p>
              </div>
              <div className="w-14 h-14 bg-red-500/20 rounded-2xl flex items-center justify-center animate-pulse">
                <Play className="w-7 h-7 text-red-400" />
              </div>
            </div>
          </div>

          {/* Stream List */}
          <div className="space-y-4">
            <h3 className="text-[11px] font-bold uppercase tracking-[0.15em] text-slate-400 dark:text-slate-500">Upcoming Streams</h3>
            {DEMO_STREAMS.map(stream => {
              const hasAccess = accessGranted[stream.id] || stream.type === 'free';
              return (
                <div key={stream.id} className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-2xl p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-red-500/10 rounded-2xl flex items-center justify-center">
                        <Radio className="w-5 h-5 text-red-500" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-800 dark:text-white">{stream.title}</h4>
                        <p className="text-[10px] text-slate-400">{stream.hostName}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
                      {stream.type === 'free' ? <Globe className="w-3 h-3 text-emerald-500" /> : <Lock className="w-3 h-3 text-amber-500" />}
                      <span className="text-[9px] font-bold text-slate-500">{stream.type === 'free' ? 'Free' : `₦${stream.ticketPrice?.toLocaleString()}`}</span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 mb-3">{stream.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-[10px] text-slate-400">
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {getTimeUntil(stream.scheduledFor)}</span>
                      {stream.maxViewers && <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {stream.maxViewers} max</span>}
                    </div>
                    {hasAccess ? (
                      <span className="flex items-center gap-1 px-3 py-1.5 bg-emerald-500/10 text-emerald-500 rounded-lg text-[10px] font-bold">
                        <CheckCircle2 className="w-3 h-3" /> Access Granted
                      </span>
                    ) : (
                      <button onClick={() => setShowAccess(stream.id)} className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl text-[10px] font-bold transition-all active:scale-95">
                        Get Access
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>

      {/* Access Modal */}
      {showAccess && (() => {
        const stream = DEMO_STREAMS.find(s => s.id === showAccess);
        if (!stream) return null;
        return (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 backdrop-blur-xl bg-slate-950/40">
            <div className="absolute inset-0" onClick={() => setShowAccess(null)} />
            <div className="relative bg-white dark:bg-slate-900 sm:rounded-[2rem] rounded-t-[2rem] p-6 w-full max-w-sm shadow-2xl border-t sm:border border-slate-200 dark:border-white/10 text-center">
              <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Play className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white mb-2">{stream.title}</h3>
              <p className="text-xs text-slate-400 mb-4">{stream.description}</p>
              {stream.type === 'ticketed' ? (
                <>
                  <p className="text-2xl font-black text-slate-800 dark:text-white mb-1">₦{stream.ticketPrice?.toLocaleString()}</p>
                  <p className="text-xs text-slate-400 mb-4">One-time access fee</p>
                </>
              ) : (
                <p className="text-sm font-bold text-emerald-500 mb-4">Free Stream</p>
              )}
              <Button onClick={() => handleGetAccess(stream.id)} className="w-full bg-red-500 hover:bg-red-600 text-white h-14 rounded-2xl text-sm font-black shadow-xl active:scale-95">
                {stream.type === 'ticketed' ? 'Pay & Get Access' : 'Get Free Access'}
              </Button>
            </div>
          </div>
        );
      })()}
      {ToastComponent}
    </div>
  );
}
