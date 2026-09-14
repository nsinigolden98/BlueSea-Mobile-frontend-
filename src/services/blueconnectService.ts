import type {
  Company,
  CompanyConfiguration,
  CustomerProfile,
  ConnectPaymentPayload,
  ConnectPaymentResponse
} from '@/types/blueconnect';
import { FEATURED_COMPANIES, MOCK_COMPANY_CONFIGURATIONS } from '@/constants/blueconnect';

export const blueConnectApi = {
  /**
   * Fetches integrated BlueConnect partners with optional category or search filtering.
   */
  async getCompanies(search?: string, category?: string): Promise<Company[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        let result = [...FEATURED_COMPANIES];

        if (category && category !== 'All') {
          result = result.filter((c) => c.category.toLowerCase() === category.toLowerCase());
        }

        if (search && search.trim() !== '') {
          const q = search.toLowerCase().trim();
          result = result.filter(
            (c) => c.name.toLowerCase().includes(q) || c.description.toLowerCase().includes(q)
          );
        }

        resolve(result);
      }, 300);
    });
  },

  /**
   * Fetches dynamic payment rules & configuration for a specific organization.
   */
  async getCompanyConfiguration(companyId: string): Promise<CompanyConfiguration> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (!companyId) {
          reject(new Error('Invalid company ID provided.'));
          return;
        }

        const config = MOCK_COMPANY_CONFIGURATIONS[companyId];
        if (config) {
          resolve(config);
        } else {
          // Fallback configuration if none specified
          resolve({
            companyId,
            verificationField: {
              label: 'Customer Identification Code',
              placeholder: 'Enter Reference Number',
              type: 'text'
            },
            paymentMode: 'amount',
            minAmount: 100,
            maxAmount: 1000000
          });
        }
      }, 250);
    });
  },

  /**
   * Verifies customer identity with partner API.
   */
  async verifyCustomer(companyId: string, identifier: string): Promise<CustomerProfile> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (!identifier || identifier.trim().length < 3) {
          reject(new Error('Invalid identifier. Please provide a valid reference code.'));
          return;
        }

        const company = FEATURED_COMPANIES.find((c) => c.id === companyId);
        const nameSeeds = ['Alex Morgan', 'David O. Okon', 'Chinedu Eze', 'Kemi Adebayo', 'Sarah Jenkins'];
        const randomName = nameSeeds[Math.floor(Math.abs(identifier.length) % nameSeeds.length)];

        resolve({
          identifier: identifier.toUpperCase(),
          name: `${randomName}`,
          image: `https://api.dicebear.com/7.x/avataaars/svg?seed=${identifier}`,
          verified: true,
          meta: {
            'Account Category': 'Verified Partner Account',
            'Organization': company ? company.name : 'Integrated Partner',
            'Status': 'Active'
          }
        });
      }, 500);
    });
  },

  /**
   * Processes gateway transaction through BlueSea Mobile settlement layer.
   */
  async submitPayment(payload: ConnectPaymentPayload): Promise<ConnectPaymentResponse> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (!payload.companyId) {
          reject(new Error('Missing target merchant identifier.'));
          return;
        }

        if (!payload.pin || payload.pin.length !== 4) {
          resolve({
            success: false,
            transactionId: `TXN-ERR-${Date.now()}`,
            message: 'Invalid Transaction PIN. Authentication failed.'
          });
          return;
        }

        const txId = `BLC-${Math.floor(100000 + Math.random() * 900000)}`;
        const company = FEATURED_COMPANIES.find((c) => c.id === payload.companyId);

        resolve({
          success: true,
          transactionId: txId,
          message: `Payment of ₦${payload.amount.toLocaleString()} to ${company?.name || 'Partner'} successful.`,
          receiptData: {
            amount: payload.amount,
            reference: txId,
            partner_name: company?.name || 'BlueConnect Gateway',
            account_identifier: payload.identifier,
            status: 'COMPLETED',
            timestamp: new Date().toISOString()
          }
        });
      }, 1000);
    });
  }
};