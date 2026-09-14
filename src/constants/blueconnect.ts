import type { Company, CompanyConfiguration } from '@/types/blueconnect';

export const BLUECONNECT_CATEGORIES = [
  'All',
  'Utilities',
  'Telecoms',
  'Education',
  'Logistics',
  'Fintech',
  'Government',
  'Entertainment'
] as const;

export const FEATURED_COMPANIES: Company[] = [
  {
    id: 'cmp_powergrid',
    name: 'PowerGrid Energy',
    logo: 'https://api.dicebear.com/7.x/identicon/svg?seed=PowerGrid',
    verified: true,
    category: 'Utilities',
    description: 'Instant prepaid & postpaid electricity token generation.',
    featured: true
  },
  {
    id: 'cmp_swiftnet',
    name: 'SwiftNet Fiber',
    logo: 'https://api.dicebear.com/7.x/identicon/svg?seed=SwiftNet',
    verified: true,
    category: 'Telecoms',
    description: 'High-speed fiber broadband subscription & bill settlement.',
    featured: true
  },
  {
    id: 'cmp_edupay',
    name: 'EduPay Global',
    logo: 'https://api.dicebear.com/7.x/identicon/svg?seed=EduPay',
    verified: true,
    category: 'Education',
    description: 'Direct portal for university tuition and exam clearance fees.',
    featured: true
  },
  {
    id: 'cmp_cargoexpress',
    name: 'Cargo Express',
    logo: 'https://api.dicebear.com/7.x/identicon/svg?seed=CargoExpress',
    verified: true,
    category: 'Logistics',
    description: 'Cross-border freight, waybill settlement & custom fees.',
    featured: true
  },
  {
    id: 'cmp_metroestates',
    name: 'Metro Estates',
    logo: 'https://api.dicebear.com/7.x/identicon/svg?seed=MetroEstates',
    verified: true,
    category: 'Utilities',
    description: 'Property service charges, water supply & security levies.',
    featured: true
  },
  {
    id: 'cmp_paystream',
    name: 'PayStream Pro',
    logo: 'https://api.dicebear.com/7.x/identicon/svg?seed=PayStream',
    verified: true,
    category: 'Fintech',
    description: 'Corporate payroll liquidations & B2B vendor settlement.',
    featured: true
  },
  {
    id: 'cmp_cinepass',
    name: 'CinePass VIP',
    logo: 'https://api.dicebear.com/7.x/identicon/svg?seed=CinePass',
    verified: true,
    category: 'Entertainment',
    description: 'Exclusive festival tickets and VIP venue reservations.',
    featured: true
  }
];

export const MOCK_COMPANY_CONFIGURATIONS: Record<string, CompanyConfiguration> = {
  cmp_powergrid: {
    companyId: 'cmp_powergrid',
    verificationField: {
      label: 'Meter / Account Number',
      placeholder: 'Enter 11-digit Meter Number',
      type: 'number',
      helperText: 'Located on your physical meter box or previous utility receipt.'
    },
    paymentMode: 'amount',
    minAmount: 1000,
    maxAmount: 250000,
    fixedAmounts: [2000, 5000, 10000, 20000, 50000]
  },
  cmp_swiftnet: {
    companyId: 'cmp_swiftnet',
    verificationField: {
      label: 'Subscriber ID / User ID',
      placeholder: 'e.g. SN-883920',
      type: 'text',
      helperText: 'Your unique SwiftNet account reference string.'
    },
    paymentMode: 'package',
    packages: [
      {
        id: 'pkg_home_basic',
        name: 'Home Basic (50 Mbps)',
        amount: 15500,
        description: 'Unlimited monthly data for up to 5 home devices.',
        badge: 'Popular'
      },
      {
        id: 'pkg_family_pro',
        name: 'Family Pro (150 Mbps)',
        amount: 28000,
        description: 'Ultra-fast streaming and low-latency gaming package.'
      },
      {
        id: 'pkg_biz_ultra',
        name: 'Business Ultra (500 Mbps)',
        amount: 65000,
        description: 'Dedicated IP address & SLA support guarantee.',
        badge: 'Enterprise'
      }
    ]
  },
  cmp_edupay: {
    companyId: 'cmp_edupay',
    verificationField: {
      label: 'Matriculation / Student Reg No',
      placeholder: 'e.g. REG/2024/8940',
      type: 'text',
      helperText: 'Verify your clearance status before initiating payment.'
    },
    paymentMode: 'both',
    minAmount: 5000,
    maxAmount: 1000000,
    packages: [
      {
        id: 'pkg_acceptance',
        name: 'Acceptance & Portal Fee',
        amount: 35000,
        description: 'Official student registration clearance charge.'
      },
      {
        id: 'pkg_tuition_full',
        name: 'Full Academic Session Tuition',
        amount: 180000,
        description: 'Covers Semester 1 and Semester 2 academic modules.'
      }
    ]
  },
  cmp_cargoexpress: {
    companyId: 'cmp_cargoexpress',
    verificationField: {
      label: 'Tracking / Waybill Reference',
      placeholder: 'e.g. CGO-99201-NG',
      type: 'text',
      helperText: 'Find this ID on your shipping manifest or SMS update.'
    },
    paymentMode: 'amount',
    minAmount: 2000,
    maxAmount: 5000000,
    fixedAmounts: [5000, 15000, 50000, 100000]
  },
  cmp_metroestates: {
    companyId: 'cmp_metroestates',
    verificationField: {
      label: 'Unit / Occupant Reference',
      placeholder: 'e.g. BLK-B4-APT12',
      type: 'text',
      helperText: 'Provided by estate administration management.'
    },
    paymentMode: 'package',
    packages: [
      {
        id: 'pkg_estate_levy',
        name: 'Monthly Maintenance & Security',
        amount: 25000,
        description: 'Covers estate lighting, perimeter security, and waste.'
      },
      {
        id: 'pkg_water_annual',
        name: 'Central Water Supply (Quarterly)',
        amount: 18000,
        description: 'Unlimited water utility settlement.'
      }
    ]
  },
  cmp_paystream: {
    companyId: 'cmp_paystream',
    verificationField: {
      label: 'Vendor Code / Merchant ID',
      placeholder: 'e.g. VND-77182',
      type: 'text',
      helperText: 'Verified corporate account number.'
    },
    paymentMode: 'amount',
    minAmount: 100,
    maxAmount: 10000000
  },
  cmp_cinepass: {
    companyId: 'cmp_cinepass',
    verificationField: {
      label: 'Member Pass Code / Phone',
      placeholder: 'e.g. CP-901829',
      type: 'text',
      helperText: 'Enter phone or membership loyalty code.'
    },
    paymentMode: 'package',
    packages: [
      {
        id: 'pkg_vip_pass',
        name: 'All-Access VIP Ticket',
        amount: 45000,
        description: 'Includes lounge access, refreshments, and meet-and-greet.',
        badge: 'Exclusive'
      },
      {
        id: 'pkg_std_pass',
        name: 'General Admission Weekend',
        amount: 12500,
        description: 'Standard access for multi-stage festival grounds.'
      }
    ]
  }
};