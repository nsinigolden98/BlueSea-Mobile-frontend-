// Payroll Pro — typed API client for the Rust backend (BTL).
// Inputs are naira (numbers or decimal strings); outputs are kobo integers
// (`*_cents`) converted to naira here so the UI never touches raw cents or
// snake_keys.
//
// Error contract: non-2xx responses throw `PayrollApiError` carrying
// `{ status, message, fieldErrors? }`.

import axios from 'axios';
import { API_BASE } from '@/types';
import { authHeaders, getSessionToken, refreshAccessToken } from '@/lib/session';
import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationOptions,
  type UseQueryOptions,
} from '@tanstack/react-query';
import type {
  AuditLog,
  Bonus,
  Branch,
  BusinessType,
  Company,
  CompanyMember,
  Deduction,
  Employee,
  EmployeeStatus,
  EmploymentType,
  Department,
  PayrollInvite,
  PayrollRecord,
  PayrollRunLine,
  Payslip,
  PayrollHome,
  PortalResponse,
  Employment,
} from '@/types/payroll-pro';

// ─── error type ───

export interface PayrollApiError {
  status: number;
  message: string;
  fieldErrors?: Record<string, string[]>;
  data?: unknown;
}

function toApiError(error: any): PayrollApiError {
  const status: number = error?.response?.status ?? 0;
  const data = error?.response?.data;
  let message = 'Request failed. Please try again.';
  const fieldErrors: Record<string, string[]> = {};
  if (data && typeof data === 'object') {
    if (typeof data.error === 'string') message = data.error;
    for (const [key, value] of Object.entries(data)) {
      if (Array.isArray(value)) fieldErrors[key] = value.map(String);
      else if (typeof value === 'string') fieldErrors[key] = [value];
    }
    if (Object.keys(fieldErrors).length > 0 && typeof data.error !== 'string') {
      message = Object.values(fieldErrors).flat()[0] ?? message;
    } else if (fieldErrors['non_field_errors']?.length) {
      message = fieldErrors['non_field_errors'][0];
    }
  } else if (typeof error?.message === 'string' && error.message.length > 0) {
    message = error.message;
  }
  return { status, message, fieldErrors: Object.keys(fieldErrors).length ? fieldErrors : undefined, data };
}

// ─── transport (mirrors src/types/index.ts; Bearer + CSRF, one silent refresh) ───

type Body = Record<string, unknown> | FormData | undefined;

async function call<T>(method: 'get' | 'post' | 'patch' | 'delete', url: string, body?: Body): Promise<T> {
  const isFormData = body instanceof FormData;

  const doRequest = () =>
    axios.request<T>({
      url: `${API_BASE}${url}`,
      method: method.toUpperCase() as any,
      withCredentials: true,
      timeout: 90000,
      data: body,
      headers: {
        ...(getSessionToken() ? { Authorization: `Bearer ${getSessionToken()}` } : {}),
        ...authHeaders(method !== 'get' && method !== 'delete'),
        'Accept': 'application/json',
        ...(body && !isFormData ? { 'Content-Type': 'application/json' } : {}),
      },
    });

  try {
    const response = await doRequest();
    return response.data;
  } catch (error: any) {
    const status: number = error?.response?.status ?? 0;
    const isAuthCall = /\/(login|sign-up|token\/refresh)\b/.test(url);
    if (status === 401 && !isAuthCall && (await refreshAccessToken(API_BASE))) {
      try {
        const response = await doRequest();
        return response.data;
      } catch (retryError: any) {
        throw toApiError(retryError);
      }
    }
    throw toApiError(error);
  }
}

const get = <T>(url: string) => call<T>('get', url);
const post = <T>(url: string, body?: Body) => call<T>('post', url, body);
const patch = <T>(url: string, body?: Body) => call<T>('patch', url, body);
const del = <T>(url: string, body?: Body) => call<T>('delete', url, body);

const naira = (cents: number) => cents / 100;

// ─── wire → UI mappers ───

