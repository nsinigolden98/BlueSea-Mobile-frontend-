import { useState } from 'react';
import { Header, Toast } from '@/components/ui-custom';
import { useBlueSeaEngine } from '@/context/BlueSeaEngine';
import { Calendar, Plus, X, MapPin, Users, Ticket, Share2, Clock, ChevronRight, Star, Radio } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const DEMO_EVENTS = [
  { id: 'ev1', title: 'Lagos Tech Week 2026', description: 'The biggest tech conference in West Africa', type: 'physical' as const, location: 'Eko Hotel, Lagos', startDate: '2026-06-15', endDate: '2026-06-18', organizer: 'TechLagos', ticketTypes: [{ id: 't1', name: 'General', price: 25000, quantity: 500, sold: 234, benefits: ['Access to all sessions'] }, { id: 't2', name: 'VIP', price: 75000, quantity: 100, sold: 67, benefits: ['VIP lounge', 'Meet speakers'] }], affiliateCommission: 10, isStream: false, currentAttendees: 301, status: 'published' as const },
  { id: 'ev2', title: 'Afrobeats Summer Fest', description: 'Live performances from top artists', type: 'physical' as const, location: 'Tafawa Balewa Square, Lagos', startDate: '2026-07-20', endDate: '2026-07-20', organizer: 'LiveNation NG', ticketTypes: [{ id: 't3', name: 'Regular', price: 15000, quantity: 2000, sold: 1456, benefits: ['General admission'] }, { id: 't4', name: 'VIP', price: 50000, quantity: 300, sold: 234, benefits: ['Front row', 'Backstage pass'] }], affiliateCommission: 8, isStream: true, streamStatus: 'upcoming' as const, currentAttendees: 1690, status: 'published' as const },
  { id: 'ev3', title: 'Crypto Investment Masterclass', description: 'Learn crypto trading from experts', type: 'virtual' as const, location: 'Online', startDate: '2026-06-10', endDate: '2026-06-10', organizer: 'BlueSea Academy', ticketTypes: [{ id: 't5', name: 'Standard', price: 10000, quantity: 1000, sold: 567, benefits: ['Live access', 'Recording'] }], affiliateCommission: 15, isStream: true, streamStatus: 'upcoming' as const, currentAttendees: 567, status: 'published' as const },
];

