import type { EmployeeStatus, BranchStatus, VerificationStatus, ApprovalStatus, PayrollStatus, LeaveStatus } from '@/types/payroll-pro';

interface StatusBadgeProps {
  status: EmployeeStatus | BranchStatus | VerificationStatus | ApprovalStatus | PayrollStatus | LeaveStatus | string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const statusConfig: Record<string, { className: string; label: string }> = {
  // Employee statuses
  active: { className: 'tm-status-active', label: 'Active' },
  suspended: { className: 'tm-status-suspended', label: 'Suspended' },
  on_leave: { className: 'tm-status-pending', label: 'On Leave' },
  resigned: { className: 'tm-status-suspended', label: 'Resigned' },
  terminated: { className: 'tm-status-suspended', label: 'Terminated' },
  // Branch statuses
  pending: { className: 'tm-status-pending', label: 'Pending' },
  // Verification statuses
  verified: { className: 'tm-status-verified', label: 'Verified' },
  under_review: { className: 'tm-status-review', label: 'Under Review' },
  rejected: { className: 'tm-status-suspended', label: 'Rejected' },
  // Approval statuses
  approved: { className: 'tm-status-active', label: 'Approved' },
  // Payroll statuses
  draft: { className: 'tm-status-review', label: 'Draft' },
  pending_approval: { className: 'tm-status-pending', label: 'Pending Approval' },
  processing: { className: 'tm-status-review', label: 'Processing' },
  completed: { className: 'tm-status-active', label: 'Completed' },
  failed: { className: 'tm-status-suspended', label: 'Failed' },
  // Leave statuses
  cancelled: { className: 'tm-status-suspended', label: 'Cancelled' },
  leave_completed: { className: 'tm-status-active', label: 'Completed' },
};

export default function StatusBadge({ status, size = 'sm', className = '' }: StatusBadgeProps) {
  const config = statusConfig[status] || { className: 'tm-status-pending', label: status };
  
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-[0.65rem]',
    md: 'px-3 py-1 text-xs',
    lg: 'px-4 py-1.5 text-sm',
  };

  return (
    <span className={`tm-status-badge ${config.className} ${sizeClasses[size]} ${className}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60" />
      {config.label}
    </span>
  );
}
