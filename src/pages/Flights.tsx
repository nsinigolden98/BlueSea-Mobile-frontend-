import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Sidebar, 
  Toast, 
  TransactionModal 
} from '@/components/ui-custom';
import { Input } from '@/components/ui/input';
import { 
  Plane, 
  Users, 
  Search, 
  MoreVertical, 
  History, 
  HelpCircle, 
  Briefcase, 
  ChevronRight, 
  ChevronLeft,
  X,
  ArrowRightLeft,
  Filter,
  Clock,
  Info
} from 'lucide-react';
import { cn } from '@/lib/utils';

// --- TYPES ---
type TripType = 'one-way' | 'round-trip';

interface FlightLocation {
  city: string;
  code: string;
  country: string;
  flag: string;
}

interface PassengerDetails {
  fullName: string;
  gender: string;
  dob: string;
  phone: string;
  email: string;
  sendToEmail: boolean;
}

interface Flight {
  id: string;
  airline: string;
  airlineLogo: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  stops: string;
  price: number;
  flightNumber: string;
  baggage: string;
  layover?: string;
}

// --- MOCK DATA ---
const AIRPORTS: FlightLocation[] = [
  { city: 'Lagos', code: 'LOS', country: 'Nigeria', flag: '🇳🇬' },
  { city: 'Abuja', code: 'ABV', country: 'Nigeria', flag: '🇳🇬' },
  { city: 'Port Harcourt', code: 'PHC', country: 'Nigeria', flag: '🇳🇬' },
  { city: 'Uyo', code: 'QUO', country: 'Nigeria', flag: '🇳🇬' },
  { city: 'London', code: 'LHR', country: 'United Kingdom', flag: '🇬🇧' },
  { city: 'Dubai', code: 'DXB', country: 'UAE', flag: '🇦🇪' },
];

const MOCK_FLIGHTS: Flight[] = [
  {
    id: '1',
    airline: 'Air Peace',
    airlineLogo: '✈️',
    departureTime: '08:00 AM',
    arrivalTime: '09:15 AM',
    duration: '1h 15m',
    stops: 'Non-stop',
    price: 125000,
    flightNumber: 'P47120',
    baggage: '23kg Checked, 7kg Cabin',
  },
  {
    id: '2',
    airline: 'Ibom Air',
    airlineLogo: '🛫',
    departureTime: '11:30 AM',
    arrivalTime: '12:45 PM',
    duration: '1h 15m',
    stops: 'Non-stop',
    price: 142000,
    flightNumber: 'QI0302',
    baggage: '25kg Checked, 10kg Cabin',
    layover: 'Direct Flight'
  }
];

const ModalHeader = ({ title, onClose }: { title: string; onClose: () => void }) => (
  <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 sticky top-0 z-10">
    <button onClick={onClose} className="p-2 -ml-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
      <X className="w-5 h-5 text-slate-600 dark:text-slate-400" />
    </button>
    <h3 className="font-bold text-slate-800 dark:text-white">{title}</h3>
    <div className="w-10" />
  </div>
);