export function mapCompany(w: any): Company {
  return {
    id: w.id,
    name: w.name,
    cacNumber: w.cac_number ?? null,
    businessType: w.business_type as BusinessType,
    email: w.email ?? null,
    phone: w.phone ?? null,
    address: w.address ?? null,
    website: w.website ?? null,
    logoUrl: w.logo_url ?? null,
    expectedEmployeeCount: w.expected_employee_count ?? null,
    expectedBranchCount: w.expected_branch_count ?? null,
    expectedMonthlyPayroll: naira(Number(w.expected_monthly_payroll_cents ?? 0)),
    settings: (w.settings ?? {}) as Company['settings'],
    status: w.status,
    membershipRole: w.membership_role === 'owner' ? 'owner' : 'controller',
    createdAt: w.created_at,
    updatedAt: w.updated_at,
    stats: {
      totalEmployees: w.stats?.total_employees ?? 0,
      activeEmployees: w.stats?.active_employees ?? 0,
      totalBranches: w.stats?.total_branches ?? 0,
      monthlyPayrollCents: w.stats?.monthly_payroll_cents ?? 0,
    },
  };
}

export function mapBranch(w: any): Branch {
  return {
    id: w.id,
    companyId: w.company_id,
    name: w.name,
    address: w.address ?? null,
    description: w.description ?? null,
    managerId: w.manager_id ?? null,
    managerName: w.manager_name ?? null,
    employeeCount: w.employee_count ?? 0,
    status: w.status,
    monthlyPayrollEstimate: naira(Number(w.monthly_payroll_estimate_cents ?? 0)),
    createdAt: w.created_at,
    updatedAt: w.updated_at,
  };
}

export function mapEmployee(w: any): Employee {
  return {
    id: w.id,
    companyId: w.company_id,
    branchId: w.branch_id ?? null,
    branchName: w.branch_name ?? null,
    userId: w.user_id ?? null,
    linked: Boolean(w.linked),
    employeeId: w.employee_id,
    fullName: w.full_name,
    email: w.email ?? null,
    phone: w.phone ?? null,
    role: w.role,
    department: w.department as Department,
    employmentType: w.employment_type as EmploymentType,
    employmentDate: w.employment_date,
    salary: naira(Number(w.salary_cents ?? 0)),
    status: w.status as EmployeeStatus,
    managerId: w.manager_id ?? null,
    bankName: w.bank_name ?? null,
    bankCode: w.bank_code ?? null,
    bankAccountNumber: w.bank_account_number ?? null,
    bankAccountName: w.bank_account_name ?? null,
    taxId: w.tax_id ?? null,
    createdAt: w.created_at,
    updatedAt: w.updated_at,
  };
}

export function mapLine(w: any): PayrollRunLine {
  return {
    id: w.id,
    runId: w.run_id,
    seq: w.seq,
    employeeId: w.employee_id,
    reference: w.reference,
    employeeName: w.employee_name,
    salaryCents: w.salary_cents,
    bonusCents: w.bonus_cents,
    deductionCents: w.deduction_cents,
    netCents: w.net_cents,
    method: w.method,
    status: w.status,
    excluded: Boolean(w.excluded),
    failReason: w.fail_reason ?? null,
    bankName: w.bank_name ?? null,
    bankCode: w.bank_code ?? null,
    bankAccountNumber: w.bank_account_number ?? null,
    bankAccountName: w.bank_account_name ?? null,
    providerTransactionReference: w.provider_transaction_reference ?? null,
    providerStatus: w.provider_status ?? null,
    paidAt: w.paid_at ?? null,
  };
}

export function mapRun(w: any): PayrollRecord {
  return {
    id: w.id,
    companyId: w.company_id,
    companyName: w.company_name ?? '',
    branchId: w.branch_id ?? null,
    name: w.name,
    type: w.run_type,
    status: w.status,
    payPeriodStart: w.pay_period_start ?? null,
    payPeriodEnd: w.pay_period_end ?? null,
    payDate: w.pay_date ?? null,
    totalGrossSalary: naira(Number(w.total_gross_cents ?? 0)),
    totalBonuses: naira(Number(w.total_bonus_cents ?? 0)),
    totalDeductions: naira(Number(w.total_deduction_cents ?? 0)),
    totalNetSalary: naira(Number(w.total_net_cents ?? 0)),
    rejectionReason: w.rejection_reason ?? null,
    createdBy: w.created_by,
    approvedBy: w.approved_by ?? null,
    submittedAt: w.submitted_at ?? null,
    approvedAt: w.approved_at ?? null,
    completedAt: w.completed_at ?? null,
    createdAt: w.created_at,
    updatedAt: w.updated_at,
    lines: Array.isArray(w.lines) ? w.lines.map(mapLine) : undefined,
  };
}

