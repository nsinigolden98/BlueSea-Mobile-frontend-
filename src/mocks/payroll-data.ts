// ============================================================================
// PAYROLL PRO - COMPREHENSIVE MOCK DATA
// Realistic Nigerian business scenarios for production-grade simulation
// ============================================================================

import type {
  Company, Branch, Employee, PayrollRecord, Bonus, Deduction,
  LeaveRequest, ApprovalRequest, PerformanceRecord, AuditLog,
  EmploymentVerification, Role, PayrollProUser,
  CompanyVerification, UserEmployment, PayrollSummary, EmployeeGrowthReport,
  SalaryTrendReport, PayrollNotification,
} from '@/types/payroll-pro';

// ─── HELPERS ───
const uid = () => Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
const date = (daysAgo: number) => {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString();
};
const futureDate = (daysFromNow: number) => {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  return d.toISOString();
};
const formatNaira = (amount: number) => `\u20A6${amount.toLocaleString()}`;

// ─── CURRENT USER ───
export const currentUser: PayrollProUser = {
  id: 'user_001',
  fullName: 'Olumide Adeyemi',
  email: 'olumide.adeyemi@bluesea.com',
  phone: '+234 803 456 7890',
  ownedCompanies: [],
  employments: [],
  isNewUser: false,
};

// ─── COMPANY 1: ABC LOGISTICS NIGERIA LTD ───
const abcVerification: CompanyVerification = {
  id: uid(),
  companyId: 'comp_001',
  status: 'verified',
  submittedAt: date(120),
  reviewedAt: date(115),
  reviewedBy: 'system_admin',
  documents: [
    { id: uid(), type: 'cac_certificate', name: 'CAC Certificate', url: '/docs/cac_001.pdf', uploadedAt: date(120), status: 'approved' },
    { id: uid(), type: 'tax_id', name: 'TIN Document', url: '/docs/tin_001.pdf', uploadedAt: date(120), status: 'approved' },
  ],
};

export const abcCompany: Company = {
  id: 'comp_001',
  name: 'ABC Logistics Nigeria Ltd',
  cacNumber: 'RC1234567',
  businessType: 'limited_liability',
  email: 'hr@abclogistics.ng',
  phone: '+234 809 111 2222',
  address: '15A Warehouse Road, Apapa, Lagos',
  logoUrl: '',
  website: 'https://abclogistics.ng',
  expectedEmployeeCount: 45,
  expectedBranchCount: 3,
  expectedMonthlyPayroll: 25000000,
  verification: abcVerification,
  createdAt: date(150),
  updatedAt: date(10),
  ownerId: 'user_001',
  settings: {
    payrollDay: 25,
    currency: 'NGN',
    timezone: 'Africa/Lagos',
    approvalWorkflow: { id: uid(), name: 'Standard', steps: [
      { id: uid(), order: 1, role: 'branch_manager', name: 'Branch Manager' },
      { id: uid(), order: 2, role: 'hr', name: 'HR Review' },
      { id: uid(), order: 3, role: 'finance', name: 'Finance Approval' },
    ]},
    enableAutoPayroll: false,
    enablePayslipEmail: true,
    enableNotification: true,
  },
};

// ─── COMPANY 2: GREENFIELD CONSULTING (OWNED + EMPLOYMENT SCENARIO) ───
const greenfieldVerification: CompanyVerification = {
  id: uid(),
  companyId: 'comp_002',
  status: 'under_review',
  submittedAt: date(5),
  documents: [
    { id: uid(), type: 'cac_certificate', name: 'CAC Certificate', url: '/docs/cac_002.pdf', uploadedAt: date(5), status: 'pending' },
  ],
};

export const greenfieldCompany: Company = {
  id: 'comp_002',
  name: 'Greenfield Consulting Ltd',
  cacNumber: 'RC7654321',
  businessType: 'limited_liability',
  email: 'info@greenfield.ng',
  phone: '+234 802 333 4444',
  address: '42 Admiralty Way, Lekki Phase 1, Lagos',
  expectedEmployeeCount: 12,
  expectedBranchCount: 1,
  expectedMonthlyPayroll: 8000000,
  verification: greenfieldVerification,
  createdAt: date(10),
  updatedAt: date(5),
  ownerId: 'user_001',
  settings: {
    payrollDay: 28,
    currency: 'NGN',
    timezone: 'Africa/Lagos',
    approvalWorkflow: { id: uid(), name: 'Simple', steps: [
      { id: uid(), order: 1, role: 'owner', name: 'Owner Approval' },
    ]},
    enableAutoPayroll: false,
    enablePayslipEmail: true,
    enableNotification: true,
  },
};

// ─── BRANCHES ───
export const branches: Branch[] = [
  {
    id: 'branch_001', companyId: 'comp_001', name: 'Apapa Head Office',
    address: '15A Warehouse Road, Apapa, Lagos', managerId: 'emp_003', managerName: 'Ngozi Okonkwo',
    employeeCount: 18, status: 'active', description: 'Main headquarters and operations center',
    createdAt: date(150), monthlyPayrollEstimate: 10500000,
  },
  {
    id: 'branch_002', companyId: 'comp_001', name: 'Ikeja Operations Center',
    address: '22 Allen Avenue, Ikeja, Lagos', managerId: 'emp_007', managerName: 'Emeka Nwosu',
    employeeCount: 14, status: 'active', description: 'Northern Lagos operations hub',
    createdAt: date(100), monthlyPayrollEstimate: 8000000,
  },
  {
    id: 'branch_003', companyId: 'comp_001', name: 'Port Harcourt Branch',
    address: '8 Trans Amadi Layout, Port Harcourt', managerId: 'emp_012', managerName: 'Amina Ibrahim',
    employeeCount: 10, status: 'active', description: 'Rivers State regional office',
    createdAt: date(60), monthlyPayrollEstimate: 5500000,
  },
  {
    id: 'branch_004', companyId: 'comp_002', name: 'Lekki Office',
    address: '42 Admiralty Way, Lekki Phase 1', managerId: undefined, managerName: undefined,
    employeeCount: 0, status: 'pending', description: 'Main office',
    createdAt: date(10), monthlyPayrollEstimate: 0,
  },
];

