import { PLACEHOLDER_COMPANIES } from '../constants';
import { Company, VerifiedCustomer, PaymentPayload, PaymentReceipt } from '../types';

export class BlueConnectService {
  /**
   * Fetches organizations connected to BlueConnect.
   * // TODO: Connect to REST API endpoint: GET /api/v1/blueconnect/companies
   */
  static async getCompanies(category?: string, query?: string): Promise<Company[]> {
    await new Promise((resolve) => setTimeout(resolve, 300)); // Simulate network latency

    return PLACEHOLDER_COMPANIES.filter((company) => {
      const matchesCategory =
        !category || category === 'All' || company.category.toLowerCase() === category.toLowerCase();
      const matchesQuery =
        !query || company.name.toLowerCase().includes(query.toLowerCase());
      return matchesCategory && matchesQuery;
    });
  }

  /**
   * Retrieves single organization parameters & payment specifications.
   * // TODO: Connect to REST API endpoint: GET /api/v1/blueconnect/companies/:id/config
   */
  static async getCompanyById(id: string): Promise<Company | null> {
    await new Promise((resolve) => setTimeout(resolve, 200));
    return PLACEHOLDER_COMPANIES.find((c) => c.id === id) || null;
  }

  /**
   * Verifies customer identity against the partner organization API.
   * // TODO: Connect to REST API endpoint: POST /api/v1/blueconnect/verify
   */
  static async verifyCustomer(companyId: string, identifier: string): Promise<VerifiedCustomer> {
    await new Promise((resolve) => setTimeout(resolve, 800));

    if (!identifier || identifier.trim().length < 3) {
      throw new Error('Invalid verification identifier provided');
    }

    const company = PLACEHOLDER_COMPANIES.find((c) => c.id === companyId);
    
    // Mock customer verification profiles
    return {
      identifier,
      fullName: 'Adebayo Oluwaseun',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
      status: 'VERIFIED',
      meta: {
        Department: company?.category === 'Education' ? 'Computer Science' : 'Active Subscription',
        Status: 'Active'
      }
    };
  }

  /**
   * Submits a payment transaction through BlueConnect.
   * // TODO: Connect to REST API endpoint: POST /api/v1/blueconnect/pay
   */
  static async submitPayment(payload: PaymentPayload): Promise<PaymentReceipt> {
    await new Promise((resolve) => setTimeout(resolve, 1200));

    if (payload.pin !== '1234' && payload.pin.length !== 4) {
      throw new Error('Transaction authorization PIN failed');
    }

    const company = PLACEHOLDER_COMPANIES.find((c) => c.id === payload.companyId);

    return {
      success: true,
      transactionId: `BC-${Math.floor(100000000 + Math.random() * 900000000)}`,
      companyName: company?.name || 'Partner Organization',
      customerName: 'Adebayo Oluwaseun',
      amount: payload.amount,
      date: new Date().toISOString()
    };
  }
}