export function mapBonus(w: any): Bonus {
  return {
    id: w.id,
    companyId: w.company_id,
    employeeId: w.employee_id,
    employeeName: w.employee_name ?? '',
    type: w.type,
    amount: naira(Number(w.amount_cents ?? 0)),
    reason: w.reason ?? '',
    occurredOn: w.occurred_on,
    consumedRunId: w.consumed_run_id ?? null,
    createdAt: w.created_at,
  };
}

export function mapDeduction(w: any): Deduction {
  return {
    id: w.id,
    companyId: w.company_id,
    employeeId: w.employee_id,
    employeeName: w.employee_name ?? '',
    type: w.type,
    amount: naira(Number(w.amount_cents ?? 0)),
    reason: w.reason ?? '',
    occurredOn: w.occurred_on,
    consumedRunId: w.consumed_run_id ?? null,
    createdAt: w.created_at,
  };
}

export function mapMember(w: any): CompanyMember {
  return {
    id: w.id,
    companyId: w.company_id,
    role: w.role === 'owner' ? 'owner' : 'controller',
    name: w.name ?? '',
    email: w.email ?? '',
    isOwner: Boolean(w.is_owner),
    createdAt: w.created_at,
  };
}

export function mapInvite(w: any): PayrollInvite {
  return {
    id: w.id,
    companyId: w.company_id,
    companyName: w.company_name ?? '',
    inviterName: w.inviter_name ?? '',
    inviteeName: w.invitee_name ?? '',
    inviteeEmail: w.invitee_email ?? '',
    role: w.role,
    status: w.status,
    expiresAt: w.expires_at,
    createdAt: w.created_at,
    resolvedAt: w.resolved_at ?? null,
  };
}

export function mapAudit(w: any): AuditLog {
  return {
    id: w.id,
    companyId: w.company_id,
    actorId: w.actor_id ?? null,
    action: w.action,
    targetType: w.target_type ?? null,
    targetId: w.target_id ?? null,
    details: (w.details ?? {}) as Record<string, unknown>,
    timestamp: w.timestamp,
  };
}

export function mapEmployment(w: any): Employment {
  return {
    id: w.id,
    companyId: w.company_id,
    companyName: w.company_name ?? '',
    branchName: w.branch_name ?? null,
    role: w.role,
    department: w.department,
    employmentType: w.employment_type,
    employmentDate: w.employment_date,
    salary: naira(Number(w.salary_cents ?? 0)),
    status: w.status,
    isOwner: Boolean(w.is_owner),
  };
}

export function mapPayslip(w: any): Payslip {
  return {
    id: w.id,
    reference: w.reference,
    runName: w.run_name ?? '',
    companyName: w.company_name ?? '',
    companyId: w.company_id ?? '',
    gross: naira(Number(w.gross_cents ?? w.gross ?? 0)),
    net: naira(Number(w.net_cents ?? w.net ?? 0)),
    paidAt: w.paid_at,
  };
}

export function mapPayrollHome(w: any): PayrollHome {
  return {
    companies: Array.isArray(w?.companies) ? w.companies.map(mapCompany) : [],
    employments: Array.isArray(w?.employments) ? w.employments.map(mapEmployment) : [],
    pendingInvites: Number(w?.pending_invites ?? 0),
  };
}

export function mapPortal(w: any): PortalResponse {
  return {
    employments: Array.isArray(w?.employments) ? w.employments.map(mapEmployment) : [],
    recentPayslips: Array.isArray(w?.recent_payslips) ? w.recent_payslips.map(mapPayslip) : [],
    bonuses: Array.isArray(w?.bonuses) ? w.bonuses.map(mapBonus) : [],
    deductions: Array.isArray(w?.deductions) ? w.deductions.map(mapDeduction) : [],
  };
}

// ─── query keys ───