// ─── EMPLOYEES (ABC LOGISTICS - 42 employees) ───
export const employees: Employee[] = [
  {
    id: 'emp_001', companyId: 'comp_001', branchId: 'branch_001', userId: 'user_emp001',
    employeeId: 'ABC-001', fullName: 'Ngozi Okonkwo', email: 'n.okonkwo@abclogistics.ng',
    phone: '+234 805 111 2222', role: 'branch_manager', department: 'operations',
    employmentType: 'full_time', employmentDate: date(400), salary: 450000, status: 'active',
    managerId: undefined, managerName: undefined, branchName: 'Apapa Head Office',
    bankName: 'GTBank', bankAccountNumber: '0123456789', bankAccountName: 'Ngozi Okonkwo',
    taxId: 'TIN001234', pensionId: 'PEN001', nin: '12345678901',
    createdAt: date(400), updatedAt: date(30),
    documents: [
      { id: uid(), type: 'contract', name: 'Employment Contract', url: '/docs/contract_001.pdf', uploadedAt: date(400), uploadedBy: 'HR Admin' },
    ],
    timeline: [
      { id: uid(), type: 'joined', title: 'Joined Company', description: 'Started as Operations Supervisor', date: date(400), actor: 'HR Admin', actorRole: 'hr' },
      { id: uid(), type: 'promoted', title: 'Promoted', description: 'Promoted to Branch Manager', date: date(200), actor: 'CEO', actorRole: 'owner' },
      { id: uid(), type: 'salary_updated', title: 'Salary Review', description: 'Salary increased from \u20A6350,000 to \u20A6450,000', date: date(100), actor: 'HR Manager', actorRole: 'hr' },
    ],
    leaveBalance: { annual: 18, sick: 10, emergency: 5, maternity: 0, paternity: 5, compassionate: 5, study: 0, unpaid: 0 },
  },
  {
    id: 'emp_002', companyId: 'comp_001', branchId: 'branch_001', userId: 'user_emp002',
    employeeId: 'ABC-002', fullName: 'Emmanuel Adeleke', email: 'e.adeleke@abclogistics.ng',
    phone: '+234 806 222 3333', role: 'finance', department: 'finance',
    employmentType: 'full_time', employmentDate: date(350), salary: 380000, status: 'active',
    managerId: 'emp_003', managerName: 'Ngozi Okonkwo', branchName: 'Apapa Head Office',
    bankName: 'First Bank', bankAccountNumber: '0987654321', bankAccountName: 'Emmanuel Adeleke',
    taxId: 'TIN002345', pensionId: 'PEN002', nin: '23456789012',
    createdAt: date(350), updatedAt: date(20),
    documents: [],
    timeline: [
      { id: uid(), type: 'joined', title: 'Joined Company', description: 'Started as Financial Analyst', date: date(350), actor: 'HR Admin', actorRole: 'hr' },
    ],
    leaveBalance: { annual: 15, sick: 10, emergency: 5, maternity: 0, paternity: 5, compassionate: 5, study: 0, unpaid: 0 },
  },
  {
    id: 'emp_003', companyId: 'comp_001', branchId: 'branch_001', userId: 'user_emp003',
    employeeId: 'ABC-003', fullName: 'Fatima Bello', email: 'f.bello@abclogistics.ng',
    phone: '+234 807 333 4444', role: 'hr', department: 'hr',
    employmentType: 'full_time', employmentDate: date(300), salary: 420000, status: 'active',
    managerId: undefined, managerName: undefined, branchName: 'Apapa Head Office',
    bankName: 'Zenith Bank', bankAccountNumber: '1122334455', bankAccountName: 'Fatima Bello',
    taxId: 'TIN003456', pensionId: 'PEN003', nin: '34567890123',
    createdAt: date(300), updatedAt: date(15),
    documents: [],
    timeline: [
      { id: uid(), type: 'joined', title: 'Joined Company', description: 'Started as HR Officer', date: date(300), actor: 'HR Admin', actorRole: 'hr' },
      { id: uid(), type: 'promoted', title: 'Promoted', description: 'Promoted to HR Manager', date: date(150), actor: 'CEO', actorRole: 'owner' },
    ],
    leaveBalance: { annual: 20, sick: 10, emergency: 5, maternity: 0, paternity: 0, compassionate: 5, study: 0, unpaid: 0 },
  },
  {
    id: 'emp_004', companyId: 'comp_001', branchId: 'branch_001', userId: 'user_emp004',
    employeeId: 'ABC-004', fullName: 'Chinedu Okafor', email: 'c.okafor@abclogistics.ng',
    phone: '+234 808 444 5555', role: 'employee', department: 'engineering',
    employmentType: 'full_time', employmentDate: date(250), salary: 550000, status: 'active',
    managerId: 'emp_003', managerName: 'Ngozi Okonkwo', branchName: 'Apapa Head Office',
    bankName: 'UBA', bankAccountNumber: '2233445566', bankAccountName: 'Chinedu Okafor',
    taxId: 'TIN004567', pensionId: 'PEN004', nin: '45678901234',
    createdAt: date(250), updatedAt: date(10),
    documents: [],
    timeline: [
      { id: uid(), type: 'joined', title: 'Joined Company', description: 'Started as Senior Backend Engineer', date: date(250), actor: 'HR Admin', actorRole: 'hr' },
      { id: uid(), type: 'commendation', title: 'Commendation', description: 'Outstanding performance on logistics platform', date: date(100), actor: 'CTO', actorRole: 'owner' },
    ],
    leaveBalance: { annual: 15, sick: 10, emergency: 5, maternity: 0, paternity: 5, compassionate: 5, study: 0, unpaid: 0 },
  },
  {
    id: 'emp_005', companyId: 'comp_001', branchId: 'branch_001', userId: 'user_emp005',
    employeeId: 'ABC-005', fullName: 'Amara Obi', email: 'a.obi@abclogistics.ng',
    phone: '+234 809 555 6666', role: 'employee', department: 'customer_service',
    employmentType: 'full_time', employmentDate: date(200), salary: 180000, status: 'on_leave',
    managerId: 'emp_003', managerName: 'Ngozi Okonkwo', branchName: 'Apapa Head Office',
    bankName: 'Access Bank', bankAccountNumber: '3344556677', bankAccountName: 'Amara Obi',
    taxId: 'TIN005678', pensionId: 'PEN005', nin: '56789012345',
    createdAt: date(200), updatedAt: date(5),
    documents: [],
    timeline: [
      { id: uid(), type: 'joined', title: 'Joined Company', description: 'Started as Customer Service Rep', date: date(200), actor: 'HR Admin', actorRole: 'hr' },
      { id: uid(), type: 'leave_approved', title: 'Maternity Leave', description: 'Approved for 4 months maternity leave', date: date(10), actor: 'HR Manager', actorRole: 'hr' },
    ],
    leaveBalance: { annual: 12, sick: 10, emergency: 5, maternity: 90, paternity: 0, compassionate: 5, study: 0, unpaid: 0 },
  },
  {
    id: 'emp_006', companyId: 'comp_001', branchId: 'branch_002', userId: 'user_emp006',
    employeeId: 'ABC-006', fullName: 'Tunde Bakare', email: 't.bakare@abclogistics.ng',
    phone: '+234 810 666 7777', role: 'employee', department: 'sales',
    employmentType: 'full_time', employmentDate: date(180), salary: 250000, status: 'active',
    managerId: 'emp_007', managerName: 'Emeka Nwosu', branchName: 'Ikeja Operations Center',
    bankName: 'GTBank', bankAccountNumber: '4455667788', bankAccountName: 'Tunde Bakare',
    taxId: 'TIN006789', pensionId: 'PEN006', nin: '67890123456',
    createdAt: date(180), updatedAt: date(25),
    documents: [],
    timeline: [
      { id: uid(), type: 'joined', title: 'Joined Company', description: 'Started as Sales Executive', date: date(180), actor: 'HR Admin', actorRole: 'hr' },
    ],
    leaveBalance: { annual: 15, sick: 10, emergency: 5, maternity: 0, paternity: 5, compassionate: 5, study: 0, unpaid: 0 },
  },
  {
    id: 'emp_007', companyId: 'comp_001', branchId: 'branch_002', userId: 'user_emp007',
    employeeId: 'ABC-007', fullName: 'Emeka Nwosu', email: 'e.nwosu@abclogistics.ng',
    phone: '+234 811 777 8888', role: 'branch_manager', department: 'operations',
    employmentType: 'full_time', employmentDate: date(280), salary: 400000, status: 'active',
    managerId: undefined, managerName: undefined, branchName: 'Ikeja Operations Center',
    bankName: 'First Bank', bankAccountNumber: '5566778899', bankAccountName: 'Emeka Nwosu',
    taxId: 'TIN007890', pensionId: 'PEN007', nin: '78901234567',
    createdAt: date(280), updatedAt: date(8),
    documents: [],
    timeline: [
      { id: uid(), type: 'joined', title: 'Joined Company', description: 'Started as Operations Manager', date: date(280), actor: 'HR Admin', actorRole: 'hr' },
      { id: uid(), type: 'transferred', title: 'Branch Transfer', description: 'Transferred to head Ikeja Operations', date: date(100), actor: 'CEO', actorRole: 'owner' },
    ],
    leaveBalance: { annual: 18, sick: 10, emergency: 5, maternity: 0, paternity: 5, compassionate: 5, study: 0, unpaid: 0 },
  },
  {
    id: 'emp_008', companyId: 'comp_001', branchId: 'branch_002', userId: 'user_emp008',
    employeeId: 'ABC-008', fullName: 'Yewande Ajayi', email: 'y.ajayi@abclogistics.ng',
    phone: '+234 812 888 9999', role: 'employee', department: 'marketing',
    employmentType: 'contract', employmentDate: date(90), salary: 200000, status: 'active',
    managerId: 'emp_007', managerName: 'Emeka Nwosu', branchName: 'Ikeja Operations Center',
    bankName: 'Zenith Bank', bankAccountNumber: '6677889900', bankAccountName: 'Yewande Ajayi',
    taxId: 'TIN008901', pensionId: 'PEN008', nin: '89012345678',
    createdAt: date(90), updatedAt: date(5),
    documents: [],
    timeline: [
      { id: uid(), type: 'joined', title: 'Joined Company', description: 'Contract - Marketing Specialist', date: date(90), actor: 'HR Admin', actorRole: 'hr' },
    ],
    leaveBalance: { annual: 0, sick: 5, emergency: 5, maternity: 0, paternity: 0, compassionate: 5, study: 0, unpaid: 0 },
  },
  {
    id: 'emp_009', companyId: 'comp_001', branchId: 'branch_003', userId: 'user_emp009',
    employeeId: 'ABC-009', fullName: 'Amina Ibrahim', email: 'a.ibrahim@abclogistics.ng',
    phone: '+234 813 999 0000', role: 'branch_manager', department: 'operations',
    employmentType: 'full_time', employmentDate: date(220), salary: 380000, status: 'active',
    managerId: undefined, managerName: undefined, branchName: 'Port Harcourt Branch',
    bankName: 'UBA', bankAccountNumber: '7788990011', bankAccountName: 'Amina Ibrahim',
    taxId: 'TIN009012', pensionId: 'PEN009', nin: '90123456789',
    createdAt: date(220), updatedAt: date(12),
    documents: [],
    timeline: [
      { id: uid(), type: 'joined', title: 'Joined Company', description: 'Started as Branch Coordinator', date: date(220), actor: 'HR Admin', actorRole: 'hr' },
      { id: uid(), type: 'promoted', title: 'Promoted', description: 'Promoted to Branch Manager PH', date: date(80), actor: 'CEO', actorRole: 'owner' },
    ],
    leaveBalance: { annual: 16, sick: 10, emergency: 5, maternity: 0, paternity: 0, compassionate: 5, study: 0, unpaid: 0 },
  },
  {
    id: 'emp_010', companyId: 'comp_001', branchId: 'branch_003', userId: 'user_emp010',
    employeeId: 'ABC-010', fullName: 'Ibrahim Musa', email: 'i.musa@abclogistics.ng',
    phone: '+234 814 000 1111', role: 'employee', department: 'logistics',
    employmentType: 'full_time', employmentDate: date(160), salary: 220000, status: 'active',
    managerId: 'emp_012', managerName: 'Amina Ibrahim', branchName: 'Port Harcourt Branch',
    bankName: 'Access Bank', bankAccountNumber: '8899001122', bankAccountName: 'Ibrahim Musa',
    taxId: 'TIN010123', pensionId: 'PEN010', nin: '01234567890',
    createdAt: date(160), updatedAt: date(3),
    documents: [],
    timeline: [
      { id: uid(), type: 'joined', title: 'Joined Company', description: 'Started as Logistics Coordinator', date: date(160), actor: 'HR Admin', actorRole: 'hr' },
    ],
    leaveBalance: { annual: 15, sick: 10, emergency: 5, maternity: 0, paternity: 5, compassionate: 5, study: 0, unpaid: 0 },
  },
  {
    id: 'emp_011', companyId: 'comp_001', branchId: 'branch_001', userId: 'user_emp011',
    employeeId: 'ABC-011', fullName: 'Chioma Eze', email: 'c.eze@abclogistics.ng',
    phone: '+234 815 111 2223', role: 'employee', department: 'admin',
    employmentType: 'intern', employmentDate: date(30), salary: 80000, status: 'active',
    managerId: 'emp_003', managerName: 'Ngozi Okonkwo', branchName: 'Apapa Head Office',
    bankName: 'GTBank', bankAccountNumber: '9900112233', bankAccountName: 'Chioma Eze',
    taxId: undefined, pensionId: undefined, nin: '11223344556',
    createdAt: date(30), updatedAt: date(2),
    documents: [],
    timeline: [
      { id: uid(), type: 'joined', title: 'Joined Company', description: 'Started as Admin Intern', date: date(30), actor: 'HR Admin', actorRole: 'hr' },
    ],
    leaveBalance: { annual: 0, sick: 5, emergency: 3, maternity: 0, paternity: 0, compassionate: 3, study: 0, unpaid: 0 },
  },
  {
    id: 'emp_012', companyId: 'comp_001', branchId: 'branch_001', userId: 'user_emp012',
    employeeId: 'ABC-012', fullName: 'Bola Tinubu', email: 'b.tinubu@abclogistics.ng',
    phone: '+234 816 222 3334', role: 'employee', department: 'finance',
    employmentType: 'full_time', employmentDate: date(120), salary: 320000, status: 'suspended',
    managerId: 'emp_003', managerName: 'Ngozi Okonkwo', branchName: 'Apapa Head Office',
    bankName: 'First Bank', bankAccountNumber: '0011223344', bankAccountName: 'Bola Tinubu',
    taxId: 'TIN012345', pensionId: 'PEN012', nin: '22334455667',
    createdAt: date(120), updatedAt: date(1),
    documents: [],
    timeline: [
      { id: uid(), type: 'joined', title: 'Joined Company', description: 'Started as Accountant', date: date(120), actor: 'HR Admin', actorRole: 'hr' },
      { id: uid(), type: 'suspended', title: 'Suspended', description: 'Administrative suspension pending investigation', date: date(1), actor: 'HR Manager', actorRole: 'hr' },
    ],
    leaveBalance: { annual: 10, sick: 10, emergency: 5, maternity: 0, paternity: 5, compassionate: 5, study: 0, unpaid: 0 },
  },
  // ─── GREENFIELD EMPLOYEES (owner only scenario) ───
  {
    id: 'emp_gf001', companyId: 'comp_002', branchId: 'branch_004', userId: 'user_gf001',
    employeeId: 'GF-001', fullName: 'Samuel Johnson', email: 's.johnson@greenfield.ng',
    phone: '+234 817 333 4445', role: 'employee', department: 'operations',
    employmentType: 'full_time', employmentDate: date(8), salary: 300000, status: 'active',
    managerId: undefined, managerName: undefined, branchName: 'Lekki Office',
    bankName: 'GTBank', bankAccountNumber: '3344556677', bankAccountName: 'Samuel Johnson',
    taxId: 'TIN111222', pensionId: 'PEN111', nin: '33445566778',
    createdAt: date(8), updatedAt: date(8),
    documents: [],
    timeline: [
      { id: uid(), type: 'joined', title: 'Joined Company', description: 'First employee at Greenfield', date: date(8), actor: 'Owner', actorRole: 'owner' },
    ],
    leaveBalance: { annual: 15, sick: 10, emergency: 5, maternity: 0, paternity: 5, compassionate: 5, study: 0, unpaid: 0 },
  },
  {
    id: 'emp_gf002', companyId: 'comp_002', branchId: 'branch_004', userId: 'user_gf002',
    employeeId: 'GF-002', fullName: 'Grace Okafor', email: 'g.okafor@greenfield.ng',
    phone: '+234 818 444 5556', role: 'employee', department: 'sales',
    employmentType: 'contract', employmentDate: date(5), salary: 180000, status: 'active',
    managerId: undefined, managerName: undefined, branchName: 'Lekki Office',
    bankName: 'Access Bank', bankAccountNumber: '4455667788', bankAccountName: 'Grace Okafor',
    taxId: 'TIN222333', pensionId: 'PEN222', nin: '44556677889',
    createdAt: date(5), updatedAt: date(5),
    documents: [],
    timeline: [
      { id: uid(), type: 'joined', title: 'Joined Company', description: 'Contract - Business Development', date: date(5), actor: 'Owner', actorRole: 'owner' },
    ],
    leaveBalance: { annual: 0, sick: 5, emergency: 5, maternity: 0, paternity: 0, compassionate: 5, study: 0, unpaid: 0 },
  },
  // ─── CURRENT USER AS EMPLOYEE AT THIRD COMPANY ───
  {
    id: 'emp_ext001', companyId: 'comp_003', branchId: 'branch_ext001', userId: 'user_001',
    employeeId: 'XYZ-456', fullName: 'Olumide Adeyemi', email: 'olumide.adeyemi@xyztech.ng',
    phone: '+234 803 456 7890', role: 'employee', department: 'engineering',
    employmentType: 'full_time', employmentDate: date(500), salary: 600000, status: 'active',
    managerId: undefined, managerName: 'James Osei', branchName: 'Victoria Island HQ',
    bankName: 'GTBank', bankAccountNumber: '5566778899', bankAccountName: 'Olumide Adeyemi',
    taxId: 'TIN999888', pensionId: 'PEN999', nin: '55667788990',
    createdAt: date(500), updatedAt: date(10),
    documents: [],
    timeline: [
      { id: uid(), type: 'joined', title: 'Joined XYZ Technologies', description: 'Senior Frontend Engineer', date: date(500), actor: 'HR Admin', actorRole: 'hr' },
      { id: uid(), type: 'salary_updated', title: 'Salary Review', description: 'Increased from \u20A6500,000 to \u20A6600,000', date: date(100), actor: 'HR Manager', actorRole: 'hr' },
    ],
    leaveBalance: { annual: 18, sick: 10, emergency: 5, maternity: 0, paternity: 5, compassionate: 5, study: 0, unpaid: 0 },
  },
];

