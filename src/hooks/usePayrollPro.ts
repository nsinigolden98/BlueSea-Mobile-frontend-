import { useState, useCallback, useMemo } from 'react';
import type { EmployeeFilters } from '@/types/payroll-pro';
import {
  currentUser, abcCompany, greenfieldCompany, branches, employees,
  payrollRecords, bonuses, deductions, leaveRequests, approvalRequests,
  performanceRecords, auditLogs, roles, notifications, userEmployments,
  getCompanyEmployees, getCompanyBranches, getBranchEmployees,
  getEmployeeBonuses, getEmployeeDeductions, getEmployeeLeaveRequests,
  getEmployeePerformance, getCompanyAuditLogs, getPendingApprovals,
} from '@/mocks/payroll-data';

// ─── MAIN MODULE HOOK ───
export function usePayrollPro() {
  const [activeCompany, setActiveCompany] = useState<string | null>(null);
  
  const user = currentUser;
  const ownedCompanies = [abcCompany, greenfieldCompany];
  const employments = userEmployments;
  
  const hasCompany = ownedCompanies.length > 0;
  const isEmployee = employments.length > 0;
  const isOwner = ownedCompanies.length > 0;
  const isNewUser = !hasCompany && !isEmployee;

  return {
    user,
    ownedCompanies,
    employments,
    hasCompany,
    isEmployee,
    isOwner,
    isNewUser,
    activeCompany,
    setActiveCompany,
  };
}

// ─── COMPANY HOOK ───
export function useCompany(companyId: string) {
  const company = useMemo(() => {
    if (companyId === 'comp_001') return abcCompany;
    if (companyId === 'comp_002') return greenfieldCompany;
    return null;
  }, [companyId]);

  const companyEmployees = useMemo(() => getCompanyEmployees(companyId), [companyId]);
  const companyBranches = useMemo(() => getCompanyBranches(companyId), [companyId]);
  const companyPayrolls = useMemo(() => payrollRecords.filter(p => p.companyId === companyId), [companyId]);
  const companyApprovals = useMemo(() => approvalRequests.filter(a => a.companyId === companyId), [companyId]);
  const pendingApprovals = useMemo(() => getPendingApprovals(companyId), [companyId]);
  const companyAuditLogs = useMemo(() => getCompanyAuditLogs(companyId), [companyId]);
  const companyRoles = useMemo(() => roles.filter(r => r.companyId === companyId), [companyId]);

  const stats = useMemo(() => ({
    totalEmployees: companyEmployees.length,
    activeEmployees: companyEmployees.filter(e => e.status === 'active').length,
    onLeaveEmployees: companyEmployees.filter(e => e.status === 'on_leave').length,
    suspendedEmployees: companyEmployees.filter(e => e.status === 'suspended').length,
    totalBranches: companyBranches.length,
    totalPayrollCost: companyEmployees.reduce((sum, e) => sum + e.salary, 0),
    pendingRequests: pendingApprovals.length,
  }), [companyEmployees, companyBranches, pendingApprovals]);

  return {
    company,
    employees: companyEmployees,
    branches: companyBranches,
    payrolls: companyPayrolls,
    approvals: companyApprovals,
    pendingApprovals,
    auditLogs: companyAuditLogs,
    roles: companyRoles,
    stats,
  };
}

// ─── BRANCH HOOK ───
export function useBranch(branchId: string) {
  const branch = useMemo(() => branches.find(b => b.id === branchId) || null, [branchId]);
  const branchEmployees = useMemo(() => getBranchEmployees(branchId), [branchId]);
  const branchPayrolls = useMemo(() => payrollRecords.filter(p => p.branchId === branchId), [branchId]);

  return { branch, employees: branchEmployees, payrolls: branchPayrolls };
}

// ─── EMPLOYEE HOOK ───
export function useEmployee(employeeId: string) {
  const employee = useMemo(() => employees.find(e => e.id === employeeId) || null, [employeeId]);
  const employeeBonuses = useMemo(() => getEmployeeBonuses(employeeId), [employeeId]);
  const employeeDeductions = useMemo(() => getEmployeeDeductions(employeeId), [employeeId]);
  const employeeLeaves = useMemo(() => getEmployeeLeaveRequests(employeeId), [employeeId]);
  const employeePerformance = useMemo(() => getEmployeePerformance(employeeId), [employeeId]);
  const employeePayrolls = useMemo(() => payrollRecords.filter(p => 
    p.employeePayrolls.some(ep => ep.employeeId === employeeId)
  ), [employeeId]);

  return {
    employee,
    bonuses: employeeBonuses,
    deductions: employeeDeductions,
    leaves: employeeLeaves,
    performance: employeePerformance,
    payrolls: employeePayrolls,
  };
}

// ─── FILTERED EMPLOYEES HOOK ───
export function useFilteredEmployees(companyEmployees: ReturnType<typeof getCompanyEmployees>) {
  const [filters, setFilters] = useState<EmployeeFilters>({
    search: '', status: 'all', department: 'all', branch: 'all', employmentType: 'all', role: 'all',
  });

  const filtered = useMemo(() => {
    return companyEmployees.filter(e => {
      if (filters.search && !e.fullName.toLowerCase().includes(filters.search.toLowerCase()) && 
          !e.email.toLowerCase().includes(filters.search.toLowerCase()) &&
          !e.employeeId.toLowerCase().includes(filters.search.toLowerCase())) return false;
      if (filters.status !== 'all' && e.status !== filters.status) return false;
      if (filters.department !== 'all' && e.department !== filters.department) return false;
      if (filters.branch !== 'all' && e.branchId !== filters.branch) return false;
      if (filters.employmentType !== 'all' && e.employmentType !== filters.employmentType) return false;
      if (filters.role !== 'all' && e.role !== filters.role) return false;
      return true;
    });
  }, [companyEmployees, filters]);

  return { filters, setFilters, filtered };
}

// ─── FORM HOOK ───
export function useForm<T extends Record<string, unknown>>(initialData: T) {
  const [data, setData] = useState<T>(initialData);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateField = useCallback(<K extends keyof T>(field: K, value: T[K]) => {
    setData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => { const n = { ...prev }; delete n[field]; return n; });
    }
  }, [errors]);

  const validate = useCallback((rules: Partial<Record<keyof T, (value: unknown) => string | undefined>>) => {
    const newErrors: Partial<Record<keyof T, string>> = {};
    for (const [key, validator] of Object.entries(rules)) {
      const error = validator?.(data[key as keyof T]);
      if (error) newErrors[key as keyof T] = error;
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [data]);

  const submit = useCallback(async (submitFn: (data: T) => Promise<void>) => {
    setIsSubmitting(true);
    try {
      await submitFn(data);
    } finally {
      setIsSubmitting(false);
    }
  }, [data]);

  return { data, errors, isSubmitting, updateField, validate, submit, setData };
}

// ─── NOTIFICATIONS HOOK ───
export function useNotifications() {
  const [notifs, setNotifs] = useState(notifications);
  const unreadCount = notifs.filter(n => !n.isRead).length;
  
  const markAsRead = useCallback((id: string) => {
    setNotifs(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  }, []);

  return { notifications: notifs, unreadCount, markAsRead };
}

// ─── BOTTOM SHEET HOOK ───
export function useBottomSheet() {
  const [isOpen, setIsOpen] = useState(false);
  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  return { isOpen, open, close };
}

export { currentUser, abcCompany, greenfieldCompany, branches, employees, payrollRecords, bonuses, deductions, leaveRequests, approvalRequests, performanceRecords, auditLogs, roles };