export const qk = {
  me: ['payroll', 'me'] as const,
  portal: ['payroll', 'portal'] as const,
  company: (id: string) => ['payroll', 'company', id] as const,
  companies: ['payroll', 'companies'] as const,
  branches: (companyId: string) => ['payroll', 'company', companyId, 'branches'] as const,
  branch: (id: string) => ['payroll', 'branch', id] as const,
  employees: (companyId: string) => ['payroll', 'company', companyId, 'employees'] as const,
  employee: (id: string) => ['payroll', 'employee', id] as const,
  runs: (companyId: string) => ['payroll', 'company', companyId, 'runs'] as const,
  run: (id: string) => ['payroll', 'run', id] as const,
  members: (companyId: string) => ['payroll', 'company', companyId, 'members'] as const,
  invites: (companyId: string) => ['payroll', 'company', companyId, 'invites'] as const,
  myInvites: ['payroll', 'invites', 'mine'] as const,
  inviteByToken: (token: string) => ['payroll', 'invite', token] as const,
  bonuses: (companyId: string) => ['payroll', 'company', companyId, 'bonuses'] as const,
  deductions: (companyId: string) => ['payroll', 'company', companyId, 'deductions'] as const,
  audit: (companyId: string) => ['payroll', 'company', companyId, 'audit'] as const,
};

function invalidateCompany(qc: ReturnType<typeof useQueryClient>, companyId: string) {
  qc.invalidateQueries({ queryKey: qk.company(companyId) });
  qc.invalidateQueries({ queryKey: qk.branches(companyId) });
  qc.invalidateQueries({ queryKey: qk.employees(companyId) });
  qc.invalidateQueries({ queryKey: qk.runs(companyId) });
  qc.invalidateQueries({ queryKey: qk.members(companyId) });
  qc.invalidateQueries({ queryKey: qk.invites(companyId) });
  qc.invalidateQueries({ queryKey: qk.bonuses(companyId) });
  qc.invalidateQueries({ queryKey: qk.deductions(companyId) });
  qc.invalidateQueries({ queryKey: qk.audit(companyId) });
  qc.invalidateQueries({ queryKey: qk.me });
  qc.invalidateQueries({ queryKey: qk.portal });
  qc.invalidateQueries({ queryKey: qk.companies });
}

// ─── queries ───

export function usePayrollMe(options?: UseQueryOptions<PayrollHome, PayrollApiError>) {
  return useQuery<PayrollHome, PayrollApiError>({
    queryKey: qk.me,
    queryFn: () => get<any>('/payroll/me').then(mapPayrollHome),
    ...options,
  });
}

export function usePayrollPortal(options?: UseQueryOptions<PortalResponse, PayrollApiError>) {
  return useQuery<PortalResponse, PayrollApiError>({
    queryKey: qk.portal,
    queryFn: () => get<any>('/payroll/portal').then(mapPortal),
    ...options,
  });
}

export function useCompany(id?: string, options?: UseQueryOptions<Company, PayrollApiError>) {
  return useQuery<Company, PayrollApiError>({
    queryKey: qk.company(id!),
    queryFn: () => get<any>(`/payroll/companies/${id}`).then(mapCompany),
    enabled: !!id,
    ...options,
  });
}

export function useCompanies(options?: UseQueryOptions<Company[], PayrollApiError>) {
  return useQuery<Company[], PayrollApiError>({
    queryKey: qk.companies,
    queryFn: () => get<any>('/payroll/companies').then((rows) => (Array.isArray(rows) ? rows.map(mapCompany) : [])),
    ...options,
  });
}

export function useBranches(companyId?: string, options?: UseQueryOptions<Branch[], PayrollApiError>) {
  return useQuery<Branch[], PayrollApiError>({
    queryKey: qk.branches(companyId!),
    queryFn: () =>
      get<any>(`/payroll/companies/${companyId}/branches`).then((rows) =>
        Array.isArray(rows) ? rows.map(mapBranch) : [],
      ),
    enabled: !!companyId,
    ...options,
  });
}

export function useBranch(branchId?: string, options?: UseQueryOptions<Branch, PayrollApiError>) {
  return useQuery<Branch, PayrollApiError>({
    queryKey: qk.branch(branchId!),
    queryFn: () => get<any>(`/payroll/branches/${branchId}`).then(mapBranch),
    enabled: !!branchId,
    ...options,
  });
}