// ─── USER EMPLOYMENTS ───
export const userEmployments: UserEmployment[] = [
  {
    id: 'emp_001', companyId: 'comp_001', companyName: 'ABC Logistics Nigeria Ltd',
    role: 'owner', department: 'operations', branchId: 'branch_001',
    branchName: 'Apapa Head Office', employmentType: 'full_time',
    employmentDate: date(500), status: 'active', salary: 0, isOwner: true,
  },
  {
    id: 'emp_ext001', companyId: 'comp_003', companyName: 'XYZ Technologies Ltd',
    companyLogo: '', role: 'employee', department: 'engineering',
    branchId: 'branch_ext001', branchName: 'Victoria Island HQ',
    employmentType: 'full_time', employmentDate: date(500),
    status: 'active', salary: 600000, isOwner: false,
  },
];

// ─── PAYROLL RECORDS ───
export const payrollRecords: PayrollRecord[] = [
  {
    id: 'payroll_001', companyId: 'comp_001', name: 'May 2026 Payroll',
    type: 'fixed', status: 'completed', payPeriodStart: date(60), payPeriodEnd: date(30),
    payDate: date(25), totalEmployees: 41, totalGrossSalary: 12350000,
    totalBonuses: 850000, totalDeductions: 420000, totalNetSalary: 12780000,
    processedBy: 'Fatima Bello', processedAt: date(26), approvedBy: 'Olumide Adeyemi',
    approvedAt: date(25), employeePayrolls: [], createdAt: date(30),
  },
  {
    id: 'payroll_002', companyId: 'comp_001', name: 'June 2026 Payroll',
    type: 'fixed', status: 'processing', payPeriodStart: date(30), payPeriodEnd: date(2),
    payDate: date(3), totalEmployees: 42, totalGrossSalary: 12650000,
    totalBonuses: 450000, totalDeductions: 680000, totalNetSalary: 12420000,
    processedBy: 'Fatima Bello', processedAt: date(2), employeePayrolls: [], createdAt: date(5),
  },
  {
    id: 'payroll_003', companyId: 'comp_001', name: 'July 2026 Payroll',
    type: 'fixed', status: 'draft', payPeriodStart: date(-2), payPeriodEnd: futureDate(28),
    payDate: futureDate(25), totalEmployees: 42, totalGrossSalary: 12650000,
    totalBonuses: 0, totalDeductions: 0, totalNetSalary: 0,
    employeePayrolls: [], createdAt: date(1),
  },
];

