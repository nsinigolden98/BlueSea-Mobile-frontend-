// ============================================================================
// PAYROLL PRO - TYPE DEFINITIONS
// Production-grade TypeScript types for workforce management module
// ============================================================================

export type UUID = string;

// ─── VERIFICATION ───
export type VerificationStatus = 'pending' | 'under_review' | 'verified' | 'rejected';

export interface CompanyVerification {
  id: UUID;
  companyId: UUID;
  status: VerificationStatus;
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  rejectionReason?: string;
  documents: VerificationDocument[];
}

export interface VerificationDocument {
  id: UUID;
  type: 'cac_certificate' | 'tax_id' | 'utility_bill' | 'directors_id' | 'bank_statement' | 'other';
  name: string;
  url: string;
  uploadedAt: string;
  status: 'pending' | 'approved' | 'rejected';
}

// ─── COMPANY ───
export type BusinessType = 'limited_liability' | 'partnership' | 'sole_proprietorship' | 'plc' | 'ngo' | 'government' | 'other';

export interface Company {
  id: UUID;
  name: string;
  cacNumber: string;
  businessType: BusinessType;
  email: string;
  phone: string;
  address: string;
  logoUrl?: string;
  website?: string;
  expectedEmployeeCount: number;
  expectedBranchCount: number;
  expectedMonthlyPayroll: number;
  verification: CompanyVerification;
  createdAt: string;
  updatedAt: string;
  ownerId: UUID;
  settings: CompanySettings;
}

export interface CompanySettings {
  payrollDay: number;
  currency: string;
  timezone: string;
  approvalWorkflow: ApprovalWorkflowConfig;
  enableAutoPayroll: boolean;
  enablePayslipEmail: boolean;
  enableNotification: boolean;
}

// ─── BRANCH ───
export type BranchStatus = 'pending' | 'active' | 'suspended';

export interface Branch {
  id: UUID;
  companyId: UUID;
  name: string;
  address: string;
  managerId?: UUID;
  managerName?: string;
  employeeCount: number;
  status: BranchStatus;
  description?: string;
  createdAt: string;
  monthlyPayrollEstimate: number;
}

// ─── EMPLOYEE ───
export type EmploymentType = 'full_time' | 'part_time' | 'contract' | 'intern' | 'temporary';
export type EmployeeStatus = 'active' | 'suspended' | 'on_leave' | 'resigned' | 'terminated';
export type Department = 'operations' | 'finance' | 'hr' | 'engineering' | 'sales' | 'marketing' | 'customer_service' | 'logistics' | 'admin' | 'legal' | 'it' | 'other';
export type DefaultRole = 'owner' | 'hr' | 'finance' | 'branch_manager' | 'employee';

export interface Employee {
  id: UUID;
  companyId: UUID;
  branchId: UUID;
  userId: UUID;
  employeeId: string;
  fullName: string;
  email: string;
  phone?: string;
  role: DefaultRole | string;
  department: Department;
  employmentType: EmploymentType;
  employmentDate: string;
  salary: number;
  status: EmployeeStatus;
  managerId?: UUID;
  managerName?: string;
  branchName: string;
  bankName?: string;
  bankAccountNumber?: string;
  bankAccountName?: string;
  taxId?: string;
  pensionId?: string;
  nin?: string;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
  documents: EmployeeDocument[];
  timeline: TimelineEvent[];
  leaveBalance: LeaveBalance;
}

export interface EmployeeDocument {
  id: UUID;
  type: 'contract' | 'id_card' | 'certificate' | 'offer_letter' | 'verification_doc' | 'payslip' | 'other';
  name: string;
  url: string;
  uploadedAt: string;
  uploadedBy: string;
}

// ─── PAYROLL ───
export type PayrollStatus = 'draft' | 'pending_approval' | 'approved' | 'processing' | 'completed' | 'failed';
export type PayrollType = 'fixed' | 'anniversary';

export interface PayrollRecord {
  id: UUID;
  companyId: UUID;
  branchId?: UUID;
  name: string;
  type: PayrollType;
  status: PayrollStatus;
  payPeriodStart: string;
  payPeriodEnd: string;
  payDate: string;
  totalEmployees: number;
  totalGrossSalary: number;
  totalBonuses: number;
  totalDeductions: number;
  totalNetSalary: number;
  processedBy?: string;
  processedAt?: string;
  approvedBy?: string;
  approvedAt?: string;
  employeePayrolls: EmployeePayroll[];
  createdAt: string;
}

