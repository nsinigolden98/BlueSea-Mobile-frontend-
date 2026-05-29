/**
 * BLUESEA MOBILE — GLOBAL SIMULATION ENGINE
 * Transaction Engine + Receipt Engine + Notification Engine + Analytics Engine
 */
import React, { createContext, useContext, useState, useCallback } from 'react';
import type {
  Transaction, ReceiptData, AppNotification, TransactionStatus, TransactionCategory,
  NotificationCategory, SavingsVault, BlueSeaCard, PensionPlan, InsurancePlan,
  Business, Invoice, Property, AppointmentBooking, Storefront, FreelanceService,
  FreelanceOrder, AffiliateItem, DigitalContract, BlueSeaEvent, EventTicket,
  LiveStream, BusTicket, Subscription, BSPCoinActivity
} from '@/types';

// ---- Transaction Engine ----
let txCounter = 1000;
const generateTxId = () => `BS${Date.now()}${++txCounter}`;

// ---- LocalStorage Persistence ----
const STORAGE_KEYS = {
  transactions: 'bluesea_transactions',
  notifications: 'bluesea_notifications',
  vaults: 'bluesea_vaults',
  cards: 'bluesea_cards',
  pension: 'bluesea_pension',
  insurance: 'bluesea_insurance',
  businesses: 'bluesea_businesses',
  invoices: 'bluesea_invoices',
  properties: 'bluesea_properties',
  appointments: 'bluesea_appointments',
  storefronts: 'bluesea_storefronts',
  freelanceServices: 'bluesea_freelance',
  affiliateItems: 'bluesea_affiliate',
  contracts: 'bluesea_contracts',
  events: 'bluesea_events',
  tickets: 'bluesea_tickets',
  streams: 'bluesea_streams',
  busTickets: 'bluesea_bus_tickets',
  subscriptions: 'bluesea_subscriptions',
  bspActivity: 'bluesea_bsp_activity',
};

function loadFromStorage<T>(key: string, defaultValue: T): T {
  try { const stored = localStorage.getItem(key); return stored ? JSON.parse(stored) : defaultValue; }
  catch { return defaultValue; }
}
function saveToStorage<T>(key: string, value: T) { localStorage.setItem(key, JSON.stringify(value)); }

// ---- Demo Data Generators ----
function createDemoTransactions(): Transaction[] {
  const now = Date.now();
  return [
    { id: generateTxId(), transaction_type: 'DEBIT', amount: 15000, description: 'Airtime Purchase - MTN', status: 'successful', category: 'airtime', created_at: new Date(now - 3600000).toISOString(), payment_method: 'Wallet' },
    { id: generateTxId(), transaction_type: 'DEBIT', amount: 250000, description: 'DSTV Premium Subscription', status: 'successful', category: 'bill_payment', created_at: new Date(now - 86400000).toISOString(), payment_method: 'Wallet' },
    { id: generateTxId(), transaction_type: 'CREDIT', amount: 500000, description: 'Wallet Deposit via Bank Transfer', status: 'successful', category: 'deposit', created_at: new Date(now - 172800000).toISOString(), payment_method: 'Bank Transfer' },
    { id: generateTxId(), transaction_type: 'DEBIT', amount: 85000, description: 'Marketplace Purchase - Sneakers', status: 'successful', category: 'marketplace', created_at: new Date(now - 259200000).toISOString(), payment_method: 'Wallet' },
    { id: generateTxId(), transaction_type: 'CREDIT', amount: 12000, description: 'Affiliate Commission - John D.', status: 'successful', category: 'affiliate_commission', created_at: new Date(now - 345600000).toISOString(), payment_method: 'Wallet' },
    { id: generateTxId(), transaction_type: 'DEBIT', amount: 45000, description: 'Data Bundle - 100GB', status: 'successful', category: 'data', created_at: new Date(now - 432000000).toISOString(), payment_method: 'Wallet' },
    { id: generateTxId(), transaction_type: 'DEBIT', amount: 180000, description: 'Savings Vault - Emergency Fund', status: 'successful', category: 'savings_deposit', created_at: new Date(now - 518400000).toISOString(), payment_method: 'Wallet' },
    { id: generateTxId(), transaction_type: 'DEBIT', amount: 15000, description: 'Bus Booking - Lagos to Abuja', status: 'successful', category: 'bus_booking', created_at: new Date(now - 604800000).toISOString(), payment_method: 'Wallet' },
    { id: generateTxId(), transaction_type: 'CREDIT', amount: 75000, description: 'Freelance Payment - Logo Design', status: 'successful', category: 'escrow', created_at: new Date(now - 691200000).toISOString(), payment_method: 'Escrow Release' },
    { id: generateTxId(), transaction_type: 'DEBIT', amount: 25000, description: 'Crypto Purchase - BSP Tokens', status: 'successful', category: 'crypto', created_at: new Date(now - 777600000).toISOString(), payment_method: 'Wallet' },
    { id: generateTxId(), transaction_type: 'DEBIT', amount: 50000, description: 'Pension Monthly Contribution', status: 'successful', category: 'pension', created_at: new Date(now - 864000000).toISOString(), payment_method: 'Wallet' },
    { id: generateTxId(), transaction_type: 'DEBIT', amount: 35000, description: 'Health Insurance Premium', status: 'successful', category: 'insurance', created_at: new Date(now - 950400000).toISOString(), payment_method: 'Wallet' },
  ];
}