export default function FlightsPage() {
  const navigate = useNavigate();
  const { showToast, ToastComponent } = Toast();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const [tripType, setTripType] = useState<TripType>('one-way');
  const [fromLocation, setFromLocation] = useState<FlightLocation | null>(null);
  const [toLocation, setToLocation] = useState<FlightLocation | null>(null);
  const [departureDate, setDepartureDate] = useState<string>('');
  const [returnDate, setReturnDate] = useState<string>('');
  const [passengers, setPassengers] = useState(1);
  const [travelClass, setTravelClass] = useState('Economy');

  const [activeModal, setActiveModal] = useState<'from' | 'to' | 'date' | 'returnDate' | 'passengers' | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [expandedFlightId, setExpandedFlightId] = useState<string | null>(null);
  const [selectedFlight, setSelectedFlight] = useState<Flight | null>(null);
  const [showCheckout, setShowCheckout] = useState(false);

  const [passengerDetails, setPassengerDetails] = useState<PassengerDetails>({
    fullName: '', gender: 'Male', dob: '', phone: '', email: '', sendToEmail: true
  });

  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState<boolean | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = () => {
    setIsSearching(true);
    setTimeout(() => {
      setIsSearching(false);
      setShowResults(true);
    }, 1200);
  };

  const handlePayment = () => {
    setIsProcessingPayment(true);
    showToast("Initializing payment secure gateway...");
    setTimeout(() => {
      setIsProcessingPayment(false);
      setPaymentSuccess(true);
    }, 2000);
  };

  const isSearchDisabled = !fromLocation || !toLocation || !departureDate || (tripType === 'round-trip' && !returnDate);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0">
        <header className="flex items-center justify-between px-4 py-4 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 -ml-2 rounded-lg transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>
            <h1 className="text-xl font-bold text-slate-800 dark:text-white">Flights</h1>
          </div>
          <div className="relative" ref={menuRef}>
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 rounded-full transition-colors">
              <MoreVertical className="w-5 h-5 text-slate-600 dark:text-slate-400" />
            </button>
            {isMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 py-2 z-50">
                <button onClick={() => navigate('/my-trips')} className="w-full px-4 py-2 text-left text-sm flex items-center gap-3"><Briefcase className="w-4 h-4 text-sky-500" /> My Trips</button>
                <button onClick={() => navigate('/my-trips')} className="w-full px-4 py-2 text-left text-sm flex items-center gap-3"><History className="w-4 h-4 text-sky-500" /> History</button>
                <button className="w-full px-4 py-2 text-left text-sm flex items-center gap-3"><HelpCircle className="w-4 h-4 text-sky-500" /> Support</button>
              </div>
            )}
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6 overflow-y-auto space-y-6">
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-sm border border-slate-100 dark:border-slate-700 space-y-6">
              <div className="flex p-1 bg-slate-100 dark:bg-slate-900 rounded-xl w-fit">
                <button onClick={() => setTripType('one-way')} className={cn("px-6 py-2 rounded-lg text-sm font-bold", tripType === 'one-way' ? "bg-white dark:bg-slate-800 text-sky-500 shadow-sm" : "text-slate-500")}>One-way</button>
                <button onClick={() => setTripType('round-trip')} className={cn("px-6 py-2 rounded-lg text-sm font-bold", tripType === 'round-trip' ? "bg-white dark:bg-slate-800 text-sky-500 shadow-sm" : "text-slate-500")}>Round-trip</button>
              </div>

              <div className="relative grid grid-cols-1 md:grid-cols-2 gap-4">
                <div onClick={() => setActiveModal('from')} className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer">
                  <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">From</p>
                  <p className="font-bold">{fromLocation ? `${fromLocation.city} (${fromLocation.code})` : "Select Departure"}</p>
                </div>
                <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white dark:bg-slate-800 border items-center justify-center text-sky-500"><ArrowRightLeft className="w-4 h-4" /></div>
                <div onClick={() => setActiveModal('to')} className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer">
                  <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">To</p>
                  <p className="font-bold">{toLocation ? `${toLocation.city} (${toLocation.code})` : "Select Destination"}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="grid grid-cols-2 gap-2">
                  <div onClick={() => setActiveModal('date')} className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer">
                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Departure</p>
                    <p className="text-sm font-bold">{departureDate || "Set Date"}</p>
                  </div>
                  <div onClick={() => { if(tripType === 'round-trip') setActiveModal('returnDate'); }} className={cn("p-4 rounded-xl border cursor-pointer", tripType === 'round-trip' ? "border-slate-200 dark:border-slate-700" : "bg-slate-50 dark:bg-slate-900 opacity-60")}>
                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Return</p>
                    <p className="text-sm font-bold">{tripType === 'round-trip' ? (returnDate || "Set Date") : "---"}</p>
                  </div>
                </div>
                <div onClick={() => setActiveModal('passengers')} className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer flex justify-between items-center">
                  <div><p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Passengers & Class</p><p className="text-sm font-bold">{passengers} Pax, {travelClass}</p></div>
                  <Users className="w-5 h-5 text-slate-400" />
                </div>
              </div>

              <button onClick={handleSearch} disabled={isSearchDisabled || isSearching} className="w-full py-4 rounded-xl bg-sky-500 text-white font-bold disabled:opacity-50 shadow-lg shadow-sky-500/20">{isSearching ? "Searching..." : "Search Flights"}</button>
            </div>

            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
              {[{ label: 'My Trips', icon: <Briefcase className="w-4 h-4" /> }, { label: 'Recent', icon: <History className="w-4 h-4" /> }, { label: 'Track', icon: <Clock className="w-4 h-4" /> }].map((item, idx) => (
                <button key={idx} className="flex-shrink-0 flex items-center gap-3 px-5 py-3 bg-white dark:bg-slate-800 rounded-xl border shadow-sm font-bold text-sm"><div className="p-2 rounded-lg bg-sky-50 dark:bg-sky-900/30 text-sky-500">{item.icon}</div>{item.label}</button>
              ))}
            </div>
          </div>
        </main>
      </div>
              {showResults && (
        <div className="fixed inset-0 z-[60] bg-white dark:bg-slate-900 flex flex-col animate-in slide-in-from-right">
          <div className="p-4 border-b flex items-center justify-between sticky top-0 bg-white dark:bg-slate-900">
            <div className="flex items-center gap-4">
              <button onClick={() => setShowResults(false)}><ChevronLeft className="w-6 h-6" /></button>
              <div><h3 className="font-bold">{fromLocation?.city} → {toLocation?.city}</h3><p className="text-xs text-slate-500">{departureDate} • {passengers} Traveler</p></div>
            </div>
            <button className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800"><Filter className="w-4 h-4" /></button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {MOCK_FLIGHTS.map((f) => (
              <div key={f.id} className={cn("bg-white dark:bg-slate-800 rounded-2xl border p-4", expandedFlightId === f.id && "ring-2 ring-sky-500")}>
                <div className="cursor-pointer" onClick={() => setExpandedFlightId(expandedFlightId === f.id ? null : f.id)}>
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-2"><div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-900 flex items-center justify-center">{f.airlineLogo}</div><span className="font-bold text-sm">{f.airline}</span></div>
                    <span className="text-lg font-black text-sky-500">₦{f.price.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-center"><p className="text-lg font-bold">{f.departureTime}</p><p className="text-[10px] font-bold text-slate-400">{fromLocation?.code}</p></div>
                    <div className="flex-1 px-4 flex flex-col items-center"><p className="text-[10px] text-slate-400">{f.duration}</p><div className="w-full h-[2px] bg-slate-200 relative"><Plane className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 text-sky-500 bg-white dark:bg-slate-800 px-0.5" /></div><p className="text-[10px] text-sky-500 font-bold mt-1 uppercase">{f.stops}</p></div>
                    <div className="text-center"><p className="text-lg font-bold">{f.arrivalTime}</p><p className="text-[10px] font-bold text-slate-400">{toLocation?.code}</p></div>
                  </div>
                </div>
                {expandedFlightId === f.id && (
                  <div className="mt-4 pt-4 border-t border-dashed space-y-4">
                    <div className="flex justify-between text-xs text-slate-500"><span>No: {f.flightNumber}</span><span>{f.baggage}</span></div>
                    <button onClick={() => { setSelectedFlight(f); setShowCheckout(true); }} className="w-full py-3 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-sm">Select Flight</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {showCheckout && (
        <div className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm flex items-end justify-center sm:items-center">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-t-3xl sm:rounded-2xl overflow-hidden flex flex-col">
            <ModalHeader title="Passenger Details" onClose={() => setShowCheckout(false)} />
            <div className="p-6 space-y-6 overflow-y-auto max-h-[70vh]">
              <div className="bg-sky-50 dark:bg-sky-900/20 p-4 rounded-xl flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center text-sky-500 font-bold">{selectedFlight?.airlineLogo}</div>
                <div><h4 className="font-bold text-sm">Summary</h4><p className="text-xs text-slate-500">₦{selectedFlight?.price.toLocaleString()}</p></div>
              </div>
              <div className="space-y-4">
                <Input placeholder="Full Name" value={passengerDetails.fullName} onChange={(e) => setPassengerDetails({...passengerDetails, fullName: e.target.value})} />
                <Input placeholder="Email" value={passengerDetails.email} onChange={(e) => setPassengerDetails({...passengerDetails, email: e.target.value})} />
              </div>
              <button onClick={handlePayment} disabled={!passengerDetails.fullName || isProcessingPayment} className="w-full py-4 rounded-xl bg-sky-500 text-white font-bold disabled:opacity-50">{isProcessingPayment ? "Processing..." : "Pay Now"}</button>
            </div>
          </div>
        </div>
      )}

      {(activeModal === 'from' || activeModal === 'to') && (
        <div className="fixed inset-0 z-[80] bg-white dark:bg-slate-900 animate-in slide-in-from-bottom">
          <ModalHeader title={activeModal === 'from' ? "From?" : "To?"} onClose={() => setActiveModal(null)} />
          <div className="p-4 space-y-4">
            <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" /><Input className="pl-10 h-12 rounded-xl" placeholder="Search..." /></div>
            {AIRPORTS.map((a) => (
              <button key={a.code} onClick={() => { if(activeModal === 'from') setFromLocation(a); else setToLocation(a); setActiveModal(null); }} className="w-full p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl">
                <div className="flex items-center gap-4"><span>{a.flag}</span><div><p className="font-bold">{a.city}</p><p className="text-xs text-slate-500">{a.country}</p></div></div>
                <span className="text-sm font-black text-slate-400">{a.code}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {(activeModal === 'date' || activeModal === 'returnDate') && (
        <div className="fixed inset-0 z-[80] bg-white dark:bg-slate-900 animate-in slide-in-from-bottom">
          <ModalHeader title="Select Date" onClose={() => setActiveModal(null)} />
          <div className="p-6 space-y-4">
            {['2026-05-10', '2026-05-15', '2026-05-20'].map(d => (
              <button key={d} onClick={() => { if(activeModal === 'date') setDepartureDate(d); else setReturnDate(d); setActiveModal(null); }} className="w-full p-4 border rounded-xl text-left font-bold flex justify-between">{d} <ChevronRight className="w-4 h-4" /></button>
            ))}
          </div>
        </div>
      )}

      {activeModal === 'passengers' && (
        <div className="fixed inset-0 z-[80] bg-black/60 backdrop-blur-sm flex items-end justify-center">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-t-3xl p-6 space-y-6">
            <div className="flex justify-between items-center"><h3 className="font-bold">Pax & Class</h3><button onClick={() => setActiveModal(null)}><X /></button></div>
            <div className="flex justify-between items-center">
              <p className="font-bold">Travelers</p>
              <div className="flex items-center gap-4 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                <button onClick={() => setPassengers(Math.max(1, passengers - 1))} className="w-8 h-8 rounded-lg bg-white">-</button>
                <span className="font-bold">{passengers}</span>
                <button onClick={() => setPassengers(passengers + 1)} className="w-8 h-8 rounded-lg bg-white">+</button>
              </div>
            </div>
            <div className="flex gap-2">
              {['Economy', 'Business'].map(c => (
                <button key={c} onClick={() => setTravelClass(c)} className={cn("flex-1 py-2 rounded-xl border-2 font-bold", travelClass === c ? "border-sky-500 bg-sky-50 text-sky-500" : "border-slate-100")}>{c}</button>
              ))}
            </div>
            <button onClick={() => setActiveModal(null)} className="w-full py-4 bg-sky-500 text-white font-bold rounded-xl">Done</button>
          </div>
        </div>
      )}

      <ToastComponent />
      {paymentSuccess && (
        <TransactionModal 
          isSuccess={true} 
          onClose={() => { setPaymentSuccess(null); setShowCheckout(false); setShowResults(false); navigate('/my-trips'); }} 
          toastMessage="Ticket booked successfully!" 
        />
      )}
    </div>
  );
}