export function Events() {
  const { addTicket, addTransaction, addNotification } = useBlueSeaEngine();
  const { ToastComponent, showToast } = Toast();
  const [showDetail, setShowDetail] = useState<string | null>(null);
  const [showTicket, setShowTicket] = useState<string | null>(null);
  const [selectedTicket, setSelectedTicket] = useState('');
  const [quantity, setQuantity] = useState('1');

  const handleBuyTicket = (eventId: string) => {
    const event = DEMO_EVENTS.find(e => e.id === eventId);
    const ticketType = event?.ticketTypes.find(t => t.id === selectedTicket);
    if (!event || !ticketType) return;
    const total = ticketType.price * Number(quantity);
    addTransaction({ transaction_type: 'DEBIT', amount: total, description: `Event Ticket - ${event.title} (${ticketType.name} x${quantity})`, status: 'successful', category: 'event_ticket', payment_method: 'Wallet' });
    addTicket({ eventId, eventTitle: event.title, ticketType: ticketType.name, attendeeName: 'BlueSea User', attendeeEmail: 'demo@bluesea.ng', qrCode: `BS-TICKET-${Date.now()}`, price: total, status: 'valid' });
    addNotification({ title: 'Ticket Purchased', subtitle: `${ticketType.name} ticket for ${event.title}`, category: 'events', read: false, amount: total });
    showToast(`${quantity}x ${ticketType.name} ticket purchased!`);
    setShowTicket(null);
    setSelectedTicket('');
    setQuantity('1');
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 flex flex-col">
      <Header title="Events" subtitle="Discover amazing events" showBackButton />
      <main className="flex-1 p-4 md:p-6 overflow-y-auto scrollbar-hide">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Categories */}
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            {['All', 'Physical', 'Virtual', 'Livestream', 'Music', 'Tech', 'Business'].map(cat => (
              <button key={cat} className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-sky-500 hover:text-white transition-all whitespace-nowrap">
                {cat}
              </button>
            ))}
          </div>

          {/* Featured Event */}
          {DEMO_EVENTS[0] && (
            <div onClick={() => setShowDetail(DEMO_EVENTS[0].id)} className="relative overflow-hidden rounded-3xl bg-slate-900 text-white shadow-xl cursor-pointer active:scale-[0.98] transition-transform">
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent z-10" />
              <div className="h-48 bg-slate-800" />
              <div className="absolute bottom-0 left-0 right-0 p-6 z-20">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-0.5 bg-sky-500 rounded text-[9px] font-black uppercase tracking-wider">Featured</span>
                  {DEMO_EVENTS[0].isStream && <span className="px-2 py-0.5 bg-red-500 rounded text-[9px] font-black uppercase tracking-wider flex items-center gap-1"><Radio className="w-2 h-2" /> Live</span>}
                </div>
                <h3 className="text-xl font-black">{DEMO_EVENTS[0].title}</h3>
                <p className="text-xs text-slate-300 mt-1">{DEMO_EVENTS[0].location} • {new Date(DEMO_EVENTS[0].startDate).toLocaleDateString('en-NG', { month: 'short', day: 'numeric' })}</p>
                <div className="flex items-center gap-3 mt-3">
                  <span className="flex items-center gap-1 text-[10px] text-slate-300"><Users className="w-3 h-3" /> {DEMO_EVENTS[0].currentAttendees}</span>
                  <span className="flex items-center gap-1 text-[10px] text-slate-300">From ₦{DEMO_EVENTS[0].ticketTypes[0].price.toLocaleString()}</span>
                </div>
              </div>
            </div>
          )}

          {/* Event List */}
          <div className="space-y-3">
            <h3 className="text-[11px] font-bold uppercase tracking-[0.15em] text-slate-400 dark:text-slate-500">All Events</h3>
            {DEMO_EVENTS.map(event => (
              <div key={event.id} onClick={() => setShowDetail(event.id)} className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-2xl p-4 cursor-pointer hover:border-sky-500/30 transition-all active:scale-[0.99]">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-slate-200 dark:bg-slate-700 rounded-2xl flex flex-col items-center justify-center flex-shrink-0">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">{new Date(event.startDate).toLocaleDateString('en-NG', { month: 'short' })}</span>
                    <span className="text-xl font-black text-slate-800 dark:text-white">{new Date(event.startDate).getDate()}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-slate-800 dark:text-white">{event.title}</h4>
                    <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5"><MapPin className="w-3 h-3" /> {event.location}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-[10px] font-bold text-slate-500">{event.currentAttendees} attending</span>
                      <span className="text-[10px] font-bold text-sky-500">From ₦{event.ticketTypes[0].price.toLocaleString()}</span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Event Detail Modal */}
      {showDetail && (() => {
        const event = DEMO_EVENTS.find(e => e.id === showDetail);
        if (!event) return null;
        return (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 backdrop-blur-xl bg-slate-950/40">
            <div className="absolute inset-0" onClick={() => setShowDetail(null)} />
            <div className="relative bg-white dark:bg-slate-900 sm:rounded-[2rem] rounded-t-[2rem] p-6 w-full max-w-lg shadow-2xl border-t sm:border border-slate-200 dark:border-white/10 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-black text-slate-900 dark:text-white">{event.title}</h3>
                <button onClick={() => setShowDetail(null)} className="p-2 hover:bg-slate-100 rounded-xl"><X className="w-4 h-4" /></button>
              </div>
              <p className="text-xs text-slate-400 mb-4">{event.description}</p>
              <div className="flex items-center gap-2 mb-4 text-[10px] text-slate-400">
                <MapPin className="w-3 h-3" /> {event.location}
                <span className="mx-1">•</span>
                <Clock className="w-3 h-3" /> {new Date(event.startDate).toLocaleDateString()}
                <span className="mx-1">•</span>
                <Users className="w-3 h-3" /> {event.currentAttendees}
              </div>
              <div className="space-y-2 mb-4">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tickets</p>
                {event.ticketTypes.map(t => (
                  <div key={t.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                    <div>
                      <p className="text-sm font-bold text-slate-800 dark:text-white">{t.name}</p>
                      <p className="text-[9px] text-slate-400">{t.sold}/{t.quantity} sold</p>
                    </div>
                    <p className="text-sm font-black text-slate-800 dark:text-white">₦{t.price.toLocaleString()}</p>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <button onClick={() => { setShowTicket(event.id); setShowDetail(null); }} className="flex-1 py-3 bg-sky-500 hover:bg-sky-600 text-white rounded-xl text-sm font-bold transition-all active:scale-95">
                  Get Tickets
                </button>
                <button onClick={() => showToast('Event shared!')} className="p-3 bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-200 transition-all">
                  <Share2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Buy Ticket Modal */}
      {showTicket && (() => {
        const event = DEMO_EVENTS.find(e => e.id === showTicket);
        if (!event) return null;
        return (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 backdrop-blur-xl bg-slate-950/40">
            <div className="absolute inset-0" onClick={() => setShowTicket(null)} />
            <div className="relative bg-white dark:bg-slate-900 sm:rounded-[2rem] rounded-t-[2rem] p-6 w-full max-w-lg shadow-2xl border-t sm:border border-slate-200 dark:border-white/10">
              <h3 className="text-lg font-black text-slate-900 dark:text-white mb-4">Get Tickets - {event.title}</h3>
              <div className="space-y-2 mb-4">
                {event.ticketTypes.map(t => (
                  <button key={t.id} onClick={() => setSelectedTicket(t.id)} className={`w-full flex items-center justify-between p-4 rounded-xl transition-all ${selectedTicket === t.id ? 'bg-sky-500 text-white' : 'bg-slate-50 dark:bg-slate-800 text-slate-600'}`}>
                    <div className="text-left">
                      <p className={`text-sm font-bold ${selectedTicket === t.id ? 'text-white' : 'text-slate-800 dark:text-white'}`}>{t.name}</p>
                      <p className={`text-[10px] ${selectedTicket === t.id ? 'text-white/70' : 'text-slate-400'}`}>{t.benefits.join(', ')}</p>
                    </div>
                    <p className={`text-sm font-black ${selectedTicket === t.id ? 'text-white' : 'text-slate-800 dark:text-white'}`}>₦{t.price.toLocaleString()}</p>
                  </button>
                ))}
              </div>
              <div className="mb-4">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Quantity</label>
                <div className="flex gap-2 mt-2">
                  {['1', '2', '3', '4', '5'].map(q => (
                    <button key={q} onClick={() => setQuantity(q)} className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all ${quantity === q ? 'bg-sky-500 text-white' : 'bg-slate-50 dark:bg-slate-800 text-slate-600'}`}>{q}</button>
                  ))}
                </div>
              </div>
              {selectedTicket && (() => {
                const tt = event.ticketTypes.find(t => t.id === selectedTicket);
                return <p className="text-sm font-bold text-center mb-4">Total: ₦{((tt?.price || 0) * Number(quantity)).toLocaleString()}</p>;
              })()}
              <Button onClick={() => handleBuyTicket(showTicket)} disabled={!selectedTicket} className="w-full bg-sky-500 hover:bg-sky-600 text-white h-14 rounded-2xl text-sm font-black shadow-xl disabled:opacity-50 active:scale-95">Purchase Tickets</Button>
            </div>
          </div>
        );
      })()}
      {ToastComponent}
    </div>
  );
}
