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
  Calendar, 
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
  Check,
  Clock,
  Info,
  ChevronDown
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

// --- SUB-COMPONENTS ---

const ModalHeader = ({ title, onClose }: { title: string; onClose: () => void }) => (
  <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 sticky top-0 z-10">
    <button onClick={onClose} className="p-2 -ml-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
      <X className="w-5 h-5 text-slate-600 dark:text-slate-400" />
    </button>
    <h3 className="font-bold text-slate-800 dark:text-white">{title}</h3>
    <div className="w-10" /> {/* Spacer for centering */}
  </div>
);

export default function FlightsPage() {
  const navigate = useNavigate();
  const { showToast, ToastComponent } = Toast();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Search States
  const [tripType, setTripType] = useState<TripType>('one-way');
  const [fromLocation, setFromLocation] = useState<FlightLocation | null>(null);
  const [toLocation, setToLocation] = useState<FlightLocation | null>(null);
  const [departureDate, setDepartureDate] = useState<string>('');
  const [returnDate, setReturnDate] = useState<string>('');
  const [passengers, setPassengers] = useState(1);
  const [travelClass, setTravelClass] = useState('Economy');

  // Modal Control States
  const [activeModal, setActiveModal] = useState<'from' | 'to' | 'date' | 'passengers' | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [expandedFlightId, setExpandedFlightId] = useState<string | null>(null);
  const [selectedFlight, setSelectedFlight] = useState<Flight | null>(null);
  const [showCheckout, setShowCheckout] = useState(false);

  // Checkout Form State
  const [passengerDetails, setPassengerDetails] = useState<PassengerDetails>({
    fullName: '',
    gender: 'Male',
    dob: '',
    phone: '',
    email: '',
    sendToEmail: true
  });

  // Payment Sim State
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState<boolean | null>(null);

  // Close menu on outside click
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
    }, 1500);
  };

  const handlePayment = () => {
    setIsProcessingPayment(true);
    setTimeout(() => {
      setIsProcessingPayment(false);
      setPaymentSuccess(true);
      showToast('Ticket booked successfully! We\'ve sent the details to your email.', 'success');
    }, 2000);
  };

  const isSearchDisabled = !fromLocation || !toLocation || !departureDate || (tripType === 'round-trip' && !returnDate);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0">
        {/* --- 1. HEADER SECTION --- */}
        <header className="flex items-center justify-between px-4 py-4 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 -ml-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>
            <h1 className="text-xl font-bold text-slate-800 dark:text-white">Flights</h1>
          </div>
          
          <div className="relative" ref={menuRef}>
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
            >
              <MoreVertical className="w-5 h-5 text-slate-600 dark:text-slate-400" />
            </button>
            
            {isMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 py-2 z-50 animate-in fade-in zoom-in-95 duration-200">
                <button onClick={() => navigate('/my-trips')} className="w-full px-4 py-2 text-left text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50 flex items-center gap-3">
                  <Briefcase className="w-4 h-4 text-sky-500" /> My Trips
                </button>
                <button onClick={() => navigate('/my-trips')} className="w-full px-4 py-2 text-left text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50 flex items-center gap-3">
                  <History className="w-4 h-4 text-sky-500" /> Flight History
                </button>
                <div className="h-px bg-slate-100 dark:bg-slate-700 my-1" />
                <button className="w-full px-4 py-2 text-left text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50 flex items-center gap-3">
                  <HelpCircle className="w-4 h-4 text-sky-500" /> Help / Support
                </button>
              </div>
            )}
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6 overflow-y-auto space-y-6">
          <div className="max-w-3xl mx-auto space-y-6">
            
            {/* --- 2. SEARCH CARD --- */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-sm border border-slate-100 dark:border-slate-700 space-y-6">
              
              {/* Trip Type Toggle */}
              <div className="flex p-1 bg-slate-100 dark:bg-slate-900 rounded-xl w-fit">
                <button 
                  onClick={() => setTripType('one-way')}
                  className={cn(
                    "px-6 py-2 rounded-lg text-sm font-bold transition-all",
                    tripType === 'one-way' ? "bg-white dark:bg-slate-800 text-sky-500 shadow-sm" : "text-slate-500"
                  )}
                >
                  One-way
                </button>
                <button 
                  onClick={() => setTripType('round-trip')}
                  className={cn(
                    "px-6 py-2 rounded-lg text-sm font-bold transition-all",
                    tripType === 'round-trip' ? "bg-white dark:bg-slate-800 text-sky-500 shadow-sm" : "text-slate-500"
                  )}
                >
                  Round-trip
                </button>
              </div>

              {/* From / To Fields */}
              <div className="relative grid grid-cols-1 md:grid-cols-2 gap-4">
                <div 
                  onClick={() => setActiveModal('from')}
                  className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-sky-300 transition-colors cursor-pointer"
                >
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">From</p>
                  <p className="font-bold text-slate-800 dark:text-white">
                    {fromLocation ? `${fromLocation.city} (${fromLocation.code})` : "Select Departure"}
                  </p>
                </div>

                <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 items-center justify-center text-sky-500 shadow-sm">
                  <ArrowRightLeft className="w-4 h-4" />
                </div>

                <div 
                  onClick={() => setActiveModal('to')}
                  className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-sky-300 transition-colors cursor-pointer"
                >
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">To</p>
                  <p className="font-bold text-slate-800 dark:text-white">
                    {toLocation ? `${toLocation.city} (${toLocation.code})` : "Select Destination"}
                  </p>
                </div>
              </div>

              {/* Date & Passenger Selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="grid grid-cols-2 gap-2">
                  <div 
                    onClick={() => setActiveModal('date')}
                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer"
                  >
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Departure</p>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      <p className="text-sm font-bold text-slate-800 dark:text-white">{departureDate || "Set Date"}</p>
                    </div>
                  </div>
                  <div 
                    onClick={() => {
                      setTripType('round-trip');
                      if (!returnDate) setActiveModal('date');
                    }}
                    className={cn(
                      "p-4 rounded-xl border transition-colors cursor-pointer",
                      tripType === 'round-trip' ? "border-slate-200 dark:border-slate-700" : "bg-slate-50 dark:bg-slate-900 border-transparent opacity-60"
                    )}
                  >
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Return</p>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      <p className="text-sm font-bold text-slate-800 dark:text-white">
                        {tripType === 'round-trip' ? (returnDate || "Set Date") : "---"}
                      </p>
                    </div>
                  </div>
                </div>

                <div 
                  onClick={() => setActiveModal('passengers')}
                  className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer flex justify-between items-center"
                >
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Passengers & Class</p>
                    <p className="text-sm font-bold text-slate-800 dark:text-white">
                      {passengers} {passengers > 1 ? 'Passengers' : 'Passenger'}, {travelClass}
                    </p>
                  </div>
                  <Users className="w-5 h-5 text-slate-400" />
                </div>
              </div>

              {/* Search Button */}
              <button 
                onClick={handleSearch}
                disabled={isSearchDisabled || isSearching}
                className="w-full py-4 rounded-xl bg-sky-500 text-white font-bold hover:bg-sky-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-sky-500/20"
              >
                {isSearching ? <span className="animate-pulse">Searching...</span> : (
                  <span className="flex items-center gap-2">
                    <Search className="w-5 h-5" />
                    Search Flights
                  </span>
                )}
              </button>
            </div>

            {/* --- 3. QUICK ACTIONS SECTION --- */}
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
              {[
                { label: 'My Trips', icon: <Briefcase className="w-4 h-4" /> },
                { label: 'Recent', icon: <History className="w-4 h-4" /> },
                { label: 'Track', icon: <Clock className="w-4 h-4" /> },
              ].map((item, idx) => (
                <button key={idx} className="flex-shrink-0 flex items-center gap-3 px-5 py-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm font-bold text-sm text-slate-700 dark:text-slate-200">
                  <div className="p-2 rounded-lg bg-sky-50 dark:bg-sky-900/30 text-sky-500">
                    {item.icon}
                  </div>
                  {item.label}
                </button>
              ))}
            </div>

            {/* --- 4. HOTEL UPSELL --- */}
            <div className="bg-gradient-to-r from-sky-500 to-blue-600 rounded-2xl p-6 text-white relative overflow-hidden">
               <div className="relative z-10 space-y-4">
                  <div>
                    <h3 className="text-lg font-bold">Find hotels at your destination</h3>
                    <p className="text-sky-100 text-sm">Save up to 20% when you book a flight and hotel together.</p>
                  </div>
                  <button className="px-5 py-2.5 bg-white text-sky-600 rounded-xl font-bold text-sm hover:bg-sky-50 transition-colors flex items-center gap-2">
                    Explore Hotels
                    <ChevronRight className="w-4 h-4" />
                  </button>
               </div>
               <Plane className="absolute -right-10 -bottom-10 w-48 h-48 opacity-10 rotate-12" />
            </div>
          </div>
        </main>
      </div>

      {/* --- 5. FLIGHT RESULTS OVERLAY --- */}
      {showResults && (
        <div className="fixed inset-0 z-[60] bg-white dark:bg-slate-900 flex flex-col animate-in slide-in-from-right duration-300">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900 sticky top-0">
            <div className="flex items-center gap-4">
              <button onClick={() => setShowResults(false)} className="p-2 -ml-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full">
                <ChevronLeft className="w-6 h-6 text-slate-800 dark:text-white" />
              </button>
              <div>
                <h3 className="font-bold text-slate-800 dark:text-white leading-tight">
                  {fromLocation?.city} → {toLocation?.city}
                </h3>
                <p className="text-xs text-slate-500">{departureDate} • {passengers} Traveller</p>
              </div>
            </div>
            <button className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
              <Filter className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {MOCK_FLIGHTS.map((flight) => (
              <div 
                key={flight.id} 
                className={cn(
                  "bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 transition-all overflow-hidden",
                  expandedFlightId === flight.id ? "ring-2 ring-sky-500 shadow-xl" : "shadow-sm"
                )}
              >
                {/* Collapsed Header */}
                <div 
                  className="p-4 cursor-pointer" 
                  onClick={() => setExpandedFlightId(expandedFlightId === flight.id ? null : flight.id)}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-900 flex items-center justify-center text-lg">{flight.airlineLogo}</div>
                      <span className="font-bold text-sm text-slate-800 dark:text-white">{flight.airline}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-black text-sky-500">₦{flight.price.toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between px-2">
                    <div className="text-center">
                      <p className="text-lg font-bold text-slate-800 dark:text-white">{flight.departureTime}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{fromLocation?.code}</p>
                    </div>
                    
                    <div className="flex-1 px-4 flex flex-col items-center">
                      <p className="text-[10px] text-slate-400 font-medium mb-1">{flight.duration}</p>
                      <div className="relative w-full h-[2px] bg-slate-200 dark:bg-slate-700">
                        <div className="absolute top-1/2 left-0 -translate-y-1/2 w-2 h-2 rounded-full bg-slate-200 dark:bg-slate-700" />
                        <Plane className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 text-sky-500 bg-white dark:bg-slate-800 px-0.5" />
                        <div className="absolute top-1/2 right-0 -translate-y-1/2 w-2 h-2 rounded-full bg-slate-200 dark:bg-slate-700" />
                      </div>
                      <p className="text-[10px] text-sky-500 font-bold mt-1 uppercase tracking-tighter">{flight.stops}</p>
                    </div>

                    <div className="text-center">
                      <p className="text-lg font-bold text-slate-800 dark:text-white">{flight.arrivalTime}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{toLocation?.code}</p>
                    </div>
                  </div>
                </div>

                {/* Expanded Details */}
                {expandedFlightId === flight.id && (
                  <div className="px-4 pb-4 border-t border-dashed border-slate-100 dark:border-slate-700 pt-4 animate-in fade-in slide-in-from-top-2">
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <Info className="w-3 h-3" />
                        <span>Flight: {flight.flightNumber}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <Briefcase className="w-3 h-3" />
                        <span>{flight.baggage}</span>
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => {
                        setSelectedFlight(flight);
                        setShowCheckout(true);
                      }}
                      className="w-full py-3 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-sm flex items-center justify-center gap-2"
                    >
                      Select Flight
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- 6. PASSENGER DETAILS MODAL --- */}
      {showCheckout && (
        <div className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm flex items-end justify-center sm:items-center p-0 sm:p-4 animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-t-3xl sm:rounded-2xl overflow-hidden max-h-[90vh] flex flex-col animate-in slide-in-from-bottom-10 duration-300">
            <ModalHeader title="Passenger Details" onClose={() => setShowCheckout(false)} />
            
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="bg-sky-50 dark:bg-sky-900/20 p-4 rounded-xl border border-sky-100 dark:border-sky-800 flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center text-sky-500 shadow-sm font-bold">
                  {selectedFlight?.airlineLogo}
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 dark:text-white text-sm">Booking Summary</h4>
                  <p className="text-xs text-slate-500">{fromLocation?.city} to {toLocation?.city} • {selectedFlight?.price.toLocaleString()} NGN</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Full Name (As in ID)</label>
                  <Input 
                    placeholder="Enter full name" 
                    value={passengerDetails.fullName}
                    onChange={(e) => setPassengerDetails({...passengerDetails, fullName: e.target.value})}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Gender</label>
                    <div className="relative">
                      <select 
                        className="w-full h-10 rounded-lg border border-slate-200 dark:border-slate-800 bg-transparent px-3 text-sm appearance-none"
                        value={passengerDetails.gender}
                        onChange={(e) => setPassengerDetails({...passengerDetails, gender: e.target.value})}
                      >
                        <option>Male</option>
                        <option>Female</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Date of Birth</label>
                    <Input 
                      type="date"
                      value={passengerDetails.dob}
                      onChange={(e) => setPassengerDetails({...passengerDetails, dob: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Email Address</label>
                  <Input 
                    placeholder="example@mail.com"
                    value={passengerDetails.email}
                    onChange={(e) => setPassengerDetails({...passengerDetails, email: e.target.value})}
                  />
                </div>

                <div className="flex items-center gap-3 p-1">
                  <div className="relative flex items-center">
                    <input 
                      type="checkbox" 
                      className="w-5 h-5 accent-sky-500 opacity-0 absolute" 
                      checked={passengerDetails.sendToEmail}
                      onChange={(e) => setPassengerDetails({...passengerDetails, sendToEmail: e.target.checked})}
                      id="send-email"
                    />
                    <div className={cn(
                      "w-5 h-5 rounded border-2 flex items-center justify-center transition-colors",
                      passengerDetails.sendToEmail ? "bg-sky-500 border-sky-500" : "border-slate-300 dark:border-slate-600"
                    )}>
                      {passengerDetails.sendToEmail && <Check className="w-3 h-3 text-white" />}
                    </div>
                  </div>
                  <label htmlFor="send-email" className="text-sm text-slate-600 dark:text-slate-400 font-medium cursor-pointer">Send ticket to email</label>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-slate-100 dark:border-slate-800">
              <button 
                onClick={handlePayment}
                disabled={!passengerDetails.fullName || !passengerDetails.email || isProcessingPayment}
                className="w-full py-4 rounded-xl bg-sky-500 text-white font-bold hover:bg-sky-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isProcessingPayment ? <LoaderIcon className="w-5 h-5 animate-spin" /> : "Continue to Payment"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- SELECT MODALS (FOR FIELDS) --- */}
      {(activeModal === 'from' || activeModal === 'to') && (
        <div className="fixed inset-0 z-[80] bg-white dark:bg-slate-900 animate-in slide-in-from-bottom duration-300">
          <ModalHeader 
            title={activeModal === 'from' ? "Where from?" : "Where to?"} 
            onClose={() => setActiveModal(null)} 
          />
          <div className="p-4 space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input className="pl-10 h-12 rounded-xl" placeholder="Search city or airport..." />
            </div>
            <div className="space-y-1">
              {AIRPORTS.map((airport) => (
                <button
                  key={airport.code}
                  onClick={() => {
                    if (activeModal === 'from') setFromLocation(airport);
                    else setToLocation(airport);
                    setActiveModal(null);
                  }}
                  className="w-full p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors text-left"
                >
                  <div className="flex items-center gap-4">
                    <span className="text-2xl">{airport.flag}</span>
                    <div>
                      <p className="font-bold text-slate-800 dark:text-white">{airport.city}</p>
                      <p className="text-xs text-slate-500">{airport.country}</p>
                    </div>
                  </div>
                  <span className="text-sm font-black text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded-lg">
                    {airport.code}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Passengers Modal */}
      {activeModal === 'passengers' && (
        <div className="fixed inset-0 z-[80] bg-black/60 backdrop-blur-sm flex items-end justify-center p-0 animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-t-3xl p-6 space-y-6 animate-in slide-in-from-bottom-full duration-300">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold">Passengers & Class</h3>
              <button onClick={() => setActiveModal(null)}><X className="w-6 h-6" /></button>
            </div>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold">Passengers</p>
                  <p className="text-xs text-slate-500">Number of people traveling</p>
                </div>
                <div className="flex items-center gap-4 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                  <button onClick={() => setPassengers(Math.max(1, passengers - 1))} className="w-8 h-8 rounded-lg bg-white dark:bg-slate-700 flex items-center justify-center">-</button>
                  <span className="font-bold w-4 text-center">{passengers}</span>
                  <button onClick={() => setPassengers(passengers + 1)} className="w-8 h-8 rounded-lg bg-white dark:bg-slate-700 flex items-center justify-center">+</button>
                </div>
              </div>

              <div className="space-y-3">
                <p className="font-bold">Travel Class</p>
                <div className="flex flex-wrap gap-2">
                  {['Economy', 'Business', 'First Class'].map(c => (
                    <button 
                      key={c}
                      onClick={() => setTravelClass(c)}
                      className={cn(
                        "px-6 py-2.5 rounded-xl border-2 font-bold text-sm transition-all",
                        travelClass === c ? "border-sky-500 bg-sky-50 text-sky-500" : "border-slate-100 dark:border-slate-800 text-slate-500"
                      )}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button 
              onClick={() => setActiveModal(null)}
              className="w-full py-4 bg-sky-500 text-white font-bold rounded-xl"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* Date Select Modal (Simplified) */}
      {activeModal === 'date' && (
        <div className="fixed inset-0 z-[80] bg-white dark:bg-slate-900 animate-in slide-in-from-bottom duration-300">
           <ModalHeader title="Select Date" onClose={() => setActiveModal(null)} />
           <div className="p-6 space-y-4">
              <p className="text-sm text-slate-500">Choose your departure date</p>
              <div className="grid grid-cols-1 gap-2">
                {['2026-05-10', '2026-05-11', '2026-05-12', '2026-05-13'].map(d => (
                  <button 
                    key={d}
                    onClick={() => {
                      if (tripType === 'round-trip' && !returnDate && departureDate) {
                        setReturnDate(new Date(d).toDateString());
                      } else {
                        setDepartureDate(new Date(d).toDateString());
                      }
                      setActiveModal(null);
                    }}
                    className="p-4 border border-slate-100 dark:border-slate-800 rounded-xl text-left font-bold flex justify-between items-center"
                  >
                    {new Date(d).toDateString()}
                    <ChevronRight className="w-4 h-4 text-slate-300" />
                  </button>
                ))}
              </div>
           </div>
        </div>
      )}

      <ToastComponent />
      {paymentSuccess && (
        <TransactionModal 
          isSuccess={true} 
          onClose={() => {
            setPaymentSuccess(null);
            setShowCheckout(false);
            setShowResults(false);
            navigate('/my-trips');
          }} 
          toastMessage="Ticket booked successfully! We've sent the details to your email." 
        />
      )}
    </div>
  );
}

function LoaderIcon({ className }: { className?: string }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
      }
                
