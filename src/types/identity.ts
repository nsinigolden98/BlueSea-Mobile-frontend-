export type VerificationTierLevel = 0 | 1 | 2 | 3;

export type VerificationStatusType = 
  | 'NOT_STARTED' 
  | 'PENDING' 
  | 'VERIFIED' 
  | 'FAILED' 
  | 'REQUIRES_ACTION';

export type PhoneMethod = 'whatsapp' | 'sms';

export interface VerificationTier {
  tier: VerificationTierLevel;
  title: string;
  subtitle: string;
  status: VerificationStatusType;
  description: string;
  benefits: string[];
}

export interface BankOption {
  code: string;
  name: string;
}

export interface FinancialIdentityPayload {
  bvn: string;
  bankCode: string;
  bankName: string;
  accountNumber: string;
}

export interface VerificationHistoryItem {
  id: string;
  type: 'Phone Verification' | 'Financial Identity' | 'Residential Address';
  status: VerificationStatusType;
  date: string;
  details: string;
}

export interface TierLimit {
  tier: string;
  maxWalletBalance: string;
  dailyDeposit: string;
  singleDeposit: string;
  dailyWithdrawal: string;
  dailyTransfer: string;
  ticketPaymentLimit: string;
}