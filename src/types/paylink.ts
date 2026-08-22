export type PayLinkType = 
  | 'PERSONAL' 
  | 'FIXED' 
  | 'FLEXIBLE' 
  | 'BUSINESS' 
  | 'PRODUCT' 
  | 'SERVICE' 
  | 'COLLECTION';

export type PayLinkStatus = 
  | 'DRAFT' 
  | 'ACTIVE' 
  | 'PENDING' 
  | 'PAID' 
  | 'PARTIALLY_PAID' 
  | 'EXPIRED' 
  | 'CANCELLED' 
  | 'FAILED' 
  | 'REFUNDED';

export type QRType = 
  | 'PERSONAL' 
  | 'BUSINESS' 
  | 'PRODUCT' 
  | 'PAYMENT_REQUEST' 
  | 'COLLECTION';

export interface BusinessProfile {
  id: string;
  name: string;
  logoUrl?: string;
  category: string;
  description: string;
  contactEmail: string;
  contactPhone?: string;
  identityTag: string;
  createdAt: string;
}

export interface BusinessProduct {
  id: string;
  businessId: string;
  name: string;
  imageUrl?: string;
  category: string;
  description: string;
  price: number;
  sku?: string;
  isService?: boolean;
  isActive: boolean;
  createdAt: string;
}

export interface PayLinkCollection {
  targetAmount: number;
  collectedAmount: number;
  contributorCount: number;
  suggestedAmounts: number[];
  allowCustomAmount: boolean;
}

export interface PayLinkItem {
  id: string; // e.g., BCL-82H7K29X
  type: PayLinkType;
  status: PayLinkStatus;
  title: string;
  description?: string;
  amount: number; // 0 for flexible
  isFixedAmount: boolean;
  suggestedAmounts?: number[];
  allowCustomAmount?: boolean;
  creatorName: string;
  creatorNickname?: string;
  business?: BusinessProfile;
  product?: BusinessProduct;
  collection?: PayLinkCollection;
  expiresAt?: string | null;
  createdAt: string;
  paidAt?: string;
  paymentReference?: string;
  url: string;
  qrPayload: string;
}

export interface TransactionReceipt {
  paymentId: string;
  amountPaid: number;
  grossAmount: number;
  commissionDeducted: number; // 1% for business transactions
  netAmount: number;
  recipientName: string;
  businessName?: string;
  itemDescription: string;
  timestamp: string;
  status: PayLinkStatus;
  paymentMethod: string;
}