export interface EmployeePayroll {
  id: UUID;
  employeeId: UUID;
  employeeName: string;
  baseSalary: number;
  proratedDays?: number;
  proratedSalary: number;
  bonuses: Bonus[];
  deductions: Deduction[];
  grossSalary: number;
  totalDeductions: number;
  netSalary: number;
  status: 'pending' | 'paid' | 'failed';
  paymentReference?: string;
  paidAt?: string;
}

// ─── BONUSES ───
export type BonusType = 'performance' | 'overtime' | 'holiday' | 'one_time' | 'referral' | 'annual' | 'other';

export interface Bonus {
  id: UUID;
  employeeId: UUID;
  employeeName: string;
  type: BonusType;
  amount: number;
  reason: string;
  date: string;
  createdBy: string;
  createdByName: string;
  createdAt: string;
  status: 'pending' | 'approved' | 'rejected';
  approvedBy?: string;
  payrollId?: UUID;
}

// ─── DEDUCTIONS ───
export type DeductionType = 'absence' | 'late_coming' | 'penalty' | 'salary_advance' | 'tax' | 'pension' | 'nhis' | 'nhf' | 'other';

export interface Deduction {
  id: UUID;
  employeeId: UUID;
  employeeName: string;
  type: DeductionType;
  amount: number;
  reason: string;
  date: string;
  createdBy: string;
  createdByName: string;
  createdAt: string;
  status: 'pending' | 'approved' | 'rejected';
  approvedBy?: string;
  payrollId?: UUID;
}

// ─── LEAVE ───
export type LeaveType = 'annual' | 'sick' | 'emergency' | 'maternity' | 'paternity' | 'compassionate' | 'study' | 'unpaid';
export type LeaveStatus = 'pending' | 'approved' | 'rejected' | 'cancelled' | 'completed';

export interface LeaveRequest {
  id: UUID;
  employeeId: UUID;
  employeeName: string;
  type: LeaveType;
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  status: LeaveStatus;
  createdAt: string;
  approvedBy?: string;
  approvedAt?: string;
  rejectionReason?: string;
}

export interface LeaveBalance {
  annual: number;
  sick: number;
  emergency: number;
  maternity: number;
  paternity: number;
  compassionate: number;
  study: number;
  unpaid: number;
}

// ─── APPROVALS ───
export type ApprovalType = 'bonus' | 'deduction' | 'leave_request' | 'salary_change' | 'branch_request' | 'employee_change' | 'payroll_run';
export type ApprovalStatus = 'pending' | 'approved' | 'rejected';

export interface ApprovalRequest {
  id: UUID;
  companyId: UUID;
  type: ApprovalType;
  status: ApprovalStatus;
  title: string;
  description: string;
  requestedBy: string;
  requestedByName: string;
  requestedAt: string;
  amount?: number;
  reviewedBy?: string;
  reviewedByName?: string;
  reviewedAt?: string;
  rejectionReason?: string;
  targetId: UUID;
  metadata: Record<string, unknown>;
}

export interface ApprovalWorkflowConfig {
  id: UUID;
  name: string;
  steps: ApprovalStep[];
}

export interface ApprovalStep {
  id: UUID;
  order: number;
  role: DefaultRole | string;
  name: string;
}

// ─── PERFORMANCE ───
export type PerformanceType = 'review' | 'warning' | 'commendation' | 'note';

export interface PerformanceRecord {
  id: UUID;
  employeeId: UUID;
  employeeName: string;
  type: PerformanceType;
  title: string;
  description: string;
  rating?: number;
  createdBy: string;
  createdByName: string;
  createdAt: string;
  period?: string;
}

// ─── TIMELINE ───
export type TimelineEventType = 
  | 'joined' 
  | 'promoted' 
  | 'transferred' 
  | 'salary_updated' 
  | 'bonus_added' 
  | 'deduction_added' 
  | 'leave_approved' 
  | 'performance_review' 
  | 'warning_issued' 
  | 'commendation' 
  | 'suspended' 
  | 'reactivated' 
  | 'resigned' 
  | 'terminated' 
  | 'branch_created' 
  | 'payroll_processed';

export interface TimelineEvent {
  id: UUID;
  type: TimelineEventType;
  title: string;
  description: string;
  date: string;
  actor: string;
  actorRole: string;
  metadata?: Record<string, unknown>;
}

