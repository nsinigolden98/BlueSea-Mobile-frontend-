import type { PayLinkItem, BusinessProfile, BusinessProduct, TransactionReceipt } from '@/types/paylink';

// Default Simulation Data
const mockBusinesses: BusinessProfile[] = [
  {
    id: 'biz_01',
    name: 'Lucid Footwear',
    logoUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=150&auto=format&fit=crop&q=80',
    category: 'Fashion & Apparel',
    description: 'Premium handcrafted athletic footwear and lifestyle sneakers.',
    contactEmail: 'sales@lucidfootwear.app',
    identityTag: 'lucidshoes',
    createdAt: new Date().toISOString(),
  }
];

const mockProducts: BusinessProduct[] = [
  {
    id: 'prod_01',
    businessId: 'biz_01',
    name: 'Nike Air Force 1 Special Edition',
    imageUrl: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600&auto=format&fit=crop&q=80',
    category: 'Footwear',
    description: 'Classic iconic low-top sneaker featuring genuine leather upper and Air cushioning.',
    price: 5000,
    sku: 'AF1-LUCID-001',
    isService: false,
    isActive: true,
    createdAt: new Date().toISOString(),
  }
];

const mockPayLinks: PayLinkItem[] = [
  {
    id: 'BCL-82H7K29X',
    type: 'PRODUCT',
    status: 'ACTIVE',
    title: 'Nike Air Force 1 Special Edition',
    description: 'Official checkout link for Lucid Footwear',
    amount: 5000,
    isFixedAmount: true,
    creatorName: 'Lucid Footwear',
    business: mockBusinesses[0],
    product: mockProducts[0],
    expiresAt: null,
    createdAt: new Date().toISOString(),
    url: 'https://com.blueseamobile.app/paylink/BCL-82H7K29X',
    qrPayload: 'https://com.blueseamobile.app/paylink/BCL-82H7K29X',
  },
  {
    id: 'BCL-991A33KB',
    type: 'PERSONAL',
    status: 'ACTIVE',
    title: 'Pay Lucid',
    description: 'Permanent Personal PayLink identity',
    amount: 0,
    isFixedAmount: false,
    allowCustomAmount: true,
    creatorName: 'Lucid',
    creatorNickname: 'Lucid',
    expiresAt: null,
    createdAt: new Date().toISOString(),
    url: 'https://com.blueseamobile.app/paylink/BCL-991A33KB',
    qrPayload: 'https://com.blueseamobile.app/paylink/BCL-991A33KB',
  },
  {
    id: 'BCL-COLLECT1',
    type: 'COLLECTION',
    status: 'ACTIVE',
    title: 'Community Tech Fund',
    description: 'Group contribution for open source mobile development',
    amount: 0,
    isFixedAmount: false,
    suggestedAmounts: [1000, 2500, 5000, 10000],
    allowCustomAmount: true,
    creatorName: 'Lucid',
    collection: {
      targetAmount: 200000,
      collectedAmount: 145000,
      contributorCount: 23,
      suggestedAmounts: [1000, 2500, 5000, 10000],
      allowCustomAmount: true,
    },
    expiresAt: null,
    createdAt: new Date().toISOString(),
    url: 'https://com.blueseamobile.app/paylink/BCL-COLLECT1',
    qrPayload: 'https://com.blueseamobile.app/paylink/BCL-COLLECT1',
  }
];