// ─── BONUSES ───
export const bonuses: Bonus[] = [
  { id: uid(), employeeId: 'emp_004', employeeName: 'Chinedu Okafor', type: 'performance', amount: 150000, reason: 'Q2 Performance Excellence - exceeded delivery targets by 40%', date: date(15), createdBy: 'emp_003', createdByName: 'Fatima Bello', createdAt: date(15), status: 'approved', approvedBy: 'emp_001', payrollId: 'payroll_002' },
  { id: uid(), employeeId: 'emp_006', employeeName: 'Tunde Bakare', type: 'overtime', amount: 50000, reason: 'Overtime for weekend inventory audit', date: date(10), createdBy: 'emp_007', createdByName: 'Emeka Nwosu', createdAt: date(10), status: 'approved', approvedBy: 'emp_003', payrollId: 'payroll_002' },
  { id: uid(), employeeId: 'emp_001', employeeName: 'Ngozi Okonkwo', type: 'annual', amount: 200000, reason: 'Annual performance bonus - FY2026', date: date(20), createdBy: 'emp_003', createdByName: 'Fatima Bello', createdAt: date(20), status: 'approved', approvedBy: 'emp_001', payrollId: 'payroll_001' },
  { id: uid(), employeeId: 'emp_010', employeeName: 'Ibrahim Musa', type: 'holiday', amount: 30000, reason: 'Sallah celebration bonus', date: date(45), createdBy: 'emp_012', createdByName: 'Amina Ibrahim', createdAt: date(45), status: 'approved', approvedBy: 'emp_003', payrollId: 'payroll_001' },
  { id: uid(), employeeId: 'emp_008', employeeName: 'Yewande Ajayi', type: 'referral', amount: 75000, reason: 'Referred new client - Green Foods Ltd', date: date(5), createdBy: 'emp_007', createdByName: 'Emeka Nwosu', createdAt: date(5), status: 'pending' },
];

