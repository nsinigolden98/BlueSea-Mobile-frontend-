// ============================================================================
// PAYROLL PRO — CONTRACT TYPES
// Mirrors the JSON emitted by the Rust backend (`bluesea-backend`,
// `src/payroll/serializers.rs`). Amounts* are integer kobo end-to-end;
// the API surface converts kobo -> naira at the edge (divide by 100) so the
// rest of the UI can stay in naira as it always has.
// ============================================================================

export type UUID = string;

// ─── Shared ───

export type VerificationStatus = 'pending' | 'under_review' | 'verified' | 'rejected';

export interface CompanyStats {
  totalEmployees: number;
  activeEmployees: number;
  totalBranches: number;
  monthlyPayrollCents: number;
}

// ─── COMPANY ───

export type BusinessType =
  | 'limited_liability'
  | 'partnership'
  | 'sole_proprietorship'
  | 'plc'
  | 'ngo'
  | 'government'
  | 'other';

export interface CompanySettings {
  payrollDay?: number;
  currency?: string;
  timezone?: string;
  enableAutoPayroll?: boolean;
  enablePayslipEmail?: boolean;
  enableNotification?: boolean;
  [k: string]: unknown;
}

export interface Company {
  id: UUID;
  name: string;
  cacNumber: string | null;
  businessType: BusinessType;
  email: string | null;
  phone: string | null;
  address: string | null;
  website: string | null;
  logoUrl: string | null;
  expectedEmployeeCount: number | null;
  expectedBranchCount: number | null;
  /** Naira (major units). */
  expectedMonthlyPayroll: number;
  settings: CompanySettings;
  status: string;
  membershipRole: 'owner' | 'controller';
  createdAt: string;
  updatedAt: string;
  stats: CompanyStats;
}

// ─── BRANCH ───

export type BranchStatus = 'active' | 'suspended';

export interface Branch {
  id: UUID;
  companyId: UUID;
  name: string;
  address: string | null;
  description: string | null;
  managerId: UUID | null;
  managerName: string | null;
  employeeCount: number;
  status: BranchStatus;
  /** Naira (major units). */
  monthlyPayrollEstimate: number;
  createdAt: string;
  updatedAt: string;
}

// ─── EMPLOYEE ───

export type EmploymentType = 'full_time' | 'part_time' | 'contract' | 'intern' | 'temporary';
export type EmployeeStatus = 'active' | 'suspended' | 'on_leave' | 'resigned' | 'terminated';
export type Department =
  | 'operations'
  | 'finance'
  | 'hr'
  | 'engineering'
  | 'sales'
  | 'marketing'
  | 'customer_service'
  | 'logistics'
  | 'admin'
  | 'legal'
  | 'it'
  | 'other';
export type EmployeeRole = 'owner' | 'hr' | 'finance' | 'branch_manager' | 'employee' | (string & {});

export interface Employee {
  id: UUID;
  companyId: UUID;
  branchId: UUID | null;
  branchName: string | null;
  userId: UUID | null;
  linked: boolean;
  employeeId: string;
  fullName: string;
  email: string | null;
  phone: string | null;
  role: EmployeeRole;
  department: Department;
  employmentType: EmploymentType;
  employmentDate: string;
  /** Naira (major units). */
  salary: number;
  status: EmployeeStatus;
  managerId: UUID | null;
  bankName: string | null;
  bankCode: string | null;
  bankAccountNumber: string | null;
  bankAccountName: string | null;
  taxId: string | null;
  createdAt: string;
  updatedAt: string;
}

// ─── PAYROLL RUN ───

export type PayrollStatus =
  | 'draft'
  | 'pending_approval'
  | 'processing'
  | 'completed'
  | 'partially_completed'
  | 'failed'
  | 'cancelled';
export type PayrollType = 'fixed' | 'anniversary';