// ─── AUDIT LOG ───
export type AuditAction = 
  | 'employee_created' 
  | 'employee_updated' 
  | 'employee_deleted'
  | 'salary_updated' 
  | 'bonus_added' 
  | 'deduction_added' 
  | 'payroll_processed' 
  | 'payroll_approved'
  | 'leave_approved' 
  | 'leave_rejected'
  | 'branch_created' 
  | 'branch_updated'
  | 'company_updated'
  | 'role_assigned'
  | 'document_uploaded';

export interface AuditLog {
  id: UUID;
  companyId: UUID;
  action: AuditAction;
  actor: string;
  actorRole: string;
  target: string;
  targetType: string;
  details: string;
  timestamp: string;
  ipAddress?: string;
}

// ─── EMPLOYMENT VERIFICATION ───
export interface EmploymentVerification {
  id: UUID;
  employeeId: UUID;
  companyName: string;
  employeeName: string;
  position: string;
  department: string;
  branch: string;
  employmentStatus: EmployeeStatus;
  employmentDate: string;
  employmentType: EmploymentType;
  verifiedAt?: string;
  verificationCode: string;
  isActive: boolean;
}

// ─── ROLE & PERMISSIONS ───
export interface Role {
  id: UUID;
  companyId: UUID;
  name: string;
  description: string;
  isDefault: boolean;
  isCustom: boolean;
  permissions: Permission[];
  createdAt: string;
  userCount: number;
}

export interface Permission {
  id: UUID;
  category: string;
  name: string;
  description: string;
  key: string;
  enabled: boolean;
}

// ─── REPORTS ───
export interface PayrollSummary {
  period: string;
  totalEmployees: number;
  totalGross: number;
  totalBonuses: number;
  totalDeductions: number;
  totalNet: number;
  comparison?: {
    grossChange: number;
    netChange: number;
    employeeChange: number;
  };
}

export interface EmployeeGrowthReport {
  month: string;
  hired: number;
  terminated: number;
  netChange: number;
  total: number;
}

export interface SalaryTrendReport {
  month: string;
  averageSalary: number;
  totalPayroll: number;
  bonusTotal: number;
  deductionTotal: number;
}

// ─── USER CONTEXT ───
export interface PayrollProUser {
  id: UUID;
  fullName: string;
  email: string;
  phone: string;
  avatarUrl?: string;
  ownedCompanies: Company[];
  employments: UserEmployment[];
  isNewUser: boolean;
}

export interface UserEmployment {
  id: UUID;
  companyId: UUID;
  companyName: string;
  companyLogo?: string;
  role: DefaultRole | string;
  department: Department;
  branchId: UUID;
  branchName: string;
  employmentType: EmploymentType;
  employmentDate: string;
  status: EmployeeStatus;
  salary: number;
  isOwner: boolean;
}

// ─── FORM STATES ───
export interface FormState<T> {
  data: T;
  errors: Partial<Record<keyof T, string>>;
  isSubmitting: boolean;
  isValid: boolean;
}

export interface ApiState<T> {
  data: T | null;
  isLoading: boolean;
  isError: boolean;
  error: string | null;
}

// ─── NOTIFICATION EVENTS ───
export type PayrollNotificationType = 
  | 'bonus_added'
  | 'deduction_added' 
  | 'salary_paid'
  | 'leave_approved'
  | 'leave_rejected'
  | 'payroll_processed'
  | 'promotion_granted'
  | 'employment_verified'
  | 'company_verified'
  | 'approval_required';

export interface PayrollNotification {
  id: UUID;
  type: PayrollNotificationType;
  title: string;
  message: string;
  companyId: UUID;
  employeeId?: UUID;
  isRead: boolean;
  createdAt: string;
  actionUrl?: string;
}

// ─── FILTER TYPES ───
export interface EmployeeFilters {
  search: string;
  status: EmployeeStatus | 'all';
  department: Department | 'all';
  branch: string | 'all';
  employmentType: EmploymentType | 'all';
  role: string | 'all';
}

export interface PayrollFilters {
  search: string;
  status: PayrollStatus | 'all';
  branch: string | 'all';
  dateRange: { start: string; end: string } | null;
}

export interface ApprovalFilters {
  search: string;
  type: ApprovalType | 'all';
  status: ApprovalStatus | 'all';
  dateRange: { start: string; end: string } | null;
}
