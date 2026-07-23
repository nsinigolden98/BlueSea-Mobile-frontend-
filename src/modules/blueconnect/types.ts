export type VerificationFieldType =
  | 'STUDENT_ID'
  | 'EMAIL'
  | 'PHONE'
  | 'BLUESEA_UID'
  | 'MEMBERSHIP_NO';

export type PaymentType = 'PACKAGE' | 'AMOUNT' | 'BOTH';

export interface PackageOption {
  id: string;
  name: string;
  amount: number;
  description?: string;
}

export interface AmountConfig {
  min?: number;
  max?: number;
  fixedAmount?: number;
  step?: number;
}

export interface VerificationFieldConfig {
  key: string;
  label: string;
  placeholder: string;
  type: 'text' | 'email' | 'number';
  pattern?: string;
}

export interface CompanyConfiguration {
  companyId: string;
  verificationField: VerificationFieldConfig;
  paymentType: PaymentType;
  packages?: PackageOption[];
  amountConfig?: AmountConfig;
}

export interface VerifiedCustomer {
  identifier: string;
  fullName: string;
  avatarUrl?: string;
  status: 'ACTIVE' | 'VERIFIED' | 'PENDING';
  meta?: Record<string, string>;
}

export interface Company {
  id: string;
  name: string;
  category: string;
  logoBg: string;
  logoText: string;
  logoUrl?: string;
  isVerified?: boolean;
  config: CompanyConfiguration;
}

export interface PaymentPayload {
  companyId: string;
  customerIdentifier: string;
  packageId?: string;
  amount: number;
  pin: string;
}

export interface PaymentReceipt {
  success: boolean;
  transactionId: string;
  companyName: string;
  customerName: string;
  amount: number;
  date: string;
}