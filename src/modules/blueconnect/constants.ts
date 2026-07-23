import { Company } from './types';

export const BLUECONNECT_CATEGORIES = [
  'All',
  'Education',
  'Entertainment',
  'Subscriptions',
  'Utilities'
] as const;

export const PLACEHOLDER_COMPANIES: Company[] = [
  {
    id: 'unilag',
    name: 'University of Lagos',
    category: 'Education',
    logoBg: 'bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400',
    logoText: 'UNILAG',
    isVerified: true,
    config: {
      companyId: 'unilag',
      verificationField: {
        key: 'student_id',
        label: 'Matriculation / Student ID',
        placeholder: 'e.g. 190407012',
        type: 'text'
      },
      paymentType: 'PACKAGE',
      packages: [
        { id: 'tuition', name: 'School Fees (Full Session)', amount: 150000, description: 'Academic Year 2025/2026' },
        { id: 'acceptance', name: 'Acceptance Fee', amount: 25000, description: 'New Student Provisional Admission' },
        { id: 'hostel', name: 'Hostel Accommodation', amount: 80000, description: 'Hall Allocation Maintenance' }
      ]
    }
  },
  {
    id: 'ui',
    name: 'University of Ibadan',
    category: 'Education',
    logoBg: 'bg-blue-600/10 text-blue-600 dark:bg-blue-600/20 dark:text-blue-400',
    logoText: 'UI',
    isVerified: true,
    config: {
      companyId: 'ui',
      verificationField: {
        key: 'student_id',
        label: 'Matriculation Number',
        placeholder: 'e.g. 210892',
        type: 'text'
      },
      paymentType: 'BOTH',
      packages: [
        { id: 'undergrad_fees', name: 'Undergraduate Tuition', amount: 120000 },
        { id: 'postgrad_fees', name: 'Postgraduate Tuition', amount: 250000 }
      ],
      amountConfig: { min: 5000, max: 500000, step: 1000 }
    }
  },
  {
    id: 'lasu',
    name: 'Lagos State University',
    category: 'Education',
    logoBg: 'bg-indigo-500/10 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400',
    logoText: 'LASU',
    isVerified: true,
    config: {
      companyId: 'lasu',
      verificationField: {
        key: 'student_id',
        label: 'LASU Student Portal ID',
        placeholder: 'e.g. 2022-LASU-1092',
        type: 'text'
      },
      paymentType: 'PACKAGE',
      packages: [
        { id: 'lasu_tuition', name: 'Tuition Fee', amount: 68000 },
        { id: 'lasu_medicals', name: 'Medical Clearance Fee', amount: 15000 }
      ]
    }
  },
  {
    id: 'bluesea-premium',
    name: 'BlueSea Premium',
    category: 'Subscriptions',
    logoBg: 'bg-sky-500/10 text-sky-600 dark:bg-sky-500/20 dark:text-sky-400',
    logoText: 'BS',
    isVerified: true,
    config: {
      companyId: 'bluesea-premium',
      verificationField: {
        key: 'uid',
        label: 'BlueSea Account UID',
        placeholder: 'e.g. BS-908123',
        type: 'text'
      },
      paymentType: 'PACKAGE',
      packages: [
        { id: 'monthly', name: 'Monthly Membership', amount: 3500, description: 'Zero transaction fees & VIP status' },
        { id: 'annual', name: 'Annual VIP Pass', amount: 36000, description: 'Save 15% yearly + exclusive cashbacks' }
      ]
    }
  },
  {
    id: 'dstv',
    name: 'DSTV Nigeria',
    category: 'Entertainment',
    logoBg: 'bg-cyan-500/10 text-cyan-600 dark:bg-cyan-500/20 dark:text-cyan-400',
    logoText: 'DSTV',
    isVerified: true,
    config: {
      companyId: 'dstv',
      verificationField: {
        key: 'smartcard',
        label: 'Smartcard / IUC Number',
        placeholder: 'e.g. 1029384756',
        type: 'number'
      },
      paymentType: 'PACKAGE',
      packages: [
        { id: 'dstv_padi', name: 'DSTV Padi', amount: 3600 },
        { id: 'dstv_compact', name: 'DSTV Compact', amount: 15700 },
        { id: 'dstv_premium', name: 'DSTV Premium', amount: 37000 }
      ]
    }
  },
  {
    id: 'netflix',
    name: 'Netflix',
    category: 'Entertainment',
    logoBg: 'bg-red-500/10 text-red-600 dark:bg-red-500/20 dark:text-red-400',
    logoText: 'N',
    isVerified: true,
    config: {
      companyId: 'netflix',
      verificationField: {
        key: 'email',
        label: 'Account Email Address',
        placeholder: 'e.g. user@domain.com',
        type: 'email'
      },
      paymentType: 'PACKAGE',
      packages: [
        { id: 'nflx_basic', name: 'Mobile Plan', amount: 2200 },
        { id: 'nflx_standard', name: 'Standard HD', amount: 4000 },
        { id: 'nflx_premium', name: 'Premium Ultra HD', amount: 5000 }
      ]
    }
  },
  {
    id: 'waec',
    name: 'WAEC Direct',
    category: 'Education',
    logoBg: 'bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400',
    logoText: 'WAEC',
    isVerified: true,
    config: {
      companyId: 'waec',
      verificationField: {
        key: 'phone_or_email',
        label: 'Phone Number / Candidate Email',
        placeholder: 'e.g. 08012345678',
        type: 'text'
      },
      paymentType: 'AMOUNT',
      amountConfig: {
        fixedAmount: 4500,
        min: 4500,
        max: 4500
      }
    }
  }
];