function createDemoNotifications(): AppNotification[] {
  const now = Date.now();
  return [
    { id: 'n1', title: 'Transfer Received', subtitle: 'You received ₦500,000 from Adebayo O.', category: 'wallet', timestamp: new Date(now - 3600000).toISOString(), read: false, amount: 500000, actionType: 'open_receipt' },
    { id: 'n2', title: 'Affiliate Commission Earned', subtitle: 'You earned ₦12,000 from referral #BLUE2026', category: 'affiliate', timestamp: new Date(now - 86400000).toISOString(), read: false, amount: 12000 },
    { id: 'n3', title: 'Payroll Processed', subtitle: 'Monthly salary of ₦450,000 has been disbursed to 8 staff', category: 'payroll', timestamp: new Date(now - 172800000).toISOString(), read: true },
    { id: 'n4', title: 'Savings Milestone', subtitle: 'Your Travel Vault reached 75% of its goal!', category: 'savings', timestamp: new Date(now - 259200000).toISOString(), read: false },
    { id: 'n5', title: 'New Event Ticket Sold', subtitle: 'Someone purchased a VIP ticket to your "Tech Summit 2026" event', category: 'events', timestamp: new Date(now - 432000000).toISOString(), read: true },
    { id: 'n6', title: 'Stream Starting Soon', subtitle: '"Crypto Masterclass" goes live in 30 minutes', category: 'streaming', timestamp: new Date(now - 1800000).toISOString(), read: false },
    { id: 'n7', title: 'Subscription Renewal', subtitle: 'Your DSTV Premium subscription renews tomorrow', category: 'subscriptions', timestamp: new Date(now - 86400000 * 5).toISOString(), read: true },
    { id: 'n8', title: 'Security Alert', subtitle: 'New login detected from Chrome on Windows', category: 'security', timestamp: new Date(now - 86400000 * 2).toISOString(), read: false },
  ];
}