export interface PayrollRunLine {
  id: UUID;
  runId: UUID;
  seq: number;
  employeeId: UUID;
  reference: string;
  employeeName: string;
  salaryCents: number;
  bonusCents: number;
  deductionCents: number;
  netCents: number;
  method: 'wallet' | 'bank' | 'skipped';
  status: 'pending' | 'paid' | 'failed' | 'skipped';
  excluded: boolean;
  failReason: string | null;
  bankName: string | null;
  bankCode: string | null;
  bankAccountNumber: string | null;
  bankAccountName: string | null;
  providerTransactionReference: string | null;
  providerStatus: string | null;
  paidAt: string | null;
}

export interface PayrollRecord {
  id: UUID;
  companyId: UUID;
  companyName: string;
  branchId: UUID | null;
  name: string;
  type: PayrollType;
  status: PayrollStatus;
  payPeriodStart: string | null;
  payPeriodEnd: string | null;
  payDate: string | null;
  /** All in naira (major units). */
  totalGrossSalary: number;
  totalBonuses: number;
  totalDeductions: number;
  totalNetSalary: number;
  rejectionReason: string | null;
  createdBy: UUID;
  approvedBy: UUID | null;
  submittedAt: string | null;
  approvedAt: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
  lines?: PayrollRunLine[];
}

// ─── ADJUSTMENTS ───

export type BonusType =
  | 'performance'
  | 'overtime'
  | 'holiday'
  | 'one_time'
  | 'referral'
  | 'annual'
  | 'other';
export type DeductionType =
  | 'absence'
  | 'late_coming'
  | 'penalty'
  | 'salary_advance'
  | 'tax'
  | 'pension'
  | 'nhis'
  | 'nhf'
  | 'other';

export interface Bonus {
  id: UUID;
  companyId: UUID;
  employeeId: UUID;
  employeeName: string;
  type: BonusType | (string & {});
  amount: number;
  reason: string;
  occurredOn: string;
  consumedRunId: UUID | null;
  createdAt: string;
}

export interface Deduction {
  id: UUID;
  companyId: UUID;
  employeeId: UUID;
  employeeName: string;
  type: DeductionType | (string & {});
  amount: number;
  reason: string;
  occurredOn: string;
  consumedRunId: UUID | null;
  createdAt: string;
}

// ─── MEMBERSHIP & INVITES ───

export type InviteStatus = 'pending' | 'accepted' | 'declined' | 'revoked' | 'expired';

export interface CompanyMember {
  id: UUID;
  companyId: UUID;
  role: 'owner' | 'controller';
  name: string;
  email: string;
  isOwner: boolean;
  createdAt: string;
}

export interface PayrollInvite {
  id: UUID;
  companyId: UUID;
  companyName: string;
  inviterName: string;
  inviteeName: string;
  inviteeEmail: string;
  role: 'controller' | string;
  status: InviteStatus;
  expiresAt: string;
  createdAt: string;
  resolvedAt: string | null;
}

// ─── AUDIT ───

export interface AuditLog {
  id: UUID;
  companyId: UUID;
  actorId: UUID | null;
  action: string;
  targetType: string | null;
  targetId: string | null;
  details: Record<string, unknown>;
  timestamp: string;
}

// ─── PORTAL (/payroll/me, /payroll/portal) ───

export interface Employment {
  id: UUID;
  companyId: UUID;
  companyName: string;
  branchName: string | null;
  role: string;
  department: Department | (string & {});
  employmentType: EmploymentType | (string & {});
  employmentDate: string;
  /** Naira (major units). */
  salary: number;
  status: EmployeeStatus | (string & {});
  isOwner: boolean;
}

export interface Payslip {
  id: UUID;
  reference: string;
  runName: string;
  companyName: string;
  companyId: UUID;
  /** Naira (major units). */
  gross: number;
  net: number;
  paidAt: string;
}

export interface PayrollHome {
  companies: Company[];
  employments: Employment[];
  pendingInvites: number;
}

export interface PortalResponse {
  employments: Employment[];
  recentPayslips: Payslip[];
  bonuses: Bonus[];
  deductions: Deduction[];
}

// ─── FORM / MISC (kept, trimmed to what the screens use) ───

export interface EmployeeFilters {
  search: string;
  status: EmployeeStatus | 'all';
  department: Department | 'all';
  branch: string | 'all';
  employmentType: EmploymentType | 'all';
  role: string | 'all';
}