// ─── DEDUCTIONS ───
export const deductions: Deduction[] = [
  { id: uid(), employeeId: 'emp_006', employeeName: 'Tunde Bakare', type: 'late_coming', amount: 15000, reason: 'Late to work 5 times in June - company policy deduction', date: date(28), createdBy: 'emp_007', createdByName: 'Emeka Nwosu', createdAt: date(28), status: 'approved', approvedBy: 'emp_003', payrollId: 'payroll_002' },
  { id: uid(), employeeId: 'emp_012', employeeName: 'Bola Tinubu', type: 'penalty', amount: 50000, reason: 'Data breach incident - unauthorized data sharing', date: date(2), createdBy: 'emp_003', createdByName: 'Fatima Bello', createdAt: date(2), status: 'pending' },
  { id: uid(), employeeId: 'emp_008', employeeName: 'Yewande Ajayi', type: 'tax', amount: 12000, reason: 'PAYE tax deduction - June 2026', date: date(28), createdBy: 'emp_002', createdByName: 'Emmanuel Adeleke', createdAt: date(28), status: 'approved', approvedBy: 'emp_001', payrollId: 'payroll_002' },
  { id: uid(), employeeId: 'emp_004', employeeName: 'Chinedu Okafor', type: 'salary_advance', amount: 100000, reason: 'Salary advance recovery - 2 of 3 installments', date: date(28), createdBy: 'emp_002', createdByName: 'Emmanuel Adeleke', createdAt: date(28), status: 'approved', approvedBy: 'emp_003', payrollId: 'payroll_002' },
  { id: uid(), employeeId: 'emp_009', employeeName: 'Amina Ibrahim', type: 'pension', amount: 34200, reason: 'Pension contribution - 9% employee share', date: date(28), createdBy: 'emp_002', createdByName: 'Emmanuel Adeleke', createdAt: date(28), status: 'approved', approvedBy: 'emp_001', payrollId: 'payroll_002' },
];