export function useEmployees(
  companyId?: string,
  filters?: { status?: EmployeeStatus | 'all'; search?: string },
  options?: UseQueryOptions<Employee[], PayrollApiError>,
) {
  const params = new URLSearchParams();
  if (filters?.status && filters.status !== 'all') params.set('status', filters.status);
  if (filters?.search?.trim()) params.set('search', filters.search.trim());
  const qs = params.toString() ? `?${params}` : '';
  return useQuery<Employee[], PayrollApiError>({
    queryKey: [...qk.employees(companyId!), filters?.status ?? 'all', filters?.search ?? ''] as const,
    queryFn: () =>
      get<any>(`/payroll/companies/${companyId}/employees${qs}`).then((rows) =>
        Array.isArray(rows) ? rows.map(mapEmployee) : [],
      ),
    enabled: !!companyId,
    ...options,
  });
}

export function useEmployee(employeeId?: string, options?: UseQueryOptions<Employee, PayrollApiError>) {
  return useQuery<Employee, PayrollApiError>({
    queryKey: qk.employee(employeeId!),
    queryFn: () => get<any>(`/payroll/employees/${employeeId}`).then(mapEmployee),
    enabled: !!employeeId,
    ...options,
  });
}

export function useRuns(
  companyId?: string,
  options?: UseQueryOptions<PayrollRecord[], PayrollApiError>,
) {
  return useQuery<PayrollRecord[], PayrollApiError>({
    queryKey: qk.runs(companyId!),
    queryFn: () =>
      get<any>(`/payroll/companies/${companyId}/runs`).then((rows) =>
        Array.isArray(rows) ? rows.map(mapRun) : [],
      ),
    enabled: !!companyId,
    ...options,
  });
}

export function useRun(runId?: string, options?: UseQueryOptions<PayrollRecord, PayrollApiError>) {
  return useQuery<PayrollRecord, PayrollApiError>({
    queryKey: qk.run(runId!),
    queryFn: () => get<any>(`/payroll/runs/${runId}`).then(mapRun),
    enabled: !!runId,
    ...options,
  });
}

export function useMembers(
  companyId?: string,
  options?: UseQueryOptions<CompanyMember[], PayrollApiError>,
) {
  return useQuery<CompanyMember[], PayrollApiError>({
    queryKey: qk.members(companyId!),
    queryFn: () =>
      get<any>(`/payroll/companies/${companyId}/members`).then((rows) =>
        Array.isArray(rows) ? rows.map(mapMember) : [],
      ),
    enabled: !!companyId,
    ...options,
  });
}

export function useInvites(
  companyId?: string,
  options?: UseQueryOptions<PayrollInvite[], PayrollApiError>,
) {
  return useQuery<PayrollInvite[], PayrollApiError>({
    queryKey: qk.invites(companyId!),
    queryFn: () =>
      get<any>(`/payroll/companies/${companyId}/invites`).then((rows) =>
        Array.isArray(rows) ? rows.map(mapInvite) : [],
      ),
    enabled: !!companyId,
    ...options,
  });
}

export function useMyInvites(options?: UseQueryOptions<PayrollInvite[], PayrollApiError>) {
  return useQuery<PayrollInvite[], PayrollApiError>({
    queryKey: qk.myInvites,
    queryFn: () =>
      get<any>('/payroll/invites/mine').then((rows) =>
        Array.isArray(rows) ? rows.map(mapInvite) : [],
      ),
    ...options,
  });
}

export function useInviteByToken(
  token: string,
  options?: UseQueryOptions<PayrollInvite, PayrollApiError>,
) {
  return useQuery<PayrollInvite, PayrollApiError>({
    queryKey: qk.inviteByToken(token),
    queryFn: () => get<any>(`/payroll/invites/token/${token}`).then(mapInvite),
    enabled: !!token,
    retry: false,
    ...options,
  });
}

export function useBonuses(
  companyId?: string,
  options?: UseQueryOptions<Bonus[], PayrollApiError>,
) {
  return useQuery<Bonus[], PayrollApiError>({
    queryKey: qk.bonuses(companyId!),
    queryFn: () =>
      get<any>(`/payroll/companies/${companyId}/bonuses`).then((rows) =>
        Array.isArray(rows) ? rows.map(mapBonus) : [],
      ),
    enabled: !!companyId,
    ...options,
  });
}