// ---- Context Interface ----
interface BlueSeaEngineContextType {
  // Transactions
  transactions: Transaction[];
  addTransaction: (tx: Omit<Transaction, 'id' | 'created_at'>) => Transaction;
  updateTransactionStatus: (id: string, status: TransactionStatus) => void;
  // Receipts
  generateReceipt: (tx: Transaction, overrides?: Partial<ReceiptData>) => ReceiptData;
  // Notifications
  notifications: AppNotification[];
  addNotification: (notif: Omit<AppNotification, 'id' | 'timestamp'>) => void;
  markNotificationRead: (id: string) => void;
  unreadCount: number;
  // Vaults
  vaults: SavingsVault[];
  addVault: (vault: Omit<SavingsVault, 'id' | 'createdAt'>) => SavingsVault;
  updateVault: (id: string, updates: Partial<SavingsVault>) => void;
  vaultDeposit: (vaultId: string, amount: number) => void;
  vaultWithdraw: (vaultId: string, amount: number) => void;
  // Cards
  cards: BlueSeaCard[];
  addCard: (card: Omit<BlueSeaCard, 'id'>) => BlueSeaCard;
  updateCard: (id: string, updates: Partial<BlueSeaCard>) => void;
  // Pension
  pensionPlans: PensionPlan[];
  addPensionPlan: (plan: Omit<PensionPlan, 'id'>) => PensionPlan;
  contributePension: (planId: string, amount: number) => void;
  // Insurance
  insurancePlans: InsurancePlan[];
  addInsurancePlan: (plan: Omit<InsurancePlan, 'id'>) => InsurancePlan;
  // Business
  businesses: Business[];
  addBusiness: (biz: Omit<Business, 'id' | 'createdAt'>) => Business;
  // Invoices
  invoices: Invoice[];
  addInvoice: (inv: Omit<Invoice, 'id' | 'createdAt'>) => Invoice;
  updateInvoice: (id: string, updates: Partial<Invoice>) => void;
  // Properties
  properties: Property[];
  addProperty: (prop: Omit<Property, 'id' | 'createdAt'>) => Property;
  // Appointments
  appointments: AppointmentBooking[];
  addAppointment: (apt: Omit<AppointmentBooking, 'id' | 'createdAt'>) => AppointmentBooking;
  // Storefronts
  storefronts: Storefront[];
  addStorefront: (store: Omit<Storefront, 'id' | 'createdAt' | 'analytics'>) => Storefront;
  // Freelance
  freelanceServices: FreelanceService[];
  addFreelanceService: (svc: Omit<FreelanceService, 'id'>) => FreelanceService;
  freelanceOrders: FreelanceOrder[];
  addFreelanceOrder: (order: Omit<FreelanceOrder, 'id' | 'createdAt'>) => FreelanceOrder;
  updateFreelanceOrder: (id: string, updates: Partial<FreelanceOrder>) => void;
  // Affiliate
  affiliateItems: AffiliateItem[];
  // Contracts
  contracts: DigitalContract[];
  addContract: (c: Omit<DigitalContract, 'id' | 'createdAt'>) => DigitalContract;
  updateContract: (id: string, updates: Partial<DigitalContract>) => void;
  // Events
  events: BlueSeaEvent[];
  addEvent: (e: Omit<BlueSeaEvent, 'id' | 'createdAt'>) => BlueSeaEvent;
  tickets: EventTicket[];
  addTicket: (t: Omit<EventTicket, 'id' | 'purchaseDate'>) => EventTicket;
  // Streams
  streams: LiveStream[];
  addStream: (s: Omit<LiveStream, 'id'>) => LiveStream;
  // Bus
  busTickets: BusTicket[];
  addBusTicket: (t: Omit<BusTicket, 'id'>) => BusTicket;
  // Subscriptions
  subscriptions: Subscription[];
  addSubscription: (s: Omit<Subscription, 'id' | 'createdAt'>) => Subscription;
  // BSP
  bspActivities: BSPCoinActivity[];
  addBSPActivity: (a: Omit<BSPCoinActivity, 'id' | 'timestamp'>) => void;
}

const BlueSeaEngineContext = createContext<BlueSeaEngineContextType | undefined>(undefined);