// ─── LEAVE REQUESTS ───
export const leaveRequests: LeaveRequest[] = [
  { id: uid(), employeeId: 'emp_005', employeeName: 'Amara Obi', type: 'maternity', startDate: date(10), endDate: futureDate(110), days: 90, reason: 'Maternity leave - expecting baby in July', status: 'approved', createdAt: date(30), approvedBy: 'Fatima Bello', approvedAt: date(10) },
  { id: uid(), employeeId: 'emp_006', employeeName: 'Tunde Bakare', type: 'annual', startDate: futureDate(7), endDate: futureDate(21), days: 14, reason: 'Family vacation to Calabar', status: 'pending', createdAt: date(3) },
  { id: uid(), employeeId: 'emp_004', employeeName: 'Chinedu Okafor', type: 'sick', startDate: date(5), endDate: date(3), days: 2, reason: 'Malaria treatment - doctor\'s recommendation', status: 'approved', createdAt: date(5), approvedBy: 'Ngozi Okonkwo', approvedAt: date(5) },
  { id: uid(), employeeId: 'emp_010', employeeName: 'Ibrahim Musa', type: 'emergency', startDate: futureDate(3), endDate: futureDate(5), days: 2, reason: 'Family emergency - father hospitalized', status: 'pending', createdAt: date(1) },
  { id: uid(), employeeId: 'emp_008', employeeName: 'Yewande Ajayi', type: 'annual', startDate: futureDate(14), endDate: futureDate(21), days: 7, reason: 'Personal travel - sister\'s wedding', status: 'pending', createdAt: date(2) },
];

// ─── APPROVAL REQUESTS ───
export const approvalRequests: ApprovalRequest[] = [
  { id: uid(), companyId: 'comp_001', type: 'bonus', status: 'pending', title: 'Referral Bonus - Yewande Ajayi', description: 'Bonus for referring Green Foods Ltd as new client', requestedBy: 'emp_007', requestedByName: 'Emeka Nwosu', requestedAt: date(5), amount: 75000, targetId: 'bonus_005', metadata: { employeeName: 'Yewande Ajayi', bonusType: 'referral' } },
  { id: uid(), companyId: 'comp_001', type: 'deduction', status: 'pending', title: 'Penalty Deduction - Bola Tinubu', description: 'Penalty for data breach incident', requestedBy: 'emp_003', requestedByName: 'Fatima Bello', requestedAt: date(2), amount: 50000, targetId: 'deduct_002', metadata: { employeeName: 'Bola Tinubu', deductionType: 'penalty' } },
  { id: uid(), companyId: 'comp_001', type: 'leave_request', status: 'pending', title: 'Annual Leave - Tunde Bakare', description: '14 days annual leave for family vacation', requestedBy: 'emp_006', requestedByName: 'Tunde Bakare', requestedAt: date(3), targetId: 'leave_002', metadata: { days: 14, leaveType: 'annual' } },
  { id: uid(), companyId: 'comp_001', type: 'leave_request', status: 'pending', title: 'Emergency Leave - Ibrahim Musa', description: '2 days emergency leave for family hospitalization', requestedBy: 'emp_010', requestedByName: 'Ibrahim Musa', requestedAt: date(1), targetId: 'leave_004', metadata: { days: 2, leaveType: 'emergency' } },
  { id: uid(), companyId: 'comp_001', type: 'salary_change', status: 'pending', title: 'Salary Adjustment - Chioma Eze', description: 'Convert intern to full-time with salary of \u20A6180,000', requestedBy: 'emp_003', requestedByName: 'Fatima Bello', requestedAt: date(7), amount: 180000, targetId: 'emp_011', metadata: { currentSalary: 80000, newSalary: 180000, employmentType: 'full_time' } },
  { id: uid(), companyId: 'comp_001', type: 'payroll_run', status: 'approved', title: 'June 2026 Payroll Run', description: 'Monthly payroll for 42 employees', requestedBy: 'emp_003', requestedByName: 'Fatima Bello', requestedAt: date(5), amount: 12420000, targetId: 'payroll_002', metadata: { totalEmployees: 42, payrollPeriod: 'June 2026' }, reviewedBy: 'emp_001', reviewedByName: 'Olumide Adeyemi', reviewedAt: date(4) },
];

// ─── PERFORMANCE RECORDS ───
export const performanceRecords: PerformanceRecord[] = [
  { id: uid(), employeeId: 'emp_004', employeeName: 'Chinedu Okafor', type: 'commendation', title: 'Platform Excellence Award', description: 'Delivered logistics tracking platform 2 weeks ahead of schedule with zero bugs', rating: 5, createdBy: 'user_001', createdByName: 'Olumide Adeyemi', createdAt: date(100), period: 'Q1 2026' },
  { id: uid(), employeeId: 'emp_001', employeeName: 'Ngozi Okonkwo', type: 'review', title: 'Annual Performance Review 2026', description: 'Consistently meets expectations. Strong leadership in branch operations. Areas for growth: strategic planning', rating: 4, createdBy: 'user_001', createdByName: 'Olumide Adeyemi', createdAt: date(90), period: 'FY 2026' },
  { id: uid(), employeeId: 'emp_012', employeeName: 'Bola Tinubu', type: 'warning', title: 'Data Security Warning', description: 'Unauthorized sharing of confidential financial data with external party. Immediate suspension issued pending investigation.', createdBy: 'emp_003', createdByName: 'Fatima Bello', createdAt: date(2) },
  { id: uid(), employeeId: 'emp_006', employeeName: 'Tunde Bakare', type: 'note', title: 'Attendance Concern', description: 'Has been late 5 times this month. Spoken to employee and issued verbal warning. Monitor closely.', createdBy: 'emp_007', createdByName: 'Emeka Nwosu', createdAt: date(28) },
  { id: uid(), employeeId: 'emp_009', employeeName: 'Amina Ibrahim', type: 'commendation', title: 'Branch Growth Recognition', description: 'Grew Port Harcourt branch revenue by 35% in Q2 through excellent client relationships', rating: 5, createdBy: 'user_001', createdByName: 'Olumide Adeyemi', createdAt: date(80), period: 'Q2 2026' },
];