export function useDeductions(
  companyId?: string,
  options?: UseQueryOptions<Deduction[], PayrollApiError>,
) {
  return useQuery<Deduction[], PayrollApiError>({
    queryKey: qk.deductions(companyId!),
    queryFn: () =>
      get<any>(`/payroll/companies/${companyId}/deductions`).then((rows) =>
        Array.isArray(rows) ? rows.map(mapDeduction) : [],
      ),
    enabled: !!companyId,
    ...options,
  });
}

export function useAuditLog(
  companyId?: string,
  options?: UseQueryOptions<AuditLog[], PayrollApiError>,
) {
  return useQuery<AuditLog[], PayrollApiError>({
    queryKey: qk.audit(companyId!),
    queryFn: () =>
      get<any>(`/payroll/companies/${companyId}/audit`).then((rows) =>
        Array.isArray(rows) ? rows.map(mapAudit) : [],
      ),
    enabled: !!companyId,
    ...options,
  });
}

// ─── mutations ───

export function useCreateCompany(options?: UseMutationOptions<Company, PayrollApiError, any>) {
  const qc = useQueryClient();
  return useMutation<Company, PayrollApiError, any>({
    mutationFn: (payload) => post<any>('/payroll/companies', payload).then(mapCompany),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.companies });
      qc.invalidateQueries({ queryKey: qk.me });
    },
    ...options,
  });
}

export function useUpdateCompany(
  companyId: string,
  options?: UseMutationOptions<Company, PayrollApiError, any>,
) {
  const qc = useQueryClient();
  return useMutation<Company, PayrollApiError, any>({
    mutationFn: (payload) => patch<any>(`/payroll/companies/${companyId}`, payload).then(mapCompany),
    onSuccess: () => invalidateCompany(qc, companyId),
    ...options,
  });
}

export function useCreateBranch(
  companyId: string,
  options?: UseMutationOptions<Branch, PayrollApiError, any>,
) {
  const qc = useQueryClient();
  return useMutation<Branch, PayrollApiError, any>({
    mutationFn: (payload) =>
      post<any>(`/payroll/companies/${companyId}/branches`, payload).then(mapBranch),
    onSuccess: () => invalidateCompany(qc, companyId),
    ...options,
  });
}

export function useUpdateBranch(
  branchId: string,
  companyId: string,
  options?: UseMutationOptions<Branch, PayrollApiError, any>,
) {
  const qc = useQueryClient();
  return useMutation<Branch, PayrollApiError, any>({
    mutationFn: (payload) => patch<any>(`/payroll/branches/${branchId}`, payload).then(mapBranch),
    onSuccess: () => invalidateCompany(qc, companyId),
    ...options,
  });
}

export function useCreateEmployee(
  companyId: string,
  options?: UseMutationOptions<Employee, PayrollApiError, any>,
) {
  const qc = useQueryClient();
  return useMutation<Employee, PayrollApiError, any>({
    mutationFn: (payload) =>
      post<any>(`/payroll/companies/${companyId}/employees`, payload).then(mapEmployee),
    onSuccess: () => invalidateCompany(qc, companyId),
    ...options,
  });
}

export function useUpdateEmployee(
  employeeId: string,
  companyId: string,
  options?: UseMutationOptions<Employee, PayrollApiError, any>,
) {
  const qc = useQueryClient();
  return useMutation<Employee, PayrollApiError, any>({
    mutationFn: (payload) => patch<any>(`/payroll/employees/${employeeId}`, payload).then(mapEmployee),
    onSuccess: () => invalidateCompany(qc, companyId),
    ...options,
  });
}

export function useTerminateEmployee(
  employeeId: string,
  companyId: string,
  options?: UseMutationOptions<{ status: string }, PayrollApiError, void>,
) {
  const qc = useQueryClient();
  return useMutation<{ status: string }, PayrollApiError, void>({
    mutationFn: () => del<{ status: string }>(`/payroll/employees/${employeeId}`),
    onSuccess: () => invalidateCompany(qc, companyId),
    ...options,
  });
}

export function useLinkEmployee(
  employeeId: string,
  companyId: string,
  options?: UseMutationOptions<{ linked: boolean; user_id?: string; name?: string; already_linked?: boolean }, PayrollApiError, string>,
) {
  const qc = useQueryClient();
  return useMutation<{ linked: boolean; user_id?: string; name?: string; already_linked?: boolean }, PayrollApiError, string>({
    mutationFn: (email: string) => post(`/payroll/employees/${employeeId}/link`, { email }),
    onSuccess: () => invalidateCompany(qc, companyId),
    ...options,
  });
}

