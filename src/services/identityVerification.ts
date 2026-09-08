import type { BankOption, VerificationHistoryItem, TierLimit } from '@/types/identity';

// Mock bank list endpoint boundary (Reuses backend bank list if existing)
export const fetchBankList = async (): Promise<BankOption[]> => {
  return [
    { code: '044', name: 'Access Bank' },
    { code: '011', name: 'First Bank of Nigeria' },
    { code: '058', name: 'GTBank (Guaranty Trust Bank)' },
    { code: '033', name: 'United Bank for Africa (UBA)' },
    { code: '057', name: 'Zenith Bank' },
    { code: '214', name: 'First City Monument Bank (FCMB)' },
    { code: '035', name: 'Wema Bank' },
    { code: '50515', name: 'Moniepoint Microfinance Bank' },
    { code: '999992', name: 'OPay Digital Services' },
    { code: '50378', name: 'PalmPay' },
  ];
};

export const DEFAULT_TIER_LIMITS: TierLimit[] = [
  {
    tier: 'Tier 1 (Phone)',
    maxWalletBalance: '₦300,000',
    dailyDeposit: '₦50,000',
    singleDeposit: '₦20,000',
    dailyWithdrawal: '₦20,000',
    dailyTransfer: '₦50,000',
    ticketPaymentLimit: '₦20,000',
  },
  {
    tier: 'Tier 2 (Financial)',
    maxWalletBalance: '₦5,000,000',
    dailyDeposit: '₦500,000',
    singleDeposit: '₦200,000',
    dailyWithdrawal: '₦200,000',
    dailyTransfer: '₦500,000',
    ticketPaymentLimit: '₦100,000',
  },
  {
    tier: 'Tier 3 (Address)',
    maxWalletBalance: 'Unlimited',
    dailyDeposit: '₦5,000,000',
    singleDeposit: '₦1,000,000',
    dailyWithdrawal: '₦1,000,000',
    dailyTransfer: '₦5,000,000',
    ticketPaymentLimit: 'Unlimited',
  },
];

export const INITIAL_VERIFICATION_HISTORY: VerificationHistoryItem[] = [
  {
    id: '1',
    type: 'Phone Verification',
    status: 'NOT_STARTED',
    date: 'Not initiated',
    details: 'Phone number confirmation required',
  },
  {
    id: '2',
    type: 'Financial Identity',
    status: 'NOT_STARTED',
    date: 'Not initiated',
    details: 'BVN and Bank Account link required',
  },
  {
    id: '3',
    type: 'Residential Address',
    status: 'NOT_STARTED',
    date: 'Not initiated',
    details: 'Address document verification required',
  },
];