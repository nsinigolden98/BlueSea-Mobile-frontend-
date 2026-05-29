import { useState } from 'react';
import { Header, Toast } from '@/components/ui-custom';
import { useBlueSeaEngine } from '@/context/BlueSeaEngine';
import { Calendar, Plus, X, Clock, CheckCircle2, User, Phone, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const SERVICES = [
  { id: 's1', name: 'Consultation', duration: 60, price: 25000 },
  { id: 's2', name: 'Strategy Session', duration: 90, price: 45000 },
  { id: 's3', name: 'Quick Call', duration: 30, price: 15000 },
];

const TIME_SLOTS = ['09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00'];

export function Appointments() {
  const { appointments, addAppointment, addTransaction, addNotification } = useBlueSeaEngine();
  const { ToastComponent, showToast } = Toast();
  const [showBook, setShowBook] = useState(false);
  const [selectedService, setSelectedService] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [form, setForm] = useState({ clientName: '', clientEmail: '', clientPhone: '', notes: '' });

  const handleBook = () => {
    const service = SERVICES.find(s => s.id === selectedService);
    if (!service || !selectedDate || !selectedTime || !form.clientName) { showToast('Please fill all fields', true); return; }
    const booking = addAppointment({ serviceId: service.id, serviceName: service.name, date: selectedDate, time: selectedTime, clientName: form.clientName, clientEmail: form.clientEmail, clientPhone: form.clientPhone, status: 'confirmed', price: service.price, notes: form.notes });
    addTransaction({ transaction_type: 'DEBIT', amount: service.price, description: `Appointment Booking - ${service.name}`, status: 'successful', category: 'storefront', payment_method: 'Wallet' });
    addNotification({ title: 'Appointment Booked', subtitle: `${service.name} on ${selectedDate} at ${selectedTime}`, category: 'business', read: false });
    showToast('Appointment booked successfully!');
    setShowBook(false);
    setSelectedService(''); setSelectedDate(''); setSelectedTime(''); setForm({ clientName: '', clientEmail: '', clientPhone: '', notes: '' });
  };

  const today = new Date().toISOString().split('T')[0];
  const upcoming = appointments.filter(a => a.date >= today && a.status === 'confirmed');
  const past = appointments.filter(a => a.date < today || a.status === 'completed');

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 flex flex-col">
      <Header title="Appointments" subtitle="Booking management system" showBackButton />
      <main className="flex-1 p-4 md:p-6 overflow-y-auto scrollbar-hide">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Summary */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-4">
              <p className="text-[10px] font-bold text-amber-500 uppercase tracking-wider">Upcoming</p>
              <p className="text-xl font-black text-slate-800 dark:text-white mt-1">{upcoming.length}</p>
            </div>
            <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-4">
              <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider">Completed</p>
              <p className="text-xl font-black text-slate-800 dark:text-white mt-1">{past.length}</p>
            </div>
            <div className="bg-sky-500/5 border border-sky-500/20 rounded-2xl p-4">
              <p className="text-[10px] font-bold text-sky-500 uppercase tracking-wider">Revenue</p>
              <p className="text-xl font-black text-slate-800 dark:text-white mt-1">₦{appointments.reduce((s, a) => s + a.price, 0).toLocaleString()}</p>
            </div>
          </div>

          {/* Book Button */}
          <button onClick={() => setShowBook(true)} className="w-full p-4 bg-amber-500 hover:bg-amber-600 text-white rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-95 shadow-lg shadow-amber-500/20">
            <Plus className="w-5 h-5" />
            <span className="text-sm font-bold">Book New Appointment</span>
          </button>

          {/* Appointments List */}
          <div className="space-y-3">
            <h3 className="text-[11px] font-bold uppercase tracking-[0.15em] text-slate-400 dark:text-slate-500">Upcoming</h3>
            {upcoming.length === 0 ? (
              <div className="text-center py-8 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-dashed border-slate-200 dark:border-white/5">
                <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <p className="text-xs text-slate-400 font-bold">No upcoming appointments</p>
              </div>
            ) : (
              upcoming.map(apt => (
                <div key={apt.id} className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-2xl p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-amber-500" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800 dark:text-white">{apt.serviceName}</p>
                        <p className="text-[10px] text-slate-400">{apt.clientName} • {apt.date} at {apt.time}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-slate-800 dark:text-white">₦{apt.price.toLocaleString()}</p>
                      <span className="text-[9px] font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded">{apt.status}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>

      {/* Book Modal */}
      {showBook && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 backdrop-blur-xl bg-slate-950/40">
          <div className="absolute inset-0" onClick={() => setShowBook(false)} />
          <div className="relative bg-white dark:bg-slate-900 sm:rounded-[2rem] rounded-t-[2rem] p-6 w-full max-w-lg shadow-2xl border-t sm:border border-slate-200 dark:border-white/10 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-black text-slate-900 dark:text-white">Book Appointment</h3>
              <button onClick={() => setShowBook(false)} className="p-2 hover:bg-slate-100 rounded-xl"><X className="w-4 h-4" /></button>
            </div>
            <div className="space-y-4">
              {/* Service Selection */}
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Select Service</label>
                <div className="mt-2 space-y-2">
                  {SERVICES.map(s => (
                    <button key={s.id} onClick={() => setSelectedService(s.id)} className={`w-full flex items-center justify-between p-3 rounded-xl text-left transition-all ${selectedService === s.id ? 'bg-amber-500 text-white' : 'bg-slate-50 dark:bg-slate-800 text-slate-600'}`}>
                      <span className="text-sm font-bold">{s.name}</span>
                      <span className={`text-xs font-bold ${selectedService === s.id ? 'text-white' : 'text-slate-400'}`}>₦{s.price.toLocaleString()} • {s.duration}min</span>
                    </button>
                  ))}
                </div>
              </div>
              {/* Date */}
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Select Date</label>
                <Input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} min={today} className="mt-2 bg-slate-50 dark:bg-slate-800 rounded-2xl h-12" />
              </div>
              {/* Time Slots */}
              {selectedDate && (
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Select Time</label>
                  <div className="mt-2 grid grid-cols-4 gap-2">
                    {TIME_SLOTS.map(t => (
                      <button key={t} onClick={() => setSelectedTime(t)} className={`py-2 rounded-xl text-xs font-bold transition-all ${selectedTime === t ? 'bg-amber-500 text-white' : 'bg-slate-50 dark:bg-slate-800 text-slate-600'}`}>
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {/* Client Info */}
              <Input value={form.clientName} onChange={e => setForm({ ...form, clientName: e.target.value })} placeholder="Client Name" className="bg-slate-50 dark:bg-slate-800 rounded-2xl h-12" />
              <Input value={form.clientEmail} onChange={e => setForm({ ...form, clientEmail: e.target.value })} placeholder="Email (optional)" className="bg-slate-50 dark:bg-slate-800 rounded-2xl h-12" />
              <Input value={form.clientPhone} onChange={e => setForm({ ...form, clientPhone: e.target.value })} placeholder="Phone (optional)" className="bg-slate-50 dark:bg-slate-800 rounded-2xl h-12" />
              <Button onClick={handleBook} disabled={!selectedService || !selectedDate || !selectedTime || !form.clientName} className="w-full bg-amber-500 hover:bg-amber-600 text-white h-14 rounded-2xl text-sm font-black shadow-xl disabled:opacity-50 active:scale-95">
                Book Appointment
              </Button>
            </div>
          </div>
        </div>
      )}
      {ToastComponent}
    </div>
  );
}