export function useUnlinkEmployee(
  employeeId: string,
  companyId: string,
  options?: UseMutationOptions<{ unlinked: boolean }, PayrollApiError, void>,
) {
  const qc = useQueryClient();
  return useMutation<{ unlinked: boolean }, PayrollApiError, void>({
    mutationFn: () => post(`/payroll/employees/${employeeId}/unlink`, {}),
    onSuccess: () => invalidateCompany(qc, companyId),
    ...options,
  });
}

export function useRemoveMember(
  companyId: string,
  options?: UseMutationOptions<{ removed: boolean }, PayrollApiError, string>,
) {
  const qc = useQueryClient();
  return useMutation<{ removed: boolean }, PayrollApiError, string>({
    mutationFn: (memberId: string) => del(`/payroll/members/${memberId}`),
    onSuccess: () => invalidateCompany(qc, companyId),
    ...options,
  });
}

export function useLeaveCompany(
  companyId: string,
  options?: UseMutationOptions<{ left: boolean }, PayrollApiError, void>,
) {
  const qc = useQueryClient();
  return useMutation<{ left: boolean }, PayrollApiError, void>({
    mutationFn: () => post(`/payroll/companies/${companyId}/leave`, {}),
    onSuccess: () => invalidateCompany(qc, companyId),
    ...options,
  });
}

export function useCreateInvite(
  companyId: string,
  options?: UseMutationOptions<PayrollInvite, PayrollApiError, { email: string }>,
) {
  const qc = useQueryClient();
  return useMutation<PayrollInvite, PayrollApiError, { email: string }>({
    mutationFn: (payload) => post<any>(`/payroll/companies/${companyId}/invites`, payload).then(mapInvite),
    onSuccess: () => invalidateCompany(qc, companyId),
    ...options,
  });
}

export function useRevokeInvite(
  companyId: string,
  options?: UseMutationOptions<{ revoked: boolean }, PayrollApiError, string>,
) {
  const qc = useQueryClient();
  return useMutation<{ revoked: boolean }, PayrollApiError, string>({
    mutationFn: (inviteId: string) => del(`/payroll/invites/${inviteId}`),
    onSuccess: () => invalidateCompany(qc, companyId),
    ...options,
  });
}

export function useAcceptInvite(
  options?: UseMutationOptions<{ status: string }, PayrollApiError, string>,
) {
  const qc = useQueryClient();
  return useMutation<{ status: string }, PayrollApiError, string>({
    mutationFn: (inviteId: string) => post(`/payroll/invites/${inviteId}/accept`, {}),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.myInvites });
      qc.invalidateQueries({ queryKey: qk.me });
      qc.invalidateQueries({ queryKey: qk.portal });
      qc.invalidateQueries({ queryKey: qk.companies });
    },
    ...options,
  });
}

export function useDeclineInvite(
  options?: UseMutationOptions<{ status: string }, PayrollApiError, string>,
) {
  const qc = useQueryClient();
  return useMutation<{ status: string }, PayrollApiError, string>({
    mutationFn: (inviteId: string) => post(`/payroll/invites/${inviteId}/decline`, {}),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.myInvites });
      qc.invalidateQueries({ queryKey: qk.me });
    },
    ...options,
  });
}

export function useCreateRun(
  companyId: string,
  options?: UseMutationOptions<PayrollRecord, PayrollApiError, any>,
) {
  const qc = useQueryClient();
  return useMutation<PayrollRecord, PayrollApiError, any>({
    mutationFn: (payload) =>
      post<any>(`/payroll/companies/${companyId}/runs`, payload).then(mapRun),
    onSuccess: () => invalidateCompany(qc, companyId),
    ...options,
  });
}

export function useUpdateRun(
  runId: string,
  companyId: string,
  options?: UseMutationOptions<PayrollRecord, PayrollApiError, any>,
) {
  const qc = useQueryClient();
  return useMutation<PayrollRecord, PayrollApiError, any>({
    mutationFn: (payload) => patch<any>(`/payroll/runs/${runId}`, payload).then(mapRun),
    onSuccess: () => invalidateCompany(qc, companyId),
    ...options,
  });
}


