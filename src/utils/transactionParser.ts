import { type Transaction } from '@/types';
import { 
  Zap, Phone, Wifi, Send, MonitorPlay, GraduationCap, 
  ShoppingCart, Ticket, Gift, CreditCard, Users, Landmark, 
  type LucideIcon 
} from 'lucide-react';

export type TransactionCategory = 
  | 'ELECTRICITY' | 'AIRTIME' | 'DATA' | 'WALLET_FUNDING' 
  | 'INTERNAL_TRANSFER' | 'WITHDRAWAL' | 'CABLE_TV' 
  | 'EDUCATION' | 'MARKETPLACE' | 'GROUP_PAYMENT' | 'REWARD' | 'UNKNOWN';

export interface ParsedDetails {
  category: TransactionCategory;
  title: string;
  icon: LucideIcon;
  recipientName?: string;
  recipientNumber?: string;
  network?: string;
  meterNumber?: string;
  token?: string;
  serviceProvider?: string;
}

export interface ParsedTransaction extends Transaction {
  parsed: ParsedDetails;
}

// Regex patterns tuned for common Nigerian VAS and fintech description formats
const PATTERNS = {
  TOKEN: /(?:token|pin)[\s:]*([0-9]{4}-?[0-9]{4}-?[0-9]{4}-?[0-9]{4}-?[0-9]{4}|[0-9]{20})/i,
  PHONE: /((?:080|081|090|091|070)\d{8})/,
  METER: /(?:meter)[\s:]*([0-9]{10,13})/i,
  NETWORK: /(MTN|AIRTEL|GLO|9MOBILE|ETISALAT)/i,
  ELECTRICITY_PROV: /(PHED|IKEDC|EKEDC|AEDC|KEDCO|EEDC|IBEDC|JEDC)/i,
  CABLE: /(DSTV|GOTV|STARTIMES|SHOWMAX)/i,
  EDUCATION: /(WAEC|JAMB|NECO)/i,
};

export const parseTransactionInfo = (transaction: Transaction): ParsedDetails => {
  const desc = transaction.description.toUpperCase();
  let details: ParsedDetails = {
    category: 'UNKNOWN',
    title: transaction.transaction_type === 'CREDIT' ? 'Credit Received' : 'Payment Made',
    icon: CreditCard,
  };

  // 1. Electricity
  if (desc.includes('ELECTRICITY') || PATTERNS.ELECTRICITY_PROV.test(desc) || PATTERNS.TOKEN.test(desc)) {
    details.category = 'ELECTRICITY';
    details.icon = Zap;
    details.serviceProvider = desc.match(PATTERNS.ELECTRICITY_PROV)?.[1] || 'Electricity Distribution';
    details.title = `${details.serviceProvider} Postpaid/Prepaid`;
    details.token = desc.match(PATTERNS.TOKEN)?.[1]?.replace(/-/g, '');
    details.meterNumber = desc.match(PATTERNS.METER)?.[1];
  }
  // 2. Airtime
  else if (desc.includes('AIRTIME') || desc.includes('VTU')) {
    details.category = 'AIRTIME';
    details.icon = Phone;
    details.network = desc.match(PATTERNS.NETWORK)?.[1];
    details.recipientNumber = desc.match(PATTERNS.PHONE)?.[1];
    details.title = details.network ? `${details.network} Airtime` : 'Airtime Purchase';
  }
  // 3. Data
  else if (desc.includes('DATA')) {
    details.category = 'DATA';
    details.icon = Wifi;
    details.network = desc.match(PATTERNS.NETWORK)?.[1];
    details.recipientNumber = desc.match(PATTERNS.PHONE)?.[1];
    details.title = details.network ? `${details.network} Data Bundle` : 'Data Purchase';
  }
  // 4. Transfers (Internal & Bank)
  else if (desc.includes('TRANSFER') || desc.includes('SENT TO')) {
    details.category = 'INTERNAL_TRANSFER';
    details.icon = Send;
    details.title = 'Funds Transfer';
    // Basic extraction if format is "Transfer to John Doe"
    const nameMatch = desc.match(/TO\s+([A-Z\s]+?)(?:\s+\d|$)/);
    if (nameMatch) details.recipientName = nameMatch[1].trim();
  }
  // 5. Wallet Funding
  else if (desc.includes('FUND') || desc.includes('DEPOSIT') || (transaction.transaction_type === 'CREDIT' && desc.includes('PAYSTACK'))) {
    details.category = 'WALLET_FUNDING';
    details.icon = Landmark;
    details.title = 'Wallet Funding';
    if (desc.includes('PAYSTACK')) details.serviceProvider = 'Paystack';
  }
  // 6. Cable TV
  else if (PATTERNS.CABLE.test(desc)) {
    details.category = 'CABLE_TV';
    details.icon = MonitorPlay;
    details.serviceProvider = desc.match(PATTERNS.CABLE)?.[1];
    details.title = `${details.serviceProvider} Subscription`;
  }
  // 7. Education
  else if (PATTERNS.EDUCATION.test(desc)) {
    details.category = 'EDUCATION';
    details.icon = GraduationCap;
    details.serviceProvider = desc.match(PATTERNS.EDUCATION)?.[1];
    details.title = `${details.serviceProvider} Registration/Result`;
  }
  // 8. Marketplace - Event Tickets
  else if (desc.includes('EVENT') || desc.includes('TICKET')) {
    details.category = 'MARKETPLACE';
    details.icon = Ticket;
    details.title = 'Event Ticket Purchase';
  }
  // 9. Marketplace - Physical Store Items (Uses ShoppingCart)
  else if (desc.includes('MARKETPLACE') || desc.includes('SHOP') || desc.includes('STORE')) {
    details.category = 'MARKETPLACE';
    details.icon = ShoppingCart;
    details.title = 'Marketplace Purchase';
  }
  // 10. Platform Financial Rewards & Cashbacks (Uses Gift)
  else if (desc.includes('CASHBACK') || desc.includes('BONUS') || desc.includes('REWARD') || desc.includes('REFERRAL')) {
    details.category = 'REWARD';
    details.icon = Gift;
    details.title = 'Reward / Cashback Credit';
  }
  // 11. Groups
  else if (desc.includes('GROUP')) {
    details.category = 'GROUP_PAYMENT';
    details.icon = Users;
    details.title = 'Group Contribution';
  }

  // Fallback for Generic Descriptions
  if (details.title === 'Payment Made' || details.title === 'Credit Received') {
    details.title = transaction.description.length > 30 
      ? transaction.description.substring(0, 30) + '...' 
      : transaction.description;
  }

  return details;
};