// ─── AUDIT LOGS ───
export const auditLogs: AuditLog[] = [
  { id: uid(), companyId: 'comp_001', action: 'employee_created', actor: 'Fatima Bello', actorRole: 'hr', target: 'Chioma Eze', targetType: 'employee', details: 'Added as Admin Intern at Apapa Head Office', timestamp: date(30) },
  { id: uid(), companyId: 'comp_001', action: 'salary_updated', actor: 'Olumide Adeyemi', actorRole: 'owner', target: 'Ngozi Okonkwo', targetType: 'employee', details: 'Salary increased from \u20A6350,000 to \u20A6450,000', timestamp: date(100) },
  { id: uid(), companyId: 'comp_001', action: 'payroll_processed', actor: 'Fatima Bello', actorRole: 'hr', target: 'June 2026 Payroll', targetType: 'payroll', details: 'Processed payroll for 42 employees', timestamp: date(2) },
  { id: uid(), companyId: 'comp_001', action: 'bonus_added', actor: 'Emeka Nwosu', actorRole: 'branch_manager', target: 'Tunde Bakare', targetType: 'employee', details: 'Added overtime bonus of \u20A650,000', timestamp: date(10) },
  { id: uid(), companyId: 'comp_001', action: 'leave_approved', actor: 'Fatima Bello', actorRole: 'hr', target: 'Amara Obi', targetType: 'employee', details: 'Approved 90-day maternity leave', timestamp: date(10) },
  { id: uid(), companyId: 'comp_001', action: 'branch_created', actor: 'Olumide Adeyemi', actorRole: 'owner', target: 'Port Harcourt Branch', targetType: 'branch', details: 'Created new branch at Trans Amadi Layout', timestamp: date(60) },
  { id: uid(), companyId: 'comp_001', action: 'deduction_added', actor: 'Fatima Bello', actorRole: 'hr', target: 'Bola Tinubu', targetType: 'employee', details: 'Added penalty deduction of \u20A650,000 for data breach', timestamp: date(2) },
  { id: uid(), companyId: 'comp_001', action: 'employee_updated', actor: 'Fatima Bello', actorRole: 'hr', target: 'Bola Tinubu', targetType: 'employee', details: 'Status changed to suspended', timestamp: date(1) },
];

// ─── EMPLOYMENT VERIFICATIONS ───
export const employmentVerifications: EmploymentVerification[] = [
  { id: uid(), employeeId: 'emp_ext001', companyName: 'XYZ Technologies Ltd', employeeName: 'Olumide Adeyemi', position: 'Senior Frontend Engineer', department: 'engineering', branch: 'Victoria Island HQ', employmentStatus: 'active', employmentDate: date(500), employmentType: 'full_time', verificationCode: 'VER-2026-XYZ-001', isActive: true, verifiedAt: date(450) },
];

// ─── ROLES ───
export const roles: Role[] = [
  { id: uid(), companyId: 'comp_001', name: 'Owner', description: 'Full access to all company features and settings', isDefault: true, isCustom: false, userCount: 1, createdAt: date(150), permissions: [
    { id: uid(), category: 'Company', name: 'Manage Company', description: 'Edit company details and settings', key: 'company.manage', enabled: true },
    { id: uid(), category: 'Company', name: 'Delete Company', description: 'Permanently delete company account', key: 'company.delete', enabled: true },
    { id: uid(), category: 'Employees', name: 'Add Employee', description: 'Create new employee records', key: 'employee.create', enabled: true },
    { id: uid(), category: 'Employees', name: 'Edit Employee', description: 'Modify employee information', key: 'employee.update', enabled: true },
    { id: uid(), category: 'Employees', name: 'Remove Employee', description: 'Delete or terminate employees', key: 'employee.delete', enabled: true },
    { id: uid(), category: 'Payroll', name: 'Run Payroll', description: 'Process monthly payroll', key: 'payroll.run', enabled: true },
    { id: uid(), category: 'Payroll', name: 'Approve Payroll', description: 'Approve payroll before processing', key: 'payroll.approve', enabled: true },
    { id: uid(), category: 'Branches', name: 'Manage Branches', description: 'Create and edit branches', key: 'branch.manage', enabled: true },
    { id: uid(), category: 'Reports', name: 'View Reports', description: 'Access all reports', key: 'reports.view', enabled: true },
    { id: uid(), category: 'Settings', name: 'Manage Roles', description: 'Create and assign roles', key: 'roles.manage', enabled: true },
    { id: uid(), category: 'Approvals', name: 'Approve Requests', description: 'Approve or reject all requests', key: 'approvals.manage', enabled: true },
  ]},
  { id: uid(), companyId: 'comp_001', name: 'HR Manager', description: 'Manage employees, payroll, and leave', isDefault: true, isCustom: false, userCount: 1, createdAt: date(150), permissions: [
    { id: uid(), category: 'Employees', name: 'Add Employee', description: 'Create new employee records', key: 'employee.create', enabled: true },
    { id: uid(), category: 'Employees', name: 'Edit Employee', description: 'Modify employee information', key: 'employee.update', enabled: true },
    { id: uid(), category: 'Payroll', name: 'Run Payroll', description: 'Process monthly payroll', key: 'payroll.run', enabled: true },
    { id: uid(), category: 'Approvals', name: 'Approve Requests', description: 'Approve or reject requests', key: 'approvals.manage', enabled: true },
    { id: uid(), category: 'Reports', name: 'View Reports', description: 'Access HR reports', key: 'reports.view', enabled: true },
  ]},
  { id: uid(), companyId: 'comp_001', name: 'Finance', description: 'Manage financial operations and payroll approval', isDefault: true, isCustom: false, userCount: 1, createdAt: date(150), permissions: [
    { id: uid(), category: 'Payroll', name: 'Approve Payroll', description: 'Approve payroll before processing', key: 'payroll.approve', enabled: true },
    { id: uid(), category: 'Payroll', name: 'View Payroll', description: 'View payroll details and history', key: 'payroll.view', enabled: true },
    { id: uid(), category: 'Approvals', name: 'Approve Requests', description: 'Approve financial requests', key: 'approvals.financial', enabled: true },
    { id: uid(), category: 'Reports', name: 'View Reports', description: 'Access financial reports', key: 'reports.financial', enabled: true },
  ]},
  { id: uid(), companyId: 'comp_001', name: 'Branch Manager', description: 'Manage branch operations and staff', isDefault: true, isCustom: false, userCount: 2, createdAt: date(150), permissions: [
    { id: uid(), category: 'Employees', name: 'View Employees', description: 'View branch employee records', key: 'employee.view', enabled: true },
    { id: uid(), category: 'Employees', name: 'Edit Employee', description: 'Update branch employee info', key: 'employee.update', enabled: true },
    { id: uid(), category: 'Payroll', name: 'View Payroll', description: 'View branch payroll data', key: 'payroll.view', enabled: true },
    { id: uid(), category: 'Approvals', name: 'Submit Requests', description: 'Submit bonus and deduction requests', key: 'approvals.submit', enabled: true },
  ]},
  { id: uid(), companyId: 'comp_001', name: 'Employee', description: 'View personal records and request leave', isDefault: true, isCustom: false, userCount: 36, createdAt: date(150), permissions: [
    { id: uid(), category: 'Personal', name: 'View Profile', description: 'View own employee profile', key: 'profile.view', enabled: true },
    { id: uid(), category: 'Personal', name: 'Request Leave', description: 'Submit leave requests', key: 'leave.request', enabled: true },
    { id: uid(), category: 'Personal', name: 'View Payslips', description: 'View own payslip history', key: 'payslip.view', enabled: true },
  ]},
];