export function BlueSeaEngineProvider({ children }: { children: React.ReactNode }) {
  // ---- Transactions State ----
  const [transactions, setTransactions] = useState<Transaction[]>(() =>
    loadFromStorage(STORAGE_KEYS.transactions, createDemoTransactions())
  );
  // ---- Notifications State ----
  const [notifications, setNotifications] = useState<AppNotification[]>(() =>
    loadFromStorage(STORAGE_KEYS.notifications, createDemoNotifications())
  );
  // ---- Vaults State ----
  const [vaults, setVaults] = useState<SavingsVault[]>(() => loadFromStorage(STORAGE_KEYS.vaults, []));
  // ---- Cards State ----
  const [cards, setCards] = useState<BlueSeaCard[]>(() => loadFromStorage(STORAGE_KEYS.cards, []));
  // ---- Pension State ----
  const [pensionPlans, setPensionPlans] = useState<PensionPlan[]>(() => loadFromStorage(STORAGE_KEYS.pension, []));
  // ---- Insurance State ----
  const [insurancePlans, setInsurancePlans] = useState<InsurancePlan[]>(() => loadFromStorage(STORAGE_KEYS.insurance, []));
  // ---- Business State ----
  const [businesses, setBusinesses] = useState<Business[]>(() => loadFromStorage(STORAGE_KEYS.businesses, []));
  // ---- Invoices State ----
  const [invoices, setInvoices] = useState<Invoice[]>(() => loadFromStorage(STORAGE_KEYS.invoices, []));
  // ---- Properties State ----
  const [properties, setProperties] = useState<Property[]>(() => loadFromStorage(STORAGE_KEYS.properties, []));
  // ---- Appointments State ----
  const [appointments, setAppointments] = useState<AppointmentBooking[]>(() => loadFromStorage(STORAGE_KEYS.appointments, []));
  // ---- Storefronts State ----
  const [storefronts, setStorefronts] = useState<Storefront[]>(() => loadFromStorage(STORAGE_KEYS.storefronts, []));
  // ---- Freelance State ----
  const [freelanceServices, setFreelanceServices] = useState<FreelanceService[]>(() => loadFromStorage(STORAGE_KEYS.freelanceServices, []));
  const [freelanceOrders, setFreelanceOrders] = useState<FreelanceOrder[]>(() => loadFromStorage('bluesea_freelance_orders', []));
  // ---- Affiliate State ----
  const [affiliateItems] = useState<AffiliateItem[]>(() => loadFromStorage(STORAGE_KEYS.affiliateItems, []));
  // ---- Contracts State ----
  const [contracts, setContracts] = useState<DigitalContract[]>(() => loadFromStorage(STORAGE_KEYS.contracts, []));
  // ---- Events State ----
  const [events, setEvents] = useState<BlueSeaEvent[]>(() => loadFromStorage(STORAGE_KEYS.events, []));
  const [tickets, setTickets] = useState<EventTicket[]>(() => loadFromStorage(STORAGE_KEYS.tickets, []));
  // ---- Streams State ----
  const [streams, setStreams] = useState<LiveStream[]>(() => loadFromStorage(STORAGE_KEYS.streams, []));
  // ---- Bus State ----
  const [busTickets, setBusTickets] = useState<BusTicket[]>(() => loadFromStorage(STORAGE_KEYS.busTickets, []));
  // ---- Subscriptions State ----
  const [subscriptions, setSubscriptions] = useState<Subscription[]>(() => loadFromStorage(STORAGE_KEYS.subscriptions, []));
  // ---- BSP State ----
  const [bspActivities, setBspActivities] = useState<BSPCoinActivity[]>(() => loadFromStorage(STORAGE_KEYS.bspActivity, []));

  // ---- Persist Effects ----
  React.useEffect(() => { saveToStorage(STORAGE_KEYS.transactions, transactions); }, [transactions]);
  React.useEffect(() => { saveToStorage(STORAGE_KEYS.notifications, notifications); }, [notifications]);
  React.useEffect(() => { saveToStorage(STORAGE_KEYS.vaults, vaults); }, [vaults]);
  React.useEffect(() => { saveToStorage(STORAGE_KEYS.cards, cards); }, [cards]);
  React.useEffect(() => { saveToStorage(STORAGE_KEYS.pension, pensionPlans); }, [pensionPlans]);
  React.useEffect(() => { saveToStorage(STORAGE_KEYS.insurance, insurancePlans); }, [insurancePlans]);
  React.useEffect(() => { saveToStorage(STORAGE_KEYS.businesses, businesses); }, [businesses]);
  React.useEffect(() => { saveToStorage(STORAGE_KEYS.invoices, invoices); }, [invoices]);
  React.useEffect(() => { saveToStorage(STORAGE_KEYS.properties, properties); }, [properties]);
  React.useEffect(() => { saveToStorage(STORAGE_KEYS.appointments, appointments); }, [appointments]);
  React.useEffect(() => { saveToStorage(STORAGE_KEYS.storefronts, storefronts); }, [storefronts]);
  React.useEffect(() => { saveToStorage(STORAGE_KEYS.freelanceServices, freelanceServices); }, [freelanceServices]);
  React.useEffect(() => { saveToStorage('bluesea_freelance_orders', freelanceOrders); }, [freelanceOrders]);
  React.useEffect(() => { saveToStorage(STORAGE_KEYS.contracts, contracts); }, [contracts]);
  React.useEffect(() => { saveToStorage(STORAGE_KEYS.events, events); }, [events]);
  React.useEffect(() => { saveToStorage(STORAGE_KEYS.tickets, tickets); }, [tickets]);
  React.useEffect(() => { saveToStorage(STORAGE_KEYS.streams, streams); }, [streams]);
  React.useEffect(() => { saveToStorage(STORAGE_KEYS.busTickets, busTickets); }, [busTickets]);
  React.useEffect(() => { saveToStorage(STORAGE_KEYS.subscriptions, subscriptions); }, [subscriptions]);
  React.useEffect(() => { saveToStorage(STORAGE_KEYS.bspActivity, bspActivities); }, [bspActivities]);

  // ---- Transaction Actions ----
  const addTransaction = useCallback((tx: Omit<Transaction, 'id' | 'created_at'>) => {
    const newTx: Transaction = { ...tx, id: generateTxId(), created_at: new Date().toISOString() };
    setTransactions(prev => [newTx, ...prev]);
    return newTx;
  }, []);

  const updateTransactionStatus = useCallback((id: string, status: TransactionStatus) => {
    setTransactions(prev => prev.map(t => t.id === id ? { ...t, status } : t));
  }, []);

  // ---- Receipt Generator ----
  const generateReceipt = useCallback((tx: Transaction, overrides?: Partial<ReceiptData>): ReceiptData => {
    return {
      transactionId: tx.id,
      timestamp: tx.created_at,
      status: tx.status,
      category: tx.category,
      sender: { name: tx.sender_name || 'BlueSea User', walletId: 'BSW' + Math.random().toString(36).slice(2, 10).toUpperCase() },
      receiver: { name: tx.receiver_name || tx.description, walletId: 'BSW' + Math.random().toString(36).slice(2, 10).toUpperCase() },
      amount: tx.amount,
      fee: tx.amount * 0.005,
      total: tx.amount * 1.005,
      paymentMethod: tx.payment_method || 'BlueSea Wallet',
      walletUsed: 'BlueSea Naira Wallet',
      description: tx.description,
      qrData: `https://blueseamobile.com.ng/verify/${tx.id}`,
      ...overrides,
    };
  }, []);

  // ---- Notification Actions ----
  const addNotification = useCallback((notif: Omit<AppNotification, 'id' | 'timestamp'>) => {
    const newNotif: AppNotification = { ...notif, id: 'n' + Date.now() + Math.random(), timestamp: new Date().toISOString() };
    setNotifications(prev => [newNotif, ...prev]);
  }, []);

  const markNotificationRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  // ---- Vault Actions ----
  const addVault = useCallback((vault: Omit<SavingsVault, 'id' | 'createdAt'>) => {
    const newVault: SavingsVault = { ...vault, id: 'v' + Date.now(), createdAt: new Date().toISOString() };
    setVaults(prev => [...prev, newVault]);
    return newVault;
  }, []);

  const updateVault = useCallback((id: string, updates: Partial<SavingsVault>) => {
    setVaults(prev => prev.map(v => v.id === id ? { ...v, ...updates } : v));
  }, []);

  const vaultDeposit = useCallback((vaultId: string, amount: number) => {
    setVaults(prev => prev.map(v => {
      if (v.id !== vaultId) return v;
      const newCurrent = v.current + amount;
      const milestones = v.milestones.map(m => ({
        ...m,
        achieved: !m.achieved && newCurrent >= v.goal * (m.percentage / 100),
        achievedAt: !m.achieved && newCurrent >= v.goal * (m.percentage / 100) ? new Date().toISOString() : m.achievedAt,
      }));
      return { ...v, current: newCurrent, milestones, transactions: [...v.transactions, { id: 'vt' + Date.now(), type: 'deposit', amount, timestamp: new Date().toISOString() }] };
    }));
  }, []);

  const vaultWithdraw = useCallback((vaultId: string, amount: number) => {
    setVaults(prev => prev.map(v => {
      if (v.id !== vaultId) return v;
      return { ...v, current: Math.max(0, v.current - amount), transactions: [...v.transactions, { id: 'vt' + Date.now(), type: 'withdrawal', amount, timestamp: new Date().toISOString() }] };
    }));
  }, []);

  // ---- Card Actions ----
  const addCard = useCallback((card: Omit<BlueSeaCard, 'id'>) => {
    const newCard: BlueSeaCard = { ...card, id: 'c' + Date.now() };
    setCards(prev => [...prev, newCard]);
    return newCard;
  }, []);

  const updateCard = useCallback((id: string, updates: Partial<BlueSeaCard>) => {
    setCards(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  }, []);

  // ---- Pension Actions ----
  const addPensionPlan = useCallback((plan: Omit<PensionPlan, 'id'>) => {
    const newPlan: PensionPlan = { ...plan, id: 'p' + Date.now() };
    setPensionPlans(prev => [...prev, newPlan]);
    return newPlan;
  }, []);

  const contributePension = useCallback((planId: string, amount: number) => {
    setPensionPlans(prev => prev.map(p => {
      if (p.id !== planId) return p;
      const employerAmount = amount * (p.employerMatch / 100);
      return {
        ...p,
        totalContribution: p.totalContribution + amount + employerAmount,
        history: [...p.history, { id: 'pc' + Date.now(), amount, employerAmount, date: new Date().toISOString(), month: new Date().toLocaleString('en-NG', { month: 'long', year: 'numeric' }) }],
      };
    }));
  }, []);

  // ---- Insurance Actions ----
  const addInsurancePlan = useCallback((plan: Omit<InsurancePlan, 'id'>) => {
    const newPlan: InsurancePlan = { ...plan, id: 'i' + Date.now() };
    setInsurancePlans(prev => [...prev, newPlan]);
    return newPlan;
  }, []);

  // ---- Business Actions ----
  const addBusiness = useCallback((biz: Omit<Business, 'id' | 'createdAt'>) => {
    const newBiz: Business = { ...biz, id: 'b' + Date.now(), createdAt: new Date().toISOString() };
    setBusinesses(prev => [...prev, newBiz]);
    return newBiz;
  }, []);

  // ---- Invoice Actions ----
  const addInvoice = useCallback((inv: Omit<Invoice, 'id' | 'createdAt'>) => {
    const newInv: Invoice = { ...inv, id: 'inv' + Date.now(), createdAt: new Date().toISOString() };
    setInvoices(prev => [...prev, newInv]);
    return newInv;
  }, []);

  const updateInvoice = useCallback((id: string, updates: Partial<Invoice>) => {
    setInvoices(prev => prev.map(i => i.id === id ? { ...i, ...updates } : i));
  }, []);

  // ---- Property Actions ----
  const addProperty = useCallback((prop: Omit<Property, 'id' | 'createdAt'>) => {
    const newProp: Property = { ...prop, id: 'prop' + Date.now(), createdAt: new Date().toISOString() };
    setProperties(prev => [...prev, newProp]);
    return newProp;
  }, []);

  // ---- Appointment Actions ----
  const addAppointment = useCallback((apt: Omit<AppointmentBooking, 'id' | 'createdAt'>) => {
    const newApt: AppointmentBooking = { ...apt, id: 'apt' + Date.now(), createdAt: new Date().toISOString() };
    setAppointments(prev => [...prev, newApt]);
    return newApt;
  }, []);

  // ---- Storefront Actions ----
  const addStorefront = useCallback((store: Omit<Storefront, 'id' | 'createdAt' | 'analytics'>) => {
    const newStore: Storefront = { ...store, id: 's' + Date.now(), createdAt: new Date().toISOString(), analytics: { totalSales: 0, totalRevenue: 0, visitors: 0, conversionRate: 0, affiliateSales: 0 } };
    setStorefronts(prev => [...prev, newStore]);
    return newStore;
  }, []);

  // ---- Freelance Actions ----
  const addFreelanceService = useCallback((svc: Omit<FreelanceService, 'id'>) => {
    const newSvc: FreelanceService = { ...svc, id: 'fs' + Date.now() };
    setFreelanceServices(prev => [...prev, newSvc]);
    return newSvc;
  }, []);

  const addFreelanceOrder = useCallback((order: Omit<FreelanceOrder, 'id' | 'createdAt'>) => {
    const newOrder: FreelanceOrder = { ...order, id: 'fo' + Date.now(), createdAt: new Date().toISOString() };
    setFreelanceOrders(prev => [...prev, newOrder]);
    return newOrder;
  }, []);

  const updateFreelanceOrder = useCallback((id: string, updates: Partial<FreelanceOrder>) => {
    setFreelanceOrders(prev => prev.map(o => o.id === id ? { ...o, ...updates } : o));
  }, []);

  // ---- Contract Actions ----
  const addContract = useCallback((c: Omit<DigitalContract, 'id' | 'createdAt'>) => {
    const newC: DigitalContract = { ...c, id: 'ct' + Date.now(), createdAt: new Date().toISOString() };
    setContracts(prev => [...prev, newC]);
    return newC;
  }, []);

  const updateContract = useCallback((id: string, updates: Partial<DigitalContract>) => {
    setContracts(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  }, []);

  // ---- Event Actions ----
  const addEvent = useCallback((e: Omit<BlueSeaEvent, 'id' | 'createdAt'>) => {
    const newEvent: BlueSeaEvent = { ...e, id: 'ev' + Date.now(), createdAt: new Date().toISOString() };
    setEvents(prev => [...prev, newEvent]);
    return newEvent;
  }, []);

  const addTicket = useCallback((t: Omit<EventTicket, 'id' | 'purchaseDate'>) => {
    const newTicket: EventTicket = { ...t, id: 'tk' + Date.now(), purchaseDate: new Date().toISOString() };
    setTickets(prev => [...prev, newTicket]);
    return newTicket;
  }, []);

  // ---- Stream Actions ----
  const addStream = useCallback((s: Omit<LiveStream, 'id'>) => {
    const newStream: LiveStream = { ...s, id: 'st' + Date.now() };
    setStreams(prev => [...prev, newStream]);
    return newStream;
  }, []);

  // ---- Bus Actions ----
  const addBusTicket = useCallback((t: Omit<BusTicket, 'id'>) => {
    const newTicket: BusTicket = { ...t, id: 'bt' + Date.now() };
    setBusTickets(prev => [...prev, newTicket]);
    return newTicket;
  }, []);

  // ---- Subscription Actions ----
  const addSubscription = useCallback((s: Omit<Subscription, 'id' | 'createdAt'>) => {
    const newSub: Subscription = { ...s, id: 'sub' + Date.now(), createdAt: new Date().toISOString() };
    setSubscriptions(prev => [...prev, newSub]);
    return newSub;
  }, []);

  // ---- BSP Actions ----
  const addBSPActivity = useCallback((a: Omit<BSPCoinActivity, 'id' | 'timestamp'>) => {
    const newA: BSPCoinActivity = { ...a, id: 'bsp' + Date.now(), timestamp: new Date().toISOString() };
    setBspActivities(prev => [newA, ...prev]);
    const current = Number(localStorage.getItem('bsp_balance') || '0');
    const change = a.type === 'earn' || a.type === 'receive' ? a.amount : -a.amount;
    localStorage.setItem('bsp_balance', String(Math.max(0, current + change)));
  }, []);

  return (
    <BlueSeaEngineContext.Provider value={{
      transactions, addTransaction, updateTransactionStatus,
      generateReceipt,
      notifications, addNotification, markNotificationRead, unreadCount,
      vaults, addVault, updateVault, vaultDeposit, vaultWithdraw,
      cards, addCard, updateCard,
      pensionPlans, addPensionPlan, contributePension,
      insurancePlans, addInsurancePlan,
      businesses, addBusiness,
      invoices, addInvoice, updateInvoice,
      properties, addProperty,
      appointments, addAppointment,
      storefronts, addStorefront,
      freelanceServices, addFreelanceService, freelanceOrders, addFreelanceOrder, updateFreelanceOrder,
      affiliateItems,
      contracts, addContract, updateContract,
      events, addEvent, tickets, addTicket,
      streams, addStream,
      busTickets, addBusTicket,
      subscriptions, addSubscription,
      bspActivities, addBSPActivity,
    }}>
      {children}
    </BlueSeaEngineContext.Provider>
  );
}

export function useBlueSeaEngine() {
  const context = useContext(BlueSeaEngineContext);
  if (context === undefined) throw new Error('useBlueSeaEngine must be used within BlueSeaEngineProvider');
  return context;
}
