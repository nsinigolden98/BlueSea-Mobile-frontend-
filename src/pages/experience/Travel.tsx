import { useState } from 'react';
import { Header, Toast } from '@/components/ui-custom';
import { useBlueSeaEngine } from '@/context/BlueSeaEngine';
import { Plane, Bus, MapPin, Calendar, Clock, Armchair, X, ChevronRight, Ticket, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const NIGERIAN_CITIES = ['Lagos', 'Abuja', 'Port Harcourt', 'Ibadan', 'Kano', 'Enugu', 'Benin City', 'Kaduna'];

const BUS_COMPANIES = [
  { id: 'guo', name: 'GUO Transport', slogan: 'The Ultimate Transport Experience', type: 'Luxury', ac: true },
  { id: 'abc', name: 'ABC Transport', slogan: 'Travel With Confidence', type: 'Standard', ac: true },
  { id: 'gigm', name: 'GIGM', slogan: 'Go With God', type: 'Premium', ac: true },
  { id: 'peace', name: 'Peace Mass Transit', slogan: 'Your Peaceful Journey', type: 'Economy', ac: false },
];

export function Travel() {
  const { addBusTicket, addTransaction, addNotification } = useBlueSeaEngine();
  const { ToastComponent, showToast } = Toast();
  const [activeTab, setActiveTab] = useState<'bus'>('bus');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [date, setDate] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [showSeats, setShowSeats] = useState<string | null>(null);
  const [selectedSeat, setSelectedSeat] = useState('');
  const [passengerName, setPassengerName] = useState('');
  const [bookingConfirmed, setBookingConfirmed] = useState(false);

  const seats = Array.from({ length: 24 }, (_, i) => ({ number: String(i + 1), occupied: Math.random() < 0.3 }));

  const handleSearch = () => {
    if (!from || !to || !date) { showToast('Please fill all fields', true); return; }
    setShowResults(true);
  };

  const handleBook = (companyId: string) => {
    if (!selectedSeat || !passengerName) { showToast('Please select a seat and enter passenger name', true); return; }
    const price = Math.floor(Math.random() * 15000) + 5000;
    addTransaction({ transaction_type: 'DEBIT', amount: price, description: `Bus Ticket - ${from} to ${to} (${BUS_COMPANIES.find(c => c.id === companyId)?.name})`, status: 'successful', category: 'bus_booking', payment_method: 'Wallet' });
    addBusTicket({ tripId: companyId + Date.now(), passengerName, passengerPhone: '', seatNumber: selectedSeat, price, boardingTime: date, terminal: `${from} Terminal`, qrCode: `BS-BUS-${Date.now()}`, status: 'active' });
    addNotification({ title: 'Bus Ticket Booked', subtitle: `${from} to ${to} on ${date}`, category: 'bus_booking', read: false, amount: price });
    setBookingConfirmed(true);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 flex flex-col">
      <Header title="Travel" subtitle="Book your journey" showBackButton />
      <main className="flex-1 p-4 md:p-6 overflow-y-auto scrollbar-hide">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Search Form */}
          <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-3xl p-5 shadow-sm">
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">From</label>
                  <select value={from} onChange={e => setFrom(e.target.value)} className="w-full mt-1 bg-white dark:bg-slate-800 rounded-xl h-12 px-3 text-sm font-bold border border-slate-200 dark:border-white/5">
                    <option value="">Select</option>
                    {NIGERIAN_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">To</label>
                  <select value={to} onChange={e => setTo(e.target.value)} className="w-full mt-1 bg-white dark:bg-slate-800 rounded-xl h-12 px-3 text-sm font-bold border border-slate-200 dark:border-white/5">
                    <option value="">Select</option>
                    {NIGERIAN_CITIES.filter(c => c !== from).map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Travel Date</label>
                <Input type="date" value={date} onChange={e => setDate(e.target.value)} min={new Date().toISOString().split('T')[0]} className="mt-1 bg-white dark:bg-slate-800 rounded-xl h-12" />
              </div>
              <Button onClick={handleSearch} className="w-full bg-sky-500 hover:bg-sky-600 text-white h-14 rounded-2xl text-sm font-black shadow-xl active:scale-95">
                Search Buses
              </Button>
            </div>
          </div>

          {/* Results */}
          {showResults && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-[11px] font-bold uppercase tracking-[0.15em] text-slate-400 dark:text-slate-500">Available Buses</h3>
                <span className="text-xs text-slate-400">{from} → {to}</span>
              </div>
              {BUS_COMPANIES.map(company => (
                <div key={company.id} className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-sky-500/10 rounded-xl flex items-center justify-center">
                        <Bus className="w-5 h-5 text-sky-500" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800 dark:text-white">{company.name}</p>
                        <p className="text-[10px] text-slate-400">{company.slogan}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-sky-500">{company.type}</p>
                      {company.ac && <span className="text-[9px] font-bold text-emerald-500">A/C</span>}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex gap-4 text-[10px] text-slate-400">
                      <span>{Math.floor(Math.random() * 4) + 6}:00 AM</span>
                      <span>{Math.floor(Math.random() * 6) + 4}h journey</span>
                      <span>{Math.floor(Math.random() * 10) + 5} seats left</span>
                    </div>
                    <button onClick={() => setShowSeats(company.id)} className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-xl text-[10px] font-bold transition-all active:scale-95">
                      Select Seat
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Seat Selection Modal */}
      {showSeats && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 backdrop-blur-xl bg-slate-950/40">
          <div className="absolute inset-0" onClick={() => { setShowSeats(null); setBookingConfirmed(false); }} />
          <div className="relative bg-white dark:bg-slate-900 sm:rounded-[2rem] rounded-t-[2rem] p-6 w-full max-w-lg shadow-2xl border-t sm:border border-slate-200 dark:border-white/10 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-black text-slate-900 dark:text-white">Select Seat</h3>
              <button onClick={() => { setShowSeats(null); setBookingConfirmed(false); }} className="p-2 hover:bg-slate-100 rounded-xl"><X className="w-4 h-4" /></button>
            </div>

            {!bookingConfirmed ? (
              <div className="space-y-4">
                {/* Seat Legend */}
                <div className="flex gap-4 justify-center text-[10px] font-bold">
                  <span className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-slate-200" /> Available</span>
                  <span className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-sky-500" /> Selected</span>
                  <span className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-slate-400" /> Occupied</span>
                </div>
                {/* Seat Grid */}
                <div className="grid grid-cols-4 gap-3 max-w-[280px] mx-auto">
                  {seats.map(seat => (
                    <button
                      key={seat.number}
                      disabled={seat.occupied}
                      onClick={() => setSelectedSeat(seat.number)}
                      className={`w-14 h-14 rounded-xl flex items-center justify-center text-xs font-bold transition-all ${
                        seat.occupied ? 'bg-slate-300 text-slate-500 cursor-not-allowed' :
                        selectedSeat === seat.number ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/30 scale-105' :
                        'bg-slate-100 dark:bg-slate-800 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      <Armchair className="w-4 h-4" />
                    </button>
                  ))}
                </div>
                {selectedSeat && (
                  <div className="text-center">
                    <p className="text-sm font-bold text-sky-500">Seat {selectedSeat} selected</p>
                  </div>
                )}
                <Input value={passengerName} onChange={e => setPassengerName(e.target.value)} placeholder="Passenger Name" className="bg-slate-50 dark:bg-slate-800 rounded-2xl h-12" />
                <Button onClick={() => handleBook(showSeats)} disabled={!selectedSeat || !passengerName} className="w-full bg-sky-500 hover:bg-sky-600 text-white h-14 rounded-2xl text-sm font-black shadow-xl disabled:opacity-50 active:scale-95">
                  Book Ticket
                </Button>
              </div>
            ) : (
              <div className="text-center py-6">
                <div className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-10 h-10 text-white" />
                </div>
                <h4 className="text-lg font-black text-slate-900 dark:text-white mb-2">Booking Confirmed!</h4>
                <p className="text-sm text-slate-400 mb-4">Your ticket has been generated</p>
                <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-4 inline-block">
                  <p className="text-xs font-mono text-slate-600">QR: BS-BUS-{Date.now()}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      {ToastComponent}
    </div>
  );
}