export const paylinkService = {
  async getPayLinks(): Promise<PayLinkItem[]> {
    return new Promise((resolve) => setTimeout(() => resolve([...mockPayLinks]), 300));
  },

  async getPayLinkById(id: string): Promise<PayLinkItem | null> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const item = mockPayLinks.find((p) => p.id.toLowerCase() === id.toLowerCase());
        resolve(item || null);
      }, 300);
    });
  },

  async createPayLink(linkData: Partial<PayLinkItem>): Promise<PayLinkItem> {
    return new Promise((resolve) => {
      const randomId = `BCL-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
      const newLink: PayLinkItem = {
        id: randomId,
        type: linkData.type || 'FIXED',
        status: 'ACTIVE',
        title: linkData.title || 'Payment Request',
        description: linkData.description || '',
        amount: linkData.amount || 0,
        isFixedAmount: linkData.isFixedAmount ?? true,
        suggestedAmounts: linkData.suggestedAmounts || [],
        allowCustomAmount: linkData.allowCustomAmount ?? true,
        creatorName: linkData.creatorName || 'BlueC User',
        business: linkData.business,
        product: linkData.product,
        collection: linkData.collection,
        expiresAt: linkData.expiresAt || null,
        createdAt: new Date().toISOString(),
        url: `https://com.blueseamobile.app/paylink/${randomId}`,
        qrPayload: `https://com.blueseamobile.app/paylink/${randomId}`,
      };
      mockPayLinks.unshift(newLink);
      setTimeout(() => resolve(newLink), 400);
    });
  },

  async processPayment(paylinkId: string, amountPaid: number): Promise<TransactionReceipt> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const link = mockPayLinks.find((p) => p.id === paylinkId);
        if (!link) {
          reject(new Error('PayLink not found'));
          return;
        }

        // Commission Rule: PayLink is 100% free for users.
        // For business links, BlueC applies a 1% commission on received amount.
        const isBusiness = link.type === 'BUSINESS' || link.type === 'PRODUCT' || link.type === 'SERVICE';
        const commissionRate = isBusiness ? 0.01 : 0.0;
        const commissionDeducted = Math.round(amountPaid * commissionRate);
        const netAmount = amountPaid - commissionDeducted;

        if (link.isFixedAmount && link.amount > 0 && amountPaid !== link.amount) {
          reject(new Error(`Exact amount required: ₦${link.amount.toLocaleString()}`));
          return;
        }

        if (link.type !== 'COLLECTION' && link.type !== 'PERSONAL') {
          link.status = 'PAID';
          link.paidAt = new Date().toISOString();
        } else if (link.collection) {
          link.collection.collectedAmount += amountPaid;
          link.collection.contributorCount += 1;
        }

        const receipt: TransactionReceipt = {
          paymentId: link.id,
          amountPaid,
          grossAmount: amountPaid,
          commissionDeducted,
          netAmount,
          recipientName: link.business ? link.business.name : link.creatorName,
          businessName: link.business?.name,
          itemDescription: link.title,
          timestamp: new Date().toISOString(),
          status: 'PAID',
          paymentMethod: 'BlueC Mobile Balance',
        };

        resolve(receipt);
      }, 600);
    });
  },

  async getBusinesses(): Promise<BusinessProfile[]> {
    return new Promise((resolve) => setTimeout(() => resolve([...mockBusinesses]), 200));
  },

  async createBusiness(profile: Omit<BusinessProfile, 'id' | 'createdAt'>): Promise<BusinessProfile> {
    return new Promise((resolve) => {
      const newBiz: BusinessProfile = {
        ...profile,
        id: `biz_${Date.now()}`,
        createdAt: new Date().toISOString(),
      };
      mockBusinesses.push(newBiz);
      setTimeout(() => resolve(newBiz), 300);
    });
  },

  async getProducts(businessId?: string): Promise<BusinessProduct[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        if (businessId) {
          resolve(mockProducts.filter((p) => p.businessId === businessId));
        } else {
          resolve([...mockProducts]);
        }
      }, 200);
    });
  },

  async createProduct(prod: Omit<BusinessProduct, 'id' | 'createdAt'>): Promise<BusinessProduct> {
    return new Promise((resolve) => {
      const newProd: BusinessProduct = {
        ...prod,
        id: `prod_${Date.now()}`,
        createdAt: new Date().toISOString(),
      };
      mockProducts.push(newProd);
      setTimeout(() => resolve(newProd), 300);
    });
  },
};