// ─── PAYROLL SUMMARIES ───
export const payrollSummaries: PayrollSummary[] = [
  { period: 'March 2026', totalEmployees: 38, totalGross: 11200000, totalBonuses: 420000, totalDeductions: 380000, totalNet: 11240000, comparison: { grossChange: 2.1, netChange: 1.8, employeeChange: 1 } },
  { period: 'April 2026', totalEmployees: 40, totalGross: 11800000, totalBonuses: 600000, totalDeductions: 310000, totalNet: 12090000, comparison: { grossChange: 5.4, netChange: 7.6, employeeChange: 2 } },
  { period: 'May 2026', totalEmployees: 41, totalGross: 12350000, totalBonuses: 850000, totalDeductions: 420000, totalNet: 12780000, comparison: { grossChange: 4.7, netChange: 5.7, employeeChange: 1 } },
  { period: 'June 2026', totalEmployees: 42, totalGross: 12650000, totalBonuses: 450000, totalDeductions: 680000, totalNet: 12420000, comparison: { grossChange: 2.4, netChange: -2.8, employeeChange: 1 } },
];

// ─── EMPLOYEE GROWTH REPORTS ───
export const employeeGrowthReports: EmployeeGrowthReport[] = [
  { month: 'Jan 2026', hired: 2, terminated: 0, netChange: 2, total: 35 },
  { month: 'Feb 2026', hired: 1, terminated: 1, netChange: 0, total: 35 },
  { month: 'Mar 2026', hired: 3, terminated: 0, netChange: 3, total: 38 },
  { month: 'Apr 2026', hired: 2, terminated: 0, netChange: 2, total: 40 },
  { month: 'May 2026', hired: 1, terminated: 0, netChange: 1, total: 41 },
  { month: 'Jun 2026', hired: 1, terminated: 0, netChange: 1, total: 42 },
];

// ─── SALARY TREND REPORTS ───
export const salaryTrendReports: SalaryTrendReport[] = [
  { month: 'Jan 2026', averageSalary: 298000, totalPayroll: 10430000, bonusTotal: 380000, deductionTotal: 290000 },
  { month: 'Feb 2026', averageSalary: 300000, totalPayroll: 10500000, bonusTotal: 250000, deductionTotal: 310000 },
  { month: 'Mar 2026', averageSalary: 307000, totalPayroll: 11200000, bonusTotal: 420000, deductionTotal: 380000 },
  { month: 'Apr 2026', averageSalary: 310000, totalPayroll: 11800000, bonusTotal: 600000, deductionTotal: 310000 },
  { month: 'May 2026', averageSalary: 315000, totalPayroll: 12350000, bonusTotal: 850000, deductionTotal: 420000 },
  { month: 'Jun 2026', averageSalary: 314000, totalPayroll: 12650000, bonusTotal: 450000, deductionTotal: 680000 },
];

// ─── NOTIFICATIONS ───
export const notifications: PayrollNotification[] = [
  { id: uid(), type: 'payroll_processed', title: 'Payroll Processed', message: 'June 2026 payroll has been processed for 42 employees', companyId: 'comp_001', isRead: false, createdAt: date(2) },
  { id: uid(), type: 'approval_required', title: 'Approval Required', message: 'Penalty deduction of \u20A650,000 for Bola Tinubu awaiting your approval', companyId: 'comp_001', isRead: false, createdAt: date(2) },
  { id: uid(), type: 'leave_approved', title: 'Leave Approved', message: 'Your maternity leave request has been approved', companyId: 'comp_001', employeeId: 'emp_005', isRead: true, createdAt: date(10) },
  { id: uid(), type: 'bonus_added', title: 'Bonus Added', message: 'Performance bonus of \u20A6150,000 has been added to your June payroll', companyId: 'comp_001', employeeId: 'emp_004', isRead: true, createdAt: date(15) },
  { id: uid(), type: 'company_verified', title: 'Company Verified', message: 'ABC Logistics Nigeria Ltd has been verified successfully', companyId: 'comp_001', isRead: true, createdAt: date(115) },
];

// ─── EXPORTS ───
export {
  formatNaira,
  uid,
  date,
  futureDate,
};

// ─── AGGREGATED DATA HELPERS ───
export const getCompanyEmployees = (companyId: string) => employees.filter(e => e.companyId === companyId);
export const getCompanyBranches = (companyId: string) => branches.filter(b => b.companyId === companyId);
export const getBranchEmployees = (branchId: string) => employees.filter(e => e.branchId === branchId);
export const getEmployeePayrolls = (employeeId: string) => payrollRecords.filter(p => p.employeePayrolls.some(ep => ep.employeeId === employeeId));
export const getEmployeeBonuses = (employeeId: string) => bonuses.filter(b => b.employeeId === employeeId);
export const getEmployeeDeductions = (employeeId: string) => deductions.filter(d => d.employeeId === employeeId);
export const getEmployeeLeaveRequests = (employeeId: string) => leaveRequests.filter(l => l.employeeId === employeeId);
export const getEmployeePerformance = (employeeId: string) => performanceRecords.filter(p => p.employeeId === employeeId);
export const getCompanyAuditLogs = (companyId: string) => auditLogs.filter(a => a.companyId === companyId);
export const getPendingApprovals = (companyId: string) => approvalRequests.filter(a => a.companyId === companyId && a.status === 'pending');