export function useCancelRun(
  runId: string,
  companyId: string,
  options?: UseMutationOptions<{ cancelled: boolean }, PayrollApiError, void>,
) {
  const qc = useQueryClient();
  return useMutation<{ cancelled: boolean }, PayrollApiError, void>({
    mutationFn: () => del(`/payroll/runs/${runId}`),
    onSuccess: () => invalidateCompany(qc, companyId),
    ...options,
  });
}

export function useSubmitRun(
  runId: string,
  companyId: string,
  options?: UseMutationOptions<PayrollRecord, PayrollApiError, void>,
) {
  const qc = useQueryClient();
  return useMutation<PayrollRecord, PayrollApiError, void>({
    mutationFn: () => post<any>(`/payroll/runs/${runId}/submit`, {}).then(mapRun),
    onSuccess: () => invalidateCompany(qc, companyId),
    ...options,
  });
}

export interface ApproveResult {
  success: boolean;
  paid: number;
  failed: number;
  pending: number;
  run_status: string;
  run: PayrollRecord;
}

export function useApproveRun(
  runId: string,
  companyId: string,
  options?: UseMutationOptions<ApproveResult, PayrollApiError, any>,
) {
  const qc = useQueryClient();
  return useMutation<ApproveResult, PayrollApiError, any>({
    mutationFn: (payload) =>
      post<any>(`/payroll/runs/${runId}/approve`, payload).then((r) => ({
        success: Boolean(r?.success ?? true),
        paid: r?.paid ?? 0,
        failed: r?.failed ?? 0,
        pending: r?.pending ?? 0,
        run_status: r?.run_status ?? r?.run?.status ?? 'unknown',
        run: r?.run ? mapRun(r.run) : ({} as PayrollRecord),
      })),
    onSuccess: () => invalidateCompany(qc, companyId),
    ...options,
  });
}

export function useRejectRun(
  runId: string,
  companyId: string,
  options?: UseMutationOptions<PayrollRecord, PayrollApiError, { reason?: string }>,
) {
  const qc = useQueryClient();
  return useMutation<PayrollRecord, PayrollApiError, { reason?: string }>({
    mutationFn: ({ reason }) =>
      post<any>(`/payroll/runs/${runId}/reject`, { reason: reason ?? 'Rejected' }).then(mapRun),
    onSuccess: () => invalidateCompany(qc, companyId),
    ...options,
  });
}

export function useCreateBonus(
  companyId: string,
  options?: UseMutationOptions<Bonus, PayrollApiError, any>,
) {
  const qc = useQueryClient();
  return useMutation<Bonus, PayrollApiError, any>({
    mutationFn: (payload) =>
      post<any>(`/payroll/companies/${companyId}/bonuses`, payload).then(mapBonus),
    onSuccess: () => invalidateCompany(qc, companyId),
    ...options,
  });
}

export function useDeleteBonus(
  companyId: string,
  options?: UseMutationOptions<{ deleted: boolean }, PayrollApiError, string>,
) {
  const qc = useQueryClient();
  return useMutation<{ deleted: boolean }, PayrollApiError, string>({
    mutationFn: (id: string) => del(`/payroll/bonuses/${id}`),
    onSuccess: () => invalidateCompany(qc, companyId),
    ...options,
  });
}

export function useCreateDeduction(
  companyId: string,
  options?: UseMutationOptions<Deduction, PayrollApiError, any>,
) {
  const qc = useQueryClient();
  return useMutation<Deduction, PayrollApiError, any>({
    mutationFn: (payload) =>
      post<any>(`/payroll/companies/${companyId}/deductions`, payload).then(mapDeduction),
    onSuccess: () => invalidateCompany(qc, companyId),
    ...options,
  });
}

export function useDeleteDeduction(
  companyId: string,
  options?: UseMutationOptions<{ deleted: boolean }, PayrollApiError, string>,
) {
  const qc = useQueryClient();
  return useMutation<{ deleted: boolean }, PayrollApiError, string>({
    mutationFn: (id: string) => del(`/payroll/deductions/${id}`),
    onSuccess: () => invalidateCompany(qc, companyId),
    ...options,
  });
}
