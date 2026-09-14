export type PaymentMode = 'amount' | 'package' | 'both';

export interface VerificationFieldConfig {
  label: string;
  placeholder: string;
  type: 'text' | 'number' | 'email';
  validationRegex?: string;
  helperText?: string;
}

export interface PaymentPackage {
  id: string;
  name: string;
  amount: number;
  description?: string;
  badge?: string;
  features?: string[];
}

export interface CompanyConfiguration {
  companyId: string;
  verificationField: VerificationFieldConfig;
  paymentMode: PaymentMode;
  minAmount?: number;
  maxAmount?: number;
  fixedAmounts?: number[];
  packages?: PaymentPackage[];
}

export interface Company {
  id: string;
  name: string;
  logo: string;
  verified: boolean;
  category: string;
  description: string;
  featured?: boolean;
}

export interface CustomerProfile {
  identifier: string;
  name: string;
  image: string;
  verified: boolean;
  meta?: Record<string, string>;
}

export interface ConnectPaymentPayload {
  companyId: string;
  identifier: string;
  amount: number;
  packageId?: string;
  pin: string;
}

export interface ConnectPaymentResponse {
  success: boolean;
  transactionId: string;
  message: string;
  receiptData?: Record<string, any>;
}